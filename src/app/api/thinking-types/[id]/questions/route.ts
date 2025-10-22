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
    const level = searchParams.get('level') // 1-5

    const whereClause: any = {
      thinkingTypeId: params.id
    }

    // ✅ 添加Level过滤，确保只返回当前Level的题目
    if (level) {
      whereClause.level = parseInt(level)
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

    // 映射数据库字段到前端期望的字段名
    const mappedQuestions = questions.map(q => ({
      ...q,
      content: q.question, // 将 question 映射为 content
    }))

    return NextResponse.json({
      success: true,
      data: {
        questions: mappedQuestions
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
