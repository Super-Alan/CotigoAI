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

    // Get user details with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        conversations: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                messages: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            conversations: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate user statistics
    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          userId: userId
        }
      }
    })

    const lastActiveAt = user.conversations[0]?.updatedAt || null
    
    // Determine user status
    let status: 'active' | 'inactive' | 'banned' = 'inactive'
    if (lastActiveAt) {
      const daysSinceActive = Math.floor(
        (new Date().getTime() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceActive <= 7) {
        status = 'active'
      }
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
      'VIEW_USER',
      'USER',
      user.id,
      { userEmail: user.email },
      request
    )

    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastActiveAt: lastActiveAt?.toISOString() || null,
      status,
      stats: {
        totalConversations: user._count.conversations,
        totalMessages,
        avgMessagesPerConversation: user._count.conversations > 0 
          ? Math.round(totalMessages / user._count.conversations) 
          : 0
      },
      recentConversations: user.conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        messageCount: conv._count.messages
      }))
    }

    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('User details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}