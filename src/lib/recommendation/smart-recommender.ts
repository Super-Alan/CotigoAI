/**
 * 智能推荐算法
 * 基于知识点掌握度、遗忘曲线和练习频率推荐最适合的思维维度
 */

import { prisma } from '@/lib/prisma'

export interface SmartRecommendation {
  thinkingTypeId: string
  thinkingTypeName: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  targetConcepts: string[]
  score: number
}

interface DimensionScore {
  thinkingTypeId: string
  thinkingTypeName: string
  avgMastery: number
  conceptCount: number
  lowestConcepts: {
    conceptKey: string
    conceptName: string
    masteryLevel: number
  }[]
  daysSinceLastPractice: number
  practiceCount: number
}

/**
 * 获取智能推荐
 * @param userId 用户ID
 * @returns 推荐结果
 */
export async function getSmartRecommendation(
  userId: string
): Promise<SmartRecommendation | null> {
  try {
    // 1. 获取用户所有知识点掌握度
    const masteryData = await prisma.knowledgePointMastery.findMany({
      where: { userId },
      orderBy: { lastPracticed: 'desc' }
    })

    if (masteryData.length === 0) {
      // 新用户，推荐从因果分析开始（最基础的维度）
      return {
        thinkingTypeId: 'causal_analysis',
        thinkingTypeName: '多维归因与利弊权衡',
        reason: '欢迎开始批判性思维训练！建议从因果分析开始，这是最基础也是最实用的思维能力。',
        priority: 'high',
        targetConcepts: [],
        score: 1.0
      }
    }

    // 2. 按思维维度分组计算
    const dimensionMap = new Map<string, DimensionScore>()

    for (const kp of masteryData) {
      if (!dimensionMap.has(kp.thinkingTypeId)) {
        dimensionMap.set(kp.thinkingTypeId, {
          thinkingTypeId: kp.thinkingTypeId,
          thinkingTypeName: getThinkingTypeName(kp.thinkingTypeId),
          avgMastery: 0,
          conceptCount: 0,
          lowestConcepts: [],
          daysSinceLastPractice: 0,
          practiceCount: 0
        })
      }

      const dimension = dimensionMap.get(kp.thinkingTypeId)!
      dimension.conceptCount++
      dimension.avgMastery += kp.masteryLevel
      dimension.practiceCount += kp.practiceCount

      const daysSince = Math.floor(
        (Date.now() - kp.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
      )
      dimension.daysSinceLastPractice = Math.max(
        dimension.daysSinceLastPractice,
        daysSince
      )

      // 收集掌握度最低的3个概念
      if (dimension.lowestConcepts.length < 3) {
        dimension.lowestConcepts.push({
          conceptKey: kp.conceptKey,
          conceptName: kp.conceptKey, // TODO: 从映射表获取名称
          masteryLevel: kp.masteryLevel
        })
        dimension.lowestConcepts.sort((a, b) => a.masteryLevel - b.masteryLevel)
      } else if (kp.masteryLevel < dimension.lowestConcepts[2].masteryLevel) {
        dimension.lowestConcepts[2] = {
          conceptKey: kp.conceptKey,
          conceptName: kp.conceptKey,
          masteryLevel: kp.masteryLevel
        }
        dimension.lowestConcepts.sort((a, b) => a.masteryLevel - b.masteryLevel)
      }
    }

    // 计算平均掌握度
    for (const dimension of dimensionMap.values()) {
      dimension.avgMastery = dimension.avgMastery / dimension.conceptCount
    }

    // 3. 综合评分
    const recommendations: Array<SmartRecommendation> = []

    for (const dimension of dimensionMap.values()) {
      // 掌握度权重（40%）：掌握度越低，推荐优先级越高
      const masteryWeight = (1 - dimension.avgMastery) * 0.4

      // 遗忘因素权重（30%）：7天后开始遗忘，最多30%权重
      const forgettingFactor = Math.min(dimension.daysSinceLastPractice / 7, 1)
      const forgettingWeight = forgettingFactor * 0.3

      // 练习频率权重（30%）：练习次数越少，推荐优先级越高
      const avgPracticeCount =
        Array.from(dimensionMap.values()).reduce(
          (sum, d) => sum + d.practiceCount,
          0
        ) / dimensionMap.size
      const practiceFreqWeight =
        (1 - Math.min(dimension.practiceCount / Math.max(avgPracticeCount, 1), 1)) *
        0.3

      const totalScore = masteryWeight + forgettingWeight + practiceFreqWeight

      recommendations.push({
        thinkingTypeId: dimension.thinkingTypeId,
        thinkingTypeName: dimension.thinkingTypeName,
        reason: generateReason(dimension),
        priority: totalScore > 0.7 ? 'high' : totalScore > 0.4 ? 'medium' : 'low',
        targetConcepts: dimension.lowestConcepts.map(c => c.conceptKey),
        score: totalScore
      })
    }

    // 4. 返回得分最高的推荐
    recommendations.sort((a, b) => b.score - a.score)

    return recommendations[0] || null
  } catch (error) {
    console.error('Failed to generate smart recommendation:', error)
    return null
  }
}

/**
 * 生成推荐理由
 */
function generateReason(dimension: DimensionScore): string {
  const masteryPercent = Math.round(dimension.avgMastery * 100)
  const { thinkingTypeName, daysSinceLastPractice } = dimension

  if (dimension.avgMastery < 0.3) {
    return `【${thinkingTypeName}】掌握度较低（${masteryPercent}%），建议重点练习以夯实基础`
  }

  if (daysSinceLastPractice > 14) {
    return `距离上次练习【${thinkingTypeName}】已有${daysSinceLastPractice}天，建议复习巩固避免遗忘`
  }

  if (daysSinceLastPractice > 7) {
    return `【${thinkingTypeName}】需要定期复习（已${daysSinceLastPractice}天），保持思维敏锐度`
  }

  if (dimension.avgMastery < 0.6) {
    return `继续练习【${thinkingTypeName}】以提升掌握度（当前${masteryPercent}%）`
  }

  return `【${thinkingTypeName}】表现良好，继续保持学习节奏`
}

/**
 * 获取思维维度名称
 */
function getThinkingTypeName(thinkingTypeId: string): string {
  const names: Record<string, string> = {
    causal_analysis: '多维归因与利弊权衡',
    premise_challenge: '前提质疑与方法批判',
    fallacy_detection: '谬误检测',
    iterative_reflection: '迭代反思',
    connection_transfer: '知识迁移'
  }
  return names[thinkingTypeId] || thinkingTypeId
}

/**
 * 获取多个推荐（供用户选择）
 * @param userId 用户ID
 * @param count 推荐数量
 * @returns 推荐列表
 */
export async function getMultipleRecommendations(
  userId: string,
  count: number = 3
): Promise<SmartRecommendation[]> {
  try {
    const masteryData = await prisma.knowledgePointMastery.findMany({
      where: { userId },
      orderBy: { lastPracticed: 'desc' }
    })

    if (masteryData.length === 0) {
      // 新用户推荐全部维度
      const newUserRecommendations: SmartRecommendation[] = [
        {
          thinkingTypeId: 'causal_analysis',
          thinkingTypeName: '多维归因与利弊权衡',
          reason: '最基础的思维能力，适合入门',
          priority: 'high' as const,
          targetConcepts: [],
          score: 1.0
        },
        {
          thinkingTypeId: 'fallacy_detection',
          thinkingTypeName: '谬误检测',
          reason: '识别常见逻辑错误，提升辨别能力',
          priority: 'medium' as const,
          targetConcepts: [],
          score: 0.9
        },
        {
          thinkingTypeId: 'premise_challenge',
          thinkingTypeName: '前提质疑与方法批判',
          reason: '学会质疑假设，培养批判性思维',
          priority: 'medium' as const,
          targetConcepts: [],
          score: 0.8
        }
      ]
      return newUserRecommendations.slice(0, count)
    }

    // 与单个推荐使用相同的算法，返回前N个
    const topRecommendation = await getSmartRecommendation(userId)
    if (!topRecommendation) return []

    // 简化实现：返回基于单个推荐的扩展列表
    // 实际应用中可以实现更复杂的多推荐算法
    return [topRecommendation]
  } catch (error) {
    console.error('Failed to generate multiple recommendations:', error)
    return []
  }
}
