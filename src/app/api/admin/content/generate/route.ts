import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { ChatMessage, ThinkingTypeId, CognitiveLevel } from '@/types';
import { generateLevelBasedPrompt } from '@/lib/prompts/level-based-generation-prompts';

interface GenerateRequest {
  thinkingTypeId: string;
  level: number;
  count: number;
  // difficulty field removed - using level instead
  topics?: string[];
  conceptKeys?: string[];
  includeScaffolding?: boolean;
  includeCaseStudy?: boolean;
}

interface GeneratedQuestion {
  topic: string;
  context: string;
  question?: string;
  tags?: string[];
  thinkingFramework: any;
  expectedOutcome?: string;
  expectedOutcomes?: string[];
  caseAnalysis: any;
  guidingQuestions: any[];
  conceptKeys?: string[];
  learningObjectives?: string[];
  scaffolding?: any;
  assessmentCriteria?: any;
}

/**
 * 从Markdown代码块中提取JSON内容
 * AI可能返回 ```json\n{...}\n``` 格式，需要提取纯JSON
 */
function extractJSONFromMarkdown(text: string): string {
  // 匹配 ```json...``` 或 ```...``` 代码块
  const match = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  return match ? match[1].trim() : text.trim();
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查管理员权限
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body: GenerateRequest = await request.json();
    const {
      thinkingTypeId,
      level,
      count,
      topics = [],
      conceptKeys = [],
      includeScaffolding = level <= 2,  // Default true for Level 1-2, difficulty removed
      includeCaseStudy = true           // Default true
    } = body;

    // 验证输入参数
    if (!thinkingTypeId || level < 1 || level > 5 || count < 1 || count > 20) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 });
    }

    // 获取思维类型信息
    const thinkingTypeData = await prisma.thinkingType.findUnique({
      where: { id: thinkingTypeId }
    });

    if (!thinkingTypeData) {
      return NextResponse.json({ error: '思维类型不存在' }, { status: 404 });
    }

    // 使用新的Level-based Prompt生成系统
    const prompt = generateLevelBasedPrompt({
      thinkingTypeId: thinkingTypeId as ThinkingTypeId,
      level: level as CognitiveLevel,
      count,
      topics: topics.length > 0 ? topics : undefined,
      customPrompt: conceptKeys.length > 0 ? `重点涵盖概念：${conceptKeys.join('、')}` : undefined,
      includeScaffolding,
      includeCaseStudy
    });

    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    // 调用 Qwen AI 生成内容（不使用流式，避免复杂性）
    // 直接增加超时时间，使用简单的非流式响应
    const response = await aiRouter.chat(messages, {
      model: 'qwen3-max',
      temperature: 0.8,
      maxTokens: 4000,
      stream: false  // 暂时禁用流式，先保证功能可用
    });

    // 简单的非流式响应处理
    if (typeof response !== 'string') {
      throw new Error('AI 响应格式错误');
    }

    // 解析完整响应
    let generatedQuestions: GeneratedQuestion[];
    try {
      console.log('AI响应内容（前500字符）:', response.substring(0, 500));

      // 提取JSON（去除可能的Markdown代码块包裹）
      const cleanedResponse = extractJSONFromMarkdown(response);
      console.log('清理后的JSON（前500字符）:', cleanedResponse.substring(0, 500));

      const parsed = JSON.parse(cleanedResponse);
      generatedQuestions = parsed.questions || [];
      console.log(`成功解析 ${generatedQuestions.length} 道题目`);
    } catch (error) {
      console.error('AI 响应解析失败:', error);
      console.error('原始响应内容:', response);
      return NextResponse.json({ error: 'AI 响应解析失败' }, { status: 500 });
    }

    // 创建SSE流来发送保存进度
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送解析完成信号
          controller.enqueue(encoder.encode(`data: {"status":"parsed","count":${generatedQuestions.length}}\n\n`));

          // 保存到数据库
          const savedQuestions = [];
          for (let i = 0; i < generatedQuestions.length; i++) {
            const question = generatedQuestions[i];
            try {
              // Extract thinkingFramework from scaffolding if needed
              let thinkingFramework = question.thinkingFramework;
              let scaffolding = question.scaffolding;

              // AI may put thinkingFramework inside scaffolding, extract it
              if (!thinkingFramework && scaffolding && typeof scaffolding === 'object' && 'thinkingFramework' in scaffolding) {
                thinkingFramework = (scaffolding as any).thinkingFramework;
                // Remove from scaffolding to avoid duplication
                const { thinkingFramework: _, ...restScaffolding } = scaffolding as any;
                scaffolding = restScaffolding;
              }

              // Provide default if still missing
              if (!thinkingFramework) {
                thinkingFramework = { description: '思维框架待补充' };
              }

              const savedQuestion = await prisma.criticalThinkingQuestion.create({
                data: {
                  thinkingTypeId: thinkingTypeId,
                  topic: question.topic,
                  context: question.context,
                  question: question.question || question.topic,
                  tags: question.tags || [],
                  thinkingFramework: thinkingFramework,
                  expectedOutcomes: question.expectedOutcomes || question.expectedOutcome || [],
                  caseAnalysis: question.caseAnalysis,
                  level: level,
                  learningObjectives: question.learningObjectives || [],
                  scaffolding: scaffolding || null,
                  assessmentCriteria: question.assessmentCriteria || null,
                }
              });

              // 保存引导问题
              if (question.guidingQuestions && question.guidingQuestions.length > 0) {
                for (let j = 0; j < question.guidingQuestions.length; j++) {
                  const guidingQ = question.guidingQuestions[j];
                  await prisma.criticalThinkingGuidingQuestion.create({
                    data: {
                      questionId: savedQuestion.id,
                      level: guidingQ.level || 'beginner', // Use level from guiding question or default
                      stage: guidingQ.stage || 'general',
                      question: guidingQ.question,
                      orderIndex: j + 1
                    }
                  });
                }
              }

              savedQuestions.push(savedQuestion);

              // 发送保存进度（转义特殊字符）
              const safeTopic = savedQuestion.topic.replace(/"/g, '\\"').replace(/\n/g, ' ');
              controller.enqueue(encoder.encode(`data: {"status":"saving","current":${i + 1},"total":${generatedQuestions.length},"topic":"${safeTopic}"}\n\n`));
            } catch (error) {
              console.error('保存问题失败:', error);
              const errorMsg = error instanceof Error ? error.message : '未知错误';
              controller.enqueue(encoder.encode(`data: {"status":"error","message":"保存失败: ${errorMsg}"}\n\n`));
            }
          }

          // 发送完成信号
          const result = {
            status: 'completed',
            data: {
              generated: savedQuestions.length,
              requested: count,
              questions: savedQuestions.map(q => ({
                id: q.id,
                topic: q.topic,
                // difficulty field removed
                level: q.level
              }))
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
          controller.close();
        } catch (error) {
          console.error('保存处理失败:', error);
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          controller.enqueue(encoder.encode(`data: {"status":"error","message":"${errorMsg}"}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI 内容生成失败:', error);
    return NextResponse.json(
      { error: '内容生成失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// Legacy prompt building functions removed - now using generateLevelBasedPrompt from level-based-generation-prompts.ts