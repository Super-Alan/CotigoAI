import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/daily-theory/today
 * 获取今日概念
 *
 * 逻辑：
 * 1. 检查今天是否已有学习记录
 * 2. 如果有，返回已选定的概念
 * 3. 如果没有，智能推荐一个概念并创建记录
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. 获取今天的日期（仅日期部分，不含时间）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 2. 检查今天是否已有学习记录
    const todayLearning = await prisma.dailyTheoryLearning.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      include: {
        conceptContent: {
          include: {
            thinkingType: {
              select: {
                id: true,
                name: true,
                icon: true,
                description: true
              }
            }
          }
        }
      }
    })

    // 3. 如果已有记录，检查是否已完成
    if (todayLearning) {
      // 如果当前概念已完成，推荐下一个未完成的概念
      if (todayLearning.completedAt) {
        const nextRecommendedTheory = await selectDailyConcept(userId)
        
        if (nextRecommendedTheory && nextRecommendedTheory.id !== todayLearning.conceptContentId) {
          // 更新今日学习记录为新推荐的概念
          const updatedLearning = await prisma.dailyTheoryLearning.update({
            where: {
              userId_date: {
                userId,
                date: today
              }
            },
            data: {
              conceptContentId: nextRecommendedTheory.id,
              startedAt: null,
              completedAt: null,
              timeSpent: 0,
              sectionsViewed: [],
              isBookmarked: false,
              userRating: null
            },
            include: {
              conceptContent: {
                include: {
                  thinkingType: {
                    select: {
                      id: true,
                      name: true,
                      icon: true,
                      description: true
                    }
                  }
                }
              }
            }
          })

          return NextResponse.json({
            success: true,
            data: {
              theory: updatedLearning.conceptContent,
              progress: {
                startedAt: null,
                completedAt: null,
                timeSpent: 0,
                sectionsViewed: [],
                isBookmarked: false,
                userRating: null
              },
              isNew: true
            }
          })
        }
      }

      // 如果未完成或没有新的推荐，返回当前记录
      return NextResponse.json({
        success: true,
        data: {
          theory: todayLearning.conceptContent,
          progress: {
            startedAt: todayLearning.startedAt,
            completedAt: todayLearning.completedAt,
            timeSpent: todayLearning.timeSpent,
            sectionsViewed: todayLearning.sectionsViewed,
            isBookmarked: todayLearning.isBookmarked,
            userRating: todayLearning.userRating
          },
          isNew: false
        }
      })
    }

    // 4. 智能推荐今日概念
    const recommendedTheory = await selectDailyConcept(userId)

    if (!recommendedTheory) {
      return NextResponse.json({
        success: false,
        error: '暂无可推荐的概念，请稍后再试'
      }, { status: 404 })
    }

    // 5. 创建今日学习记录
    const newLearning = await prisma.dailyTheoryLearning.create({
      data: {
        userId,
        conceptContentId: recommendedTheory.id,
        date: today
      },
      include: {
        conceptContent: {
          include: {
            thinkingType: {
              select: {
                id: true,
                name: true,
                icon: true,
                description: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        theory: newLearning.conceptContent,
        progress: {
          startedAt: null,
          completedAt: null,
          timeSpent: 0,
          sectionsViewed: [],
          isBookmarked: false,
          userRating: null
        },
        isNew: true
      }
    })
  } catch (error) {
    console.error('获取今日概念失败:', error)
    return NextResponse.json(
      { error: '获取今日概念失败' },
      { status: 500 }
    )
  }
}

/**
 * 智能推荐算法：选择今日概念
 */
async function selectDailyConcept(userId: string) {
  try {
    // 1. 获取用户已完成的概念
    const completed = await prisma.dailyTheoryLearning.findMany({
      where: {
        userId,
        completedAt: { not: null }
      },
      select: { conceptContentId: true }
    })
    const completedIds = completed.map(c => c.conceptContentId)

    // 2. 获取用户当前等级（基于已完成数量）
    // 每10个概念晋升一级，最高Level 5
    const completedCount = completedIds.length
    const userLevel = Math.min(Math.floor(completedCount / 10) + 1, 5)

    // 3. 获取用户最近偏好的思维维度（基于最近5次练习）
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { sessionType: true }
    })
    const preferredDimensions = [...new Set(recentSessions.map(s => s.sessionType))]
      .filter(type => ['causal_analysis', 'premise_challenge', 'fallacy_detection', 'iterative_reflection', 'connection_transfer'].includes(type))

    // 4. 获取用户最近学习过的思维维度（避免连续推送同一维度）
    const recentLearning = await prisma.dailyTheoryLearning.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 3,
      include: {
        conceptContent: {
          select: { thinkingTypeId: true }
        }
      }
    })
    const recentDimensions = recentLearning.map(l => l.conceptContent.thinkingTypeId)

    // 5. 智能推荐
    const recommendedConcept = await prisma.conceptContent.findFirst({
      where: {
        id: { notIn: completedIds },
        level: { lte: userLevel }, // 当前等级及以下
        isPublished: true,
        // 优先推送偏好维度，但避免连续推送同一维度
        ...(preferredDimensions.length > 0 && recentDimensions.length > 0 && {
          thinkingTypeId: {
            in: preferredDimensions,
            notIn: recentDimensions.slice(0, 1) // 避免与昨天相同
          }
        })
      },
      orderBy: [
        { level: 'desc' },           // 优先推送高 Level
        { difficulty: 'asc' },       // 难度递增
        { viewCount: 'asc' },        // 优先推送少人学习的
        { order: 'asc' }             // 按顺序推送
      ]
    })

    // 6. 如果没有找到（可能过滤条件太严格），放宽条件再试
    if (!recommendedConcept) {
      return await prisma.conceptContent.findFirst({
        where: {
          id: { notIn: completedIds },
          level: { lte: userLevel },
          isPublished: true
        },
        orderBy: [
          { level: 'desc' },
          { difficulty: 'asc' },
          { order: 'asc' }
        ]
      })
    }

    return recommendedConcept
  } catch (error) {
    console.error('智能推荐算法失败:', error)
    // 降级：随机返回一个已发布的概念
    return await prisma.conceptContent.findFirst({
      where: {
        isPublished: true
      },
      orderBy: {
        order: 'asc'
      }
    })
  }
}
