import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/search/learning
 * 全文检索理论知识和学习内容
 *
 * Query Parameters:
 * - q: 搜索关键词（必填）
 * - limit: 返回结果数量（可选，默认10）
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '搜索关键词不能为空' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toLowerCase()

    // 并行搜索理论知识和学习内容
    const [theoryResults, learningContentResults] = await Promise.all([
      searchTheoryContent(searchTerm, Math.ceil(limit / 2)),
      searchLearningContent(searchTerm, Math.ceil(limit / 2))
    ])

    // 合并结果并按相关性排序
    const combinedResults = [
      ...theoryResults,
      ...learningContentResults
    ].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

    // 限制返回数量
    const limitedResults = combinedResults.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        query: query,
        total: limitedResults.length,
        results: limitedResults
      }
    })

  } catch (error) {
    console.error('Learning search error:', error)
    return NextResponse.json(
      { success: false, error: '搜索失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 搜索理论知识内容
 */
async function searchTheoryContent(searchTerm: string, limit: number) {
  const theoryContents = await prisma.theoryContent.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
        { keywords: { hasSome: [searchTerm] } },
        { tags: { hasSome: [searchTerm] } }
      ]
    },
    select: {
      id: true,
      thinkingTypeId: true,
      level: true,
      title: true,
      subtitle: true,
      description: true,
      tags: true,
      keywords: true,
      difficulty: true,
      estimatedTime: true,
      thinkingType: {
        select: {
          name: true
        }
      }
    },
    take: limit,
    orderBy: [
      { viewCount: 'desc' },
      { userRating: 'desc' }
    ]
  })

  return theoryContents.map(content => {
    // 计算匹配分数
    const matchScore = calculateMatchScore(searchTerm, {
      title: content.title,
      description: content.description,
      subtitle: content.subtitle || '',
      keywords: content.keywords,
      tags: content.tags
    })

    return {
      type: 'theory' as const,
      id: content.id,
      thinkingTypeId: content.thinkingTypeId,
      thinkingTypeName: content.thinkingType.name,
      level: content.level,
      title: content.title,
      description: content.subtitle || content.description,
      tags: content.tags,
      keywords: content.keywords,
      matchScore
    }
  })
}

/**
 * 搜索学习内容
 */
async function searchLearningContent(searchTerm: string, limit: number) {
  const learningContents = await prisma.levelLearningContent.findMany({
    where: {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm] } }
      ]
    },
    select: {
      id: true,
      thinkingTypeId: true,
      level: true,
      contentType: true,
      title: true,
      description: true,
      tags: true,
      estimatedTime: true,
      thinkingType: {
        select: {
          name: true
        }
      }
    },
    take: limit,
    orderBy: [
      { orderIndex: 'asc' },
      { level: 'asc' }
    ]
  })

  return learningContents.map(content => {
    // 计算匹配分数
    const matchScore = calculateMatchScore(searchTerm, {
      title: content.title,
      description: content.description,
      tags: content.tags
    })

    return {
      type: 'learning_content' as const,
      id: content.id,
      thinkingTypeId: content.thinkingTypeId,
      thinkingTypeName: content.thinkingType.name,
      level: content.level,
      contentType: content.contentType,
      title: content.title,
      description: content.description,
      tags: content.tags,
      matchScore
    }
  })
}

/**
 * 计算匹配分数（0-100）
 */
function calculateMatchScore(
  searchTerm: string,
  fields: {
    title: string
    description: string
    subtitle?: string
    keywords?: string[]
    tags?: string[]
  }
): number {
  let score = 0
  const lowerSearchTerm = searchTerm.toLowerCase()

  // 标题完全匹配：40分
  if (fields.title.toLowerCase() === lowerSearchTerm) {
    score += 40
  }
  // 标题包含：25分
  else if (fields.title.toLowerCase().includes(lowerSearchTerm)) {
    score += 25
  }

  // 副标题包含：15分
  if (fields.subtitle && fields.subtitle.toLowerCase().includes(lowerSearchTerm)) {
    score += 15
  }

  // 描述包含：10分
  if (fields.description.toLowerCase().includes(lowerSearchTerm)) {
    score += 10
  }

  // 关键词匹配：20分
  if (fields.keywords) {
    const keywordMatch = fields.keywords.some(
      keyword => keyword.toLowerCase().includes(lowerSearchTerm)
    )
    if (keywordMatch) {
      score += 20
    }
  }

  // 标签匹配：15分
  if (fields.tags) {
    const tagMatch = fields.tags.some(
      tag => tag.toLowerCase().includes(lowerSearchTerm)
    )
    if (tagMatch) {
      score += 15
    }
  }

  return Math.min(score, 100)
}
