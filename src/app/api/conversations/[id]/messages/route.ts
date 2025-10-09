import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { SOCRATIC_SYSTEM_PROMPT } from '@/lib/prompts';
import { ChatMessage } from '@/types';

// GET /api/conversations/[id]/messages - 获取对话历史
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const body = await req.json();
    const { message, content, metadata, role } = body;
    const messageContent = message || content;

    if (!messageContent || typeof messageContent !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '消息内容不能为空' },
        },
        { status: 400 }
      );
    }

    // 验证role参数，默认为'user'
    const messageRole = role && (role === 'user' || role === 'assistant') ? role : 'user';

    // 获取对话并验证所有权
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
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

    // 保存消息（支持用户消息和助手消息）
    await prisma.message.create({
      data: {
        conversationId: params.id,
        role: messageRole,
        content: messageContent,
        metadata,
      },
    });

    // 如果是助手消息（如总结消息），直接返回成功，不需要生成AI响应
    if (messageRole === 'assistant') {
      // 更新对话的updatedAt时间戳
      await prisma.conversation.update({
        where: { id: params.id },
        data: { updatedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        data: {
          role: messageRole,
          content: messageContent,
        },
      });
    }

    // 构建AI对话上下文（仅对用户消息）
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
        content: messageContent,
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
