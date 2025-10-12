import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dimension = searchParams.get('dimension')
    const limit = parseInt(searchParams.get('limit') || '2')

    if (!dimension) {
      return NextResponse.json({ error: 'Dimension parameter is required' }, { status: 400 })
    }

    // 验证维度是否有效
    const validDimensions = [
      'causal_analysis',
      'premise_challenge', 
      'fallacy_detection',
      'iterative_reflection',
      'connection_transfer'
    ]

    if (!validDimensions.includes(dimension)) {
      return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 })
    }

    // 从数据库获取指定维度的题目，按创建时间排序，取最新的题目
    const topics = await prisma.generatedConversationTopic.findMany({
      where: {
        dimension: dimension
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        topic: true,
        context: true,
        difficulty: true,
        category: true,
        tags: true,
        dimension: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        dimension,
        topics,
        count: topics.length
      }
    })

  } catch (error) {
    console.error('Error fetching topics by dimension:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}