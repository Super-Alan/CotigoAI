import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/achievements
 * 获取所有成就及用户解锁状态
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

    // 获取所有成就
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' }
      ]
    })

    // 获取用户已解锁的成就
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      }
    })

    // 创建解锁状态映射
    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua.earnedAt])
    )

    // 组合数据
    const achievements = allAchievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      badgeIcon: achievement.badgeIcon,
      rarity: achievement.rarity,
      unlockedAt: unlockedMap.get(achievement.id) || null
    }))

    // 统计信息
    const stats = {
      total: allAchievements.length,
      unlocked: userAchievements.length,
      unlockedPercentage: Math.round((userAchievements.length / allAchievements.length) * 100),
      byCategory: {
        milestone: {
          total: allAchievements.filter(a => a.category === 'milestone').length,
          unlocked: userAchievements.filter(ua => ua.achievement.category === 'milestone').length
        },
        streak: {
          total: allAchievements.filter(a => a.category === 'streak').length,
          unlocked: userAchievements.filter(ua => ua.achievement.category === 'streak').length
        },
        accuracy: {
          total: allAchievements.filter(a => a.category === 'accuracy').length,
          unlocked: userAchievements.filter(ua => ua.achievement.category === 'accuracy').length
        },
        knowledge: {
          total: allAchievements.filter(a => a.category === 'knowledge').length,
          unlocked: userAchievements.filter(ua => ua.achievement.category === 'knowledge').length
        },
        speed: {
          total: allAchievements.filter(a => a.category === 'speed').length,
          unlocked: userAchievements.filter(ua => ua.achievement.category === 'speed').length
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        stats
      }
    })
  } catch (error) {
    console.error('获取成就列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: '获取成就列表失败' }
      },
      { status: 500 }
    )
  }
}
