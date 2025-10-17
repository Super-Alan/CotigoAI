import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 权限枚举
export enum Permission {
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  CONTENT_READ = 'content:read',
  CONTENT_WRITE = 'content:write',
  ANALYTICS_READ = 'analytics:read',
  SYSTEM_CONFIG = 'system:config',
  ADMIN_MANAGE = 'admin:manage'
}

// 角色权限映射
export const rolePermissions = {
  SUPER_ADMIN: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,
    Permission.ANALYTICS_READ,
    Permission.SYSTEM_CONFIG,
    Permission.ADMIN_MANAGE
  ],
  CONTENT_ADMIN: [
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,
    Permission.ANALYTICS_READ,
    Permission.USER_READ
  ],
  ANALYST: [
    Permission.ANALYTICS_READ,
    Permission.USER_READ,
    Permission.CONTENT_READ
  ]
} as const

export type AdminRole = keyof typeof rolePermissions

// 检查用户是否有管理员权限
export async function checkAdminPermission(userId: string, requiredPermission: Permission): Promise<boolean> {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId },
      select: { role: true, permissions: true, isActive: true }
    })

    if (!adminUser || !adminUser.isActive) {
      return false
    }

    // 检查角色权限
    const rolePerms = rolePermissions[adminUser.role as AdminRole] || []
    if (rolePerms.includes(requiredPermission as any)) {
      return true
    }

    // 检查额外权限
    const extraPermissions = adminUser.permissions as string[]
    return extraPermissions.includes(requiredPermission)
  } catch (error) {
    console.error('Error checking admin permission:', error)
    return false
  }
}

// 获取用户管理员信息
export async function getAdminUser(userId: string) {
  try {
    return await prisma.adminUser.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

// 记录管理员操作日志
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  request?: NextRequest
) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        details: details || null,
        ipAddress: request?.ip || request?.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request?.headers.get('user-agent') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

// 尝试记录管理员操作（如果 admin_users 表存在）
export async function tryLogAdminAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  request?: NextRequest
): Promise<void> {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (adminUser) {
      await logAdminAction(
        adminUser.id,
        action,
        resource,
        resourceId,
        details,
        request
      )
    }
  } catch (error) {
    // admin_users table doesn't exist yet or other error, skip logging
    console.log('Admin logging skipped:', (error as Error).message)
  }
}

// 管理员权限中间件
export function withAdminAuth(requiredPermission: Permission) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const hasPermission = await checkAdminPermission(session.user.id, requiredPermission)

      if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // 记录访问日志
      const adminUser = await getAdminUser(session.user.id)
      if (adminUser) {
        await logAdminAction(
          adminUser.userId,
          'VIEW',
          'API',
          req.url,
          { permission: requiredPermission },
          req
        )
      }

      return null // 继续执行
    } catch (error) {
      console.error('Admin auth middleware error:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }
}

// 检查是否为管理员用户
export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    // 临时解决方案：通过用户邮箱判断管理员权限
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })
    
    // 管理员邮箱列表
    const adminEmails = ['admin@cogito.ai', 'super@cogito.ai']
    
    if (user && adminEmails.includes(user.email)) {
      return true
    }

    // 尝试查询 AdminUser 表（如果存在）
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { userId },
        select: { isActive: true }
      })
      return adminUser?.isActive || false
    } catch (adminError) {
      // AdminUser 表不存在时，回退到邮箱检查
      return false
    }
  } catch (error) {
    console.error('Error checking admin user:', error)
    return false
  }
}

// Export isAdmin as an alias for isAdminUser for backward compatibility
export const isAdmin = isAdminUser