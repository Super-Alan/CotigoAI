import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/topics/random - 随机获取话题
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '6');
    const dimension = searchParams.get('dimension');
    const difficulty = searchParams.get('difficulty');

    // 构建查询条件
    const where: any = {
      userId: session.user.id,
    };

    if (dimension) {
      where.dimension = dimension;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // 获取总数
    const total = await prisma.generatedConversationTopic.count({ where });

    if (total === 0) {
      return NextResponse.json({ topics: [] });
    }

    // 随机选择话题（使用简单的随机offset方法）
    const skip = Math.max(0, Math.floor(Math.random() * (total - count)));

    const topics = await prisma.generatedConversationTopic.findMany({
      where,
      skip,
      take: count,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[Topics Random] 随机获取成功，数量:', topics.length);

    return NextResponse.json({
      topics: topics.map((topic) => ({
        id: topic.id,
        topic: topic.topic,
        category: topic.category,
        context: topic.context,
        referenceUniversity: topic.referenceUniversity,
        dimension: topic.dimension,
        difficulty: topic.difficulty,
        tags: topic.tags,
        thinkingFramework: topic.thinkingFramework,
        guidingQuestions: topic.guidingQuestions,
        expectedOutcomes: topic.expectedOutcomes,
        usageCount: topic.usageCount,
        createdAt: topic.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Topics Random] 查询失败:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
