import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/perspectives/save - 保存完整的视角分析结果
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
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
        userId: session.user.id,
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
