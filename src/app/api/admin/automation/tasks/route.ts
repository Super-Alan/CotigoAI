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

    // Generate mock automation tasks (in a real implementation, these would come from database)
    const now = new Date()
    const tasks = [
      {
        id: '1',
        ruleId: '1',
        ruleName: '新用户欢迎邮件',
        status: 'completed',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
        duration: 5000,
        result: '邮件发送成功'
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: '数据库备份',
        status: 'completed',
        startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 6 * 60 * 60 * 1000 + 120000).toISOString(),
        duration: 120000,
        result: '备份完成，文件大小: 2.3GB'
      },
      {
        id: '3',
        ruleId: '3',
        ruleName: '内容审核',
        status: 'completed',
        startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 30 * 60 * 1000 + 2000).toISOString(),
        duration: 2000,
        result: '检测到1条可疑内容并已标记'
      },
      {
        id: '4',
        ruleId: '5',
        ruleName: '系统性能监控',
        status: 'completed',
        startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 4 * 60 * 60 * 1000 + 1500).toISOString(),
        duration: 1500,
        result: 'CPU使用率超过阈值，已发送警报'
      },
      {
        id: '5',
        ruleId: '1',
        ruleName: '新用户欢迎邮件',
        status: 'failed',
        startTime: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 8 * 60 * 60 * 1000 + 3000).toISOString(),
        duration: 3000,
        error: 'SMTP服务器连接失败'
      },
      {
        id: '6',
        ruleId: '4',
        ruleName: '用户活跃度报告',
        status: 'completed',
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 45000).toISOString(),
        duration: 45000,
        result: '报告生成完成并已发送给管理员'
      },
      {
        id: '7',
        ruleId: '3',
        ruleName: '内容审核',
        status: 'running',
        startTime: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '8',
        ruleId: '6',
        ruleName: '清理临时文件',
        status: 'completed',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 15000).toISOString(),
        duration: 15000,
        result: '清理了234个临时文件，释放空间1.2GB'
      },
      {
        id: '9',
        ruleId: '2',
        ruleName: '数据库备份',
        status: 'failed',
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 30000).toISOString(),
        duration: 30000,
        error: '磁盘空间不足'
      },
      {
        id: '10',
        ruleId: '1',
        ruleName: '新用户欢迎邮件',
        status: 'pending',
        startTime: new Date(now.getTime() + 10 * 60 * 1000).toISOString()
      }
    ]

    // Sort by start time (newest first)
    tasks.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    // Log admin action
    console.log(`Admin ${session.user.email} accessed automation tasks at ${new Date().toISOString()}`)

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Error fetching automation tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}