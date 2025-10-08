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

    const argument = await prisma.argumentAnalysis.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
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
