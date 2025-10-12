import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/thinking-types/[id]/questions
 * 获取指定思维类型的批判性思维题目
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const difficulty = searchParams.get('difficulty') // beginner | intermediate | advanced

    const whereClause: any = {
      thinkingTypeId: params.id
    }

    if (difficulty) {
      whereClause.difficulty = difficulty
    }

    const questions = await prisma.criticalThinkingQuestion.findMany({
      where: whereClause,
      include: {
        guidingQuestions: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: {
        questions
      }
    })
  } catch (error) {
    console.error('获取批判性思维题目失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取题目失败',
          details: error instanceof Error ? error.message : '未知错误'
        }
      },
      { status: 500 }
    )
  }
}
