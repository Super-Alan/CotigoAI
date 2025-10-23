/**
 * 学习进度数据聚合服务
 *
 * 负责从数据库获取和聚合各模块的进度数据
 */

import { prisma } from '@/lib/prisma';
import {
  calculatePracticeProgress,
  calculateTheoryProgress,
  calculateCourseProgress,
  calculateDailyPracticeProgress,
  calculateConversationProgress,
  calculateOverallProgress,
  calculateModuleContribution,
  MODULE_WEIGHTS,
  validateProgress
} from './calculator';

export interface UnifiedProgressData {
  overallProgress: number;
  modules: {
    practice: ModuleProgressDetail;
    theory: ModuleProgressDetail;
    course: ModuleProgressDetail;
    dailyPractice: ModuleProgressDetail;
    conversation: ModuleProgressDetail;
  };
  dimensions: {
    [thinkingTypeId: string]: number;
  };
  timeStats: {
    totalTimeSpent: number;
    thisWeek: number;
    lastUpdated: Date;
  };
}

export interface ModuleProgressDetail {
  progress: number;
  weight: number;
  contribution: number;
  details: any;
}

/**
 * 获取用户的统一进度数据
 */
export async function getUserUnifiedProgress(userId: string): Promise<UnifiedProgressData> {
  // 并行获取所有模块数据
  const [
    practiceData,
    theoryData,
    courseData,
    dailyPracticeData,
    conversationData,
    timeData
  ] = await Promise.all([
    getPracticeProgressData(userId),
    getTheoryProgressData(userId),
    getCourseProgressData(userId),
    getDailyPracticeData(userId),
    getConversationData(userId),
    getTimeSpentData(userId)
  ]);

  // 计算各模块进度
  const practiceProgress = validateProgress(calculatePracticeProgress(practiceData.summary));
  const theoryProgress = validateProgress(calculateTheoryProgress(theoryData.contents));
  const courseProgress = validateProgress(calculateCourseProgress(courseData.levelProgress));
  const dailyPracticeProgress = validateProgress(calculateDailyPracticeProgress(dailyPracticeData));
  const conversationProgress = validateProgress(calculateConversationProgress(conversationData));

  // 计算总体进度
  const overallProgress = calculateOverallProgress({
    practice: practiceProgress,
    theory: theoryProgress,
    course: courseProgress,
    dailyPractice: dailyPracticeProgress,
    conversation: conversationProgress
  });

  // 计算各维度进度
  const dimensions: { [key: string]: number } = {};
  for (const typeId of Object.keys(practiceData.byDimension)) {
    dimensions[typeId] = validateProgress(practiceData.byDimension[typeId]);
  }

  return {
    overallProgress,
    modules: {
      practice: {
        progress: practiceProgress,
        weight: MODULE_WEIGHTS.practice,
        contribution: calculateModuleContribution(practiceProgress, MODULE_WEIGHTS.practice),
        details: practiceData.summary
      },
      theory: {
        progress: theoryProgress,
        weight: MODULE_WEIGHTS.theory,
        contribution: calculateModuleContribution(theoryProgress, MODULE_WEIGHTS.theory),
        details: {
          completedContents: theoryData.contents.filter(c => c.status === 'completed').length,
          totalContents: theoryData.contents.length,
          averageCompletionRate: theoryProgress
        }
      },
      course: {
        progress: courseProgress,
        weight: MODULE_WEIGHTS.course,
        contribution: calculateModuleContribution(courseProgress, MODULE_WEIGHTS.course),
        details: courseData.levelProgress
      },
      dailyPractice: {
        progress: dailyPracticeProgress,
        weight: MODULE_WEIGHTS.dailyPractice,
        contribution: calculateModuleContribution(dailyPracticeProgress, MODULE_WEIGHTS.dailyPractice),
        details: dailyPracticeData
      },
      conversation: {
        progress: conversationProgress,
        weight: MODULE_WEIGHTS.conversation,
        contribution: calculateModuleContribution(conversationProgress, MODULE_WEIGHTS.conversation),
        details: conversationData
      }
    },
    dimensions,
    timeStats: timeData
  };
}

/**
 * 获取批判性思维练习数据
 */
async function getPracticeProgressData(userId: string) {
  const progressRecords = await prisma.criticalThinkingProgress.findMany({
    where: { userId },
    include: {
      thinkingType: true
    }
  });

  const byDimension: { [key: string]: number } = {};
  let totalQuestions = 0;
  let totalLevels = 0;

  progressRecords.forEach(record => {
    const progress = calculatePracticeProgress({
      questionsCompleted: record.questionsCompleted,
      currentLevel: record.currentLevel || 1
    });
    byDimension[record.thinkingTypeId] = progress;
    totalQuestions += record.questionsCompleted;
    totalLevels += record.currentLevel || 1;
  });

  const avgLevel = progressRecords.length > 0 ? Math.round(totalLevels / progressRecords.length) : 1;

  return {
    summary: {
      questionsCompleted: totalQuestions,
      currentLevel: avgLevel
    },
    byDimension
  };
}

/**
 * 获取理论学习数据
 */
async function getTheoryProgressData(userId: string) {
  const theoryProgress = await prisma.theoryProgress.findMany({
    where: { userId },
    include: {
      theoryContent: {
        select: {
          level: true,
          thinkingTypeId: true
        }
      }
    }
  });

  const contents = theoryProgress.map(tp => ({
    level: tp.theoryContent.level,
    progressPercent: tp.progressPercent,
    status: tp.status
  }));

  return { contents };
}

/**
 * 获取课程学习数据
 */
async function getCourseProgressData(userId: string) {
  // 查询所有课程内容
  const allContents = await prisma.levelLearningContent.findMany({
    select: {
      id: true,
      level: true,
      thinkingTypeId: true
    }
  });

  // 查询用户已完成的内容 (假设通过TheoryProgress或其他表追踪)
  // 这里简化处理,实际需要根据具体的完成标准判断
  const completedContents = await prisma.theoryProgress.findMany({
    where: {
      userId,
      status: 'completed'
    },
    include: {
      theoryContent: {
        select: {
          level: true
        }
      }
    }
  });

  const levelProgress: { [level: number]: { completed: number; total: number } } = {};

  // 初始化
  for (let level = 1; level <= 5; level++) {
    levelProgress[level] = { completed: 0, total: 0 };
  }

  // 统计总数
  allContents.forEach(content => {
    levelProgress[content.level].total++;
  });

  // 统计已完成
  completedContents.forEach(cp => {
    const level = cp.theoryContent.level;
    levelProgress[level].completed++;
  });

  return { levelProgress };
}

/**
 * 获取每日练习数据
 */
async function getDailyPracticeData(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 获取最近30天的练习记录
  const sessions = await prisma.practiceSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // 计算活跃天数
  const uniqueDays = new Set(
    sessions.map(s => s.createdAt.toISOString().split('T')[0])
  );
  const activeDaysLast30 = uniqueDays.size;

  // 计算连续天数
  const sortedDays = Array.from(uniqueDays).sort().reverse();
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDays.length > 0 && (sortedDays[0] === today || sortedDays[0] === yesterday)) {
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    activeDaysLast30,
    currentStreak
  };
}

/**
 * 获取对话学习数据
 */
async function getConversationData(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      messageCount: {
        gte: 5
      },
      timeSpent: {
        gte: 180 // 至少3分钟
      }
    }
  });

  const effectiveConversations = conversations.filter(
    c => c.status === 'completed' || c.messageCount >= 10
  ).length;

  return {
    effectiveConversations,
    targetConversations: 20
  };
}

/**
 * 获取学习时长数据
 */
async function getTimeSpentData(userId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 聚合所有模块的时长
  const [
    conversationTime,
    theoryTime,
    practiceTime
  ] = await Promise.all([
    prisma.conversation.aggregate({
      where: { userId },
      _sum: { timeSpent: true }
    }),
    prisma.theoryProgress.aggregate({
      where: { userId },
      _sum: { timeSpent: true }
    }),
    prisma.criticalThinkingPracticeSession.aggregate({
      where: { userId },
      _sum: { timeSpent: true }
    })
  ]);

  // 本周时长
  const [
    conversationTimeWeek,
    theoryTimeWeek,
    practiceTimeWeek
  ] = await Promise.all([
    prisma.conversation.aggregate({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo }
      },
      _sum: { timeSpent: true }
    }),
    prisma.theoryProgress.aggregate({
      where: {
        userId,
        lastViewedAt: { gte: oneWeekAgo }
      },
      _sum: { timeSpent: true }
    }),
    prisma.criticalThinkingPracticeSession.aggregate({
      where: {
        userId,
        completedAt: { gte: oneWeekAgo }
      },
      _sum: { timeSpent: true }
    })
  ]);

  const totalTimeSpent = (conversationTime._sum.timeSpent || 0) +
    (theoryTime._sum.timeSpent || 0) +
    (practiceTime._sum.timeSpent || 0);

  const thisWeek = (conversationTimeWeek._sum.timeSpent || 0) +
    (theoryTimeWeek._sum.timeSpent || 0) +
    (practiceTimeWeek._sum.timeSpent || 0);

  return {
    totalTimeSpent,
    thisWeek,
    lastUpdated: new Date()
  };
}

/**
 * 获取单个维度的进度
 */
export async function getDimensionProgress(
  userId: string,
  thinkingTypeId: string
): Promise<{
  thinkingTypeId: string;
  overallProgress: number;
  breakdown: {
    practice: number;
    theory: number;
    course: number;
    dailyPractice: number;
    conversation: number;
  };
  levelProgress: {
    [level: number]: number;
  };
}> {
  // 获取该维度的练习进度
  const practiceProgress = await prisma.criticalThinkingProgress.findUnique({
    where: {
      userId_thinkingTypeId: {
        userId,
        thinkingTypeId
      }
    }
  });

  const practiceValue = practiceProgress
    ? calculatePracticeProgress({
      questionsCompleted: practiceProgress.questionsCompleted,
      currentLevel: practiceProgress.currentLevel || 1
    })
    : 0;

  // 获取该维度的理论学习进度
  const theoryContents = await prisma.theoryProgress.findMany({
    where: {
      userId,
      theoryContent: {
        thinkingTypeId
      }
    },
    include: {
      theoryContent: {
        select: {
          level: true
        }
      }
    }
  });

  const theoryValue = calculateTheoryProgress(
    theoryContents.map(tp => ({
      level: tp.theoryContent.level,
      progressPercent: tp.progressPercent,
      status: tp.status
    }))
  );

  // 课程、每日练习、对话等数据需要按维度过滤
  // 简化处理,实际应该有更细粒度的追踪

  const levelProgress: { [level: number]: number } = {};
  if (practiceProgress) {
    for (let level = 1; level <= 5; level++) {
      const key = `level${level}Progress` as keyof typeof practiceProgress;
      const value = practiceProgress[key];
      levelProgress[level] = (typeof value === 'number' ? value : 0);
    }
  }

  const breakdown = {
    practice: practiceValue,
    theory: theoryValue,
    course: 0, // TODO: 实现课程维度进度
    dailyPractice: 0, // TODO: 实现每日练习维度进度
    conversation: 0  // TODO: 实现对话维度进度
  };

  const overallProgress = calculateOverallProgress({
    ...breakdown,
    course: breakdown.course,
    dailyPractice: breakdown.dailyPractice,
    conversation: breakdown.conversation
  });

  return {
    thinkingTypeId,
    overallProgress,
    breakdown,
    levelProgress
  };
}
