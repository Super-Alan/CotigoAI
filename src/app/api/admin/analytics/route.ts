import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using the admin auth helper
    const isAdmin = await isAdminUser(session.user.id)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Fetch overview data
    const totalUsers = await prisma.user.count()
    
    // Calculate active users based on recent conversations instead of lastActiveAt
    const activeUsers = await prisma.user.count({
      where: {
        conversations: {
          some: {
            updatedAt: {
              gte: startDate
            }
          }
        }
      }
    })

    const totalConversations = await prisma.conversation.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    const totalMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Calculate growth rates (mock data for now)
    const previousPeriodUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: startDate
        }
      }
    })

    const userGrowthRate = previousPeriodUsers > 0 
      ? ((totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 0

    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    const retentionRate = 72.5 // Mock data - would need more complex calculation

    // Generate user growth data
    const userGrowth = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dayUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      })

      const totalUsersUpToDate = await prisma.user.count({
        where: {
          createdAt: {
            lte: date
          }
        }
      })

      userGrowth.push({
        date: date.toISOString().split('T')[0],
        newUsers: dayUsers,
        totalUsers: totalUsersUpToDate
      })
    }

    // Generate conversation trends
    const conversationTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dayConversations = await prisma.conversation.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      })

      const dayMessages = await prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          }
        }
      })

      conversationTrends.push({
        date: date.toISOString().split('T')[0],
        conversations: dayConversations,
        messages: dayMessages
      })
    }

    // Generate hourly activity data (mock data)
    const userActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activeUsers: Math.floor(Math.random() * 100) + 20
    }))

    // Generate topic distribution (mock data)
    const topicDistribution = [
      { topic: '技术咨询', count: 1250, percentage: 35.2 },
      { topic: '产品支持', count: 890, percentage: 25.1 },
      { topic: '一般问答', count: 650, percentage: 18.3 },
      { topic: '功能建议', count: 420, percentage: 11.8 },
      { topic: '其他', count: 340, percentage: 9.6 }
    ]

    // Generate user segments (mock data)
    const userSegments = [
      { segment: '新用户', count: 450, percentage: 32.1 },
      { segment: '活跃用户', count: 380, percentage: 27.1 },
      { segment: '回流用户', count: 290, percentage: 20.7 },
      { segment: '沉睡用户', count: 180, percentage: 12.9 },
      { segment: '流失用户', count: 100, percentage: 7.1 }
    ]

    // Log admin action
    console.log(`Admin ${session.user.email} accessed analytics data for ${timeRange}`)

    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalConversations,
        totalMessages,
        avgSessionDuration: 15.7, // Mock data
        userGrowthRate,
        engagementRate,
        retentionRate
      },
      userGrowth,
      conversationTrends,
      userActivity,
      topicDistribution,
      userSegments
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}