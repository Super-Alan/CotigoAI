import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true
      }
    })

    // Get recent conversations
    const recentConversations = await prisma.conversation.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    // Get admin logs if they exist
    const adminLogs = await prisma.adminLog.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    }).catch(() => []) // Handle case where AdminLog table doesn't exist yet

    // Combine and format activities
    const activities = []

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        title: '新用户注册',
        description: `${user.name || user.email} 注册了账户`,
        user: {
          name: user.name || '未知用户',
          email: user.email,
          image: user.image
        },
        timestamp: user.createdAt.toISOString()
      })
    })

    // Add recent conversations
    recentConversations.forEach(conversation => {
      if (conversation.user) {
        activities.push({
          id: `conversation-${conversation.id}`,
          type: 'conversation' as const,
          title: '新对话创建',
          description: `${conversation.user.name || conversation.user.email} 开始了新对话，包含 ${conversation._count.messages} 条消息`,
          user: {
            name: conversation.user.name || '未知用户',
            email: conversation.user.email,
            image: conversation.user.image
          },
          timestamp: conversation.updatedAt.toISOString()
        })
      }
    })

    // Add admin actions
    adminLogs.forEach(log => {
      activities.push({
        id: `admin-${log.id}`,
        type: 'admin_action' as const,
        title: '管理员操作',
        description: log.action,
        user: {
          name: log.admin.user.name || '管理员',
          email: log.admin.user.email,
          image: log.admin.user.image
        },
        timestamp: log.createdAt.toISOString()
      })
    })

    // Add some mock system alerts
    const now = new Date()
    activities.push({
      id: 'alert-1',
      type: 'system_alert' as const,
      title: 'AI 服务异常',
      description: 'OpenAI API 响应时间超过正常范围',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      severity: 'medium' as const
    })

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return top 10 activities
    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error('Dashboard activities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}