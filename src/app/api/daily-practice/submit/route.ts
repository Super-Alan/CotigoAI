import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { PRACTICE_FEEDBACK_PROMPT } from '@/lib/prompts';

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { sessionId, answers } = await request.json();

    // 验证练习会话
    const practiceSession = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        completedAt: null
      },
      include: {
        questions: true
      }
    });

    if (!practiceSession) {
      return NextResponse.json({ error: '练习会话不存在或已结束' }, { status: 404 });
    }

    // 验证答案数量
    if (answers.length !== practiceSession.questions.length) {
      return NextResponse.json({ error: '答案数量不匹配' }, { status: 400 });
    }

    // 保存用户答案并计算得分
    let correctCount = 0;
    const answerResults = [];
    const timeSpent = [];

    for (let i = 0; i < answers.length; i++) {
      const question = practiceSession.questions[i];
      const userAnswer = answers[i];

      const isCorrect = userAnswer.answer === question.correctAnswer;
      if (isCorrect) correctCount++;

      // 保存用户答案
      const savedAnswer = await prisma.userAnswer.create({
        data: {
          questionId: question.id,
          userId: session.user.id,
          answer: userAnswer.answer,
          isCorrect,
          timeSpent: userAnswer.timeSpent || 0
        }
      });

      answerResults.push({
        questionId: question.id,
        userAnswer: userAnswer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeSpent: userAnswer.timeSpent || 0,
        explanation: question.explanation
      });

      timeSpent.push(userAnswer.timeSpent || 0);
    }

    // 计算总体表现
    const accuracy = correctCount / practiceSession.questions.length;
    const totalTime = timeSpent.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / timeSpent.length;
    const score = Math.round(accuracy * 100);

    // 更新练习会话状态
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: correctCount,
        score,
        completedAt: new Date()
      }
    });

    // 更新或创建每日打卡记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStreak = await prisma.dailyStreak.findUnique({
      where: {
        userId_practiceDate: {
          userId: session.user.id,
          practiceDate: today
        }
      }
    });

    if (!existingStreak) {
      // 获取昨天的打卡记录
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayStreak = await prisma.dailyStreak.findUnique({
        where: {
          userId_practiceDate: {
            userId: session.user.id,
            practiceDate: yesterday
          }
        }
      });

      // 计算连续天数
      let streakCount = 1;
      if (yesterdayStreak) {
        streakCount = yesterdayStreak.streakCount + 1;
      }

      // 创建今日打卡记录
      await prisma.dailyStreak.create({
        data: {
          userId: session.user.id,
          practiceDate: today,
          completed: true,
          streakCount
        }
      });
    } else {
      // 已经存在打卡记录，无需更新
      // Daily streak already exists for today
    }

    // 检查成就解锁
    const achievements = await checkAchievements(session.user.id, {
      accuracy,
      streak: await getCurrentStreak(session.user.id),
      totalSessions: await prisma.practiceSession.count({
        where: {
          userId: session.user.id,
          completedAt: { not: null }
        }
      }),
      sessionType: practiceSession.sessionType
    });

    // 生成AI反馈
    const sessionMetadata = practiceSession.metadata as any || {};
    const feedbackPrompt = `${PRACTICE_FEEDBACK_PROMPT}

## 用户表现数据
- 练习类型: ${practiceSession.sessionType}
- 难度等级: ${sessionMetadata.difficulty || 'unknown'}
- 正确率: ${(accuracy * 100).toFixed(1)}%
- 平均答题时间: ${averageTime.toFixed(1)}秒
- 总用时: ${totalTime}秒

## 详细答题情况
${answerResults.map((result, index) => `
题目${index + 1}: ${result.isCorrect ? '✓正确' : '✗错误'}
- 用户答案: ${result.userAnswer}
- 正确答案: ${result.correctAnswer}
- 用时: ${result.timeSpent}秒
`).join('')}

请基于以上数据生成个性化的学习反馈和建议。`;

    let feedbackData;
    try {
      const aiResponse = await aiRouter.chat([
        {
          role: 'system',
          content: '你是一位专业的批判性思维教育专家。请以JSON格式返回反馈建议。'
        },
        {
          role: 'user',
          content: feedbackPrompt
        }
      ], {
        temperature: 0.7,
        maxTokens: 1500
      });
      const responseText = typeof aiResponse === 'string' ? aiResponse : '';
      feedbackData = JSON.parse(responseText);
    } catch (error) {
      console.error('AI反馈生成失败:', error);
      // 提供默认反馈
      feedbackData = {
        overallScore: score,
        performance: {
          accuracy,
          averageTime,
          strengths: accuracy > 0.8 ? ['批判性思维'] : [],
          weaknesses: accuracy < 0.6 ? ['需要更多练习'] : []
        },
        feedback: {
          summary: `本次练习得分${score}分，正确率${(accuracy * 100).toFixed(1)}%`,
          improvements: ['继续保持练习习惯'],
          encouragement: '每一次练习都是进步的机会！'
        },
        recommendations: {
          nextPractice: practiceSession.sessionType,
          studyMaterials: [],
          learningPath: '建议继续当前学习路径'
        },
        achievements: achievements
      };
    }

    return NextResponse.json({
      sessionId,
      score,
      accuracy,
      correctCount,
      totalQuestions: practiceSession.questions.length,
      totalTime,
      averageTime,
      results: answerResults,
      feedback: feedbackData,
      achievements,
      streakUpdated: true
    });

  } catch (error: any) {
    console.error('提交练习答案失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// 检查成就解锁
async function checkAchievements(userId: string, performance: {
  accuracy: number;
  streak: number;
  totalSessions: number;
  sessionType: string;
}) {
  const achievements = [];

  // 获取所有成就定义
  const allAchievements = await prisma.achievement.findMany();
  
  // 获取用户已获得的成就
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true }
  });
  
  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

  for (const achievement of allAchievements) {
    if (unlockedAchievementIds.has(achievement.id)) continue;

    let shouldUnlock = false;
    const criteria = achievement.criteria as any || {};

    // 检查不同类型的成就条件
    switch (achievement.category) {
      case 'accuracy':
        if (performance.accuracy >= ((criteria.threshold || 0) / 100)) {
          shouldUnlock = true;
        }
        break;
      case 'streak':
        if (performance.streak >= (criteria.days || 0)) {
          shouldUnlock = true;
        }
        break;
      case 'milestone':
        if (performance.totalSessions >= (criteria.sessions || 0)) {
          shouldUnlock = true;
        }
        break;
      case 'knowledge':
        // 检查特定类别的练习次数
        const categoryCount = await prisma.practiceSession.count({
          where: {
            userId,
            sessionType: performance.sessionType,
            completedAt: { not: null }
          }
        });
        if (categoryCount >= (criteria.count || 0)) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      // 解锁成就
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: {}
        }
      });

      achievements.push({
        category: achievement.category,
        name: achievement.name,
        description: achievement.description,
        progress: 1.0
      });
    }
  }

  return achievements;
}

// 获取当前连续天数
async function getCurrentStreak(userId: string): Promise<number> {
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

  return todayStreak?.streakCount || 0;
}