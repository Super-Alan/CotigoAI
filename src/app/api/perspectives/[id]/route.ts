import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const perspectiveSession = await prisma.perspectiveSession.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
      include: {
        perspectives: {
          select: {
            id: true,
            roleName: true,
            roleConfig: true,
            viewpoint: true,
            createdAt: true,
          },
        },
      },
    });

    if (!perspectiveSession) {
      return NextResponse.json({ error: '未找到该视角会话' }, { status: 404 });
    }

    console.log('[Perspectives GET] 读取会话:', {
      id: perspectiveSession.id,
      perspectivesCount: perspectiveSession.perspectives.length
    });

    return NextResponse.json({
      id: perspectiveSession.id,
      topic: perspectiveSession.topic,
      perspectives: perspectiveSession.perspectives,
      createdAt: perspectiveSession.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('获取视角会话失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
