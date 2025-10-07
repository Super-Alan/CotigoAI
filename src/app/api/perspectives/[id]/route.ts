import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const perspectiveSession = await prisma.perspectiveSession.findUnique({
      where: {
        id: params.id,
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

    // Verify ownership
    if (perspectiveSession.userId !== session.user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
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
