import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/content/concepts
 * 获取概念内容列表（带分页和筛选）
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户ID
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

    // 获取查询参数
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const thinkingTypeId = searchParams.get('thinkingTypeId') || undefined
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const isPublished = searchParams.get('isPublished') === 'true' ? true : searchParams.get('isPublished') === 'false' ? false : undefined
    const search = searchParams.get('search') || undefined

    // 构建查询条件
    const where: any = {}

    if (thinkingTypeId) {
      where.thinkingTypeId = thinkingTypeId
    }

    if (level) {
      where.level = level
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 获取总数
    const total = await prisma.conceptContent.count({ where })

    // 获取分页数据
    const concepts = await prisma.conceptContent.findMany({
      where,
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      },
      orderBy: [
        { thinkingTypeId: 'asc' },
        { level: 'asc' },
        { order: 'asc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return NextResponse.json({
      success: true,
      data: {
        concepts,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取概念列表失败:', error)
    return NextResponse.json(
      { error: '获取概念列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content/concepts
 * 创建新概念内容
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      thinkingTypeId,
      level,
      order,
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

    // 验证必需字段
    if (!thinkingTypeId || !level || !order || !title || !description) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 检查是否已存在相同位置的概念
    const existing = await prisma.conceptContent.findUnique({
      where: {
        thinkingTypeId_level_order: {
          thinkingTypeId,
          level,
          order
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: '该位置已存在概念，请修改 order 或删除现有概念' },
        { status: 400 }
      )
    }

    // 创建概念
    const concept = await prisma.conceptContent.create({
      data: {
        thinkingTypeId,
        level,
        order,
        title,
        subtitle: subtitle || null,
        description,
        learningObjectives: learningObjectives || [],
        conceptsIntro: conceptsIntro || null,
        conceptsContent: conceptsContent || { sections: [] },
        modelsIntro: modelsIntro || null,
        modelsContent: modelsContent || { sections: [] },
        demonstrationsIntro: demonstrationsIntro || null,
        demonstrationsContent: demonstrationsContent || { sections: [] },
        estimatedTime: estimatedTime || 10,
        difficulty: difficulty || 'beginner',
        tags: tags || [],
        keywords: keywords || [],
        isPublished: isPublished ?? false,
        generatedBy: 'manual',
        generationModel: null
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
    console.error('创建概念失败:', error)
    return NextResponse.json(
      { error: error.message || '创建概念失败' },
      { status: 500 }
    )
  }
}
