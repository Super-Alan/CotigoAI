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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const dateRange = searchParams.get('dateRange') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } }
      ]
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStart, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    const [field, direction] = sortBy.split('_')
    
    switch (field) {
      case 'createdAt':
        orderBy.createdAt = direction
        break
      case 'name':
        orderBy.name = direction
        break
      case 'lastActive':
        // We'll handle this with a subquery or computed field
        orderBy.updatedAt = direction
        break
      default:
        orderBy.createdAt = 'desc'
    }

    // Get users with conversation count
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            conversations: true
          }
        },
        conversations: {
          select: {
            updatedAt: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Transform users data
    const transformedUsers = users.map(user => {
      const lastConversation = user.conversations[0]
      const lastActiveAt = lastConversation?.updatedAt || null
      
      // Determine user status based on activity
      let userStatus: 'active' | 'inactive' | 'banned' = 'inactive'
      
      if (lastActiveAt) {
        const daysSinceActive = Math.floor(
          (new Date().getTime() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysSinceActive <= 7) {
          userStatus = 'active'
        }
      }

      // Apply status filter
      if (status !== 'all' && userStatus !== status) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: lastActiveAt?.toISOString() || null,
        conversationCount: user._count.conversations,
        status: userStatus
      }
    }).filter(Boolean)

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}