import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConceptsNeedingReview } from '@/lib/knowledge/mastery-calculator'
import { getConceptInfo, CONCEPT_MAPPING } from '@/lib/knowledge/concept-mapping'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * GET /api/knowledge-mastery/review-needed
 * 获取需要复习的知识点列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const userId = session.user.id

    // 从query params获取参数
    const { searchParams } = new URL(request.url)
    const daysSince = parseInt(searchParams.get('daysSince') || '7', 10)

    // 获取需要复习的概念
    const conceptsToReview = await getConceptsNeedingReview(userId, daysSince)

    // 格式化输出
    const formattedConcepts = conceptsToReview.map(c => {
      const conceptInfo = getConceptInfo(c.thinkingTypeId, c.conceptKey)
      const thinkingTypeInfo = Object.values(CONCEPT_MAPPING).find(
        t => t.thinkingTypeId === c.thinkingTypeId
      )

      return {
        thinkingTypeId: c.thinkingTypeId,
        thinkingTypeName: thinkingTypeInfo?.thinkingTypeName || c.thinkingTypeId,
        conceptKey: c.conceptKey,
        conceptName: conceptInfo?.name || c.conceptKey,
        masteryLevel: Math.round(c.masteryLevel * 100),
        daysSinceLastPractice: c.daysSince,
        urgency: c.daysSince > 14 ? 'high' : c.daysSince > 7 ? 'medium' : 'low'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        count: formattedConcepts.length,
        concepts: formattedConcepts
      }
    })
  } catch (error: any) {
    console.error('Failed to get concepts needing review:', error)
    return NextResponse.json(
      {
        error: '获取复习建议失败',
        details: error.message
      },
      { status: 500 }
    )
  }
}
