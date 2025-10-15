import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, logAdminAction } from '@/lib/admin-auth'

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
    const format = searchParams.get('format') || 'csv'
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const dateRange = searchParams.get('dateRange') || 'all'

    // Build where clause (same as in users list)
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } }
      ]
    }

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

    // Get users with conversation count
    const users = await prisma.user.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform users data
    const transformedUsers = users.map(user => {
      const lastConversation = user.conversations[0]
      const lastActiveAt = lastConversation?.updatedAt || null
      
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
        name: user.name || '未设置',
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: lastActiveAt?.toISOString() || '从未活跃',
        conversationCount: user._count.conversations,
        status: userStatus
      }
    }).filter(Boolean) as Array<{
      id: string
      name: string
      email: string
      createdAt: string
      lastActiveAt: string
      conversationCount: number
      status: string
    }>

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
      'EXPORT_USERS',
      'USER',
      undefined,
      { format: format.toUpperCase(), recordCount: transformedUsers.length },
      request
    )

    if (format === 'json') {
      return NextResponse.json({
        data: transformedUsers,
        exportedAt: new Date().toISOString(),
        totalRecords: transformedUsers.length
      })
    }

    // Generate CSV
    const csvHeaders = ['用户ID', '姓名', '邮箱', '注册时间', '最后活跃', '对话数', '状态']
    const csvRows = transformedUsers.map(user => [
      user.id,
      user.name,
      user.email,
      new Date(user.createdAt).toLocaleDateString('zh-CN'),
      user.lastActiveAt === '从未活跃' ? user.lastActiveAt : new Date(user.lastActiveAt).toLocaleDateString('zh-CN'),
      user.conversationCount.toString(),
      user.status === 'active' ? '活跃' : user.status === 'inactive' ? '非活跃' : '已禁用'
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cogito-users-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}