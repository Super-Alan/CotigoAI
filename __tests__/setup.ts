/**
 * Jest测试环境设置
 */

import { PrismaClient } from '@prisma/client'

// 全局测试配置
declare global {
  var __PRISMA__: PrismaClient
}

// 设置测试数据库连接
beforeAll(async () => {
  // 初始化Prisma客户端
  global.__PRISMA__ = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL
      }
    }
  })

  // 确保数据库连接正常
  try {
    await global.__PRISMA__.$connect()
    console.log('✅ 测试数据库连接成功')
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error)
    throw error
  }
})

// 清理测试环境
afterAll(async () => {
  if (global.__PRISMA__) {
    await global.__PRISMA__.$disconnect()
    console.log('✅ 测试数据库连接已关闭')
  }
})

// 每个测试前的清理工作
beforeEach(async () => {
  // 可以在这里添加每个测试前的数据清理逻辑
  // 例如：清理测试数据、重置模拟等
})

// 每个测试后的清理工作
afterEach(async () => {
  // 可以在这里添加每个测试后的清理逻辑
})

// 扩展Jest匹配器
expect.extend({
  toBeValidTheoryContent(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.title === 'string' &&
                 typeof received.description === 'string' &&
                 typeof received.level === 'number' &&
                 received.level >= 1 && received.level <= 5

    if (pass) {
      return {
        message: () => `expected ${received} not to be valid theory content`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be valid theory content`,
        pass: false
      }
    }
  },

  toBeValidProgress(received) {
    const pass = received &&
                 typeof received.userId === 'string' &&
                 typeof received.thinkingTypeId === 'string' &&
                 typeof received.level === 'number' &&
                 ['not_started', 'in_progress', 'completed'].includes(received.status) &&
                 typeof received.progressPercent === 'number' &&
                 received.progressPercent >= 0 && received.progressPercent <= 100

    if (pass) {
      return {
        message: () => `expected ${received} not to be valid progress`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be valid progress`,
        pass: false
      }
    }
  }
})

// 类型声明
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTheoryContent(): R
      toBeValidProgress(): R
    }
  }
}

// 测试工具函数
export const testUtils = {
  // 创建测试用的理论内容
  createTestTheoryContent: async (overrides: any = {}) => {
    return await global.__PRISMA__.theoryContent.create({
      data: {
        thinkingTypeId: 'test_dimension',
        level: 1,
        title: '测试理论内容',
        subtitle: '测试副标题',
        description: '这是测试用的理论内容描述',
        learningObjectives: ['测试目标1', '测试目标2'],
        conceptsIntro: '概念介绍',
        conceptsContent: {
          title: '测试概念',
          introduction: '概念介绍',
          sections: [{
            heading: '核心概念',
            content: '概念内容',
            keyPoints: ['要点1', '要点2'],
            examples: ['示例1']
          }],
          summary: '概念总结'
        },
        modelsIntro: '模型介绍',
        modelsContent: {
          frameworkName: '测试框架',
          introduction: '框架介绍',
          steps: [{
            step: '步骤1',
            description: '步骤描述',
            tips: '技巧',
            commonMistakes: '错误'
          }],
          applicationExample: '应用示例'
        },
        demonstrationsIntro: '演示介绍',
        demonstrationsContent: {
          scenario: '测试场景',
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
        viewCount: 0,
        ...overrides
      }
    })
  },

  // 创建测试用的进度记录
  createTestProgress: async (overrides: any = {}) => {
    return await global.__PRISMA__.theoryProgress.create({
      data: {
        userId: 'test-user',
        thinkingTypeId: 'test_dimension',
        level: 1,
        status: 'in_progress',
        progressPercent: 50,
        sectionsCompleted: ['concepts'],
        timeSpent: 30,
        notes: '测试笔记',
        ...overrides
      }
    })
  },

  // 清理测试数据
  cleanupTestData: async () => {
    await global.__PRISMA__.theoryProgress.deleteMany({
      where: {
        OR: [
          { userId: { startsWith: 'test-' } },
          { thinkingTypeId: 'test_dimension' }
        ]
      }
    })

    await global.__PRISMA__.theoryContent.deleteMany({
      where: {
        thinkingTypeId: 'test_dimension'
      }
    })
  }
}

// 环境变量检查
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  console.warn('⚠️  警告: 未设置测试数据库URL，某些测试可能失败')
}

// 设置测试超时
jest.setTimeout(30000) // 30秒

console.log('🧪 Jest测试环境已初始化')