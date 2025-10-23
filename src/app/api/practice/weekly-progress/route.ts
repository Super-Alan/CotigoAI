import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface WeeklyProgressData {
  date: string
  questionsCompleted: number
  averageScore: number
}

/**
 * GET /api/practice/weekly-progress
 * 获取最近7天的练习进度 (题目完成数 + 平均分数)
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

    // 计算最近7天日期范围
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6) // 包含今天共7天

    // 并行查询两类练习记录
    const [criticalThinkingSessions, practiceSessions] = await Promise.all([
      // 1. 批判性思维练习
      prisma.criticalThinkingPracticeSession.findMany({
        where: {
          userId,
          completedAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          completedAt: true,
          score: true
        },
        orderBy: {
          completedAt: 'asc'
        }
      }),

      // 2. 每日练习
      prisma.practiceSession.findMany({
        where: {
          userId,
          completedAt: {
            gte: sevenDaysAgo,
            not: null
          }
        },
        select: {
          completedAt: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true
        },
        orderBy: {
          completedAt: 'asc'
        }
      })
    ])

    // 生成最近7天的日期数组
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })

    // 按日期聚合数据
    const weeklyProgress: WeeklyProgressData[] = last7Days.map(date => {
      const dayStart = new Date(date)
      const dayEnd = new Date(date)
      dayEnd.setDate(dayEnd.getDate() + 1)

      // 筛选当天的批判性思维练习
      const dayCriticalThinking = criticalThinkingSessions.filter(session => {
        const completedDate = new Date(session.completedAt)
        return completedDate >= dayStart && completedDate < dayEnd
      })

      // 筛选当天的每日练习
      const dayPractice = practiceSessions.filter(session => {
        if (!session.completedAt) return false
        const completedDate = new Date(session.completedAt)
        return completedDate >= dayStart && completedDate < dayEnd
      })

      // 计算当天完成题目数
      const ctQuestionsCompleted = dayCriticalThinking.length
      const practiceQuestionsCompleted = dayPractice.reduce(
        (sum, s) => sum + s.correctAnswers,
        0
      )
      const questionsCompleted = ctQuestionsCompleted + practiceQuestionsCompleted

      // 计算当天平均分数
      let totalScore = 0
      let scoreCount = 0

      // 批判性思维练习分数 (0-100)
      dayCriticalThinking.forEach(session => {
        if (session.score !== null) {
          totalScore += session.score
          scoreCount += 1
        }
      })

      // 每日练习分数 (Decimal -> Number, 需转换为百分制)
      dayPractice.forEach(session => {
        const score = Number(session.score)
        if (!isNaN(score)) {
          // 假设score是0-100的分数
          totalScore += score
          scoreCount += 1
        }
      })

      const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

      return {
        date,
        questionsCompleted,
        averageScore
      }
    })

    // 计算本周汇总统计
    const weekSummary = {
      totalQuestions: weeklyProgress.reduce((sum, day) => sum + day.questionsCompleted, 0),
      averageScore: weeklyProgress.reduce((sum, day) => sum + day.averageScore, 0) / 7,
      activeDays: weeklyProgress.filter(day => day.questionsCompleted > 0).length,
      peakDay: weeklyProgress.reduce((peak, day) =>
        day.questionsCompleted > peak.questionsCompleted ? day : peak
      , weeklyProgress[0])
    }

    return NextResponse.json({
      success: true,
      data: {
        weeklyProgress,
        summary: {
          totalQuestions: weekSummary.totalQuestions,
          averageScore: Math.round(weekSummary.averageScore),
          activeDays: weekSummary.activeDays,
          peakDay: weekSummary.peakDay.date,
          peakDayQuestions: weekSummary.peakDay.questionsCompleted
        }
      }
    })
  } catch (error) {
    console.error('获取每周练习进度失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: '获取每周练习进度失败' }
      },
      { status: 500 }
    )
  }
}
