import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/daily-theory/complete
 * 标记今日概念学习完成
 *
 * Body:
 * - timeSpent: number (学习时长，秒)
 * - sectionsViewed: string[] (查看的章节)
 * - userRating?: number (1-5星评分)
 * - feedback?: string (用户反馈)
 * - comprehensionScore?: number (理解程度自评 0-100)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const {
      timeSpent,
      sectionsViewed,
      userRating,
      feedback,
      comprehensionScore
    } = body

    // 验证输入
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      return NextResponse.json(
        { error: '学习时长参数无效' },
        { status: 400 }
      )
    }

    if (!Array.isArray(sectionsViewed)) {
      return NextResponse.json(
        { error: 'sectionsViewed 必须是数组' },
        { status: 400 }
      )
    }

    // 获取今天的日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 查找今日学习记录
    const todayLearning = await prisma.dailyTheoryLearning.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    if (!todayLearning) {
      return NextResponse.json(
        { error: '未找到今日学习记录' },
        { status: 404 }
      )
    }

    if (todayLearning.completedAt) {
      return NextResponse.json(
        { error: '今日概念已标记完成' },
        { status: 400 }
      )
    }

    // 更新学习记录
    const updatedLearning = await prisma.dailyTheoryLearning.update({
      where: {
        id: todayLearning.id
      },
      data: {
        completedAt: new Date(),
        timeSpent,
        sectionsViewed,
        ...(userRating && { userRating }),
        ...(feedback && { feedback }),
        ...(comprehensionScore !== undefined && { comprehensionScore })
      }
    })

    // 更新连续学习天数
    await updateLearningStreak(userId, today)

    // 更新 ConceptContent 的 viewCount 和 completionRate
    await updateConceptContentStats(todayLearning.conceptContentId)

    return NextResponse.json({
      success: true,
      data: {
        learning: updatedLearning,
        message: '恭喜！今日概念学习完成 🎉'
      }
    })
  } catch (error) {
    console.error('标记完成失败:', error)
    return NextResponse.json(
      { error: '标记完成失败' },
      { status: 500 }
    )
  }
}

/**
 * 更新用户连续学习天数
 */
async function updateLearningStreak(userId: string, completionDate: Date) {
  try {
    // 查找或创建连续学习记录
    let streak = await prisma.theoryLearningStreak.findUnique({
      where: { userId }
    })

    if (!streak) {
      // 创建新记录
      streak = await prisma.theoryLearningStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          totalDays: 1,
          lastLearningDate: completionDate
        }
      })
      return streak
    }

    // 计算是否是连续天数
    const lastDate = streak.lastLearningDate
    const daysDiff = lastDate
      ? Math.floor((completionDate.getTime() - new Date(lastDate).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
      : 1

    let newStreak = streak.currentStreak

    if (daysDiff === 0) {
      // 同一天，不更新
      return streak
    } else if (daysDiff === 1) {
      // 连续天数 +1
      newStreak = streak.currentStreak + 1
    } else {
      // 中断了，重置为 1
      newStreak = 1
    }

    // 更新记录
    const updatedStreak = await prisma.theoryLearningStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        totalDays: streak.totalDays + 1,
        lastLearningDate: completionDate
      }
    })

    return updatedStreak
  } catch (error) {
    console.error('更新连续学习天数失败:', error)
    return null
  }
}

/**
 * 更新概念内容的统计数据
 */
async function updateConceptContentStats(conceptContentId: string) {
  try {
    // 获取该内容的完成数和总浏览数
    const stats = await prisma.dailyTheoryLearning.aggregate({
      where: { conceptContentId },
      _count: {
        id: true
      }
    })

    const completedCount = await prisma.dailyTheoryLearning.count({
      where: {
        conceptContentId,
        completedAt: { not: null }
      }
    })

    const totalViews = stats._count.id
    const completionRate = totalViews > 0 ? (completedCount / totalViews) * 100 : 0

    // 更新 ConceptContent
    await prisma.conceptContent.update({
      where: { id: conceptContentId },
      data: {
        viewCount: totalViews,
        completionRate: Math.round(completionRate * 100) / 100 // 保留2位小数
      }
    })
  } catch (error) {
    console.error('更新概念内容统计数据失败:', error)
  }
}
