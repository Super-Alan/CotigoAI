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

// PATCH /api/conversations/[id] - 更新对话(时长、状态等)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const body = await req.json();
    const { timeSpent, status, conversationType } = body;

    // 验证对话所有权
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '对话不存在' } },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    if (typeof timeSpent === 'number') {
      updateData.timeSpent = conversation.timeSpent + timeSpent; // 累加时长
    }
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    if (conversationType) {
      updateData.conversationType = conversationType;
    }

    // 更新消息数量
    const messageCount = await prisma.message.count({
      where: { conversationId: params.id }
    });
    updateData.messageCount = messageCount;

    // 执行更新
    const updatedConversation = await prisma.conversation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedConversation,
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '更新对话失败' },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - 删除对话
export async function DELETE(
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

    // 验证对话所有权
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '对话不存在' } },
        { status: 404 }
      );
    }

    // 删除对话（Prisma会自动级联删除相关消息）
    await prisma.conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '对话已删除',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '删除对话失败' },
      },
      { status: 500 }
    );
  }
}
