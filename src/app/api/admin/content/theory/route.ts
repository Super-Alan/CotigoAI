import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/content/theory - 查询理论内容
export async function GET(req: NextRequest) {
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

    // 解析查询参数
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const thinkingTypeId = searchParams.get('thinkingTypeId') || undefined
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const validationStatus = searchParams.get('validationStatus') || undefined
    const isPublished = searchParams.get('isPublished') ? searchParams.get('isPublished') === 'true' : undefined
    const search = searchParams.get('search') || undefined

    // 构建查询条件
    const where: any = {}
    if (thinkingTypeId) where.thinkingTypeId = thinkingTypeId
    if (level) where.level = level
    if (difficulty) where.difficulty = difficulty
    if (validationStatus) where.validationStatus = validationStatus
    if (isPublished !== undefined) where.isPublished = isPublished
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 查询总数
    const total = await prisma.theoryContent.count({ where })

    // 查询理论内容列表
    const contents = await prisma.theoryContent.findMany({
      where,
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
      },
      orderBy: [
        { thinkingTypeId: 'asc' },
        { level: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: {
        contents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('查询理论内容失败:', error)
    return NextResponse.json(
      { error: '查询理论内容失败' },
      { status: 500 }
    )
  }
}

// POST /api/admin/content/theory - 创建理论内容
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      thinkingTypeId,
      level,
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
      qualityScore
    } = body

    // 验证必填字段
    if (!thinkingTypeId || !level || !title || !description || !learningObjectives) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证思维类型是否存在
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: thinkingTypeId }
    })

    if (!thinkingType) {
      return NextResponse.json(
        { error: '思维类型不存在' },
        { status: 404 }
      )
    }

    // 创建理论内容
    const theoryContent = await prisma.theoryContent.create({
      data: {
        thinkingTypeId,
        level,
        title,
        subtitle,
        description,
        learningObjectives,
        conceptsIntro,
        conceptsContent: conceptsContent || {},
        modelsIntro,
        modelsContent: modelsContent || {},
        demonstrationsIntro,
        demonstrationsContent: demonstrationsContent || {},
        estimatedTime: estimatedTime || 30,
        difficulty: difficulty || 'intermediate',
        tags: tags || [],
        keywords: keywords || [],
        prerequisites: prerequisites || [],
        relatedTopics: relatedTopics || [],
        version: version || '1.0.0',
        isPublished: isPublished || false,
        validationStatus: 'draft',
        qualityScore: qualityScore || null,
        publishedAt: isPublished ? new Date() : null
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

    // 记录管理员操作日志
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'CREATE_THEORY_CONTENT',
        resource: 'theory_content',
        resourceId: theoryContent.id,
        details: {
          thinkingTypeId,
          level,
          title
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: theoryContent
    })
  } catch (error) {
    console.error('创建理论内容失败:', error)
    return NextResponse.json(
      { error: '创建理论内容失败' },
      { status: 500 }
    )
  }
}
