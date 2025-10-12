/**
 * 知识点掌握度计算逻辑
 * 基于用户练习表现更新知识点掌握度
 */

import { prisma } from '@/lib/prisma'
import { extractConceptsFromTags } from './concept-mapping'

/**
 * 更新用户知识点掌握度
 * 在用户完成练习后调用
 */
export async function updateKnowledgeMastery(
  userId: string,
  thinkingTypeId: string,
  questionId: string,
  score: number // 0-100
): Promise<void> {
  try {
    // 1. 获取题目信息，提取涉及的概念
    const question = await prisma.criticalThinkingQuestion.findUnique({
      where: { id: questionId },
      select: { tags: true }
    })

    if (!question) {
      console.error(`Question ${questionId} not found`)
      return
    }

    // 2. 从题目tags提取概念
    const conceptKeys = extractConceptsFromTags(
      thinkingTypeId,
      question.tags as string[]
    )

    console.log(`Updating mastery for concepts: ${conceptKeys.join(', ')}`)

    // 3. 为每个概念更新掌握度
    for (const conceptKey of conceptKeys) {
      await updateSingleConceptMastery(
        userId,
        thinkingTypeId,
        conceptKey,
        score / 100 // 转换为 0-1 的掌握度
      )
    }
  } catch (error) {
    console.error('Failed to update knowledge mastery:', error)
    throw error
  }
}

/**
 * 更新单个概念的掌握度
 * 使用加权平均算法：70%历史 + 30%本次
 */
async function updateSingleConceptMastery(
  userId: string,
  thinkingTypeId: string,
  conceptKey: string,
  newScore: number // 0-1
): Promise<void> {
  const existing = await prisma.knowledgePointMastery.findUnique({
    where: {
      userId_thinkingTypeId_conceptKey: {
        userId,
        thinkingTypeId,
        conceptKey
      }
    }
  })

  // 加权平均算法：70%历史 + 30%本次
  // 这个比例确保历史表现有更大权重，但新表现也能快速影响掌握度
  const newMasteryLevel = existing
    ? existing.masteryLevel * 0.7 + newScore * 0.3
    : newScore

  await prisma.knowledgePointMastery.upsert({
    where: {
      userId_thinkingTypeId_conceptKey: {
        userId,
        thinkingTypeId,
        conceptKey
      }
    },
    update: {
      masteryLevel: newMasteryLevel,
      lastPracticed: new Date(),
      practiceCount: { increment: 1 },
      updatedAt: new Date()
    },
    create: {
      id: generateId(),
      userId,
      thinkingTypeId,
      conceptKey,
      masteryLevel: newScore,
      lastPracticed: new Date(),
      practiceCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log(
    `Updated concept ${conceptKey}: ${(newMasteryLevel * 100).toFixed(1)}%`
  )
}

/**
 * 获取用户在某个思维维度的掌握度概览
 */
export async function getUserMasteryByThinkingType(
  userId: string,
  thinkingTypeId: string
) {
  const masteryData = await prisma.knowledgePointMastery.findMany({
    where: {
      userId,
      thinkingTypeId
    },
    orderBy: {
      lastPracticed: 'desc'
    }
  })

  return masteryData
}

/**
 * 获取用户所有思维维度的掌握度概览
 */
export async function getUserMasterySummary(userId: string) {
  const allMastery = await prisma.knowledgePointMastery.findMany({
    where: { userId },
    orderBy: [
      { thinkingTypeId: 'asc' },
      { masteryLevel: 'asc' }
    ]
  })

  // 按思维维度分组
  const groupedByType = allMastery.reduce((acc, item) => {
    if (!acc[item.thinkingTypeId]) {
      acc[item.thinkingTypeId] = []
    }
    acc[item.thinkingTypeId].push(item)
    return acc
  }, {} as Record<string, typeof allMastery>)

  // 计算每个维度的平均掌握度
  const summary = Object.entries(groupedByType).map(([typeId, concepts]) => {
    const avgMastery = concepts.reduce((sum, c) => sum + c.masteryLevel, 0) / concepts.length
    const lowestConcept = concepts.reduce((min, c) =>
      c.masteryLevel < min.masteryLevel ? c : min
    )

    return {
      thinkingTypeId: typeId,
      avgMastery,
      conceptCount: concepts.length,
      lowestConcept: {
        conceptKey: lowestConcept.conceptKey,
        masteryLevel: lowestConcept.masteryLevel
      },
      concepts
    }
  })

  return summary
}

/**
 * 获取需要复习的知识点
 * 基于遗忘曲线，推荐超过一定时间未练习的知识点
 */
export async function getConceptsNeedingReview(
  userId: string,
  daysSinceLastPractice: number = 7
): Promise<Array<{
  thinkingTypeId: string
  conceptKey: string
  masteryLevel: number
  daysSince: number
}>> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastPractice)

  const concepts = await prisma.knowledgePointMastery.findMany({
    where: {
      userId,
      lastPracticed: {
        lt: cutoffDate
      },
      masteryLevel: {
        lt: 0.8 // 只推荐掌握度不足80%的概念
      }
    },
    orderBy: [
      { lastPracticed: 'asc' },
      { masteryLevel: 'asc' }
    ],
    take: 10
  })

  return concepts.map(c => ({
    thinkingTypeId: c.thinkingTypeId,
    conceptKey: c.conceptKey,
    masteryLevel: c.masteryLevel,
    daysSince: Math.floor(
      (Date.now() - c.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
    )
  }))
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `kpm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
