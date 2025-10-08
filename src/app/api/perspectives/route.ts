import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET /api/perspectives - 获取用户的视角会话列表
export async function GET(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const sessions = await prisma.perspectiveSession.findMany({
      where: { userId: auth.userId },
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

    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: auth.error.message }
        },
        { status: auth.error.status }
      );
    }

    const perspectiveSession = await prisma.perspectiveSession.create({
      data: {
        userId: auth.userId,
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
