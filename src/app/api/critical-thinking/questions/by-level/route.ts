import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/critical-thinking/questions/by-level
 *
 * 获取指定Level的练习题目
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    const level = searchParams.get('level');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!thinkingTypeId || !level) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      );
    }

    const levelNum = parseInt(level);

    const where: any = {
      thinkingTypeId,
      level: levelNum,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const questions = await prisma.criticalThinkingQuestion.findMany({
      where,
      take: limit,
      include: {
        guidingQuestions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 映射数据库字段到前端期望的字段名
    const mappedQuestions = questions.map(q => ({
      ...q,
      content: q.question, // 将 question 映射为 content
    }));

    const userProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId: session.user.id,
          thinkingTypeId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        questions: mappedQuestions,
        userProgress: userProgress || {
          currentLevel: 1,
          level1Unlocked: true,
          level2Unlocked: false,
          level3Unlocked: false,
          level4Unlocked: false,
          level5Unlocked: false,
        },
      },
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
