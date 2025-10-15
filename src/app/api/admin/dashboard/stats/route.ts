import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取当前月份和上个月的日期范围
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // 总用户数
    const totalUsers = await prisma.user.count()
    
    // 活跃用户数（7天内有活动）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { updatedAt: { gte: sevenDaysAgo } },
          { 
            conversations: {
              some: {
                createdAt: { gte: sevenDaysAgo }
              }
            }
          }
        ]
      }
    })

    // 对话总数
    const totalConversations = await prisma.conversation.count()

    // 平均会话时长（模拟数据，实际需要根据业务逻辑计算）
    const avgSessionTime = 12.5

    // 计算增长率
    const currentMonthUsers = await prisma.user.count({
      where: { createdAt: { gte: currentMonthStart } }
    })
    
    const lastMonthUsers = await prisma.user.count({
      where: { 
        createdAt: { 
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    })

    const currentMonthConversations = await prisma.conversation.count({
      where: { createdAt: { gte: currentMonthStart } }
    })
    
    const lastMonthConversations = await prisma.conversation.count({
      where: { 
        createdAt: { 
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    })

    // 计算增长百分比
    const userGrowth = lastMonthUsers > 0 
      ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0

    const conversationGrowth = lastMonthConversations > 0
      ? Math.round(((currentMonthConversations - lastMonthConversations) / lastMonthConversations) * 100)
      : 0

    const stats = {
      totalUsers,
      activeUsers,
      totalConversations,
      avgSessionTime,
      userGrowth,
      conversationGrowth,
      sessionGrowth: 5, // 模拟数据
      activeGrowth: 8   // 模拟数据
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}