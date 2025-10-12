import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/learning-progress - 获取用户学习进度
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取五维思维能力进度
    const thinkingProgress = await prisma.criticalThinkingProgress.findMany({
      where: { userId },
      include: {
        thinkingType: true
      }
    });

    // 获取练习会话统计
    const practiceStats = await prisma.practiceSession.groupBy({
      by: ['sessionType'],
      where: { userId },
      _count: {
        id: true
      },
      _avg: {
        score: true
      }
    });

    // 获取最近的练习记录
    const recentPractice = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        sessionType: true,
        score: true,
        createdAt: true,
        totalQuestions: true
      }
    });

    // 获取学习里程碑
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    // 计算总体学习统计
    const totalSessions = await prisma.practiceSession.count({
      where: { userId }
    });

    const averageScore = await prisma.practiceSession.aggregate({
      where: { userId },
      _avg: { score: true }
    });

    // 获取连续学习天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streak = await prisma.dailyStreak.findFirst({
      where: { userId },
      orderBy: { practiceDate: 'desc' }
    });

    return NextResponse.json({
      thinkingProgress: thinkingProgress.map(progress => ({
        thinkingType: progress.thinkingType.name,
        typeId: progress.thinkingType.id,
        level: Math.floor(progress.questionsCompleted / 10) + 1,
        progressPercentage: progress.progressPercentage,
        questionsCompleted: progress.questionsCompleted,
        averageScore: progress.averageScore,
        accuracy: progress.averageScore.toFixed(1)
      })),
      practiceStats: practiceStats.map(stat => ({
        sessionType: stat.sessionType,
        totalSessions: stat._count.id,
        averageScore: stat._avg.score?.toFixed(1) || '0'
      })),
      recentPractice,
      achievements: achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.badgeIcon,
        unlockedAt: ua.earnedAt
      })),
      overallStats: {
        totalSessions,
        averageScore: averageScore._avg.score?.toFixed(1) || '0',
        currentStreak: streak?.streakCount || 0,
        longestStreak: streak?.streakCount || 0
      }
    });

  } catch (error) {
    console.error('获取学习进度失败:', error);
    return NextResponse.json(
      { error: '获取学习进度失败' },
      { status: 500 }
    );
  }
}

// POST /api/learning-progress - 更新学习进度
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { thinkingTypeId, score } = await request.json();
    const userId = session.user.id;

    if (!thinkingTypeId || score === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数: thinkingTypeId, score' },
        { status: 400 }
      );
    }

    // 更新或创建思维类型进度
    const existingProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      }
    });

    if (existingProgress) {
      // 更新现有进度 - 计算新的平均分和进度百分比
      const newQuestionsCompleted = existingProgress.questionsCompleted + 1;
      const newAverageScore =
        (existingProgress.averageScore * existingProgress.questionsCompleted + score) /
        newQuestionsCompleted;
      const newProgressPercentage = Math.min(100, Math.floor(newQuestionsCompleted * 5)); // 每完成一题增加5%

      const updatedProgress = await prisma.criticalThinkingProgress.update({
        where: {
          userId_thinkingTypeId: {
            userId,
            thinkingTypeId
          }
        },
        data: {
          questionsCompleted: newQuestionsCompleted,
          averageScore: newAverageScore,
          progressPercentage: newProgressPercentage,
          lastUpdated: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        progress: updatedProgress
      });
    } else {
      // 创建新进度记录
      const newProgress = await prisma.criticalThinkingProgress.create({
        data: {
          userId,
          thinkingTypeId,
          questionsCompleted: 1,
          averageScore: score,
          progressPercentage: 5, // 首次完成5%
          lastUpdated: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        progress: newProgress
      });
    }

  } catch (error) {
    console.error('更新学习进度失败:', error);
    return NextResponse.json(
      { error: '更新学习进度失败' },
      { status: 500 }
    );
  }
}