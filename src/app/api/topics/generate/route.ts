import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateTopicsWithLLM,
} from '@/lib/topicGenerator';
import { TopicGenerationRequest } from '@/types/topic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
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
      userId: session.user.id,
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

    for (const topic of topics) {
      // 检查是否已存在相同话题（根据 topic 内容判断）
      const existingTopic = await prisma.generatedConversationTopic.findFirst({
        where: {
          userId: session.user.id,
          topic: topic.topic,
        },
      });

      if (existingTopic) {
        console.log('[Topics Generate] 话题已存在，跳过:', topic.topic.substring(0, 50) + '...');
        skippedTopics.push(existingTopic);
      } else {
        // 保存新话题
        const saved = await prisma.generatedConversationTopic.create({
          data: {
            userId: session.user.id,
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
