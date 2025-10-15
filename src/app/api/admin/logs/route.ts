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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || 'all'
    const category = searchParams.get('category') || 'all'
    const timeRange = searchParams.get('timeRange') || '24h'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 1)
    }

    // Build where clause
    const where: any = {
      timestamp: {
        gte: startDate
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (level !== 'all') {
      where.level = level
    }

    if (category !== 'all') {
      where.category = category
    }

    // Since we don't have a logs table in the schema, we'll generate mock data
    // In a real implementation, you would create a SystemLog model in Prisma
    
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'info',
        category: 'user',
        action: '用户登录',
        userId: 'user1',
        userEmail: 'admin@example.com',
        details: '管理员成功登录系统',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        metadata: {}
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        level: 'success',
        category: 'user',
        action: '用户创建',
        userId: 'admin1',
        userEmail: 'admin@example.com',
        details: '成功创建新用户账户',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        metadata: { newUserId: 'user123' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'warning',
        category: 'auth',
        action: '登录失败',
        details: '用户尝试使用错误密码登录',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0...',
        metadata: { attemptedEmail: 'test@example.com' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        level: 'error',
        category: 'system',
        action: 'API错误',
        details: '数据库连接超时',
        ipAddress: '127.0.0.1',
        userAgent: 'Internal',
        metadata: { errorCode: 'DB_TIMEOUT' }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        level: 'info',
        category: 'conversation',
        action: '对话创建',
        userId: 'user2',
        userEmail: 'user@example.com',
        details: '用户创建新对话',
        ipAddress: '192.168.1.150',
        userAgent: 'Mozilla/5.0...',
        metadata: { conversationId: 'conv123' }
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        level: 'success',
        category: 'user',
        action: '用户禁用',
        userId: 'admin1',
        userEmail: 'admin@example.com',
        details: '管理员禁用用户账户',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        metadata: { targetUserId: 'user456' }
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        level: 'info',
        category: 'api',
        action: 'API调用',
        details: '获取用户列表',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        metadata: { endpoint: '/api/admin/users' }
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        level: 'warning',
        category: 'system',
        action: '性能警告',
        details: 'CPU使用率超过80%',
        ipAddress: '127.0.0.1',
        userAgent: 'System Monitor',
        metadata: { cpuUsage: 85.2 }
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        level: 'success',
        category: 'user',
        action: '批量邮件发送',
        userId: 'admin1',
        userEmail: 'admin@example.com',
        details: '成功向50个用户发送邮件',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        metadata: { recipientCount: 50 }
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        level: 'error',
        category: 'auth',
        action: '权限错误',
        userId: 'user3',
        userEmail: 'user3@example.com',
        details: '用户尝试访问管理员功能',
        ipAddress: '192.168.1.180',
        userAgent: 'Mozilla/5.0...',
        metadata: { attemptedAction: 'admin_access' }
      }
    ]

    // Filter logs based on criteria
    let filteredLogs = mockLogs.filter(log => {
      const logDate = new Date(log.timestamp)
      if (logDate < startDate) return false
      
      if (level !== 'all' && log.level !== level) return false
      if (category !== 'all' && log.category !== category) return false
      
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          (log.userEmail && log.userEmail.toLowerCase().includes(searchLower))
        )
      }
      
      return true
    })

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const total = filteredLogs.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    // Log this admin action
    console.log(`Admin ${session.user.email} accessed system logs`)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('System logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}