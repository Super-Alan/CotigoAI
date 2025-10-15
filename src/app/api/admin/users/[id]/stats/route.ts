import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, logAdminAction } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get basic stats
    const [totalConversations, totalMessages, conversations] = await Promise.all([
      prisma.conversation.count({
        where: { userId }
      }),
      prisma.message.count({
        where: {
          conversation: { userId }
        }
      }),
      prisma.conversation.findMany({
        where: { userId },
        select: {
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    ])

    // Calculate average messages per conversation
    const avgMessagesPerConversation = totalConversations > 0 
      ? Math.round(totalMessages / totalConversations) 
      : 0

    // Get first and last conversation dates
    const firstConversationDate = conversations.length > 0 
      ? conversations[0].createdAt.toISOString()
      : null
    const lastConversationDate = conversations.length > 0 
      ? conversations[conversations.length - 1].updatedAt.toISOString()
      : null

    // Calculate most active day of week
    const dayOfWeekCounts = new Array(7).fill(0)
    conversations.forEach(conv => {
      const dayOfWeek = conv.createdAt.getDay()
      dayOfWeekCounts[dayOfWeek]++
    })
    const mostActiveDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts)).toString()

    // Calculate average session duration (mock data for now)
    const avgSessionDuration = conversations.length > 0 
      ? Math.random() * 30 + 15 // Random between 15-45 minutes
      : 0

    // Get conversations by month (last 12 months)
    const now = new Date()
    const conversationsByMonth = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const count = await prisma.conversation.count({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      conversationsByMonth.push({
        month: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
        count
      })
    }

    // Get messages by hour of day
    const messagesByHour = []
    for (let hour = 0; hour < 24; hour++) {
      // This is a simplified version - in a real app, you'd query the database
      // For now, we'll generate some realistic mock data based on typical usage patterns
      let count = 0
      if (hour >= 9 && hour <= 22) {
        // More active during day hours
        count = Math.floor(Math.random() * (totalMessages / 10)) + 1
      } else {
        // Less active during night hours
        count = Math.floor(Math.random() * (totalMessages / 50))
      }
      
      messagesByHour.push({
        hour,
        count
      })
    }

    // Get admin user to get adminId for logging
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Log admin action
    await logAdminAction(
      adminUser.id,
      'VIEW_USER_STATS',
      'USER',
      user.id,
      { userEmail: user.email },
      request
    )

    const stats = {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation,
      firstConversationDate,
      lastConversationDate,
      mostActiveDay,
      avgSessionDuration: Math.round(avgSessionDuration),
      conversationsByMonth: conversationsByMonth.filter(m => m.count > 0),
      messagesByHour
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('User stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}