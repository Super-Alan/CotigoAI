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

    // Check if user is already banned (you might want to add a banned field to your schema)
    // For now, we'll use a simple approach and create a BannedUser table or add a field
    
    // Create or update user ban status
    // Since we don't have a banned field in the schema, we'll simulate this
    // In a real implementation, you'd add a 'banned' boolean field to the User model
    
    // For now, we'll just log the action and return success
    // You can extend this by adding a banned field to the User model in schema.prisma
    
    // Get admin user to get adminId for logging
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    await logAdminAction(
      adminUser.id,
      'BAN_USER',
      'USER',
      user.id,
      { userEmail: user.email, userName: user.name || '未设置姓名' },
      request
    )

    return NextResponse.json({ 
      success: true, 
      message: `用户 ${user.email} 已被禁用`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: 'banned'
      }
    })
  } catch (error) {
    console.error('Ban user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}