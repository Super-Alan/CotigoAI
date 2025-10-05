import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { createPerspectivePrompt, ROLE_PRESETS } from '@/lib/prompts';

// POST /api/perspectives/[id]/generate - 生成多个视角观点
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { roleNames } = body;

    if (!roleNames || !Array.isArray(roleNames) || roleNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '请至少选择一个角色' },
        },
        { status: 400 }
      );
    }

    // 获取会话(允许演示模式)
    const perspectiveSession = await prisma.perspectiveSession.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!perspectiveSession) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '会话不存在' } },
        { status: 404 }
      );
    }

    // 为每个角色生成观点
    const perspectives = await Promise.all(
      roleNames.map(async (roleName: string) => {
        const roleConfig = ROLE_PRESETS[roleName] || {
          background: '',
          values: [],
          systemPrompt: `你扮演${roleName},从你的角色立场出发表达观点。`,
        };

        const prompt = createPerspectivePrompt(
          roleName,
          perspectiveSession.topic,
          roleConfig.background
        );

        // 调用AI生成观点
        const viewpoint = await aiRouter.chat(
          [
            {
              role: 'system',
              content: prompt,
            },
            {
              role: 'user',
              content: '请开始你的观点陈述。',
            },
          ],
          {
            temperature: 0.8, // 较高的temperature以获得更有个性的观点
            maxTokens: 500,
          }
        );

        // 保存到数据库
        const perspective = await prisma.perspective.create({
          data: {
            sessionId: params.id,
            roleName,
            roleConfig: roleConfig as any,
            viewpoint: typeof viewpoint === 'string' ? viewpoint : '',
          },
        });

        return {
          id: perspective.id,
          roleName: perspective.roleName,
          viewpoint: perspective.viewpoint,
          roleConfig: perspective.roleConfig,
          createdAt: perspective.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { perspectives },
    });
  } catch (error) {
    console.error('Generate perspectives error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '生成视角失败' },
      },
      { status: 500 }
    );
  }
}
