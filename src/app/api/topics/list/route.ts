import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET /api/topics/list - 获取话题列表
export async function GET(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const dimension = searchParams.get('dimension');
    const difficulty = searchParams.get('difficulty');

    // 构建查询条件
    const where: any = {
      userId: auth.userId,
    };

    if (dimension) {
      where.dimension = dimension;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // 查询总数
    const total = await prisma.generatedConversationTopic.count({
      where,
    });

    // 计算分页
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // 查询用户的话题（倒序 + 分页）
    const topics = await prisma.generatedConversationTopic.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    console.log('[Topics List] 查询成功，数量:', topics.length, '总数:', total, '页码:', page, '/', totalPages);

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
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[Topics List] 查询失败:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
