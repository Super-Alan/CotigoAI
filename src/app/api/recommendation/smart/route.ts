import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSmartRecommendation, getMultipleRecommendations } from '@/lib/recommendation/smart-recommender'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * GET /api/recommendation/smart
 * 获取智能推荐
 *
 * Query Parameters:
 * - count: number (可选) - 返回推荐数量，默认1
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '1', 10)

    if (count === 1) {
      const recommendation = await getSmartRecommendation(userId)

      if (!recommendation) {
        return NextResponse.json(
          {
            success: false,
            error: '无法生成推荐'
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          recommendation
        }
      })
    } else {
      const recommendations = await getMultipleRecommendations(userId, count)

      return NextResponse.json({
        success: true,
        data: {
          recommendations
        }
      })
    }
  } catch (error: any) {
    console.error('Failed to get smart recommendation:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取推荐失败',
        details: error.message
      },
      { status: 500 }
    )
  }
}
