import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/conversations - 获取用户的所有对话列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { title, topic } = body;

    // 如果用户未登录,创建匿名对话(仅用于演示)
    const conversation = await prisma.conversation.create({
      data: {
        userId: session?.user?.id || null,
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
