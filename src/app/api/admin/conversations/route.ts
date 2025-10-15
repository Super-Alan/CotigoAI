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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { 
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          messages: {
            select: {
              id: true,
              role: true,
              createdAt: true
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      }),
      prisma.conversation.count({ where })
    ])

    // 计算对话统计信息
    const conversationsWithStats = conversations.map(conv => {
      const messageCount = conv.messages.length
      const userMessages = conv.messages.filter(m => m.role === 'user').length
      const assistantMessages = conv.messages.filter(m => m.role === 'assistant').length
      
      // 计算对话时长（从第一条消息到最后一条消息）
      const duration = conv.messages.length > 1 
        ? new Date(conv.messages[conv.messages.length - 1].createdAt).getTime() - 
          new Date(conv.messages[0].createdAt).getTime()
        : 0

      return {
        ...conv,
        stats: {
          messageCount,
          userMessages,
          assistantMessages,
          duration: Math.round(duration / 1000 / 60) // 转换为分钟
        }
      }
    })

    return NextResponse.json({
      conversations: conversationsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Conversations fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}