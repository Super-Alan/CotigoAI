import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateKnowledgeMastery } from '@/lib/knowledge/mastery-calculator';

/**
 * POST /api/critical-thinking/practice-sessions
 * 创建并提交完整的练习会话（包含反思数据）
 *
 * Sprint 1 新增端点 - 支持V2版本的线性学习流程
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const {
      questionId,
      thinkingTypeId,
      answers,
      score,
      aiFeedback,
      evaluationDetails,
      reflection, // 新增：反思数据 { learned: string, nextSteps: string, questions?: string }
      timeSpent
    } = body;

    const userId = session.user.id;

    // 验证必需字段
    if (!questionId || !thinkingTypeId || !answers) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 验证reflection数据格式（如果提供）
    if (reflection) {
      if (!reflection.learned || !reflection.nextSteps) {
        return NextResponse.json(
          { error: '反思数据不完整：需要learned和nextSteps字段' },
          { status: 400 }
        );
      }
      if (reflection.learned.length < 50) {
        return NextResponse.json(
          { error: '学习收获至少需要50字' },
          { status: 400 }
        );
      }
      if (reflection.nextSteps.length < 30) {
        return NextResponse.json(
          { error: '改进策略至少需要30字' },
          { status: 400 }
        );
      }
    }

    // 创建练习会话记录
    const practiceSession = await prisma.criticalThinkingPracticeSession.create({
      data: {
        userId,
        questionId,
        answers,
        score: score || 0,
        aiFeedback: aiFeedback || '',
        evaluationDetails: evaluationDetails || null,
        reflection: reflection || null, // 存储反思数据
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      },
      include: {
        question: {
          include: {
            thinkingType: true
          }
        }
      }
    });

    // 更新用户进度
    const currentProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      }
    });

    const newQuestionsCompleted = (currentProgress?.questionsCompleted || 0) + 1;
    const currentTotalScore = (currentProgress?.averageScore || 0) * (currentProgress?.questionsCompleted || 0);
    const newAverageScore = (currentTotalScore + (score || 0)) / newQuestionsCompleted;
    const newProgressPercentage = Math.min(100, Math.floor(newQuestionsCompleted * 5));

    await prisma.criticalThinkingProgress.upsert({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      },
      update: {
        questionsCompleted: newQuestionsCompleted,
        averageScore: newAverageScore,
        progressPercentage: newProgressPercentage,
        lastUpdated: new Date()
      },
      create: {
        userId,
        thinkingTypeId,
        questionsCompleted: 1,
        averageScore: score || 0,
        progressPercentage: 5,
        lastUpdated: new Date()
      }
    });

    // 🔥 更新知识点掌握度（Sprint 3新增）
    try {
      await updateKnowledgeMastery(
        userId,
        thinkingTypeId,
        questionId,
        score || 0
      );
      console.log(`✅ 知识点掌握度已更新 (userId: ${userId}, score: ${score})`);
    } catch (error) {
      console.error('更新知识点掌握度失败:', error);
      // 不阻断主流程，记录错误即可
    }

    // 检查并解锁成就
    await checkAndUnlockAchievements(userId, thinkingTypeId, score || 0);

    // 更新每日连续学习记录
    await updateDailyStreak(userId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: practiceSession.id,
        score: practiceSession.score,
        feedback: practiceSession.aiFeedback,
        reflection: practiceSession.reflection,
        thinkingType: practiceSession.question.thinkingType,
        progress: {
          questionsCompleted: newQuestionsCompleted,
          averageScore: newAverageScore,
          progressPercentage: newProgressPercentage
        }
      }
    });

  } catch (error) {
    console.error('创建练习会话失败:', error);
    return NextResponse.json(
      { error: '创建练习会话失败' },
      { status: 500 }
    );
  }
}

// 检查并解锁成就
async function checkAndUnlockAchievements(
  userId: string,
  thinkingTypeId: string,
  score: number
) {
  try {
    const progress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      }
    });

    if (!progress) return;

    const level = Math.floor(progress.questionsCompleted / 10) + 1;

    const achievementConditions = [
      {
        condition: level >= 5,
        achievementName: '思维大师',
        description: '在某个思维维度达到5级'
      },
      {
        condition: score === 100,
        achievementName: '完美表现',
        description: '在练习中获得满分'
      },
      {
        condition: progress.questionsCompleted >= 100,
        achievementName: '勤奋学习者',
        description: '完成100道练习题'
      },
      {
        condition: progress.averageScore >= 80 && progress.questionsCompleted >= 50,
        achievementName: '准确射手',
        description: '完成50道题且平均分达到80分'
      }
    ];

    for (const { condition, achievementName, description } of achievementConditions) {
      if (condition) {
        let achievement = await prisma.achievement.findFirst({
          where: { name: achievementName }
        });

        if (!achievement) {
          achievement = await prisma.achievement.create({
            data: {
              name: achievementName,
              description,
              badgeIcon: 'trophy',
              category: 'learning',
              criteria: {}
            }
          });
        }

        const existingUserAchievement = await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievementId: achievement.id
          }
        });

        if (!existingUserAchievement) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              earnedAt: new Date()
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('检查成就失败:', error);
  }
}

// 更新每日连续学习记录
async function updateDailyStreak(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStreak = await prisma.dailyStreak.findUnique({
      where: {
        userId_practiceDate: {
          userId,
          practiceDate: today
        }
      }
    });

    if (todayStreak) {
      if (!todayStreak.completed) {
        await prisma.dailyStreak.update({
          where: {
            userId_practiceDate: {
              userId,
              practiceDate: today
            }
          },
          data: {
            completed: true
          }
        });
      }
      return;
    }

    const recentStreaks = await prisma.dailyStreak.findMany({
      where: { userId },
      orderBy: { practiceDate: 'desc' },
      take: 1
    });

    let streakCount = 1;
    if (recentStreaks.length > 0) {
      const lastStreak = recentStreaks[0];
      const lastDate = new Date(lastStreak.practiceDate);
      lastDate.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === yesterday.getTime()) {
        streakCount = lastStreak.streakCount + 1;
      }
    }

    await prisma.dailyStreak.create({
      data: {
        userId,
        practiceDate: today,
        completed: true,
        streakCount
      }
    });
  } catch (error) {
    console.error('更新每日连续记录失败:', error);
  }
}
