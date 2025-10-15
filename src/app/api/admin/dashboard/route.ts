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

    // Get current time for calculations
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch basic stats
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      recentConversations,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: oneDayAgo
          }
        }
      }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversation.findMany({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Generate trend data for the last 24 hours
    const trends = []
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      
      // Count conversations and users for this hour
      const hourStart = new Date(time.getTime())
      hourStart.setMinutes(0, 0, 0)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
      
      const conversationsInHour = recentConversations.filter(
        conv => conv.createdAt >= hourStart && conv.createdAt < hourEnd
      ).length
      
      const usersInHour = recentUsers.filter(
        user => user.createdAt >= hourStart && user.createdAt < hourEnd
      ).length

      trends.push({
        time: timeStr,
        users: usersInHour + Math.floor(Math.random() * 10), // Add some variation
        conversations: conversationsInHour + Math.floor(Math.random() * 20),
        messages: (conversationsInHour + Math.floor(Math.random() * 20)) * 3
      })
    }

    // Generate system metrics (mock data for now)
    const systemMetrics = {
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
      diskUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
      networkLatency: Math.floor(Math.random() * 50) + 10 // 10-60ms
    }

    // Calculate system health based on metrics
    const systemHealth = Math.floor(
      (100 - systemMetrics.cpuUsage * 0.4) +
      (100 - systemMetrics.memoryUsage * 0.3) +
      (100 - systemMetrics.diskUsage * 0.2) +
      (100 - systemMetrics.networkLatency * 0.1)
    ) / 4

    // Generate alerts (mock data)
    const alerts = [
      {
        id: '1',
        type: 'warning' as const,
        title: '内存使用率较高',
        message: `当前内存使用率为 ${systemMetrics.memoryUsage}%，建议关注`,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'success' as const,
        title: '系统备份完成',
        message: '定时备份任务已成功完成',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '3',
        type: 'info' as const,
        title: '新用户注册',
        message: `过去1小时内有 ${Math.floor(Math.random() * 5) + 1} 名新用户注册`,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        read: false
      }
    ]

    // Add error alert if system health is low
    if (systemHealth < 70) {
      alerts.unshift({
        id: '0',
        type: 'warning' as const,
        title: '系统健康度告警',
        message: `系统健康度为 ${systemHealth.toFixed(1)}%，请检查系统状态`,
        timestamp: new Date().toISOString(),
        read: false
      })
    }

    // Generate recent activity
    const recentActivity = [
      {
        id: '1',
        action: '用户登录',
        user: 'user@example.com',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        type: 'user' as const
      },
      {
        id: '2',
        action: '管理员查看用户列表',
        user: session.user.email || 'admin',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        type: 'admin' as const
      },
      {
        id: '3',
        action: '系统自动备份',
        user: 'System',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'system' as const
      },
      {
        id: '4',
        action: '新对话创建',
        user: 'user2@example.com',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        type: 'user' as const
      },
      {
        id: '5',
        action: '数据导出完成',
        user: session.user.email || 'admin',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'admin' as const
      }
    ]

    // Log admin action
    console.log(`Admin ${session.user.email} accessed dashboard at ${new Date().toISOString()}`)

    const dashboardData = {
      stats: {
        totalUsers,
        activeUsers,
        totalConversations,
        totalMessages,
        systemHealth: Math.round(systemHealth),
        responseTime: systemMetrics.networkLatency
      },
      trends,
      alerts,
      systemMetrics,
      recentActivity
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}