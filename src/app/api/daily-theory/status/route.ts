import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/daily-theory/status
 * 获取用户的每日概念学习状态
 *
 * 返回:
 * - todayCompleted: boolean (今天是否完成)
 * - currentStreak: number (连续天数)
 * - longestStreak: number (最长连续天数)
 * - totalDays: number (总学习天数)
 * - completedCount: number (已完成概念数)
 * - totalAvailable: number (可学习概念总数)
 * - progressPercentage: number (学习进度百分比)
 * - currentLevel: number (当前等级 1-5)
 * - nextLevelProgress: number (下一级进度百分比)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. 获取今天是否完成
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayLearning = await prisma.dailyTheoryLearning.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    const todayCompleted = !!todayLearning?.completedAt

    // 2. 获取连续学习天数
    let streak = await prisma.theoryLearningStreak.findUnique({
      where: { userId }
    })

    // 如果没有记录，创建一个空记录
    if (!streak) {
      streak = {
        id: '',
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        lastLearningDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // 3. 获取已完成概念数
    const completedCount = await prisma.dailyTheoryLearning.count({
      where: {
        userId,
        completedAt: { not: null }
      }
    })

    // 4. 获取可学习概念总数
    const totalAvailable = await prisma.conceptContent.count({
      where: {
        isPublished: true
      }
    })

    // 5. 计算学习进度
    const progressPercentage = totalAvailable > 0
      ? Math.round((completedCount / totalAvailable) * 100)
      : 0

    // 6. 计算当前等级（每10个概念晋升一级）
    const currentLevel = Math.min(Math.floor(completedCount / 10) + 1, 5)
    const conceptsInCurrentLevel = completedCount % 10
    const nextLevelProgress = (conceptsInCurrentLevel / 10) * 100

    // 7. 获取最近7天的学习情况
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLearning = await prisma.dailyTheoryLearning.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo }
      },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        completedAt: true,
        timeSpent: true
      }
    })

    // 8. 计算本周学习天数
    const weeklyCompletion = recentLearning.filter(l => l.completedAt).length

    // 9. 获取用户最近的学习记录（用于展示）
    const recentHistory = await prisma.dailyTheoryLearning.findMany({
      where: {
        userId,
        completedAt: { not: null }
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        conceptContent: {
          select: {
            id: true,
            title: true,
            thinkingTypeId: true,
            level: true,
            difficulty: true,
            thinkingType: {
              select: {
                name: true,
                icon: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        todayCompleted,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalDays: streak.totalDays,
        lastLearningDate: streak.lastLearningDate,
        completedCount,
        totalAvailable,
        progressPercentage,
        currentLevel,
        nextLevelProgress: Math.round(nextLevelProgress),
        weeklyCompletion,
        recentLearning: recentLearning.map(l => ({
          date: l.date,
          completed: !!l.completedAt,
          timeSpent: l.timeSpent
        })),
        recentHistory: recentHistory.map(h => ({
          id: h.id,
          conceptContentId: h.conceptContentId,
          title: h.conceptContent.title,
          thinkingType: h.conceptContent.thinkingType.name,
          thinkingTypeIcon: h.conceptContent.thinkingType.icon,
          level: h.conceptContent.level,
          difficulty: h.conceptContent.difficulty,
          completedAt: h.completedAt,
          timeSpent: h.timeSpent,
          userRating: h.userRating
        }))
      }
    })
  } catch (error) {
    console.error('获取学习状态失败:', error)
    return NextResponse.json(
      { error: '获取学习状态失败' },
      { status: 500 }
    )
  }
}
