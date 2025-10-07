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

    const argument = await prisma.argumentAnalysis.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        inputText: true,
        analysis: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!argument) {
      return NextResponse.json({ error: '未找到该解构记录' }, { status: 404 });
    }

    // Verify ownership
    if (argument.userId !== session.user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    console.log('[Arguments GET] 读取数据:', {
      id: argument.id,
      analysisKeys: argument.analysis ? Object.keys(argument.analysis) : 'undefined',
      analysisType: typeof argument.analysis
    });

    return NextResponse.json({
      id: argument.id,
      inputText: argument.inputText,
      analysis: argument.analysis,
      createdAt: argument.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('获取解构记录失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
