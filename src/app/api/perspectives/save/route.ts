import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// POST /api/perspectives/save - 保存完整的视角分析结果
export async function POST(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const body = await req.json();
    const { topic, perspectives } = body;

    console.log('[Perspectives Save] 接收到的数据:', {
      topic: topic?.substring(0, 100),
      perspectivesCount: perspectives?.length
    });

    if (!topic || !perspectives || !Array.isArray(perspectives) || perspectives.length === 0) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 创建会话并保存所有视角
    const perspectiveSession = await prisma.perspectiveSession.create({
      data: {
        userId: auth.userId,
        topic: topic,
        perspectives: {
          create: perspectives.map((p: any) => ({
            roleName: p.roleName,
            roleConfig: {
              roleId: p.roleId,
              roleIcon: p.roleIcon
            },
            viewpoint: p.analysis,
            createdAt: new Date(p.timestamp)
          }))
        }
      },
      include: {
        perspectives: true
      }
    });

    console.log('[Perspectives Save] 保存成功，ID:', perspectiveSession.id);

    return NextResponse.json({
      success: true,
      id: perspectiveSession.id
    });
  } catch (error) {
    console.error('保存视角分析失败:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
