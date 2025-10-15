import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { value, category, isSecret } = body

    const setting = await prisma.systemConfig.update({
      where: { key: params.key },
      data: {
        value,
        category,
        isSecret: isSecret || false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      ...setting,
      value: setting.isSecret ? '***' : setting.value
    })
  } catch (error) {
    console.error('Setting update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.systemConfig.delete({
      where: { key: params.key }
    })

    return NextResponse.json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('Setting deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}