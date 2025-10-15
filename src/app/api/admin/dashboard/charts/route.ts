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

    // Get user growth data for the last 30 days
    const userGrowthData = []
    const conversationStatsData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Get cumulative user count up to this date
      const totalUsers = await prisma.user.count({
        where: {
          createdAt: {
            lte: date
          }
        }
      })
      
      // Get active users for this specific day
      const activeUsers = await prisma.user.count({
        where: {
          conversations: {
            some: {
              updatedAt: {
                gte: new Date(date.getTime() - 24 * 60 * 60 * 1000),
                lte: date
              }
            }
          }
        }
      })

      // Get conversations created on this day
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const conversationsCount = await prisma.conversation.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })

      // Get messages created on this day
      const messagesCount = await prisma.message.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })

      userGrowthData.push({
        date: dateStr,
        users: totalUsers,
        active: activeUsers
      })

      conversationStatsData.push({
        date: dateStr,
        conversations: conversationsCount,
        messages: messagesCount
      })
    }

    // Get topic distribution (mock data based on conversation analysis)
    // In a real implementation, you would analyze conversation content or have topic tags
    const topicDistribution = [
      { name: '学习辅导', value: 35, color: '#0088FE' },
      { name: '论证分析', value: 25, color: '#00C49F' },
      { name: '批判思维', value: 20, color: '#FFBB28' },
      { name: '多元视角', value: 15, color: '#FF8042' },
      { name: '其他', value: 5, color: '#8884D8' }
    ]

    const chartData = {
      userGrowth: userGrowthData,
      conversationStats: conversationStatsData,
      topicDistribution
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}