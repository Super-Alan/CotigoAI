import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/daily-theory/concept/[id]
 * 获取单个概念内容详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const conceptId = params.id

    // 获取概念内容
    const concept = await prisma.conceptContent.findUnique({
      where: { id: conceptId },
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            icon: true,
            description: true
          }
        }
      }
    })

    if (!concept) {
      return NextResponse.json(
        { error: '概念不存在' },
        { status: 404 }
      )
    }

    if (!concept.isPublished) {
      return NextResponse.json(
        { error: '概念未发布' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: concept
    })
  } catch (error) {
    console.error('获取概念内容失败:', error)
    return NextResponse.json(
      { error: '获取概念内容失败' },
      { status: 500 }
    )
  }
}
