import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { SOCRATIC_SYSTEM_PROMPT } from '@/lib/prompts';
import { ChatMessage } from '@/types';

// GET /api/conversations/[id]/messages - 获取对话历史
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        messages: {
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
      data: conversation,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '获取消息失败' },
      },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - 发送新消息 (流式响应)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { message, content, metadata } = body;
    const userMessage = message || content;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '消息内容不能为空' },
        },
        { status: 400 }
      );
    }

    // 获取对话(允许匿名访问用于演示)
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // 获取最近10条消息作为上下文
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '对话不存在' } },
        { status: 404 }
      );
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: params.id,
        role: 'user',
        content: userMessage,
        metadata,
      },
    });

    // 构建AI对话上下文
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: SOCRATIC_SYSTEM_PROMPT,
      },
      ...conversation.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // 调用AI服务(流式响应)
    const aiStream = await aiRouter.chat(messages, { stream: true });

    // 创建SSE流式响应
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (aiStream instanceof ReadableStream) {
            const reader = aiStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullResponse += chunk;

              // 发送数据块
              const data = `data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          } else {
            // 非流式响应(fallback)
            fullResponse = aiStream as string;
            const data = `data: ${JSON.stringify({ type: 'chunk', content: fullResponse })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // 保存AI响应到数据库
          await prisma.message.create({
            data: {
              conversationId: params.id,
              role: 'assistant',
              content: fullResponse,
            },
          });

          // 更新对话的updatedAt时间戳
          await prisma.conversation.update({
            where: { id: params.id },
            data: { updatedAt: new Date() },
          });

          // 发送完成信号
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '发送消息失败' },
      },
      { status: 500 }
    );
  }
}
