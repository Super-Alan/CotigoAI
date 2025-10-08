import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET /api/conversations/[id] - 获取单个对话及其消息
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '对话不存在' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: conversation.id,
      topic: conversation.topic,
      title: conversation.title,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '获取对话失败' },
      },
      { status: 500 }
    );
  }
}
