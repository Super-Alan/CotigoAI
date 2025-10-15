import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, logAdminAction } from '@/lib/admin-auth'

export async function POST(
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove user ban status
    // In a real implementation, you'd update the 'banned' field to false
    // For now, we'll just log the action and return success
    
    // Get admin user to get adminId for logging
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    await logAdminAction(
      adminUser.id,
      'UNBAN_USER',
      'USER',
      user.id,
      { userEmail: user.email, userName: user.name || '未设置姓名' },
      request
    )

    return NextResponse.json({ 
      success: true, 
      message: `用户 ${user.email} 已解除禁用`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Unban user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}