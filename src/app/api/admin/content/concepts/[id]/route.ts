import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/content/concepts/[id]
 * 获取单个概念详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session.user as any).id || (session.user as any).userId
    if (!userId) {
      return NextResponse.json({ error: '用户ID未找到' }, { status: 401 })
    }

    // 验证管理员权限
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    const concept = await prisma.conceptContent.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({
      success: true,
      data: concept
    })
  } catch (error) {
    console.error('获取概念详情失败:', error)
    return NextResponse.json(
      { error: '获取概念详情失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/content/concepts/[id]
 * 更新概念内容
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session.user as any).id || (session.user as any).userId
    if (!userId) {
      return NextResponse.json({ error: '用户ID未找到' }, { status: 401 })
    }

    // 验证管理员权限
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    // 检查概念是否存在
    const existing = await prisma.conceptContent.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: '概念不存在' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const {
      title,
      subtitle,
      description,
      learningObjectives,
      conceptsIntro,
      conceptsContent,
      modelsIntro,
      modelsContent,
      demonstrationsIntro,
      demonstrationsContent,
      estimatedTime,
      difficulty,
      tags,
      keywords,
      isPublished
    } = body

    // 更新概念
    const concept = await prisma.conceptContent.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(learningObjectives !== undefined && { learningObjectives }),
        ...(conceptsIntro !== undefined && { conceptsIntro }),
        ...(conceptsContent !== undefined && { conceptsContent }),
        ...(modelsIntro !== undefined && { modelsIntro }),
        ...(modelsContent !== undefined && { modelsContent }),
        ...(demonstrationsIntro !== undefined && { demonstrationsIntro }),
        ...(demonstrationsContent !== undefined && { demonstrationsContent }),
        ...(estimatedTime !== undefined && { estimatedTime }),
        ...(difficulty !== undefined && { difficulty }),
        ...(tags !== undefined && { tags }),
        ...(keywords !== undefined && { keywords }),
        ...(isPublished !== undefined && {
          isPublished,
          ...(isPublished && !existing.publishedAt && { publishedAt: new Date() })
        }),
        updatedAt: new Date()
      },
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: concept
    })
  } catch (error: any) {
    console.error('更新概念失败:', error)
    return NextResponse.json(
      { error: error.message || '更新概念失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/concepts/[id]
 * 删除概念
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = (session.user as any).id || (session.user as any).userId
    if (!userId) {
      return NextResponse.json({ error: '用户ID未找到' }, { status: 401 })
    }

    // 验证管理员权限
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId }
    })

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
    }

    // 检查是否有关联的学习记录
    const learningCount = await prisma.dailyTheoryLearning.count({
      where: { conceptContentId: params.id }
    })

    if (learningCount > 0) {
      return NextResponse.json(
        { error: `该概念已被 ${learningCount} 位用户学习，无法删除。建议将其设为未发布状态。` },
        { status: 400 }
      )
    }

    // 删除概念
    await prisma.conceptContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '概念已删除'
    })
  } catch (error: any) {
    console.error('删除概念失败:', error)
    return NextResponse.json(
      { error: error.message || '删除概念失败' },
      { status: 500 }
    )
  }
}
