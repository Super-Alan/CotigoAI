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

    // 获取用户已完成且及格的题目ID列表
    const completedSessions = await prisma.criticalThinkingPracticeSession.findMany({
      where: {
        userId: session.user.id,
        score: {
          gte: 60 // 及格线60分
        },
        question: {
          thinkingTypeId,
          level: levelNum
        }
      },
      select: {
        questionId: true,
        completedAt: true,
        score: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    const completedQuestionIds = completedSessions.map(s => s.questionId);

    // 优先获取未完成的题目
    let questions = await prisma.criticalThinkingQuestion.findMany({
      where: {
        ...where,
        id: {
          notIn: completedQuestionIds
        }
      },
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

    // 如果没有未完成的题目,则返回所有题目(允许重新练习)
    if (questions.length === 0) {
      questions = await prisma.criticalThinkingQuestion.findMany({
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
    }

    // 映射数据库字段到前端期望的字段名,并添加完成状态
    const mappedQuestions = questions.map(q => {
      const session = completedSessions.find(s => s.questionId === q.id);
      return {
        ...q,
        content: q.question, // 将 question 映射为 content
        isCompleted: completedQuestionIds.includes(q.id),
        completedAt: session?.completedAt || null,
        lastScore: session?.score || null
      };
    });

    const userProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId: session.user.id,
          thinkingTypeId,
        },
      },
    });

    // 获取该Level的完成统计
    const totalQuestions = await prisma.criticalThinkingQuestion.count({
      where: {
        thinkingTypeId,
        level: levelNum
      }
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
        stats: {
          totalQuestions,
          completedQuestions: completedQuestionIds.length,
          completionRate: totalQuestions > 0
            ? Math.round((completedQuestionIds.length / totalQuestions) * 100)
            : 0
        }
      },
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
