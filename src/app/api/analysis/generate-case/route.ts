import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiRouter } from '@/lib/ai/router'
import { generateCaseAnalysisPrompt, validateCaseAnalysis } from '@/lib/prompts/case-analysis-prompts'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/analysis/generate-case
 * 为批判性思维题目生成专业的案例分析
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { questionId, dimension, question, context, tags } = body

    if (!dimension || !question || !context) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '缺少必要参数：dimension, question, context'
          }
        },
        { status: 400 }
      )
    }

    // 生成案例分析提示词
    const prompt = generateCaseAnalysisPrompt(
      dimension,
      question,
      context,
      tags || []
    )

    // 调用AI生成案例分析
    const response = await aiRouter.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 4000
    })

    if (!response.success || !response.content) {
      throw new Error('AI生成失败')
    }

    // 解析JSON响应
    let caseAnalysis
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('未找到JSON格式的响应')
      }

      const parsedData = JSON.parse(jsonMatch[0])
      caseAnalysis = validateCaseAnalysis(parsedData)
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.error('AI响应内容:', response.content)

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'AI生成的案例分析格式不正确',
            details: parseError instanceof Error ? parseError.message : '未知错误'
          }
        },
        { status: 500 }
      )
    }

    // 如果提供了questionId，更新数据库中的题目
    if (questionId) {
      await prisma.criticalThinkingQuestion.update({
        where: { id: questionId },
        data: {
          caseAnalysis: caseAnalysis as any,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        caseAnalysis,
        aiModel: response.model,
        tokensUsed: response.usage
      }
    })
  } catch (error) {
    console.error('生成案例分析失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: '生成案例分析失败',
          details: error instanceof Error ? error.message : '未知错误'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analysis/generate-case?questionId=xxx
 * 获取题目的案例分析
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '缺少questionId参数'
          }
        },
        { status: 400 }
      )
    }

    const question = await prisma.criticalThinkingQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        caseAnalysis: true,
        question: true,
        context: true,
        tags: true,
        thinkingTypeId: true
      }
    })

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '题目不存在'
          }
        },
        { status: 404 }
      )
    }

    // 如果案例分析不存在，自动生成
    if (!question.caseAnalysis) {
      const generationResponse = await POST(
        new NextRequest(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify({
            questionId: question.id,
            dimension: question.thinkingTypeId,
            question: question.question,
            context: question.context,
            tags: question.tags
          })
        })
      )

      const generationData = await generationResponse.json()
      if (!generationData.success) {
        return NextResponse.json(generationData, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: {
          caseAnalysis: generationData.data.caseAnalysis,
          generated: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        caseAnalysis: question.caseAnalysis,
        generated: false
      }
    })
  } catch (error) {
    console.error('获取案例分析失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取案例分析失败',
          details: error instanceof Error ? error.message : '未知错误'
        }
      },
      { status: 500 }
    )
  }
}
