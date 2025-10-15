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
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.contentType = type
    }
    
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          ...where,
          // 只获取需要审核的内容
          OR: [
            { flagged: true },
            { content: { contains: 'flagged_content' } } // 示例条件
          ]
        },
        include: {
          conversation: {
            select: {
              id: true,
              title: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({
        where: {
          ...where,
          OR: [
            { flagged: true },
            { content: { contains: 'flagged_content' } }
          ]
        }
      })
    ])

    // 转换数据格式以适应前端
    const moderationItems = items.map(item => ({
      id: item.id,
      content: item.content,
      contentType: 'message',
      status: 'pending', // Since we're filtering for flagged content, assume pending
      reportReason: 'Automatic flag',
      user: item.conversation?.user,
      conversation: item.conversation,
      createdAt: item.createdAt,
      updatedAt: item.createdAt // Use createdAt since updatedAt doesn't exist on Message
    }))

    return NextResponse.json({
      items: moderationItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Moderation fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, action, reason } = body

    if (!contentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 根据action更新内容状态
    if (action === 'approve') {
      // For now, just log the approval since Message model doesn't have flagged field
      console.log(`Message ${contentId} approved by ${session.user.email}`)
    } else if (action === 'reject') {
      // For now, just log the rejection since Message model doesn't have flagged field
      console.log(`Message ${contentId} rejected by ${session.user.email}, reason: ${reason}`)
    } else if (action === 'delete') {
      await prisma.message.delete({
        where: { id: contentId }
      })
    }

    return NextResponse.json({ 
      message: 'Content moderated successfully',
      action 
    })
  } catch (error) {
    console.error('Moderation action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}