/**
 * 理论内容生成端到端测试
 */

import { PrismaClient } from '@prisma/client'
import { generateTheoryContent, ContentValidator, Logger } from '../../../scripts/generate-theory-content-v2'

const prisma = new PrismaClient()

// 测试配置
const TEST_CONFIG = {
  testDimensions: ['causal_analysis'], // 只测试一个维度
  testLevels: [1, 2], // 只测试前两个级别
  timeout: 120000 // 2分钟超时
}

describe('Theory Content Generation E2E Tests', () => {
  beforeAll(async () => {
    // 清理可能存在的测试数据
    await cleanupTestContent()
  })

  afterAll(async () => {
    // 清理测试数据
    await cleanupTestContent()
    await prisma.$disconnect()
  })

  describe('完整内容生成流程', () => {
    it('应该成功生成完整的理论内容', async () => {
      const result = await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        TEST_CONFIG.testLevels,
        false // 不跳过已存在的内容
      )

      // 验证生成结果
      expect(result.totalTasks).toBe(TEST_CONFIG.testDimensions.length * TEST_CONFIG.testLevels.length)
      expect(result.completed).toBeGreaterThan(0)
      expect(result.errors).toBe(0)

      // 验证数据库中的内容
      for (const dimensionId of TEST_CONFIG.testDimensions) {
        for (const level of TEST_CONFIG.testLevels) {
          const content = await prisma.theoryContent.findFirst({
            where: {
              thinkingTypeId: dimensionId,
              level: level,
              isPublished: true
            }
          })

          expect(content).toBeTruthy()
          expect(content?.title).toBeTruthy()
          expect(content?.description).toBeTruthy()
          expect(content?.conceptsContent).toBeTruthy()
          expect(content?.modelsContent).toBeTruthy()
          expect(content?.demonstrationsContent).toBeTruthy()

          // 验证内容质量
          const conceptsValidation = ContentValidator.validateConceptsContent(content?.conceptsContent)
          expect(conceptsValidation.isValid).toBe(true)

          const modelsValidation = ContentValidator.validateModelsContent(content?.modelsContent)
          expect(modelsValidation.isValid).toBe(true)

          const demonstrationsValidation = ContentValidator.validateDemonstrationsContent(content?.demonstrationsContent)
          expect(demonstrationsValidation.isValid).toBe(true)
        }
      }
    }, TEST_CONFIG.timeout)

    it('应该正确处理已存在的内容', async () => {
      // 第一次生成
      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]], // 只生成第一个级别
        false
      )

      // 第二次生成，应该跳过已存在的内容
      const result = await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        true // 跳过已存在的内容
      )

      expect(result.skipped).toBe(1)
      expect(result.completed).toBe(0)
    }, TEST_CONFIG.timeout)

    it('应该生成有效的JSON内容', async () => {
      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        false
      )

      const content = await prisma.theoryContent.findFirst({
        where: {
          thinkingTypeId: TEST_CONFIG.testDimensions[0],
          level: TEST_CONFIG.testLevels[0]
        }
      })

      expect(content).toBeTruthy()

      // 验证概念内容结构
      const conceptsContent = content?.conceptsContent as any
      expect(conceptsContent).toHaveProperty('title')
      expect(conceptsContent).toHaveProperty('introduction')
      expect(conceptsContent).toHaveProperty('sections')
      expect(Array.isArray(conceptsContent.sections)).toBe(true)
      expect(conceptsContent).toHaveProperty('summary')

      // 验证模型内容结构
      const modelsContent = content?.modelsContent as any
      expect(modelsContent).toHaveProperty('frameworkName')
      expect(modelsContent).toHaveProperty('introduction')
      expect(modelsContent).toHaveProperty('steps')
      expect(Array.isArray(modelsContent.steps)).toBe(true)
      expect(modelsContent).toHaveProperty('applicationExample')

      // 验证演示内容结构
      const demonstrationsContent = content?.demonstrationsContent as any
      expect(demonstrationsContent).toHaveProperty('scenario')
      expect(demonstrationsContent).toHaveProperty('goodAnalysis')
      expect(demonstrationsContent).toHaveProperty('poorAnalysis')
      expect(demonstrationsContent).toHaveProperty('expertCommentary')
      expect(demonstrationsContent).toHaveProperty('keyLessons')
    }, TEST_CONFIG.timeout)
  })

  describe('内容质量验证', () => {
    it('应该生成符合质量标准的内容', async () => {
      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        false
      )

      const content = await prisma.theoryContent.findFirst({
        where: {
          thinkingTypeId: TEST_CONFIG.testDimensions[0],
          level: TEST_CONFIG.testLevels[0]
        }
      })

      expect(content).toBeTruthy()

      // 验证基本字段
      expect(content?.title.length).toBeGreaterThan(5)
      expect(content?.description.length).toBeGreaterThan(20)
      expect(content?.estimatedTime).toBeGreaterThan(0)
      expect(content?.qualityScore).toBeGreaterThan(0)

      // 验证学习目标
      expect(Array.isArray(content?.learningObjectives)).toBe(true)
      expect(content?.learningObjectives.length).toBeGreaterThan(0)

      // 验证标签和关键词
      expect(Array.isArray(content?.tags)).toBe(true)
      expect(Array.isArray(content?.keywords)).toBe(true)
    }, TEST_CONFIG.timeout)

    it('应该生成适当长度的内容', async () => {
      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        false
      )

      const content = await prisma.theoryContent.findFirst({
        where: {
          thinkingTypeId: TEST_CONFIG.testDimensions[0],
          level: TEST_CONFIG.testLevels[0]
        }
      })

      const conceptsContent = content?.conceptsContent as any
      const modelsContent = content?.modelsContent as any
      const demonstrationsContent = content?.demonstrationsContent as any

      // 验证概念内容长度
      expect(conceptsContent.introduction.length).toBeGreaterThanOrEqual(100)
      expect(conceptsContent.sections.length).toBeGreaterThanOrEqual(2)
      conceptsContent.sections.forEach((section: any) => {
        expect(section.content.length).toBeGreaterThanOrEqual(200)
        expect(section.keyPoints.length).toBeGreaterThanOrEqual(2)
      })

      // 验证模型内容长度
      expect(modelsContent.introduction.length).toBeGreaterThanOrEqual(100)
      expect(modelsContent.steps.length).toBeGreaterThanOrEqual(3)
      modelsContent.steps.forEach((step: any) => {
        expect(step.description.length).toBeGreaterThanOrEqual(100)
      })
      expect(modelsContent.applicationExample.length).toBeGreaterThanOrEqual(200)

      // 验证演示内容长度
      expect(demonstrationsContent.scenario.length).toBeGreaterThanOrEqual(200)
      expect(demonstrationsContent.goodAnalysis.content.length).toBeGreaterThanOrEqual(300)
      expect(demonstrationsContent.poorAnalysis.content.length).toBeGreaterThanOrEqual(200)
      expect(demonstrationsContent.expertCommentary.length).toBeGreaterThanOrEqual(200)
      expect(demonstrationsContent.keyLessons.length).toBeGreaterThanOrEqual(2)
    }, TEST_CONFIG.timeout)
  })

  describe('错误处理和重试机制', () => {
    it('应该处理生成失败的情况', async () => {
      // 模拟网络错误或AI服务不可用的情况
      // 这个测试需要根据实际的错误处理逻辑来实现
      
      // 由于我们无法轻易模拟AI服务失败，这里主要测试数据库操作的错误处理
      const invalidDimensions = ['invalid_dimension']
      
      const result = await generateTheoryContent(
        invalidDimensions,
        [1],
        false
      )

      // 应该能够处理无效的维度ID，但不会崩溃
      expect(result).toBeDefined()
      expect(typeof result.totalTasks).toBe('number')
      expect(typeof result.completed).toBe('number')
      expect(typeof result.errors).toBe('number')
    }, TEST_CONFIG.timeout)
  })

  describe('数据完整性验证', () => {
    it('应该保持数据库的一致性', async () => {
      const beforeCount = await prisma.theoryContent.count()

      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        false
      )

      const afterCount = await prisma.theoryContent.count()
      expect(afterCount).toBeGreaterThan(beforeCount)

      // 验证生成的内容都是已发布状态
      const publishedCount = await prisma.theoryContent.count({
        where: {
          thinkingTypeId: { in: TEST_CONFIG.testDimensions },
          level: { in: [TEST_CONFIG.testLevels[0]] },
          isPublished: true
        }
      })

      expect(publishedCount).toBeGreaterThan(0)
    }, TEST_CONFIG.timeout)

    it('应该正确设置内容的元数据', async () => {
      await generateTheoryContent(
        TEST_CONFIG.testDimensions,
        [TEST_CONFIG.testLevels[0]],
        false
      )

      const content = await prisma.theoryContent.findFirst({
        where: {
          thinkingTypeId: TEST_CONFIG.testDimensions[0],
          level: TEST_CONFIG.testLevels[0]
        }
      })

      expect(content).toBeTruthy()
      expect(content?.version).toBe('1.0.0')
      expect(content?.isPublished).toBe(true)
      expect(content?.publishedAt).toBeTruthy()
      expect(content?.createdAt).toBeTruthy()
      expect(content?.updatedAt).toBeTruthy()
      expect(content?.qualityScore).toBeGreaterThan(0)
      expect(content?.viewCount).toBe(0)
    }, TEST_CONFIG.timeout)
  })
})

// 辅助函数
async function cleanupTestContent() {
  // 删除测试生成的内容
  await prisma.theoryContent.deleteMany({
    where: {
      thinkingTypeId: { in: TEST_CONFIG.testDimensions },
      level: { in: TEST_CONFIG.testLevels }
    }
  })

  // 删除相关的进度记录
  await prisma.theoryProgress.deleteMany({
    where: {
      thinkingTypeId: { in: TEST_CONFIG.testDimensions },
      level: { in: TEST_CONFIG.testLevels }
    }
  })
}