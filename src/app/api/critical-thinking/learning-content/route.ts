import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/critical-thinking/learning-content
 *
 * 获取指定思维维度和Level的学习内容
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    const level = searchParams.get('level');
    const contentType = searchParams.get('contentType');

    if (!thinkingTypeId || !level) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      );
    }

    const levelNum = parseInt(level);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
      return NextResponse.json(
        { success: false, error: 'Level必须在1-5之间' },
        { status: 400 }
      );
    }

    const where: any = {
      thinkingTypeId,
      level: levelNum,
    };

    if (contentType) {
      where.contentType = contentType;
    }

    const contents = await prisma.levelLearningContent.findMany({
      where,
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: { contents },
    });
  } catch (error) {
    console.error('获取学习内容失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
