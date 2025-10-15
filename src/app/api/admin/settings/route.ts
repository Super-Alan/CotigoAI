import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
      where.category = category
    }

    const settings = await prisma.systemConfig.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // 按分类分组
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push({
        ...setting,
        value: setting.isSecret ? '***' : setting.value // 隐藏敏感信息
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      settings: groupedSettings,
      categories: Object.keys(groupedSettings)
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, category, isSecret } = body

    if (!key || !value || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const setting = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        category,
        isSecret: isSecret || false,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        category,
        isSecret: isSecret || false
      }
    })

    return NextResponse.json({
      ...setting,
      value: setting.isSecret ? '***' : setting.value
    })
  } catch (error) {
    console.error('Setting creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}