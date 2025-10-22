/**
 * Level解锁系统
 * 基于 level-based-practice-flow-design.md 的解锁算法
 */

export interface UnlockCriteria {
  minQuestions: number  // 最少完成题目数
  minAccuracy: number   // 最低准确率（百分比）
}

export interface UnlockResult {
  canUnlock: boolean
  progress: {
    questionsCompleted: number
    questionsRequired: number
    averageScore: number
    requiredScore: number
  }
  message: string
}

// Level解锁条件配置
export const UNLOCK_CRITERIA: Record<string, UnlockCriteria> = {
  level2: { minQuestions: 10, minAccuracy: 80 },  // Level 1 → Level 2
  level3: { minQuestions: 8,  minAccuracy: 75 },  // Level 2 → Level 3
  level4: { minQuestions: 6,  minAccuracy: 70 },  // Level 3 → Level 4
  level5: { minQuestions: 5,  minAccuracy: 65 }   // Level 4 → Level 5
}

/**
 * 检查是否可以解锁下一Level
 * @param currentLevel 当前Level (1-4)
 * @param questionsCompleted 当前Level已完成题目数
 * @param averageScore 当前Level平均分
 * @returns 解锁结果
 */
export function checkLevelUnlock(
  currentLevel: number,
  questionsCompleted: number,
  averageScore: number
): UnlockResult {
  const nextLevel = currentLevel + 1
  
  if (nextLevel > 5) {
    return {
      canUnlock: false,
      progress: {
        questionsCompleted,
        questionsRequired: 0,
        averageScore,
        requiredScore: 0
      },
      message: '已达到最高Level'
    }
  }

  const criteria = UNLOCK_CRITERIA[`level${nextLevel}`]
  if (!criteria) {
    return {
      canUnlock: false,
      progress: {
        questionsCompleted,
        questionsRequired: 0,
        averageScore,
        requiredScore: 0
      },
      message: '无效的Level'
    }
  }

  const canUnlock = 
    questionsCompleted >= criteria.minQuestions &&
    averageScore >= criteria.minAccuracy

  let message = ''
  if (canUnlock) {
    message = `恭喜！您已达到Level ${nextLevel}的解锁条件！`
  } else {
    const needQuestions = Math.max(0, criteria.minQuestions - questionsCompleted)
    const needScore = Math.max(0, criteria.minAccuracy - averageScore)
    
    if (needQuestions > 0 && needScore > 0) {
      message = `还需完成${needQuestions}道题目，并将准确率提升至${criteria.minAccuracy}%（当前${averageScore.toFixed(1)}%）`
    } else if (needQuestions > 0) {
      message = `还需完成${needQuestions}道题目即可解锁Level ${nextLevel}！`
    } else if (needScore > 0) {
      message = `需将准确率提升至${criteria.minAccuracy}%（当前${averageScore.toFixed(1)}%）`
    }
  }

  return {
    canUnlock,
    progress: {
      questionsCompleted,
      questionsRequired: criteria.minQuestions,
      averageScore,
      requiredScore: criteria.minAccuracy
    },
    message
  }
}

/**
 * 计算Level进度百分比
 * @param questionsCompleted 已完成题目数
 * @param averageScore 平均分
 * @param targetLevel 目标Level (2-5)
 * @returns 进度百分比 (0-100)
 */
export function calculateLevelProgress(
  questionsCompleted: number,
  averageScore: number,
  targetLevel: number
): number {
  const criteria = UNLOCK_CRITERIA[`level${targetLevel}`]
  if (!criteria) return 0

  // 计算题目完成度 (权重50%)
  const questionProgress = Math.min(100, (questionsCompleted / criteria.minQuestions) * 100)
  
  // 计算准确率进度 (权重50%)
  const scoreProgress = Math.min(100, (averageScore / criteria.minAccuracy) * 100)

  // 综合进度
  return Math.floor((questionProgress + scoreProgress) / 2)
}

/**
 * 获取激励文案
 * @param progress 进度百分比
 * @param nextLevel 下一Level
 * @returns 激励文案
 */
export function getMotivationalMessage(progress: number, nextLevel: number): string {
  if (progress >= 100) {
    return `🎉 太棒了！Level ${nextLevel}已解锁！`
  } else if (progress >= 80) {
    return `💪 加油！你离解锁Level ${nextLevel}只差一步了！`
  } else if (progress >= 60) {
    return `🌟 继续保持！Level ${nextLevel}正在向你招手！`
  } else if (progress >= 40) {
    return `📈 稳步前进中，继续努力！`
  } else {
    return `🚀 开始你的Level ${nextLevel}征程吧！`
  }
}
