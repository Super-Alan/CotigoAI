import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProgressData {
  level: number;
  score: number;
  sessionsCompleted: number;
  unlockedLevels: number[];
  masteryByLevel: Record<number, {
    averageScore: number;
    sessionsCount: number;
    lastPracticed: Date;
    conceptMastery: Record<string, number>;
  }>;
  nextLevelRequirements?: {
    level: number;
    requiredScore: number;
    requiredSessions: number;
    currentScore: number;
    currentSessions: number;
    canUnlock: boolean;
  };
}

// 级别解锁标准
const LEVEL_UNLOCK_CRITERIA = {
  1: { minScore: 0, minSessions: 0 },
  2: { minScore: 70, minSessions: 3 },
  3: { minScore: 75, minSessions: 5 },
  4: { minScore: 80, minSessions: 8 },
  5: { minScore: 85, minSessions: 12 }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { thinkingTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { thinkingTypeId } = params;
    const userId = session.user.id;

    // 获取用户在该思维类型的所有练习记录
    const practiceSessions = await prisma.criticalThinkingPracticeSession.findMany({
      where: {
        userId,
        question: {
          thinkingTypeId
        }
      },
      include: {
        question: {
          select: {
            level: true, // difficulty removed
            topic: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    // 获取知识点掌握度
    const knowledgeMastery = await prisma.knowledgePointMastery.findMany({
      where: {
        userId,
        thinkingTypeId
      }
    });

    // 计算各级别的统计数据
    const levelStats: Record<number, {
      scores: number[];
      sessions: number;
      lastPracticed: Date | null;
      conceptKeys: string[];
    }> = {};

    // 初始化级别统计
    for (let level = 1; level <= 5; level++) {
      levelStats[level] = {
        scores: [],
        sessions: 0,
        lastPracticed: null,
        conceptKeys: []
      };
    }

    // 处理练习记录
    practiceSessions.forEach(session => {
      // Use level directly from question (difficulty field removed)
      const level = session.question.level;

      if (session.score !== null) {
        levelStats[level].scores.push(session.score);
      }
      levelStats[level].sessions++;

      if (!levelStats[level].lastPracticed || session.completedAt > levelStats[level].lastPracticed) {
        levelStats[level].lastPracticed = session.completedAt;
      }

      // Note: conceptKeys field doesn't exist in schema, skipping for now
    });

    // 计算整体进度
    const totalSessions = practiceSessions.length;
    const totalScores = practiceSessions
      .filter(s => s.score !== null)
      .map(s => s.score!);
    const averageScore = totalScores.length > 0 
      ? Math.round(totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length)
      : 0;

    // 确定当前级别和解锁级别
    let currentLevel = 1;
    const unlockedLevels = [1]; // Level 1 默认解锁

    for (let level = 2; level <= 5; level++) {
      const criteria = LEVEL_UNLOCK_CRITERIA[level as keyof typeof LEVEL_UNLOCK_CRITERIA];
      const prevLevelStats = levelStats[level - 1];
      const prevLevelAvgScore = prevLevelStats.scores.length > 0
        ? prevLevelStats.scores.reduce((sum, score) => sum + score, 0) / prevLevelStats.scores.length
        : 0;

      if (prevLevelAvgScore >= criteria.minScore && prevLevelStats.sessions >= criteria.minSessions) {
        unlockedLevels.push(level);
        currentLevel = level;
      } else {
        break;
      }
    }

    // 构建各级别详细数据
    const masteryByLevel: Record<number, any> = {};
    for (let level = 1; level <= 5; level++) {
      const stats = levelStats[level];
      const avgScore = stats.scores.length > 0
        ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length)
        : 0;

      // 计算概念掌握度
      const conceptMastery: Record<string, number> = {};
      const uniqueConcepts = [...new Set(stats.conceptKeys)];
      
      uniqueConcepts.forEach(concept => {
        const masteryRecord = knowledgeMastery.find(km => km.conceptKey === concept);
        conceptMastery[concept] = masteryRecord?.masteryLevel || 0;
      });

      masteryByLevel[level] = {
        averageScore: avgScore,
        sessionsCount: stats.sessions,
        lastPracticed: stats.lastPracticed,
        conceptMastery
      };
    }

    // 计算下一级别解锁要求
    let nextLevelRequirements: ProgressData['nextLevelRequirements'] = undefined;
    if (currentLevel < 5) {
      const nextLevel = currentLevel + 1;
      const criteria = LEVEL_UNLOCK_CRITERIA[nextLevel as keyof typeof LEVEL_UNLOCK_CRITERIA];
      const currentLevelStats = levelStats[currentLevel];
      const currentLevelAvgScore = currentLevelStats.scores.length > 0
        ? Math.round(currentLevelStats.scores.reduce((sum, score) => sum + score, 0) / currentLevelStats.scores.length)
        : 0;

      nextLevelRequirements = {
        level: nextLevel,
        requiredScore: criteria.minScore,
        requiredSessions: criteria.minSessions,
        currentScore: currentLevelAvgScore,
        currentSessions: currentLevelStats.sessions,
        canUnlock: currentLevelAvgScore >= criteria.minScore && currentLevelStats.sessions >= criteria.minSessions
      };
    }

    // 计算综合进度百分比
    // 公式: 50% 基于题目数量 (最多50题) + 50% 基于级别解锁 (1-5级)
    const quantityProgress = Math.min(100, Math.floor((totalSessions / 50) * 100));
    const levelProgress = Math.round((currentLevel / 5) * 100);
    const combinedProgress = Math.round((quantityProgress * 0.5) + (levelProgress * 0.5));

    // 更新或创建进度记录
    await prisma.criticalThinkingProgress.upsert({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      },
      update: {
        progressPercentage: combinedProgress,
        questionsCompleted: totalSessions,
        averageScore: averageScore,
        currentLevel: currentLevel,
        lastUpdated: new Date()
      },
      create: {
        userId,
        thinkingTypeId,
        progressPercentage: combinedProgress,
        questionsCompleted: totalSessions,
        averageScore: averageScore,
        currentLevel: currentLevel,
        lastUpdated: new Date()
      }
    });

    const progressData: ProgressData = {
      level: currentLevel,
      score: averageScore,
      sessionsCompleted: totalSessions,
      unlockedLevels,
      masteryByLevel,
      nextLevelRequirements
    };

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('获取用户进度失败:', error);
    return NextResponse.json(
      { error: '获取进度失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { thinkingTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { thinkingTypeId } = params;
    const userId = session.user.id;
    const body = await request.json();

    const { 
      level, 
      score, 
      conceptKeys = [], 
      timeSpent = 0,
      sessionId 
    } = body;

    // 验证输入
    if (!level || score === undefined || level < 1 || level > 5) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 });
    }

    // TODO: Update knowledge point mastery after fixing schema duplication issue
    // Note: conceptKeys field doesn't exist in CriticalThinkingQuestion schema
    // if (conceptKeys.length > 0) {
    //   for (const conceptKey of conceptKeys) {
    //     const existingMastery = await prisma.knowledgePointMastery.findUnique({
    //       where: {
    //         userId_thinkingTypeId_conceptKey: {
    //           userId,
    //           thinkingTypeId,
    //           conceptKey
    //         }
    //       }
    //     });
    //     let newMasteryLevel = score / 100;
    //     if (existingMastery) {
    //       newMasteryLevel = existingMastery.masteryLevel * 0.7 + (score / 100) * 0.3;
    //     }
    //     await prisma.knowledgePointMastery.upsert({
    //       where: {
    //         userId_thinkingTypeId_conceptKey: { userId, thinkingTypeId, conceptKey }
    //       },
    //       update: {
    //         masteryLevel: Math.min(1.0, newMasteryLevel),
    //         lastPracticed: new Date(),
    //         practiceCount: { increment: 1 }
    //       },
    //       create: {
    //         userId, thinkingTypeId, conceptKey,
    //         masteryLevel: Math.min(1.0, newMasteryLevel),
    //         lastPracticed: new Date(),
    //         practiceCount: 1
    //       }
    //     });
    //   }
    // }

    // 重新计算并返回更新后的进度
    const updatedProgressResponse = await GET(request, { params });
    return updatedProgressResponse;

  } catch (error) {
    console.error('更新用户进度失败:', error);
    return NextResponse.json(
      { error: '更新进度失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}