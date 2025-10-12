import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userId = session.user.id;

    // 并行获取所有对话、解构、视角记录
    const [conversations, argumentAnalyses, perspectives] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          topic: true,
          createdAt: true,
        },
      }),
      prisma.argumentAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          inputText: true,
          createdAt: true,
        },
      }),
      prisma.perspectiveSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          topic: true,
          createdAt: true,
        },
      }),
    ]);

    // 组合并格式化历史记录
    const history = [
      ...conversations.map((c) => ({
        id: c.id,
        title: c.title || c.topic || '新对话',
        type: 'conversation' as const,
        createdAt: c.createdAt.toISOString(),
      })),
      ...argumentAnalyses.map((a) => ({
        id: a.id,
        title: a.inputText.length > 80 ? a.inputText.substring(0, 80) + '...' : a.inputText,
        type: 'argument' as const,
        createdAt: a.createdAt.toISOString(),
      })),
      ...perspectives.map((p) => ({
        id: p.id,
        title: p.topic.length > 80 ? p.topic.substring(0, 80) + '...' : p.topic,
        type: 'perspective' as const,
        createdAt: p.createdAt.toISOString(),
      })),
    ];

    // 按时间倒序排序
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(history);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 });
  }
}
