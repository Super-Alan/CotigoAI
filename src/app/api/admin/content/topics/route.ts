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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const isPublic = searchParams.get('isPublic')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (difficulty) {
      where.difficulty = difficulty
    }
    
    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    const [topics, total] = await Promise.all([
      prisma.generatedConversationTopic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.generatedConversationTopic.count({ where })
    ])

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Topics fetch error:', error)
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
    const {
      topic,
      category,
      context,
      referenceUniversity,
      dimension,
      difficulty,
      tags,
      thinkingFramework,
      guidingQuestions,
      expectedOutcomes,
      isPublic
    } = body

    const newTopic = await prisma.generatedConversationTopic.create({
      data: {
        topic,
        category,
        context,
        referenceUniversity,
        dimension,
        difficulty,
        tags: tags || [],
        thinkingFramework: thinkingFramework || {},
        guidingQuestions: guidingQuestions || [],
        expectedOutcomes: expectedOutcomes || [],
        isPublic: isPublic || false,
        usageCount: 0
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(newTopic, { status: 201 })
  } catch (error) {
    console.error('Topic creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}