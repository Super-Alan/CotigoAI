import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/daily-questions
 * 获取每日批判性思维问题
 *
 * Query Parameters:
 * - category: critical_thinking | interview | social_issue (可选，筛选类别)
 * - difficulty: beginner | intermediate | advanced (可选，筛选难度)
 * - limit: 数量限制 (默认为1，获取单个问题)
 *
 * 返回随机选择的问题，优先选择使用次数较少的问题
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '1')

    // 构建查询条件
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // 获取符合条件的所有问题，按使用次数排序
    const questions = await prisma.dailyCriticalQuestion.findMany({
      where,
      orderBy: [
        { usageCount: 'asc' },  // 优先使用次数少的
        { createdAt: 'desc' }   // 其次按创建时间排序
      ],
      take: limit * 5  // 获取更多问题以便随机选择
    })

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: '暂无可用问题'
      }, { status: 404 })
    }

    // 从前N个使用次数最少的问题中随机选择
    const randomQuestions = questions
      .slice(0, Math.min(limit * 3, questions.length))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    // 更新使用次数
    await Promise.all(
      randomQuestions.map(q =>
        prisma.dailyCriticalQuestion.update({
          where: { id: q.id },
          data: { usageCount: { increment: 1 } }
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: {
        questions: randomQuestions,
        total: questions.length
      }
    })
  } catch (error) {
    console.error('Error fetching daily questions:', error)
    return NextResponse.json({
      success: false,
      message: '获取问题失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * POST /api/daily-questions
 * 添加新的批判性思维问题 (管理员功能)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      question,
      category,
      subcategory,
      difficulty = 'intermediate',
      tags = [],
      thinkingTypes = [],
      context,
      isActive = true
    } = body

    // 验证必填字段
    if (!question || !category) {
      return NextResponse.json({
        success: false,
        message: '缺少必填字段: question, category'
      }, { status: 400 })
    }

    // 验证category
    const validCategories = ['critical_thinking', 'interview', 'social_issue']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        message: `category 必须是: ${validCategories.join(', ')}`
      }, { status: 400 })
    }

    // 验证difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json({
        success: false,
        message: `difficulty 必须是: ${validDifficulties.join(', ')}`
      }, { status: 400 })
    }

    // 创建问题
    const newQuestion = await prisma.dailyCriticalQuestion.create({
      data: {
        question,
        category,
        subcategory,
        difficulty,
        tags,
        thinkingTypes,
        context,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: newQuestion
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating daily question:', error)
    return NextResponse.json({
      success: false,
      message: '创建问题失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
