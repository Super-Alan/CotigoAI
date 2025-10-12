import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/practice-sessions/[id]/submit - 提交练习答案
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { answers, duration } = await request.json();
    const userId = session.user.id;
    const sessionId = params.id;

    // 验证输入
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: '答案数据无效' },
        { status: 400 }
      );
    }

    // 检查是否是批判性思维练习会话
    const criticalThinkingSession = await prisma.criticalThinkingPracticeSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        questions: true,
        thinkingType: true
      }
    });

    if (criticalThinkingSession) {
      return await submitCriticalThinkingSession(
        criticalThinkingSession,
        answers,
        duration,
        userId
      );
    }

    // 检查普通练习会话
    const practiceSession = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        questions: true
      }
    });

    if (practiceSession) {
      return await submitPracticeSession(
        practiceSession,
        answers,
        duration,
        userId
      );
    }

    return NextResponse.json(
      { error: '练习会话不存在' },
      { status: 404 }
    );

  } catch (error) {
    console.error('提交练习答案失败:', error);
    return NextResponse.json(
      { error: '提交练习答案失败' },
      { status: 500 }
    );
  }
}

// 提交批判性思维练习会话
async function submitCriticalThinkingSession(
  session: any,
  answers: any[],
  duration: number,
  userId: string
) {
  let correctAnswers = 0;
  const results = [];

  // 处理每个答案
  for (const answer of answers) {
    const question = session.questions.find((q: any) => q.id === answer.questionId);
    if (!question) continue;

    const isCorrect = question.correctAnswer === answer.selectedOption;
    if (isCorrect) correctAnswers++;

    // 保存用户答案
    await prisma.userAnswer.create({
      data: {
        userId,
        questionId: question.id,
        answer: answer.selectedOption.toString(),
        isCorrect,
        submittedAt: new Date()
      }
    });

    results.push({
      questionId: question.id,
      question: question.question,
      selectedOption: answer.selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    });
  }

  // 计算分数
  const score = Math.round((correctAnswers / session.questions.length) * 100);

  // 更新练习会话
  await prisma.criticalThinkingPracticeSession.update({
    where: { id: session.id },
    data: {
      score,
      correctAnswers,
      duration,
      completedAt: new Date()
    }
  });

  // 更新用户的思维类型进度
  const experienceGained = correctAnswers * 10 + (score >= 80 ? 20 : 0);
  
  await prisma.criticalThinkingProgress.upsert({
    where: {
      userId_thinkingTypeId: {
        userId,
        thinkingTypeId: session.thinkingTypeId
      }
    },
    update: {
      experience: {
        increment: experienceGained
      },
      totalQuestions: {
        increment: session.questions.length
      },
      correctAnswers: {
        increment: correctAnswers
      },
      level: {
        set: Math.floor((await getCurrentExperience(userId, session.thinkingTypeId) + experienceGained) / 100) + 1
      }
    },
    create: {
      userId,
      thinkingTypeId: session.thinkingTypeId,
      experience: experienceGained,
      totalQuestions: session.questions.length,
      correctAnswers,
      level: Math.floor(experienceGained / 100) + 1
    }
  });

  // 检查是否解锁成就
  await checkAndUnlockAchievements(userId, session.thinkingTypeId, score, correctAnswers);

  // 更新每日连续学习记录
  await updateDailyStreak(userId);

  return NextResponse.json({
    success: true,
    results: {
      score,
      correctAnswers,
      totalQuestions: session.questions.length,
      experienceGained,
      duration,
      questions: results,
      thinkingType: session.thinkingType
    }
  });
}

// 提交普通练习会话
async function submitPracticeSession(
  session: any,
  answers: any[],
  duration: number,
  userId: string
) {
  let correctAnswers = 0;
  const results = [];

  // 处理每个答案
  for (const answer of answers) {
    const question = session.questions.find((q: any) => q.id === answer.questionId);
    if (!question) continue;

    const isCorrect = question.correctAnswer === answer.selectedOption;
    if (isCorrect) correctAnswers++;

    // 保存用户答案
    await prisma.userAnswer.create({
      data: {
        userId,
        questionId: question.id,
        answer: answer.selectedOption.toString(),
        isCorrect,
        submittedAt: new Date()
      }
    });

    results.push({
      questionId: question.id,
      question: question.question,
      selectedOption: answer.selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    });
  }

  // 计算分数
  const score = Math.round((correctAnswers / session.questions.length) * 100);

  // 更新练习会话
  await prisma.practiceSession.update({
    where: { id: session.id },
    data: {
      score,
      correctAnswers,
      duration,
      completedAt: new Date()
    }
  });

  // 更新每日连续学习记录
  await updateDailyStreak(userId);

  return NextResponse.json({
    success: true,
    results: {
      score,
      correctAnswers,
      totalQuestions: session.questions.length,
      duration,
      questions: results,
      sessionType: session.sessionType
    }
  });
}

// 获取当前经验值
async function getCurrentExperience(userId: string, thinkingTypeId: string): Promise<number> {
  const progress = await prisma.criticalThinkingProgress.findUnique({
    where: {
      userId_thinkingTypeId: {
        userId,
        thinkingTypeId
      }
    }
  });
  return progress?.experience || 0;
}

// 检查并解锁成就
async function checkAndUnlockAchievements(
  userId: string,
  thinkingTypeId: string,
  score: number,
  correctAnswers: number
) {
  try {
    // 获取用户的思维类型进度
    const progress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      }
    });

    if (!progress) return;

    // 定义成就条件
    const achievementConditions = [
      {
        condition: progress.level >= 5,
        achievementName: '思维大师',
        description: '在某个思维维度达到5级'
      },
      {
        condition: score === 100,
        achievementName: '完美表现',
        description: '在练习中获得满分'
      },
      {
        condition: progress.totalQuestions >= 100,
        achievementName: '勤奋学习者',
        description: '完成100道练习题'
      },
      {
        condition: progress.correctAnswers >= 50 && (progress.correctAnswers / progress.totalQuestions) >= 0.8,
        achievementName: '准确射手',
        description: '正确回答50道题且准确率达到80%'
      }
    ];

    // 检查每个成就条件
    for (const { condition, achievementName, description } of achievementConditions) {
      if (condition) {
        // 检查成就是否存在
        let achievement = await prisma.achievement.findFirst({
          where: { name: achievementName }
        });

        if (!achievement) {
          // 创建成就
          achievement = await prisma.achievement.create({
            data: {
              name: achievementName,
              description,
              icon: 'trophy',
              category: 'learning'
            }
          });
        }

        // 检查用户是否已经解锁此成就
        const existingUserAchievement = await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievementId: achievement.id
          }
        });

        if (!existingUserAchievement) {
          // 解锁成就
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              unlockedAt: new Date()
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

    const streak = await prisma.dailyStreak.findUnique({
      where: { userId }
    });

    if (!streak) {
      // 创建新的连续记录
      await prisma.dailyStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today
        }
      });
    } else {
      const lastActiveDate = new Date(streak.lastActiveDate);
      lastActiveDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // 今天已经学习过了，不需要更新
        return;
      } else if (daysDiff === 1) {
        // 连续学习
        const newStreak = streak.currentStreak + 1;
        await prisma.dailyStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(streak.longestStreak, newStreak),
            lastActiveDate: today
          }
        });
      } else {
        // 中断了连续学习
        await prisma.dailyStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActiveDate: today
          }
        });
      }
    }
  } catch (error) {
    console.error('更新每日连续记录失败:', error);
  }
}