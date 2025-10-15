import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const alertId = params.id

    // For now, we'll just return success since we don't have an alerts table
    // In a real implementation, you would update the alert in the database
    // await prisma.alert.update({
    //   where: { id: alertId },
    //   data: { read: true, readAt: new Date() }
    // })

    // Log admin action
    console.log(`Admin ${session.user.email} marked alert ${alertId} as read at ${new Date().toISOString()}`)

    return NextResponse.json({ 
      success: true,
      message: 'Alert marked as read',
      alertId 
    })

  } catch (error) {
    console.error('Error marking alert as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}