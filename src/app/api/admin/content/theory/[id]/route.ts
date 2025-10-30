import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/content/theory/[id] - 获取单个理论内容详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户ID (兼容不同的session结构)
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

    const theoryContent = await prisma.theoryContent.findUnique({
      where: { id: params.id },
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            icon: true,
            description: true
          }
        },
        _count: {
          select: {
            userProgress: true,
            contentFeedback: true
          }
        }
      }
    })

    if (!theoryContent) {
      return NextResponse.json({ error: '理论内容不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: theoryContent
    })
  } catch (error) {
    console.error('获取理论内容详情失败:', error)
    return NextResponse.json(
      { error: '获取理论内容详情失败' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/content/theory/[id] - 更新理论内容
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户ID (兼容不同的session结构)
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

    // 验证理论内容是否存在
    const existingContent = await prisma.theoryContent.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json({ error: '理论内容不存在' }, { status: 404 })
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
      prerequisites,
      relatedTopics,
      version,
      isPublished,
      validationStatus,
      qualityScore,
      qualityMetrics,
      validationErrors,
      reviewNotes
    } = body

    // 构建更新数据
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (learningObjectives !== undefined) updateData.learningObjectives = learningObjectives
    if (conceptsIntro !== undefined) updateData.conceptsIntro = conceptsIntro
    if (conceptsContent !== undefined) updateData.conceptsContent = conceptsContent
    if (modelsIntro !== undefined) updateData.modelsIntro = modelsIntro
    if (modelsContent !== undefined) updateData.modelsContent = modelsContent
    if (demonstrationsIntro !== undefined) updateData.demonstrationsIntro = demonstrationsIntro
    if (demonstrationsContent !== undefined) updateData.demonstrationsContent = demonstrationsContent
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (tags !== undefined) updateData.tags = tags
    if (keywords !== undefined) updateData.keywords = keywords
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites
    if (relatedTopics !== undefined) updateData.relatedTopics = relatedTopics
    if (version !== undefined) updateData.version = version
    if (validationStatus !== undefined) updateData.validationStatus = validationStatus
    if (qualityScore !== undefined) updateData.qualityScore = qualityScore
    if (qualityMetrics !== undefined) updateData.qualityMetrics = qualityMetrics
    if (validationErrors !== undefined) updateData.validationErrors = validationErrors
    if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes

    // 发布状态变更
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      if (isPublished && !existingContent.publishedAt) {
        updateData.publishedAt = new Date()
      } else if (!isPublished) {
        updateData.publishedAt = null
      }
    }

    // 更新理论内容
    const updatedContent = await prisma.theoryContent.update({
      where: { id: params.id },
      data: updateData,
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

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'UPDATE_THEORY_CONTENT',
        resource: 'theory_content',
        resourceId: params.id,
        details: {
          updatedFields: Object.keys(updateData),
          title: updatedContent.title
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedContent
    })
  } catch (error) {
    console.error('更新理论内容失败:', error)
    return NextResponse.json(
      { error: '更新理论内容失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content/theory/[id] - 删除理论内容
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户ID (兼容不同的session结构)
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

    // 验证理论内容是否存在
    const existingContent = await prisma.theoryContent.findUnique({
      where: { id: params.id }
    })

    if (!existingContent) {
      return NextResponse.json({ error: '理论内容不存在' }, { status: 404 })
    }

    // 删除理论内容
    await prisma.theoryContent.delete({
      where: { id: params.id }
    })

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'DELETE_THEORY_CONTENT',
        resource: 'theory_content',
        resourceId: params.id,
        details: {
          title: existingContent.title,
          thinkingTypeId: existingContent.thinkingTypeId,
          level: existingContent.level
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除理论内容失败:', error)
    return NextResponse.json(
      { error: '删除理论内容失败' },
      { status: 500 }
    )
  }
}
