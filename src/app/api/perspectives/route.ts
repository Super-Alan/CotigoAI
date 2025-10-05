import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/perspectives - 获取用户的视角会话列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const sessions = await prisma.perspectiveSession.findMany({
      where: { userId: session.user.id },
      include: {
        perspectives: {
          select: {
            id: true,
            roleName: true,
            viewpoint: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get perspective sessions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '获取记录失败' },
      },
      { status: 500 }
    );
  }
}

// POST /api/perspectives - 创建新的视角会话并生成观点
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, roles } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '议题至少需要10个字符' },
        },
        { status: 400 }
      );
    }

    if (!roles || !Array.isArray(roles) || roles.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '至少选择2个角色' },
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // 用户必须登录
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      );
    }

    const perspectiveSession = await prisma.perspectiveSession.create({
      data: {
        userId: session.user.id,
        topic,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: perspectiveSession.id,
        topic: perspectiveSession.topic,
        createdAt: perspectiveSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Create perspective session error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '创建会话失败' },
      },
      { status: 500 }
    );
  }
}
