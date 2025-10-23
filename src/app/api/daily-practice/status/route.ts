import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unifiedRecommendation } from '@/lib/services/unified-recommendation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 使用统一推荐服务获取今日任务
    const todayTask = await unifiedRecommendation.getDailyTask(userId)

    // 获取额外练习选项（排除今日任务的思维类型）
    const optionalPractices = await unifiedRecommendation.getOptionalPractices(
      userId,
      todayTask.thinkingTypeId
    )

    // 检查今日是否已完成练习
    const todayStreak = await prisma.dailyStreak.findUnique({
      where: {
        userId_practiceDate: {
          userId,
          practiceDate: today
        }
      }
    })

    // 获取最新连续打卡天数
    const latestStreak = await prisma.dailyStreak.findFirst({
      where: { userId },
      orderBy: { practiceDate: 'desc' }
    })

    // 获取用户总练习次数
    const totalSessions = await prisma.practiceSession.count({
      where: { userId }
    })

    // 获取本周完成情况
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const weekSessions = await prisma.dailyStreak.count({
      where: {
        userId,
        practiceDate: {
          gte: weekStart,
          lte: today
        },
        completed: true
      }
    })

    // 计算本周完成率（百分比）
    const weeklyCompletion = Math.round((weekSessions / 7) * 100)

    // 获取用户当前等级（基于总练习次数）
    let userLevel = 'beginner'
    if (totalSessions >= 50) {
      userLevel = 'advanced'
    } else if (totalSessions >= 20) {
      userLevel = 'intermediate'
    }

    // 获取用户成就数量
    const achievements = await prisma.userAchievement.count({
      where: { userId }
    })

    return NextResponse.json({
      todayCompleted: todayStreak?.completed || false,
      currentStreak: latestStreak?.streakCount || 0,
      userLevel,
      totalSessions,
      weeklyCompletion,
      achievements,
      // 新增：今日任务和路径上下文
      todayTask,
      optionalPractices
    })

  } catch (error: any) {
    console.error('Error fetching daily practice status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}