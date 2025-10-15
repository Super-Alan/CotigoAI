import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminUser } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(session.user.id)
    
    return NextResponse.json({ 
      isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    })
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 })
  }
}