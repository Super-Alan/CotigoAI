import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET /api/conversations - 获取用户的所有对话列表
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

    const conversations = await prisma.conversation.findMany({
      where: { userId: auth.userId },
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1, // 只取第一条消息作为预览
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '获取对话列表失败' },
      },
      { status: 500 }
    );
  }
}

// POST /api/conversations - 创建新对话
export async function POST(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const body = await req.json();
    const { title, topic } = body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: auth.userId,
        title: title || topic?.substring(0, 50) || '新对话',
        topic: topic || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: conversation.id,
      data: conversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '创建对话失败' },
      },
      { status: 500 }
    );
  }
}
