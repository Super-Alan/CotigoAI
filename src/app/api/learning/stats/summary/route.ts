import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/learning/stats/summary
 * 统一学习统计API - 聚合所有学习模块的时长和活动数据
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '请先登录' }
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 并行查询所有学习模块数据
    const [
      conversations,
      criticalThinkingSessions,
      practiceSessions,
      theoryProgress,
      perspectiveSessions,
      argumentAnalyses
    ] = await Promise.all([
      // 1. Socratic对话/每日一问/AI导师
      prisma.conversation.findMany({
        where: { userId },
        select: {
          id: true,
          conversationType: true,
          timeSpent: true,
          messageCount: true,
          status: true,
          createdAt: true,
          completedAt: true
        }
      }),

      // 2. 批判性思维练习
      prisma.criticalThinkingPracticeSession.findMany({
        where: { userId },
        select: {
          id: true,
          timeSpent: true,
          score: true,
          level: true,
          completedAt: true
        }
      }),

      // 3. 每日练习
      prisma.practiceSession.findMany({
        where: { userId },
        select: {
          id: true,
          duration: true,
          score: true,
          sessionType: true,
          completedAt: true
        }
      }),

      // 4. 理论学习
      prisma.theoryProgress.findMany({
        where: { userId },
        select: {
          id: true,
          timeSpent: true,
          progressPercent: true,
          status: true,
          completedAt: true,
          lastViewedAt: true
        }
      }),

      // 5. 多视角对话
      prisma.perspectiveSession.findMany({
        where: { userId },
        select: {
          id: true,
          timeSpent: true,
          status: true,
          createdAt: true,
          completedAt: true
        }
      }),

      // 6. 论证分解
      prisma.argumentAnalysis.findMany({
        where: { userId },
        select: {
          id: true,
          timeSpent: true,
          status: true,
          createdAt: true
        }
      })
    ])

    // ========================================
    // 时长统计 (秒)
    // ========================================
    const conversationTime = conversations.reduce((sum, c) => sum + c.timeSpent, 0)
    const criticalThinkingTime = criticalThinkingSessions.reduce((sum, s) => sum + s.timeSpent, 0)
    const practiceTime = practiceSessions.reduce((sum, s) => sum + s.duration, 0)
    const theoryTime = theoryProgress.reduce((sum, t) => sum + t.timeSpent, 0)
    const perspectiveTime = perspectiveSessions.reduce((sum, p) => sum + p.timeSpent, 0)
    const argumentAnalysisTime = argumentAnalyses.reduce((sum, a) => sum + a.timeSpent, 0)

    const totalTimeSpent =
      conversationTime +
      criticalThinkingTime +
      practiceTime +
      theoryTime +
      perspectiveTime +
      argumentAnalysisTime

    // ========================================
    // 对话分类统计
    // ========================================
    const conversationsByType = conversations.reduce((acc, c) => {
      const type = c.conversationType || 'general'
      if (!acc[type]) {
        acc[type] = { count: 0, timeSpent: 0, messageCount: 0 }
      }
      acc[type].count += 1
      acc[type].timeSpent += c.timeSpent
      acc[type].messageCount += c.messageCount
      return acc
    }, {} as Record<string, { count: number; timeSpent: number; messageCount: number }>)

    // ========================================
    // 活动分解
    // ========================================
    const activityBreakdown = {
      conversation: {
        total: conversationTime,
        count: conversations.length,
        byType: conversationsByType
      },
      criticalThinking: {
        total: criticalThinkingTime,
        count: criticalThinkingSessions.length,
        averageScore: criticalThinkingSessions.length > 0
          ? criticalThinkingSessions.reduce((sum, s) => sum + (s.score || 0), 0) / criticalThinkingSessions.length
          : 0
      },
      dailyPractice: {
        total: practiceTime,
        count: practiceSessions.length,
        averageScore: practiceSessions.length > 0
          ? practiceSessions.reduce((sum, s) => sum + Number(s.score), 0) / practiceSessions.length
          : 0
      },
      theoryStudy: {
        total: theoryTime,
        count: theoryProgress.length,
        completedCount: theoryProgress.filter(t => t.status === 'completed').length,
        averageProgress: theoryProgress.length > 0
          ? theoryProgress.reduce((sum, t) => sum + t.progressPercent, 0) / theoryProgress.length
          : 0
      },
      perspective: {
        total: perspectiveTime,
        count: perspectiveSessions.length,
        completedCount: perspectiveSessions.filter(p => p.status === 'completed').length
      },
      argumentAnalysis: {
        total: argumentAnalysisTime,
        count: argumentAnalyses.length
      }
    }

    // ========================================
    // 每周活跃度趋势 (最近7天)
    // ========================================
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // 包含今天共7天

    // 生成最近7天的日期数组
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })

    // 按日期聚合所有活动
    const weeklyActivity = last7Days.map(date => {
      const dayStart = new Date(date)
      const dayEnd = new Date(date)
      dayEnd.setDate(dayEnd.getDate() + 1)

      // 计算当天的活动数和时长
      const dayConversations = conversations.filter(c => {
        const createdDate = new Date(c.createdAt)
        return createdDate >= dayStart && createdDate < dayEnd
      })

      const dayCriticalThinking = criticalThinkingSessions.filter(s => {
        const completedDate = new Date(s.completedAt)
        return completedDate >= dayStart && completedDate < dayEnd
      })

      const dayPractice = practiceSessions.filter(s => {
        if (!s.completedAt) return false
        const completedDate = new Date(s.completedAt)
        return completedDate >= dayStart && completedDate < dayEnd
      })

      const dayTheory = theoryProgress.filter(t => {
        const viewedDate = new Date(t.lastViewedAt)
        return viewedDate >= dayStart && viewedDate < dayEnd
      })

      return {
        date,
        totalActivities: dayConversations.length + dayCriticalThinking.length + dayPractice.length + dayTheory.length,
        totalTimeSpent:
          dayConversations.reduce((sum, c) => sum + c.timeSpent, 0) +
          dayCriticalThinking.reduce((sum, s) => sum + s.timeSpent, 0) +
          dayPractice.reduce((sum, s) => sum + s.duration, 0) +
          dayTheory.reduce((sum, t) => sum + t.timeSpent, 0),
        activitiesByType: {
          conversation: dayConversations.length,
          criticalThinking: dayCriticalThinking.length,
          practice: dayPractice.length,
          theory: dayTheory.length
        }
      }
    })

    // ========================================
    // 学习深度指标
    // ========================================
    const engagementMetrics = {
      // 平均每次会话时长
      averageSessionDuration: conversations.length > 0
        ? Math.round(conversationTime / conversations.length)
        : 0,
      // 完成率
      completionRate: {
        conversation: conversations.length > 0
          ? (conversations.filter(c => c.status === 'completed').length / conversations.length) * 100
          : 0,
        theory: theoryProgress.length > 0
          ? (theoryProgress.filter(t => t.status === 'completed').length / theoryProgress.length) * 100
          : 0,
        perspective: perspectiveSessions.length > 0
          ? (perspectiveSessions.filter(p => p.status === 'completed').length / perspectiveSessions.length) * 100
          : 0
      },
      // 活跃天数 (过去30天)
      activeDaysLast30: calculateActiveDays(
        [
          ...conversations.map(c => c.createdAt),
          ...criticalThinkingSessions.map(s => s.completedAt),
          ...practiceSessions.map(s => s.completedAt).filter(Boolean) as Date[]
        ],
        30
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTimeSpent,      // 总学习时长(秒)
        activityBreakdown,   // 各模块时长和次数
        weeklyActivity,      // 每周活跃度趋势
        engagementMetrics    // 学习深度指标
      }
    })
  } catch (error) {
    console.error('获取学习统计失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: '获取学习统计失败' }
      },
      { status: 500 }
    )
  }
}

/**
 * 计算活跃天数
 */
function calculateActiveDays(dates: Date[], days: number): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const activeDates = new Set<string>()
  dates.forEach(date => {
    const d = new Date(date)
    if (d >= cutoffDate) {
      activeDates.add(d.toISOString().split('T')[0])
    }
  })

  return activeDates.size
}
