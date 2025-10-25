import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { generateGuidedThinkingPrompt, GuidedThinkingResponse } from '@/lib/prompts/guided-thinking-prompts';

/**
 * POST /api/critical-thinking/guided-questions
 * 基于具体题目内容，智能生成个性化的引导问题
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const {
      thinkingType,
      questionTopic,
      questionContext,
      difficulty = 'intermediate',
      questionId // 新增：题目ID，用于缓存查询
    } = body;

    // 验证必需字段
    if (!thinkingType || !questionTopic || !questionContext) {
      return NextResponse.json(
        { error: '缺少必需字段：thinkingType, questionTopic, questionContext' },
        { status: 400 }
      );
    }

    // 验证difficulty值
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty必须是: beginner, intermediate, 或 advanced' },
        { status: 400 }
      );
    }

    // 🔥 优先从数据库缓存中查找
    if (questionId) {
      const cachedGuided = await prisma.intelligentGuidedQuestionCache.findUnique({
        where: {
          questionId
        }
      });

      if (cachedGuided && cachedGuided.isActive) {
        // 更新使用统计
        await prisma.intelligentGuidedQuestionCache.update({
          where: { id: cachedGuided.id },
          data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        });

        // 返回缓存的引导问题
        return NextResponse.json({
          success: true,
          data: {
            questions: cachedGuided.guidedQuestions,
            thinkingPath: cachedGuided.thinkingPath,
            expectedInsights: cachedGuided.expectedInsights
          },
          cached: true,
          message: '使用缓存的智能引导问题'
        });
      }
    }

    // 生成提示词
    const prompt = generateGuidedThinkingPrompt(
      thinkingType,
      questionTopic,
      questionContext,
      difficulty
    );

    // 调用AI生成引导问题
    const aiResponse = await aiRouter.chat([
      {
        role: 'system',
        content: '你是一位资深的批判性思维教育专家。请严格按照JSON格式返回结果，不要包含任何其他文字。'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.7,
      maxTokens: 2000
    });

    // 解析AI响应
    let guidedThinking: GuidedThinkingResponse;
    try {
      // 如果响应是字符串，直接解析
      const responseText = typeof aiResponse === 'string' ? aiResponse : await streamToString(aiResponse);

      // 移除可能的markdown代码块标记
      const cleanedResponse = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      guidedThinking = JSON.parse(cleanedResponse);

      // 验证响应格式
      if (!guidedThinking.questions || !Array.isArray(guidedThinking.questions)) {
        throw new Error('AI响应格式错误：缺少questions数组');
      }

      // 验证每个问题的必需字段
      for (const q of guidedThinking.questions) {
        if (!q.question || !q.purpose) {
          throw new Error('AI响应格式错误：问题缺少必需字段');
        }
      }

      // 🔥 保存到数据库缓存（仅当提供了questionId时）
      if (questionId) {
        try {
          // 1. 保存到缓存表
          await prisma.intelligentGuidedQuestionCache.upsert({
            where: { questionId },
            create: {
              questionId,
              thinkingType,
              difficulty,
              guidedQuestions: guidedThinking.questions as any,
              thinkingPath: guidedThinking.thinkingPath || '',
              expectedInsights: guidedThinking.expectedInsights || [],
              generatedBy: 'ai',
              usageCount: 1,
              lastUsedAt: new Date()
            },
            update: {
              guidedQuestions: guidedThinking.questions as any,
              thinkingPath: guidedThinking.thinkingPath || '',
              expectedInsights: guidedThinking.expectedInsights || [],
              updatedAt: new Date(),
              usageCount: { increment: 1 },
              lastUsedAt: new Date()
            }
          });
          console.log(`✅ 智能引导问题已缓存 (questionId: ${questionId})`);

          // 2. 同时更新题目本身的 scaffolding 字段，使其成为题目的永久数据
          await prisma.criticalThinkingQuestion.update({
            where: { id: questionId },
            data: {
              scaffolding: {
                intelligentGuided: {
                  questions: guidedThinking.questions,
                  thinkingPath: guidedThinking.thinkingPath || '',
                  expectedInsights: guidedThinking.expectedInsights || [],
                  generatedAt: new Date().toISOString(),
                  generatedBy: 'ai'
                }
              } as any
            }
          });
          console.log(`✅ 智能引导问题已保存到题目数据 (questionId: ${questionId})`);
        } catch (cacheError) {
          console.error('保存智能引导问题失败:', cacheError);
          // 保存失败不影响主流程，继续返回结果
        }
      }
    } catch (parseError: any) {
      console.error('解析AI响应失败:', parseError);
      console.error('AI原始响应:', aiResponse);

      // 返回降级方案：使用预设的基础引导问题
      return NextResponse.json({
        success: true,
        data: getFallbackGuidedQuestions(thinkingType, difficulty),
        fallback: true,
        message: 'AI生成失败，使用默认引导问题'
      });
    }

    return NextResponse.json({
      success: true,
      data: guidedThinking,
      fallback: false,
      cached: false,
      message: 'AI生成新的智能引导问题'
    });

  } catch (error: any) {
    console.error('生成引导问题失败:', error);
    return NextResponse.json(
      {
        error: '生成引导问题失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 将ReadableStream转换为字符串
 */
async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

/**
 * 降级方案：预设的基础引导问题
 */
function getFallbackGuidedQuestions(
  thinkingType: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): GuidedThinkingResponse {
  const fallbackQuestions: Record<string, Record<string, GuidedThinkingResponse>> = {
    causal_analysis: {
      beginner: {
        questions: [
          {
            question: '题目中提到的现象或结论是什么？',
            purpose: '明确分析对象，理解问题的基本内容',
            thinkingDirection: '从题目中找出核心观察结果或主要结论',
            keywords: ['现象', '结论', '观察结果']
          },
          {
            question: '这些现象之间是简单的相关性，还是确实存在因果关系？',
            purpose: '建立相关性与因果性的基本区分',
            thinkingDirection: '思考是否只是同时发生，还是一方导致另一方',
            keywords: ['相关性', '因果性', '区分']
          },
          {
            question: '可能有哪些其他因素同时影响了这两个现象？',
            purpose: '引导识别混淆因素',
            thinkingDirection: '考虑第三变量、环境因素、个体差异等',
            keywords: ['混淆因素', '第三变量', '共同原因']
          }
        ],
        thinkingPath: '从理解现象 → 区分相关与因果 → 识别混淆因素，逐步建立因果分析的基本框架',
        expectedInsights: [
          '理解相关性不等于因果性',
          '学会识别可能的混淆因素',
          '认识到因果关系需要严格验证'
        ]
      },
      intermediate: {
        questions: [
          {
            question: '题目中的因果推理基于什么样的证据？这些证据是否充分？',
            purpose: '评估证据质量，建立证据意识',
            thinkingDirection: '分析数据来源、样本大小、研究设计等',
            keywords: ['证据', '数据质量', '研究方法']
          },
          {
            question: '有哪些可能的混淆因素需要控制？它们如何影响结论？',
            purpose: '系统识别和分析混淆因素',
            thinkingDirection: '列出所有可能的第三变量，评估其影响程度',
            keywords: ['混淆因素', '控制变量', '影响评估']
          },
          {
            question: '时间序列是否支持这种因果关系？是否存在反向因果的可能？',
            purpose: '检验因果关系的时间条件',
            thinkingDirection: '确认原因是否先于结果发生，考虑双向影响',
            keywords: ['时间序列', '反向因果', '因果方向']
          },
          {
            question: '这种因果关系的作用机制是什么？能否找到中介路径？',
            purpose: '理解因果机制的重要性',
            thinkingDirection: '解释A如何通过具体过程导致B',
            keywords: ['因果机制', '中介变量', '作用路径']
          }
        ],
        thinkingPath: '评估证据 → 控制混淆 → 检验时序 → 解释机制，构建完整的因果分析框架',
        expectedInsights: [
          '掌握识别和控制混淆因素的方法',
          '理解因果关系需要机制解释',
          '认识到因果推理的复杂性和条件性'
        ]
      },
      advanced: {
        questions: [
          {
            question: '这个因果关系的强度如何？在不同情境下是否稳定？',
            purpose: '评估因果关系的普遍性和边界条件',
            thinkingDirection: '考虑效应量、情境依赖性、个体差异等',
            keywords: ['因果强度', '效应量', '边界条件']
          },
          {
            question: '除了简单的A导致B，是否存在更复杂的因果网络或反馈循环？',
            purpose: '理解复杂系统中的多重因果关系',
            thinkingDirection: '考虑交互作用、调节效应、非线性关系',
            keywords: ['因果网络', '交互作用', '复杂系统']
          },
          {
            question: '如何设计实验或准实验来验证这种因果关系？',
            purpose: '应用因果推断的研究设计原则',
            thinkingDirection: '考虑随机对照实验、工具变量、断点回归等方法',
            keywords: ['实验设计', '因果推断', '验证方法']
          },
          {
            question: '这个因果关系在不同文化、时代或群体中是否成立？',
            purpose: '评估因果关系的外部效度',
            thinkingDirection: '考虑文化差异、历史变迁、人群特征',
            keywords: ['外部效度', '跨文化', '泛化性']
          },
          {
            question: '基于这种因果关系，可以提出什么样的干预措施？潜在风险是什么？',
            purpose: '将因果分析应用到实际问题解决',
            thinkingDirection: '设计干预方案，评估预期效果和副作用',
            keywords: ['干预措施', '应用', '风险评估']
          }
        ],
        thinkingPath: '评估强度和边界 → 分析复杂因果 → 设计验证方法 → 评估外部效度 → 应用到实践，形成系统的因果推理能力',
        expectedInsights: [
          '理解因果关系的复杂性和条件依赖性',
          '掌握因果推断的高级方法',
          '能够将因果分析应用到实际问题解决'
        ]
      }
    },
    // 其他维度可以类似扩展
    premise_challenge: {
      beginner: {
        questions: [
          {
            question: '论证中明确陈述了哪些前提或假设？',
            purpose: '识别显性前提',
            thinkingDirection: '找出论证中明确说出的假设',
            keywords: ['显性前提', '明确假设']
          },
          {
            question: '这些假设是否合理？有没有站不住脚的地方？',
            purpose: '质疑前提的合理性',
            thinkingDirection: '评估假设是否符合常识和逻辑',
            keywords: ['合理性', '质疑']
          },
          {
            question: '如果改变这些假设，会得到什么不同的结论？',
            purpose: '理解前提对结论的影响',
            thinkingDirection: '尝试改变假设，观察结论如何变化',
            keywords: ['假设改变', '结论影响']
          }
        ],
        thinkingPath: '识别前提 → 质疑合理性 → 探索替代方案',
        expectedInsights: [
          '学会识别显性前提',
          '培养质疑意识',
          '理解前提对结论的重要性'
        ]
      },
      intermediate: {
        questions: [
          {
            question: '论证中有哪些没有明说但必须成立的隐含假设？',
            purpose: '挖掘隐含前提',
            thinkingDirection: '思考论证成立需要哪些未明说的条件',
            keywords: ['隐含假设', '必要条件']
          },
          {
            question: '这个问题可以从哪些不同的角度来理解和框定？',
            purpose: '重新框定问题',
            thinkingDirection: '尝试从不同视角看待同一问题',
            keywords: ['重新框定', '多角度']
          },
          {
            question: '不同利益相关方对这个问题会有什么不同的看法？',
            purpose: '考虑多方观点',
            thinkingDirection: '站在不同立场思考',
            keywords: ['利益相关方', '多方观点']
          },
          {
            question: '基于新的前提，可以提出什么更合理的方案？',
            purpose: '建立替代方案',
            thinkingDirection: '在新假设下构建解决方案',
            keywords: ['替代方案', '新前提']
          }
        ],
        thinkingPath: '挖掘隐含假设 → 重新框定 → 多方视角 → 替代方案',
        expectedInsights: [
          '掌握识别隐含假设的方法',
          '学会从多角度看待问题',
          '能够基于新前提构建方案'
        ]
      },
      advanced: {
        questions: [
          {
            question: '这些前提背后隐含了什么样的价值观和意识形态？',
            purpose: '解构深层价值判断',
            thinkingDirection: '分析背后的世界观、伦理观',
            keywords: ['价值观', '意识形态', '深层假设']
          },
          {
            question: '如何系统性地重构这个论证，使其更严密和合理？',
            purpose: '批判性重构论证',
            thinkingDirection: '基于更合理的前提建立新论证',
            keywords: ['论证重构', '系统性思考']
          },
          {
            question: '在更大的社会、历史或文化背景下，这些假设意味着什么？',
            purpose: '理解更广阔的背景',
            thinkingDirection: '考虑时代背景、文化差异、历史演变',
            keywords: ['社会背景', '历史context', '文化维度']
          },
          {
            question: '如何平衡不同前提和价值观之间的冲突？',
            purpose: '处理价值冲突',
            thinkingDirection: '寻找平衡点或优先级',
            keywords: ['价值冲突', '平衡', '优先级']
          }
        ],
        thinkingPath: '解构价值观 → 重构论证 → 理解背景 → 平衡冲突',
        expectedInsights: [
          '理解假设背后的深层价值观',
          '掌握系统性重构论证的能力',
          '能够在复杂背景下分析问题'
        ]
      }
    }
  };

  // 如果找不到对应的维度或难度，返回通用问题
  return fallbackQuestions[thinkingType]?.[difficulty] || {
    questions: [
      {
        question: '这道题目的核心问题是什么？',
        purpose: '明确分析对象',
        thinkingDirection: '找出题目的关键问题',
        keywords: ['核心问题']
      },
      {
        question: '你会从哪些角度来分析这个问题？',
        purpose: '建立分析框架',
        thinkingDirection: '确定分析的维度和方法',
        keywords: ['分析角度', '思考框架']
      },
      {
        question: '可能有哪些容易忽略的要点？',
        purpose: '避免思维盲点',
        thinkingDirection: '考虑不太明显的因素',
        keywords: ['容易忽略', '盲点']
      }
    ],
    thinkingPath: '理解问题 → 建立框架 → 全面思考',
    expectedInsights: [
      '掌握基本的思考方法',
      '学会系统性分析问题'
    ]
  };
}
