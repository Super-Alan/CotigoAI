import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserMasterySummary } from '@/lib/knowledge/mastery-calculator'
import { CONCEPT_MAPPING, getConceptInfo } from '@/lib/knowledge/concept-mapping'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * GET /api/knowledge-mastery/summary
 * 获取用户知识点掌握度概览
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const userId = session.user.id

    // 获取用户掌握度数据
    const summary = await getUserMasterySummary(userId)

    // 格式化输出
    const formattedSummary = summary.map(item => {
      const thinkingTypeInfo = Object.values(CONCEPT_MAPPING).find(
        t => t.thinkingTypeId === item.thinkingTypeId
      )

      return {
        thinkingTypeId: item.thinkingTypeId,
        thinkingTypeName: thinkingTypeInfo?.thinkingTypeName || item.thinkingTypeId,
        overallMastery: Math.round(item.avgMastery * 100),
        concepts: item.concepts.map(c => {
          const conceptInfo = getConceptInfo(item.thinkingTypeId, c.conceptKey)
          return {
            conceptKey: c.conceptKey,
            conceptName: conceptInfo?.name || c.conceptKey,
            masteryLevel: Math.round(c.masteryLevel * 100),
            practiceCount: c.practiceCount,
            lastPracticed: c.lastPracticed
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedSummary
    })
  } catch (error: any) {
    console.error('Failed to get knowledge mastery summary:', error)
    return NextResponse.json(
      {
        error: '获取知识点掌握度失败',
        details: error.message
      },
      { status: 500 }
    )
  }
}
