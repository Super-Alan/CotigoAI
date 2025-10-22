import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';

// 思维类型对应的提示词映射
const THINKING_TYPE_PROMPTS = {
  // ===== HKU 5大核心思维维度 =====
  causal_analysis: `# 多维归因与利弊权衡练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计因果分析训练题目。

## 核心要求
生成一个因果分析练习题目，要求学生能够：
1. 区分相关性与因果性
2. 识别混淆因素和潜在变量
3. 建立可靠的因果推理链条
4. 评估多个因素的相对重要性

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要分析因果关系的具体情境）",
  "scenario": "背景情境描述（100-200字，提供充足的信息支持因果分析）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["因果分析", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别相关性）",
      "purpose": "相关性识别"
    },
    {
      "question": "引导问题2（区分因果）",
      "purpose": "因果关系判断"
    },
    {
      "question": "引导问题3（评估混淆因素）",
      "purpose": "混淆因素分析"
    }
  ],
  "expectedOutcomes": [
    "能够区分相关性与因果性",
    "识别潜在混淆因素",
    "建立可靠的因果推理"
  ]
}
\`\`\`

## 难度要求
- beginner: 简单的单一因果关系
- intermediate: 多因素相互作用
- advanced: 复杂系统中的因果网络

请生成一个符合中文语境的因果分析练习题目。`,

  premise_challenge: `# 前提质疑与方法批判练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计前提质疑训练题目。

## 核心要求
生成一个前提质疑练习题目，要求学生能够：
1. 识别论证中的隐含前提
2. 质疑前提的合理性和适用范围
3. 重新框定问题和前提
4. 评估方法论的有效性

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要质疑前提的论证或观点）",
  "scenario": "背景情境描述（100-200字，提供论证的具体语境）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["前提质疑", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别隐含前提）",
      "purpose": "前提识别"
    },
    {
      "question": "引导问题2（质疑前提合理性）",
      "purpose": "前提批判"
    },
    {
      "question": "引导问题3（重新框定）",
      "purpose": "问题重构"
    }
  ],
  "expectedOutcomes": [
    "识别论证中的隐含前提",
    "质疑前提的合理性",
    "提出替代性框架"
  ]
}
\`\`\`

## 难度要求
- beginner: 明显的隐含前提
- intermediate: 需要深入思考的前提假设
- advanced: 复杂的方法论和认识论前提

请生成一个符合中文语境的前提质疑练习题目。`,

  fallacy_detection: `# 谬误检测练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计逻辑谬误识别训练题目。

## 核心要求
生成一个谬误检测练习题目，要求学生能够：
1. 识别常见的逻辑谬误类型
2. 理解谬误的危害和误导性
3. 学会避免思维陷阱
4. 构建严密的逻辑论证

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含包含逻辑谬误的论证实例）",
  "scenario": "背景情境描述（100-200字，提供论证的具体场景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["逻辑谬误", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别谬误）",
      "purpose": "谬误识别"
    },
    {
      "question": "引导问题2（分析危害）",
      "purpose": "危害分析"
    },
    {
      "question": "引导问题3（改进论证）",
      "purpose": "论证优化"
    }
  ],
  "expectedOutcomes": [
    "识别常见逻辑谬误",
    "理解谬误的误导性",
    "构建严密论证"
  ]
}
\`\`\`

## 难度要求
- beginner: 典型的基础谬误（诉诸权威、稻草人等）
- intermediate: 较复杂的谬误组合
- advanced: 隐蔽的高级谬误和系统性偏误

请生成一个符合中文语境的谬误检测练习题目。`,

  iterative_reflection: `# 迭代反思练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计元认知和迭代反思训练题目。

## 核心要求
生成一个迭代反思练习题目，要求学生能够：
1. 培养元认知能力，审视自己的思维过程
2. 识别思维模式和认知偏误
3. 持续改进思维质量
4. 从错误中学习和成长

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要反思的思维过程或决策）",
  "scenario": "背景情境描述（100-200字，提供反思的具体语境）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["元认知", "反思", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（审视思维过程）",
      "purpose": "元认知觉察"
    },
    {
      "question": "引导问题2（识别模式）",
      "purpose": "模式识别"
    },
    {
      "question": "引导问题3（改进策略）",
      "purpose": "持续优化"
    }
  ],
  "expectedOutcomes": [
    "培养元认知能力",
    "识别思维模式",
    "持续改进思维质量"
  ]
}
\`\`\`

## 难度要求
- beginner: 简单的思维过程反思
- intermediate: 复杂决策的多层次反思
- advanced: 系统性思维模式的深度审视

请生成一个符合中文语境的迭代反思练习题目。`,

  connection_transfer: `# 知识迁移练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计知识迁移和跨领域思维训练题目。

## 核心要求
生成一个知识迁移练习题目，要求学生能够：
1. 识别不同领域问题的深层结构相似性
2. 实现跨领域的知识和方法迁移
3. 建立创新的类比和联系
4. 综合运用多领域知识解决问题

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要跨领域思考的问题情境）",
  "scenario": "背景情境描述（100-200字，提供多领域关联的线索）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["知识迁移", "跨领域", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别相似性）",
      "purpose": "结构识别"
    },
    {
      "question": "引导问题2（建立类比）",
      "purpose": "类比思维"
    },
    {
      "question": "引导问题3（迁移应用）",
      "purpose": "知识迁移"
    }
  ],
  "expectedOutcomes": [
    "识别深层结构相似性",
    "建立跨领域联系",
    "实现知识迁移应用"
  ]
}
\`\`\`

## 难度要求
- beginner: 相近领域的简单迁移
- intermediate: 跨学科的知识整合
- advanced: 抽象的深层结构迁移

请生成一个符合中文语境的知识迁移练习题目。`,

  // ===== 传统思维类型（向后兼容） =====
  analytical: `# 分析性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计分析性思维训练题目。

## 核心要求
生成一个分析性思维练习题目，要求学生能够：
1. 识别问题的核心要素和关键信息
2. 运用逻辑推理分析因果关系
3. 从多个角度拆解复杂问题
4. 基于证据得出合理结论

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含具体情境和需要分析的问题）",
  "scenario": "背景情境描述（100-200字，提供分析所需的具体信息）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（帮助学生理解问题）",
      "purpose": "理解与识别"
    },
    {
      "question": "引导问题2（帮助学生分析关系）",
      "purpose": "分析与推理"
    },
    {
      "question": "引导问题3（帮助学生得出结论）",
      "purpose": "综合与评估"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 单一变量分析，明确的因果关系
- intermediate: 多变量分析，需要权衡不同因素
- advanced: 复杂系统分析，涉及多层次相互作用

请生成一个符合中文语境的分析性思维练习题目。`,

  creative: `# 创造性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计创造性思维训练题目。

## 核心要求
生成一个创造性思维练习题目，要求学生能够：
1. 跳出常规思维模式
2. 产生多样化的解决方案
3. 运用想象力和创新思维
4. 整合不同领域的知识和经验

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要创新解决的挑战）",
  "scenario": "背景情境描述（100-200字，提供创新的具体场景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（激发创意思考）",
      "purpose": "发散思维"
    },
    {
      "question": "引导问题2（探索可能性）",
      "purpose": "创新探索"
    },
    {
      "question": "引导问题3（整合方案）",
      "purpose": "方案整合"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 日常生活中的创新改进
- intermediate: 跨领域的创新应用
- advanced: 系统性的创新设计

请生成一个符合中文语境的创造性思维练习题目。`,

  practical: `# 实用性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计实用性思维训练题目。

## 核心要求
生成一个实用性思维练习题目，要求学生能够：
1. 识别现实问题的实际需求
2. 考虑资源限制和实施可行性
3. 制定具体可行的行动方案
4. 评估方案的实际效果和成本

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要解决的实际问题）",
  "scenario": "背景情境描述（100-200字，提供具体的实施环境）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别实际需求）",
      "purpose": "需求分析"
    },
    {
      "question": "引导问题2（评估可行性）",
      "purpose": "可行性评估"
    },
    {
      "question": "引导问题3（制定行动方案）",
      "purpose": "方案制定"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 个人层面的实际问题解决
- intermediate: 团队或组织层面的问题解决
- advanced: 社会或系统层面的复杂问题解决

请生成一个符合中文语境的实用性思维练习题目。`,

  caring: `# 关怀性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计关怀性思维训练题目。

## 核心要求
生成一个关怀性思维练习题目，要求学生能够：
1. 理解和关注他人的感受和需求
2. 考虑决策对不同群体的影响
3. 平衡个人利益与集体福祉
4. 体现同理心和社会责任感

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含涉及关怀和道德考量的情境）",
  "scenario": "背景情境描述（100-200字，提供具体的人际或社会背景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（理解他人感受）",
      "purpose": "同理心培养"
    },
    {
      "question": "引导问题2（分析影响）",
      "purpose": "影响评估"
    },
    {
      "question": "引导问题3（寻求平衡）",
      "purpose": "价值平衡"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 人际关系中的关怀考量
- intermediate: 社区或组织中的关怀决策
- advanced: 社会政策中的关怀伦理

请生成一个符合中文语境的关怀性思维练习题目。`,

  systematic: `# 系统性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计系统性思维训练题目。

## 核心要求
生成一个系统性思维练习题目，要求学生能够：
1. 识别系统中的各个组成部分
2. 理解部分之间的相互关系和影响
3. 从整体角度分析问题
4. 考虑系统的动态变化和反馈机制

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要系统性分析的复杂问题）",
  "scenario": "背景情境描述（100-200字，提供系统的具体背景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别系统要素）",
      "purpose": "要素识别"
    },
    {
      "question": "引导问题2（分析关系）",
      "purpose": "关系分析"
    },
    {
      "question": "引导问题3（整体思考）",
      "purpose": "整体优化"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 简单系统的基本分析
- intermediate: 复杂系统的多层次分析
- advanced: 动态系统的深度分析

请生成一个符合中文语境的系统性思维练习题目。`
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // difficulty parameter removed - not needed anymore
    // const body = await request.json();
    const thinkingTypeId = params.id;

    // 验证思维类型
    if (!THINKING_TYPE_PROMPTS[thinkingTypeId as keyof typeof THINKING_TYPE_PROMPTS]) {
      return NextResponse.json({ error: '不支持的思维类型' }, { status: 400 });
    }

    // 获取对应的提示词
    const prompt = THINKING_TYPE_PROMPTS[thinkingTypeId as keyof typeof THINKING_TYPE_PROMPTS];

    // Use prompt directly without difficulty specification
    const fullPrompt = prompt;

    // 调用AI生成题目
    const aiResponse = await aiRouter.chat(
      [
        {
          role: 'system',
          content: fullPrompt
        },
        {
          role: 'user',
          content: `请为${thinkingTypeId}思维类型生成一个练习题目。`
        }
      ],
      { stream: false }
    );

    if (!aiResponse || typeof aiResponse !== 'string') {
      return NextResponse.json({ error: 'AI生成失败' }, { status: 500 });
    }

    let questionData;
    try {
      // 尝试解析AI响应中的JSON
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[1]);
      } else {
        questionData = JSON.parse(aiResponse);
      }
    } catch (error) {
      console.error('AI响应解析失败:', error);
      return NextResponse.json({ error: 'AI生成题目格式错误' }, { status: 500 });
    }

    // 创建批判性思维题目记录
    const question = await prisma.criticalThinkingQuestion.create({
      data: {
        thinkingTypeId,
        // difficulty field removed - questions don't have difficulty anymore
        topic: questionData.topic || questionData.content?.substring(0, 100) || '批判性思维练习',
        context: questionData.scenario || questionData.content || '请根据题目要求进行思考和分析',
        question: questionData.question || questionData.content || '请分析这个批判性思维问题',
        tags: questionData.tags || [],
        thinkingFramework: {
          content: questionData.content,
          scenario: questionData.scenario,
          tags: questionData.tags || [],
          guidingQuestions: questionData.guidingQuestions || []
        },
        expectedOutcomes: questionData.expectedOutcomes || []
      }
    });

    // 创建引导问题
    if (questionData.guidingQuestions && questionData.guidingQuestions.length > 0) {
      await prisma.criticalThinkingGuidingQuestion.createMany({
        data: questionData.guidingQuestions.map((gq: any, index: number) => ({
          questionId: question.id,
          level: gq.level || 'beginner', // Use level from guiding question data or default
          stage: gq.purpose || 'general',
          question: gq.question,
          orderIndex: index
        }))
      });
    }

    // 重新获取完整的题目数据（包含引导问题）
    const completeQuestion = await prisma.criticalThinkingQuestion.findUnique({
      where: { id: question.id },
      include: {
        guidingQuestions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { question: completeQuestion }
    });

  } catch (error) {
    console.error('生成批判性思维题目失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}