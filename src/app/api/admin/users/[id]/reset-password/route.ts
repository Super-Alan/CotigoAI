import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser, tryLogAdminAction } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

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
    const body = await request.json()
    const { newPassword } = body

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // Log admin action
    await tryLogAdminAction(
      session.user.id,
      'RESET_PASSWORD',
      'USER',
      user.id,
      {
        userEmail: user.email,
        userName: user.name
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: '密码重置成功'
    })
  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
