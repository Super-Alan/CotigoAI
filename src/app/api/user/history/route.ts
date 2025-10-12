import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const userId = auth.userId;

    // 并行获取最近的对话、解构、视角记录（每种取5条）
    const [conversations, argumentAnalyses, perspectives] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
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
        take: 5,
        select: {
          id: true,
          inputText: true,
          createdAt: true,
        },
      }),
      prisma.perspectiveSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
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
        title: a.inputText.length > 50 ? a.inputText.substring(0, 50) + '...' : a.inputText,
        type: 'argument' as const,
        createdAt: a.createdAt.toISOString(),
      })),
      ...perspectives.map((p) => ({
        id: p.id,
        title: p.topic.length > 50 ? p.topic.substring(0, 50) + '...' : p.topic,
        type: 'perspective' as const,
        createdAt: p.createdAt.toISOString(),
      })),
    ];

    // 按时间倒序排序，取最近15条
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentHistory = history.slice(0, 15);

    return NextResponse.json(recentHistory);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 });
  }
}
