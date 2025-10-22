import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Level解锁条件
const UNLOCK_CRITERIA = {
  level2: { minQuestions: 10, minAccuracy: 80 },
  level3: { minQuestions: 8, minAccuracy: 75 },
  level4: { minQuestions: 6, minAccuracy: 70 },
  level5: { minQuestions: 5, minAccuracy: 65 },
};

/**
 * POST /api/critical-thinking/progress/update-level
 *
 * 更新用户在特定Level的进度，自动检查解锁条件
 */
export async function POST(req: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { thinkingTypeId, level, score, questionId } = body;

    // 详细日志：查看实际收到的参数
    console.log('[update-level] Received params:', { userId, thinkingTypeId, level, score, questionId });

    if (!thinkingTypeId || !level || score === undefined) {
      console.error('[update-level] Missing params:', {
        hasThinkingTypeId: !!thinkingTypeId,
        hasLevel: !!level,
        hasScore: score !== undefined,
        body
      });
      return NextResponse.json(
        { success: false, error: '缺少必需参数', details: { thinkingTypeId: !!thinkingTypeId, level: !!level, score: score !== undefined } },
        { status: 400 }
      );
    }

    // 1. 查找或创建进度记录
    let progress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.criticalThinkingProgress.create({
        data: {
          userId,
          thinkingTypeId,
          currentLevel: 1,
          level1Unlocked: true,
        },
      });
    }

    // 2. 更新对应Level的进度
    const questionsCompletedKey = `level${level}QuestionsCompleted`;
    const averageScoreKey = `level${level}AverageScore`;

    const currentQuestions = (progress as any)[questionsCompletedKey] || 0;
    const currentAvgScore = (progress as any)[averageScoreKey] || 0;

    // 计算新的平均分（确保不为null）
    const newAvgScore =
      currentQuestions > 0
        ? (currentAvgScore * currentQuestions + score) / (currentQuestions + 1)
        : score;

    // 确保 newAvgScore 不为 null/undefined
    const safeNewAvgScore = newAvgScore ?? 0;

    // ✅ 根据当前Level的解锁要求动态计算进度百分比
    // Level 1: 10题解锁L2, Level 2: 8题解锁L3, Level 3: 6题解锁L4, Level 4: 5题解锁L5
    const getRequiredQuestions = (lvl: number): number => {
      const nextLevelKey = `level${lvl + 1}` as keyof typeof UNLOCK_CRITERIA;
      return UNLOCK_CRITERIA[nextLevelKey]?.minQuestions || 10; // 默认10题
    };

    const requiredQuestions = getRequiredQuestions(level);
    const newProgress = Math.min(((currentQuestions + 1) / requiredQuestions) * 100, 100);

    // 3. 更新进度
    const updateData: any = {
      [`level${level}Progress`]: newProgress,
      [questionsCompletedKey]: currentQuestions + 1,
      [averageScoreKey]: safeNewAvgScore,
      questionsCompleted: (progress.questionsCompleted || 0) + 1,
      averageScore:
        (progress.questionsCompleted || 0) > 0
          ? ((progress.averageScore || 0) * (progress.questionsCompleted || 0) + score) /
            ((progress.questionsCompleted || 0) + 1)
          : score,
      lastPracticeAt: new Date(),
      lastUpdated: new Date(),
    };

    // 4. 检查是否解锁下一Level
    let levelUnlockStatus: any = null;
    const nextLevel = level + 1;

    if (nextLevel <= 5) {
      const criteria = UNLOCK_CRITERIA[`level${nextLevel}` as keyof typeof UNLOCK_CRITERIA];

      if (criteria) {
        const shouldUnlock =
          currentQuestions + 1 >= criteria.minQuestions && safeNewAvgScore >= criteria.minAccuracy;

        const isAlreadyUnlocked = (progress as any)[`level${nextLevel}Unlocked`];

        if (shouldUnlock && !isAlreadyUnlocked) {
          updateData[`level${nextLevel}Unlocked`] = true;
          updateData.currentLevel = nextLevel;

          levelUnlockStatus = {
            unlocked: true,
            level: nextLevel,
            message: `恭喜！你已解锁Level ${nextLevel}！`,
            questionsCompleted: currentQuestions + 1,
            questionsRequired: criteria.minQuestions,
            averageScore: safeNewAvgScore,
            requiredScore: criteria.minAccuracy,
          };
        } else if (!shouldUnlock) {
          const questionsNeeded = Math.max(0, criteria.minQuestions - (currentQuestions + 1));
          levelUnlockStatus = {
            unlocked: false,
            level: nextLevel,
            message:
              questionsNeeded > 0
                ? `还需完成${questionsNeeded}道题目，当前准确率${safeNewAvgScore.toFixed(1)}%（需要${criteria.minAccuracy}%）`
                : `当前准确率${safeNewAvgScore.toFixed(1)}%，需要达到${criteria.minAccuracy}%才能解锁Level ${nextLevel}`,
            questionsCompleted: currentQuestions + 1,
            questionsRequired: criteria.minQuestions,
            averageScore: safeNewAvgScore,
            requiredScore: criteria.minAccuracy,
          };
        }
      }
    }

    // 5. 执行更新
    const updatedProgress = await prisma.criticalThinkingProgress.update({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId,
        },
      },
      data: updateData,
    });

    // 6. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        updatedProgress,
        levelUnlockStatus,
      },
    });
  } catch (error) {
    console.error('更新Level进度失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
