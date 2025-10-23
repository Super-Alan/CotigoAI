/**
 * 统一学习进度计算器
 *
 * 负责计算各模块进度和总体进度
 */

// 模块权重配置
export const MODULE_WEIGHTS = {
  practice: 0.40,      // 批判性思维练习 40%
  theory: 0.25,        // 理论学习 25%
  course: 0.20,        // 课程学习 20%
  dailyPractice: 0.10, // 每日练习 10%
  conversation: 0.05   // 对话学习 5%
} as const;

// Level权重配置
export const LEVEL_WEIGHTS = {
  1: 0.10,
  2: 0.15,
  3: 0.20,
  4: 0.25,
  5: 0.30
} as const;

/**
 * 计算批判性思维练习进度
 * 公式: (数量进度 × 50%) + (级别进度 × 50%)
 */
export function calculatePracticeProgress(data: {
  questionsCompleted: number;
  currentLevel: number;
}): number {
  const { questionsCompleted, currentLevel } = data;

  // 数量进度: 最多50题为100%
  const quantityProgress = Math.min(100, Math.floor((questionsCompleted / 50) * 100));

  // 级别进度: Level 1-5
  const levelProgress = Math.round((currentLevel / 5) * 100);

  // 综合进度: 50% + 50%
  return Math.round((quantityProgress * 0.5) + (levelProgress * 0.5));
}

/**
 * 计算理论学习进度
 * 公式: Σ(单篇进度 × Level权重) / Σ(Level权重)
 */
export function calculateTheoryProgress(contents: Array<{
  level: number;
  progressPercent: number;
  status: string;
}>): number {
  if (contents.length === 0) return 0;

  let totalWeightedProgress = 0;
  let totalWeight = 0;

  contents.forEach(content => {
    const levelWeight = LEVEL_WEIGHTS[content.level as keyof typeof LEVEL_WEIGHTS] || 0.10;
    const progress = content.status === 'completed' ? 100 : content.progressPercent;

    totalWeightedProgress += progress * levelWeight;
    totalWeight += levelWeight;
  });

  return totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0;
}

/**
 * 计算课程学习进度
 * 公式: Σ(Level进度 × Level权重) / Σ(Level权重)
 */
export function calculateCourseProgress(levelProgress: {
  [level: number]: {
    completed: number;
    total: number;
  };
}): number {
  let totalWeightedProgress = 0;
  let totalWeight = 0;

  for (let level = 1; level <= 5; level++) {
    const data = levelProgress[level];
    if (!data || data.total === 0) continue;

    const levelWeight = LEVEL_WEIGHTS[level as keyof typeof LEVEL_WEIGHTS];
    const progress = (data.completed / data.total) * 100;

    totalWeightedProgress += progress * levelWeight;
    totalWeight += levelWeight;
  }

  return totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0;
}

/**
 * 计算每日练习进度
 * 公式: min(100, (最近30天活跃天数 / 30) × 100) + 连续天数加成
 */
export function calculateDailyPracticeProgress(data: {
  activeDaysLast30: number;
  currentStreak: number;
}): number {
  const { activeDaysLast30, currentStreak } = data;

  // 基础进度: 30天内活跃天数
  let baseProgress = Math.min(100, Math.round((activeDaysLast30 / 30) * 100));

  // 连续天数加成
  let streakBonus = 0;
  if (currentStreak >= 30) {
    streakBonus = 20;
  } else if (currentStreak >= 14) {
    streakBonus = 15;
  } else if (currentStreak >= 7) {
    streakBonus = 10;
  } else if (currentStreak >= 3) {
    streakBonus = 5;
  }

  return Math.min(100, baseProgress + streakBonus);
}

/**
 * 计算对话学习进度
 * 公式: min(100, (有效对话数 / 20) × 100)
 *
 * 有效对话标准:
 * - messageCount >= 5
 * - timeSpent >= 180秒
 * - status = "completed"
 */
export function calculateConversationProgress(data: {
  effectiveConversations: number;
  targetConversations?: number;
}): number {
  const target = data.targetConversations || 20;
  return Math.min(100, Math.round((data.effectiveConversations / target) * 100));
}

/**
 * 计算总体进度
 * 公式: Σ(模块进度 × 模块权重)
 */
export function calculateOverallProgress(moduleProgress: {
  practice: number;
  theory: number;
  course: number;
  dailyPractice: number;
  conversation: number;
}): number {
  const weightedSum =
    moduleProgress.practice * MODULE_WEIGHTS.practice +
    moduleProgress.theory * MODULE_WEIGHTS.theory +
    moduleProgress.course * MODULE_WEIGHTS.course +
    moduleProgress.dailyPractice * MODULE_WEIGHTS.dailyPractice +
    moduleProgress.conversation * MODULE_WEIGHTS.conversation;

  return Math.round(weightedSum);
}

/**
 * 计算模块对总进度的贡献
 */
export function calculateModuleContribution(
  moduleProgress: number,
  moduleWeight: number
): number {
  return Math.round((moduleProgress * moduleWeight) * 10) / 10; // 保留1位小数
}

/**
 * 计算维度进度 (跨模块聚合)
 */
export function calculateDimensionProgress(data: {
  practiceProgress: number;
  theoryProgress: number;
  courseProgress: number;
  dailyPracticeProgress: number;
  conversationProgress: number;
}): number {
  // 维度进度使用相同的模块权重
  return calculateOverallProgress({
    practice: data.practiceProgress,
    theory: data.theoryProgress,
    course: data.courseProgress,
    dailyPractice: data.dailyPracticeProgress,
    conversation: data.conversationProgress
  });
}

/**
 * 验证进度值有效性
 */
export function validateProgress(progress: number): number {
  if (isNaN(progress)) return 0;
  if (progress < 0) return 0;
  if (progress > 100) return 100;
  return Math.round(progress);
}
