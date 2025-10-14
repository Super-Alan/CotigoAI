import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/daily-streak - 返回用户的每日打卡连续天数统计
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 未登录也返回默认值，避免前端报错
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: null
        }
      })
    }

    const userId = session.user.id

    // 最近一次完成练习的记录
    const lastRecord = await prisma.dailyStreak.findFirst({
      where: { userId, completed: true },
      orderBy: { practiceDate: 'desc' },
      select: { practiceDate: true, streakCount: true }
    })

    // 历史最高连续天数
    const longest = await prisma.dailyStreak.aggregate({
      where: { userId, completed: true },
      _max: { streakCount: true }
    })

    // 检查连续性：只有最后打卡日期是今天或昨天，才算有效连续
    let currentStreak = 0
    if (lastRecord) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const lastPracticeDate = new Date(lastRecord.practiceDate)
      lastPracticeDate.setHours(0, 0, 0, 0)

      // 如果最后打卡是今天或昨天，连续天数有效
      if (lastPracticeDate.getTime() === today.getTime() ||
          lastPracticeDate.getTime() === yesterday.getTime()) {
        currentStreak = lastRecord.streakCount
      }
      // 否则连续天数归零（中断了）
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: longest._max.streakCount ?? 0,
        lastPracticeDate: lastRecord?.practiceDate ?? null
      }
    })
  } catch (error) {
    console.error('获取每日连续学习统计失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DAILY_STREAK_ERROR', message: '获取每日连续学习统计失败' } },
      { status: 500 }
    )
  }
}