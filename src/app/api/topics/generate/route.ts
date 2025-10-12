import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateTopicsWithLLM,
} from '@/lib/topicGenerator';
import { TopicGenerationRequest } from '@/types/topic';

export async function POST(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const body: TopicGenerationRequest = await req.json();

    // 参数验证
    if (!body.count || body.count < 1 || body.count > 10) {
      return NextResponse.json(
        { error: '话题数量必须在1-10之间' },
        { status: 400 }
      );
    }

    console.log('[Topics Generate] 请求参数:', {
      userId: auth.userId,
      ...body,
    });

    // 构建Prompt - 根据维度选择专业提示词
    const systemPrompt = buildSystemPrompt(body.dimension);
    const userPrompt = buildUserPrompt(body);

    // 调用LLM生成话题
    const topics = await generateTopicsWithLLM(systemPrompt, userPrompt);

    console.log('[Topics Generate] 生成成功，数量:', topics.length);

    // 检查并保存话题（去重逻辑）
    const savedTopics = [];
    const skippedTopics = [];

    // 先验证用户是否存在（统一检查一次）
    let validUserId: string | null = auth.userId;
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true }
      });
      if (!userExists) {
        console.warn('[Topics Generate] 用户不存在，使用null作为userId:', auth.userId);
        validUserId = null;
      }
    } catch (error) {
      console.error('[Topics Generate] 检查用户失败，使用null作为userId:', error);
      validUserId = null;
    }

    for (const topic of topics) {
      // 检查是否已存在相同话题（根据 topic 内容判断）
      const existingTopic = await prisma.generatedConversationTopic.findFirst({
        where: {
          ...(validUserId ? { userId: validUserId } : { userId: null }),
          topic: topic.topic,
        },
      });

      if (existingTopic) {
        console.log('[Topics Generate] 话题已存在，跳过:', topic.topic.substring(0, 50) + '...');
        skippedTopics.push(existingTopic);
      } else {
        // 保存新话题
        try {
          const saved = await prisma.generatedConversationTopic.create({
            data: {
              userId: validUserId,
              topic: topic.topic,
              category: topic.category,
              context: topic.context,
              referenceUniversity: topic.referenceUniversity,
              dimension: topic.dimension,
              difficulty: topic.difficulty,
              tags: topic.tags,
              thinkingFramework: topic.thinkingFramework as any,
              guidingQuestions: topic.guidingQuestions as any,
              expectedOutcomes: topic.expectedOutcomes,
              isPublic: false, // 用户生成的话题默认私有
            },
          });
          savedTopics.push(saved);
        } catch (saveError) {
          console.error('[Topics Generate] 保存话题失败:', saveError);
          throw saveError;
        }
      }
    }

    console.log('[Topics Generate] 已保存到数据库，数量:', savedTopics.length);
    console.log('[Topics Generate] 跳过重复话题，数量:', skippedTopics.length);

    // 合并新保存的和已存在的话题
    const allTopics = [...savedTopics, ...skippedTopics];

    // 返回带数据库ID的话题
    const topicsWithId = allTopics.map((saved) => ({
      id: saved.id,
      topic: saved.topic,
      category: saved.category,
      context: saved.context,
      referenceUniversity: saved.referenceUniversity,
      dimension: saved.dimension as any,
      difficulty: saved.difficulty as any,
      tags: saved.tags,
      thinkingFramework: saved.thinkingFramework as any,
      guidingQuestions: saved.guidingQuestions as any,
      expectedOutcomes: saved.expectedOutcomes,
      createdAt: saved.createdAt,
    }));

    return NextResponse.json({
      topics: topicsWithId,
      generatedAt: new Date().toISOString(),
      stats: {
        total: allTopics.length,
        new: savedTopics.length,
        existing: skippedTopics.length,
      },
    });
  } catch (error) {
    console.error('[Topics Generate] 生成失败:', error);
    return NextResponse.json(
      {
        error: '生成话题失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
