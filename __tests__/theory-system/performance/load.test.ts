/**
 * 理论系统性能测试
 */

import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'

const prisma = new PrismaClient()

// 性能测试配置
const PERFORMANCE_CONFIG = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  maxResponseTime: 2000, // 2秒
  maxDbQueryTime: 500, // 500毫秒
  timeout: 60000 // 1分钟
}

describe('Theory System Performance Tests', () => {
  beforeAll(async () => {
    // 确保有足够的测试数据
    await ensureTestData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('API响应性能', () => {
    it('应该在合理时间内响应理论内容请求', async () => {
      const testCases = [
        { thinkingTypeId: 'causal_analysis', level: 1 },
        { thinkingTypeId: 'premise_challenge', level: 2 },
        { thinkingTypeId: 'fallacy_detection', level: 3 }
      ]

      for (const testCase of testCases) {
        const startTime = performance.now()
        
        const content = await prisma.theoryContent.findFirst({
          where: {
            thinkingTypeId: testCase.thinkingTypeId,
            level: testCase.level,
            isPublished: true
          },
          include: {
            _count: {
              select: {
                progress: true
              }
            }
          }
        })

        const endTime = performance.now()
        const responseTime = endTime - startTime

        expect(content).toBeTruthy()
        expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.maxDbQueryTime)
      }
    }, PERFORMANCE_CONFIG.timeout)

    it('应该高效处理批量内容查询', async () => {
      const startTime = performance.now()

      const contents = await prisma.theoryContent.findMany({
        where: {
          isPublished: true
        },
        select: {
          id: true,
          thinkingTypeId: true,
          level: true,
          title: true,
          subtitle: true,
          description: true,
          estimatedTime: true,
          difficulty: true,
          tags: true,
          qualityScore: true
        },
        orderBy: [
          { thinkingTypeId: 'asc' },
          { level: 'asc' }
        ]
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(contents.length).toBeGreaterThan(0)
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.maxDbQueryTime)
    }, PERFORMANCE_CONFIG.timeout)
  })

  describe('并发性能测试', () => {
    it('应该处理并发的内容查询请求', async () => {
      const promises: Promise<any>[] = []
      const results: { responseTime: number; success: boolean }[] = []

      // 创建并发请求
      for (let i = 0; i < PERFORMANCE_CONFIG.concurrentUsers; i++) {
        for (let j = 0; j < PERFORMANCE_CONFIG.requestsPerUser; j++) {
          const promise = (async () => {
            const startTime = performance.now()
            
            try {
              const content = await prisma.theoryContent.findFirst({
                where: {
                  thinkingTypeId: 'causal_analysis',
                  level: (j % 5) + 1, // 循环使用不同的级别
                  isPublished: true
                }
              })

              const endTime = performance.now()
              const responseTime = endTime - startTime

              return {
                responseTime,
                success: !!content
              }
            } catch (error) {
              const endTime = performance.now()
              return {
                responseTime: endTime - startTime,
                success: false
              }
            }
          })()

          promises.push(promise)
        }
      }

      // 等待所有请求完成
      const responses = await Promise.all(promises)
      results.push(...responses)

      // 分析结果
      const successfulRequests = results.filter(r => r.success)
      const averageResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length
      const maxResponseTime = Math.max(...successfulRequests.map(r => r.responseTime))
      const successRate = successfulRequests.length / results.length

      expect(successRate).toBeGreaterThan(0.95) // 95%成功率
      expect(averageResponseTime).toBeLessThan(PERFORMANCE_CONFIG.maxResponseTime)
      expect(maxResponseTime).toBeLessThan(PERFORMANCE_CONFIG.maxResponseTime * 2)

      console.log(`并发测试结果:`)
      console.log(`  总请求数: ${results.length}`)
      console.log(`  成功请求数: ${successfulRequests.length}`)
      console.log(`  成功率: ${(successRate * 100).toFixed(2)}%`)
      console.log(`  平均响应时间: ${averageResponseTime.toFixed(2)}ms`)
      console.log(`  最大响应时间: ${maxResponseTime.toFixed(2)}ms`)
    }, PERFORMANCE_CONFIG.timeout)

    it('应该高效处理进度更新操作', async () => {
      const testUserId = 'performance-test-user'
      const updatePromises: Promise<any>[] = []

      // 创建并发的进度更新请求
      for (let i = 0; i < PERFORMANCE_CONFIG.concurrentUsers; i++) {
        const promise = (async () => {
          const startTime = performance.now()

          try {
            const progress = await prisma.theoryProgress.upsert({
              where: {
                userId_thinkingTypeId_level: {
                  userId: `${testUserId}-${i}`,
                  thinkingTypeId: 'causal_analysis',
                  level: 1
                }
              },
              update: {
                progressPercent: Math.floor(Math.random() * 100),
                timeSpent: Math.floor(Math.random() * 60),
                updatedAt: new Date()
              },
              create: {
                userId: `${testUserId}-${i}`,
                thinkingTypeId: 'causal_analysis',
                level: 1,
                status: 'in_progress',
                progressPercent: Math.floor(Math.random() * 100),
                sectionsCompleted: ['concepts'],
                timeSpent: Math.floor(Math.random() * 60)
              }
            })

            const endTime = performance.now()
            return {
              responseTime: endTime - startTime,
              success: !!progress
            }
          } catch (error) {
            const endTime = performance.now()
            return {
              responseTime: endTime - startTime,
              success: false
            }
          }
        })()

        updatePromises.push(promise)
      }

      const updateResults = await Promise.all(updatePromises)
      const successfulUpdates = updateResults.filter(r => r.success)
      const averageUpdateTime = successfulUpdates.reduce((sum, r) => sum + r.responseTime, 0) / successfulUpdates.length

      expect(successfulUpdates.length).toBe(PERFORMANCE_CONFIG.concurrentUsers)
      expect(averageUpdateTime).toBeLessThan(PERFORMANCE_CONFIG.maxDbQueryTime)

      // 清理测试数据
      await prisma.theoryProgress.deleteMany({
        where: {
          userId: {
            startsWith: testUserId
          }
        }
      })
    }, PERFORMANCE_CONFIG.timeout)
  })

  describe('内存和资源使用', () => {
    it('应该高效处理大量内容数据', async () => {
      const startMemory = process.memoryUsage()

      // 查询大量数据
      const contents = await prisma.theoryContent.findMany({
        where: {
          isPublished: true
        },
        include: {
          progress: {
            take: 10 // 限制关联数据量
          }
        }
      })

      const endMemory = process.memoryUsage()
      const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed

      expect(contents.length).toBeGreaterThan(0)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB内存增长限制

      console.log(`内存使用测试结果:`)
      console.log(`  查询内容数: ${contents.length}`)
      console.log(`  内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
    }, PERFORMANCE_CONFIG.timeout)
  })

  describe('数据库查询优化', () => {
    it('应该使用索引优化查询性能', async () => {
      const queries = [
        // 按思维类型查询
        () => prisma.theoryContent.findMany({
          where: { thinkingTypeId: 'causal_analysis' }
        }),
        
        // 按级别查询
        () => prisma.theoryContent.findMany({
          where: { level: 1 }
        }),
        
        // 复合查询
        () => prisma.theoryContent.findMany({
          where: {
            thinkingTypeId: 'causal_analysis',
            level: 1,
            isPublished: true
          }
        }),
        
        // 进度查询
        () => prisma.theoryProgress.findMany({
          where: {
            thinkingTypeId: 'causal_analysis',
            status: 'completed'
          }
        })
      ]

      for (const query of queries) {
        const startTime = performance.now()
        const result = await query()
        const endTime = performance.now()
        const queryTime = endTime - startTime

        expect(queryTime).toBeLessThan(PERFORMANCE_CONFIG.maxDbQueryTime)
        expect(Array.isArray(result)).toBe(true)
      }
    }, PERFORMANCE_CONFIG.timeout)
  })
})

// 辅助函数
async function ensureTestData() {
  const contentCount = await prisma.theoryContent.count({
    where: { isPublished: true }
  })

  if (contentCount < 5) {
    console.log('性能测试需要更多测试数据，请先运行内容生成脚本')
    console.log('运行命令: npx tsx scripts/generate-theory-content-v2.ts')
  }
}