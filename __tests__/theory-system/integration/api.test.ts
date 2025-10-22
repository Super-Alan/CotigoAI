/**
 * 理论系统API集成测试
 */

import { NextRequest } from 'next/server'
import { GET as getTheoryContent } from '../../../src/app/api/theory-system/[thinkingTypeId]/route'
import { GET as getSpecificContent, POST as updateProgress } from '../../../src/app/api/theory-system/[thinkingTypeId]/[level]/route'
import { POST as updateProgressRoute, GET as getProgressRoute } from '../../../src/app/api/theory-system/progress/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 测试数据
const testThinkingTypeId = 'causal_analysis'
const testLevel = 1
const testUserId = 'test-user-id'

describe('Theory System API Integration Tests', () => {
  beforeAll(async () => {
    // 确保测试数据存在
    await setupTestData()
  })

  afterAll(async () => {
    // 清理测试数据
    await cleanupTestData()
    await prisma.$disconnect()
  })

  describe('GET /api/theory-system/[thinkingTypeId]', () => {
    it('应该返回指定思维类型的所有理论内容', async () => {
      const request = new NextRequest(`http://localhost:3000/api/theory-system/${testThinkingTypeId}`)
      const response = await getTheoryContent(request, { params: { thinkingTypeId: testThinkingTypeId } })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
      
      // 验证数据结构
      const firstItem = data.data[0]
      expect(firstItem).toHaveProperty('id')
      expect(firstItem).toHaveProperty('thinkingTypeId', testThinkingTypeId)
      expect(firstItem).toHaveProperty('level')
      expect(firstItem).toHaveProperty('title')
      expect(firstItem).toHaveProperty('description')
      expect(firstItem).toHaveProperty('learningObjectives')
      expect(firstItem).toHaveProperty('estimatedTime')
      expect(firstItem).toHaveProperty('difficulty')
    })

    it('应该处理不存在的思维类型', async () => {
      const request = new NextRequest('http://localhost:3000/api/theory-system/nonexistent')
      const response = await getTheoryContent(request, { params: { thinkingTypeId: 'nonexistent' } })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })
  })

  describe('GET /api/theory-system/[thinkingTypeId]/[level]', () => {
    it('应该返回指定级别的详细内容', async () => {
      const request = new NextRequest(`http://localhost:3000/api/theory-system/${testThinkingTypeId}/${testLevel}`)
      const response = await getSpecificContent(
        request, 
        { params: { thinkingTypeId: testThinkingTypeId, level: testLevel.toString() } }
      )
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('content')
      expect(data.data).toHaveProperty('progress')
      
      // 验证内容结构
      const content = data.data.content
      expect(content).toHaveProperty('id')
      expect(content).toHaveProperty('thinkingTypeId', testThinkingTypeId)
      expect(content).toHaveProperty('level', testLevel)
      expect(content).toHaveProperty('conceptsContent')
      expect(content).toHaveProperty('modelsContent')
      expect(content).toHaveProperty('demonstrationsContent')
    })

    it('应该处理不存在的内容', async () => {
      const request = new NextRequest(`http://localhost:3000/api/theory-system/nonexistent/999`)
      const response = await getSpecificContent(
        request, 
        { params: { thinkingTypeId: 'nonexistent', level: '999' } }
      )
      
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('未找到')
    })
  })

  describe('POST /api/theory-system/[thinkingTypeId]/[level]', () => {
    it('应该更新用户学习进度', async () => {
      const progressData = {
        userId: testUserId,
        status: 'in_progress' as const,
        progressPercent: 50,
        sectionsCompleted: ['concepts'],
        timeSpent: 30,
        notes: '测试笔记'
      }

      const request = new NextRequest(`http://localhost:3000/api/theory-system/${testThinkingTypeId}/${testLevel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData)
      })

      const response = await updateProgress(
        request,
        { params: { thinkingTypeId: testThinkingTypeId, level: testLevel.toString() } }
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('status', 'in_progress')
      expect(data.data).toHaveProperty('progressPercent', 50)
    })

    it('应该验证必需字段', async () => {
      const invalidData = {
        // 缺少userId
        status: 'in_progress',
        progressPercent: 50
      }

      const request = new NextRequest(`http://localhost:3000/api/theory-system/${testThinkingTypeId}/${testLevel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })

      const response = await updateProgress(
        request,
        { params: { thinkingTypeId: testThinkingTypeId, level: testLevel.toString() } }
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('userId')
    })
  })

  describe('POST /api/theory-system/progress', () => {
    it('应该批量更新进度', async () => {
      const progressData = {
        userId: testUserId,
        thinkingTypeId: testThinkingTypeId,
        level: testLevel,
        status: 'completed' as const,
        progressPercent: 100,
        sectionsCompleted: ['concepts', 'models', 'demonstrations'],
        timeSpent: 60,
        selfRating: 4
      }

      const request = new NextRequest('http://localhost:3000/api/theory-system/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData)
      })

      const response = await updateProgressRoute(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('status', 'completed')
      expect(data.data).toHaveProperty('progressPercent', 100)
    })
  })

  describe('GET /api/theory-system/progress', () => {
    it('应该获取用户进度', async () => {
      const url = new URL('http://localhost:3000/api/theory-system/progress')
      url.searchParams.set('userId', testUserId)
      url.searchParams.set('thinkingTypeId', testThinkingTypeId)

      const request = new NextRequest(url.toString())
      const response = await getProgressRoute(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('应该处理缺少参数的情况', async () => {
      const request = new NextRequest('http://localhost:3000/api/theory-system/progress')
      const response = await getProgressRoute(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('userId')
    })
  })
})

// 辅助函数
async function setupTestData() {
  // 创建测试用的理论内容
  const existingContent = await prisma.theoryContent.findFirst({
    where: {
      thinkingTypeId: testThinkingTypeId,
      level: testLevel
    }
  })

  if (!existingContent) {
    await prisma.theoryContent.create({
      data: {
        thinkingTypeId: testThinkingTypeId,
        level: testLevel,
        title: '测试理论内容',
        subtitle: '测试副标题',
        description: '这是用于测试的理论内容描述',
        learningObjectives: ['测试目标1', '测试目标2'],
        conceptsIntro: '概念介绍',
        conceptsContent: {
          title: '测试概念',
          introduction: '概念介绍内容',
          sections: [
            {
              heading: '核心概念',
              content: '概念详细内容',
              keyPoints: ['要点1', '要点2'],
              examples: ['示例1']
            }
          ],
          summary: '概念总结'
        },
        modelsIntro: '模型介绍',
        modelsContent: {
          frameworkName: '测试框架',
          introduction: '框架介绍',
          steps: [
            {
              step: '步骤1',
              description: '步骤描述',
              tips: '技巧',
              commonMistakes: '常见错误'
            }
          ],
          applicationExample: '应用示例'
        },
        demonstrationsIntro: '演示介绍',
        demonstrationsContent: {
          scenario: '测试场景描述',
          goodAnalysis: {
            title: '优秀分析',
            content: '分析内容',
            strengths: ['优点1'],
            appliedConcepts: ['概念1']
          },
          poorAnalysis: {
            title: '错误分析',
            content: '错误内容',
            problems: ['问题1'],
            missedPoints: ['遗漏点1']
          },
          expertCommentary: '专家点评',
          keyLessons: ['启示1']
        },
        estimatedTime: 45,
        difficulty: 'beginner',
        tags: ['test'],
        keywords: ['测试'],
        prerequisites: [],
        relatedTopics: [],
        version: '1.0.0',
        isPublished: true,
        publishedAt: new Date(),
        qualityScore: 0.8,
        viewCount: 0
      }
    })
  }
}

async function cleanupTestData() {
  // 清理测试进度数据
  await prisma.theoryProgress.deleteMany({
    where: {
      userId: testUserId,
      thinkingTypeId: testThinkingTypeId
    }
  })

  // 注意：不删除理论内容，因为可能被其他测试使用
}