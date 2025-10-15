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

    // Generate mock system metrics (in a real implementation, these would come from system monitoring tools)
    const now = new Date()
    
    // Server metrics
    const server = {
      status: 'healthy' as const,
      uptime: Math.floor(Math.random() * 2592000) + 86400, // 1-30 days
      load: [
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ],
      processes: Math.floor(Math.random() * 200) + 100,
      threads: Math.floor(Math.random() * 1000) + 500
    }

    // Resource metrics
    const resources = {
      cpu: {
        usage: Math.floor(Math.random() * 60) + 10, // 10-70%
        cores: 8,
        temperature: Math.floor(Math.random() * 30) + 45, // 45-75°C
        frequency: 3.2
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        used: 0,
        available: 0,
        cached: 0
      },
      disk: {
        total: 500 * 1024 * 1024 * 1024, // 500GB
        used: 0,
        available: 0,
        iops: Math.floor(Math.random() * 1000) + 500
      },
      network: {
        inbound: Math.floor(Math.random() * 1024 * 1024) + 1024 * 512, // 0.5-1.5 MB/s
        outbound: Math.floor(Math.random() * 1024 * 1024) + 1024 * 256, // 0.25-1.25 MB/s
        latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
        connections: Math.floor(Math.random() * 1000) + 100
      }
    }

    // Calculate memory usage
    const memoryUsagePercent = Math.floor(Math.random() * 60) + 20 // 20-80%
    resources.memory.used = Math.floor(resources.memory.total * memoryUsagePercent / 100)
    resources.memory.available = resources.memory.total - resources.memory.used
    resources.memory.cached = Math.floor(resources.memory.total * 0.1)

    // Calculate disk usage
    const diskUsagePercent = Math.floor(Math.random() * 40) + 30 // 30-70%
    resources.disk.used = Math.floor(resources.disk.total * diskUsagePercent / 100)
    resources.disk.available = resources.disk.total - resources.disk.used

    // Database metrics
    const database = {
      status: 'connected' as const,
      connections: Math.floor(Math.random() * 50) + 10,
      maxConnections: 100,
      queryTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
      slowQueries: Math.floor(Math.random() * 5)
    }

    // Services status
    const services = [
      {
        name: 'Next.js Application',
        status: 'running' as const,
        port: 3000,
        memory: Math.floor(Math.random() * 512 * 1024 * 1024) + 256 * 1024 * 1024, // 256-768MB
        cpu: Math.floor(Math.random() * 30) + 5, // 5-35%
        uptime: Math.floor(Math.random() * 86400) + 3600 // 1-24 hours
      },
      {
        name: 'PostgreSQL Database',
        status: 'running' as const,
        port: 5432,
        memory: Math.floor(Math.random() * 1024 * 1024 * 1024) + 512 * 1024 * 1024, // 512MB-1.5GB
        cpu: Math.floor(Math.random() * 20) + 5, // 5-25%
        uptime: Math.floor(Math.random() * 604800) + 86400 // 1-7 days
      },
      {
        name: 'Redis Cache',
        status: 'running' as const,
        port: 6379,
        memory: Math.floor(Math.random() * 256 * 1024 * 1024) + 64 * 1024 * 1024, // 64-320MB
        cpu: Math.floor(Math.random() * 10) + 2, // 2-12%
        uptime: Math.floor(Math.random() * 604800) + 86400 // 1-7 days
      },
      {
        name: 'Nginx Proxy',
        status: 'running' as const,
        port: 80,
        memory: Math.floor(Math.random() * 64 * 1024 * 1024) + 32 * 1024 * 1024, // 32-96MB
        cpu: Math.floor(Math.random() * 5) + 1, // 1-6%
        uptime: Math.floor(Math.random() * 1209600) + 86400 // 1-14 days
      }
    ]

    // Performance history (last 24 hours)
    const performance = []
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      performance.push({
        timestamp: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 60) + 10,
        memory: Math.floor(Math.random() * 60) + 20,
        disk: Math.floor(Math.random() * 40) + 30,
        network: Math.floor(Math.random() * 80) + 10
      })
    }

    // System alerts
    const alerts = []
    
    // Add alerts based on current metrics
    if (resources.cpu.usage > 80) {
      alerts.push({
        id: 'cpu-high',
        level: 'warning' as const,
        service: 'System CPU',
        message: `CPU使用率过高: ${resources.cpu.usage}%`,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        resolved: false
      })
    }

    if (memoryUsagePercent > 85) {
      alerts.push({
        id: 'memory-high',
        level: 'error' as const,
        service: 'System Memory',
        message: `内存使用率过高: ${memoryUsagePercent}%`,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        resolved: false
      })
    }

    if (diskUsagePercent > 90) {
      alerts.push({
        id: 'disk-full',
        level: 'critical' as const,
        service: 'System Disk',
        message: `磁盘空间不足: ${diskUsagePercent}%`,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        resolved: false
      })
    }

    if (database.queryTime > 100) {
      alerts.push({
        id: 'db-slow',
        level: 'warning' as const,
        service: 'PostgreSQL',
        message: `数据库查询响应时间过长: ${database.queryTime}ms`,
        timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        resolved: false
      })
    }

    // Add some resolved alerts
    alerts.push({
      id: 'backup-success',
      level: 'info' as const,
      service: 'Backup Service',
      message: '数据库备份成功完成',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true
    })

    alerts.push({
      id: 'ssl-renewed',
      level: 'info' as const,
      service: 'SSL Certificate',
      message: 'SSL证书自动续期成功',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      resolved: true
    })

    // Log admin action
    console.log(`Admin ${session.user.email} accessed system monitoring at ${new Date().toISOString()}`)

    const monitoringData = {
      server,
      resources,
      database,
      services,
      performance,
      alerts
    }

    return NextResponse.json(monitoringData)

  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}