import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/content/learning-content
 * 管理员获取学习内容列表（支持筛选和分页）
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }

    // 检查管理员权限
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ success: false, error: '权限不足' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    const level = searchParams.get('level');
    const contentType = searchParams.get('contentType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (thinkingTypeId) where.thinkingTypeId = thinkingTypeId;
    if (level) where.level = parseInt(level);
    if (contentType) where.contentType = contentType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [contents, total] = await Promise.all([
      prisma.levelLearningContent.findMany({
        where,
        include: {
          thinkingType: {
            select: {
              id: true,
              name: true,
              icon: true,
              description: true
            }
          }
        },
        orderBy: [
          { thinkingTypeId: 'asc' },
          { level: 'asc' },
          { orderIndex: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.levelLearningContent.count({ where })
    ]);

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
    });
  } catch (error) {
    console.error('获取学习内容列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

/**
 * POST /api/admin/content/learning-content
 * 创建新的学习内容
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }

    // 检查管理员权限
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ success: false, error: '权限不足' }, { status: 403 });
    }

    const body = await req.json();
    const {
      thinkingTypeId,
      level,
      contentType,
      title,
      description,
      content,
      estimatedTime,
      orderIndex,
      tags,
      prerequisites
    } = body;

    // 验证必需字段
    if (!thinkingTypeId || !level || !contentType || !title || !description || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 验证 level 范围
    if (level < 1 || level > 5) {
      return NextResponse.json(
        { success: false, error: 'Level必须在1-5之间' },
        { status: 400 }
      );
    }

    // 验证 contentType
    const validTypes = ['concepts', 'frameworks', 'examples', 'practice_guide'];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: `contentType必须是: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // 如果未提供 orderIndex，自动计算
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const maxOrder = await prisma.levelLearningContent.aggregate({
        where: {
          thinkingTypeId,
          level,
          contentType
        },
        _max: { orderIndex: true }
      });
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1;
    }

    const newContent = await prisma.levelLearningContent.create({
      data: {
        thinkingTypeId,
        level,
        contentType,
        title,
        description,
        content,
        estimatedTime: estimatedTime || 10,
        orderIndex: finalOrderIndex,
        tags: tags || [],
        prerequisites: prerequisites || []
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
    });

    return NextResponse.json({
      success: true,
      data: { content: newContent }
    });
  } catch (error) {
    console.error('创建学习内容失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
