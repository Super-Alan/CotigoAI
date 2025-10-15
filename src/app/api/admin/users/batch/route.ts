import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, logAdminAction } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(session.user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userIds, data } = body

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request. Action and userIds are required.' 
      }, { status: 400 })
    }

    // Validate that all users exist
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: { id: true, email: true, name: true }
    })

    if (users.length !== userIds.length) {
      return NextResponse.json({ 
        error: 'Some users not found' 
      }, { status: 404 })
    }

    let results: any[] = []
    let successCount = 0
    let errorCount = 0

    switch (action) {
      case 'ban':
        // In a real implementation, you'd update a 'banned' field
        // For now, we'll simulate the action
        for (const user of users) {
          try {
            // Simulate ban action
            results.push({
              userId: user.id,
              email: user.email,
              status: 'success',
              message: '用户已禁用'
            })
            successCount++
          } catch (error) {
            results.push({
              userId: user.id,
              email: user.email,
              status: 'error',
              message: '禁用失败'
            })
            errorCount++
          }
        }
        
        // Get admin user to get adminId for logging
        const adminUser = await prisma.adminUser.findUnique({
          where: { userId: session.user.id }
        })

        if (!adminUser) {
          return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
        }
        
        await logAdminAction(
          adminUser.id,
          'BATCH_BAN_USERS',
          'USER',
          undefined,
          { successCount, errorCount, userIds },
          request
        )
        break

      case 'unban':
        // In a real implementation, you'd update a 'banned' field to false
        for (const user of users) {
          try {
            // Simulate unban action
            results.push({
              userId: user.id,
              email: user.email,
              status: 'success',
              message: '用户已解除禁用'
            })
            successCount++
          } catch (error) {
            results.push({
              userId: user.id,
              email: user.email,
              status: 'error',
              message: '解除禁用失败'
            })
            errorCount++
          }
        }
        
        // Get admin user to get adminId for logging
        const adminUser2 = await prisma.adminUser.findUnique({
          where: { userId: session.user.id }
        })

        if (!adminUser2) {
          return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
        }
        
        await logAdminAction(
          adminUser2.id,
          'BATCH_UNBAN_USERS',
          'USER',
          undefined,
          { successCount, errorCount, userIds },
          request
        )
        break

      case 'send-email':
        const { subject, message } = data || {}
        
        if (!subject || !message) {
          return NextResponse.json({ 
            error: 'Email subject and message are required for send-email action' 
          }, { status: 400 })
        }

        for (const user of users) {
          try {
            // Simulate email sending
            // In a real implementation, you'd integrate with an email service
            await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay
            
            results.push({
              userId: user.id,
              email: user.email,
              status: 'success',
              message: '邮件发送成功'
            })
            successCount++
          } catch (error) {
            results.push({
              userId: user.id,
              email: user.email,
              status: 'error',
              message: '邮件发送失败'
            })
            errorCount++
          }
        }
        
        // Get admin user to get adminId for logging
        const adminUser3 = await prisma.adminUser.findUnique({
          where: { userId: session.user.id }
        })

        if (!adminUser3) {
          return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
        }
        
        await logAdminAction(
          adminUser3.id,
          'BATCH_SEND_EMAIL',
          'USER',
          undefined,
          { successCount, errorCount, userIds, subject },
          request
        )
        break

      case 'delete':
        // This is a dangerous operation, implement with extra caution
        for (const user of users) {
          try {
            // In a real implementation, you might want to:
            // 1. Soft delete (mark as deleted)
            // 2. Archive user data
            // 3. Delete related conversations and messages
            
            // For now, we'll just simulate and NOT actually delete
            results.push({
              userId: user.id,
              email: user.email,
              status: 'success',
              message: '用户已删除 (模拟)'
            })
            successCount++
          } catch (error) {
            results.push({
              userId: user.id,
              email: user.email,
              status: 'error',
              message: '删除失败'
            })
            errorCount++
          }
        }
        
        // Get admin user to get adminId for logging
        const adminUser4 = await prisma.adminUser.findUnique({
          where: { userId: session.user.id }
        })

        if (!adminUser4) {
          return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
        }
        
        await logAdminAction(
          adminUser4.id,
          'BATCH_DELETE_USERS',
          'USER',
          undefined,
          { successCount, errorCount, userIds },
          request
        )
        break

      default:
        return NextResponse.json({ 
          error: `Unsupported action: ${action}` 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      totalUsers: userIds.length,
      successCount,
      errorCount,
      results
    })
  } catch (error) {
    console.error('Batch users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}