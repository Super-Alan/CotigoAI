import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { createFollowUpPrompt } from '@/lib/prompts';

// POST /api/perspectives/[id]/chat - 与特定角色进行追问对话
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { perspectiveId, message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '消息内容不能为空' },
        },
        { status: 400 }
      );
    }

    // 验证会话和视角
    const perspectiveSession = await prisma.perspectiveSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        perspectives: true,
        messages: {
          where: { perspectiveId },
          orderBy: { createdAt: 'asc' },
          take: 5, // 获取最近5条对话作为上下文
        },
      },
    });

    if (!perspectiveSession) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '会话不存在' } },
        { status: 404 }
      );
    }

    const perspective = perspectiveSession.perspectives.find((p) => p.id === perspectiveId);

    if (!perspective) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '视角不存在' } },
        { status: 404 }
      );
    }

    // 保存用户消息
    await prisma.perspectiveMessage.create({
      data: {
        sessionId: params.id,
        perspectiveId,
        role: 'user',
        content: message,
      },
    });

    // 构建对话上下文
    const conversationContext = `
议题: ${perspectiveSession.topic}

你的初始观点:
${perspective.viewpoint}

最近的对话:
${perspectiveSession.messages.map((msg) => `${msg.role === 'user' ? '用户' : '你'}: ${msg.content}`).join('\n')}

用户追问: ${message}
`;

    const systemPrompt = createFollowUpPrompt(perspective.roleName, conversationContext);

    // 调用AI生成回应
    const response = await aiRouter.chat(
      [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      {
        temperature: 0.8,
        maxTokens: 300,
      }
    );

    const responseText = typeof response === 'string' ? response : '';

    // 保存AI回应
    const assistantMessage = await prisma.perspectiveMessage.create({
      data: {
        sessionId: params.id,
        perspectiveId,
        role: 'assistant',
        content: responseText,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Perspective chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '对话失败' },
      },
      { status: 500 }
    );
  }
}
