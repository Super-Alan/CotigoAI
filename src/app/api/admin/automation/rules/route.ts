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

    // Generate mock automation rules (in a real implementation, these would come from database)
    const rules = [
      {
        id: '1',
        name: '新用户欢迎邮件',
        description: '用户注册后24小时内发送欢迎邮件',
        type: 'triggered',
        status: 'active',
        trigger: {
          type: 'user_registered',
          condition: 'delay',
          value: '24h'
        },
        actions: [
          {
            type: 'send_email',
            config: {
              template: 'welcome',
              subject: '欢迎使用 Cogito AI'
            }
          }
        ],
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        runCount: 156,
        successRate: 98
      },
      {
        id: '2',
        name: '数据库备份',
        description: '每日凌晨2点自动备份数据库',
        type: 'scheduled',
        status: 'active',
        trigger: {
          type: 'schedule',
          condition: 'daily',
          value: '02:00'
        },
        actions: [
          {
            type: 'backup_database',
            config: {
              destination: 's3://backups/',
              retention: '30d'
            }
          }
        ],
        schedule: {
          frequency: 'daily',
          time: '02:00'
        },
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        runCount: 45,
        successRate: 100
      },
      {
        id: '3',
        name: '内容审核',
        description: '自动检测和标记不当内容',
        type: 'triggered',
        status: 'active',
        trigger: {
          type: 'message_created',
          condition: 'immediate',
          value: null
        },
        actions: [
          {
            type: 'content_moderation',
            config: {
              threshold: 0.8,
              action: 'flag'
            }
          }
        ],
        lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        runCount: 2341,
        successRate: 95
      },
      {
        id: '4',
        name: '用户活跃度报告',
        description: '每周生成用户活跃度报告',
        type: 'scheduled',
        status: 'active',
        trigger: {
          type: 'schedule',
          condition: 'weekly',
          value: 'monday_09:00'
        },
        actions: [
          {
            type: 'generate_report',
            config: {
              type: 'user_activity',
              recipients: ['admin@example.com']
            }
          }
        ],
        schedule: {
          frequency: 'weekly',
          time: '09:00',
          days: ['monday']
        },
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        runCount: 12,
        successRate: 92
      },
      {
        id: '5',
        name: '系统性能监控',
        description: '监控系统资源使用情况',
        type: 'conditional',
        status: 'active',
        trigger: {
          type: 'system_metric',
          condition: 'cpu_usage > 80%',
          value: 80
        },
        actions: [
          {
            type: 'send_alert',
            config: {
              channels: ['email', 'slack'],
              severity: 'warning'
            }
          }
        ],
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        runCount: 8,
        successRate: 100
      },
      {
        id: '6',
        name: '清理临时文件',
        description: '每日清理超过7天的临时文件',
        type: 'scheduled',
        status: 'inactive',
        trigger: {
          type: 'schedule',
          condition: 'daily',
          value: '03:00'
        },
        actions: [
          {
            type: 'cleanup_files',
            config: {
              path: '/tmp/',
              age: '7d'
            }
          }
        ],
        schedule: {
          frequency: 'daily',
          time: '03:00'
        },
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        runCount: 23,
        successRate: 87
      }
    ]

    // Log admin action
    console.log(`Admin ${session.user.email} accessed automation rules at ${new Date().toISOString()}`)

    return NextResponse.json({ rules })

  } catch (error) {
    console.error('Error fetching automation rules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}