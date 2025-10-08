import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET /api/arguments - 获取用户的历史解构记录
export async function GET(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: auth.error.message } },
        { status: auth.error.status }
      );
    }

    const analyses = await prisma.argumentAnalysis.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inputText: true,
        analysis: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error('Get arguments error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '获取记录失败' },
      },
      { status: 500 }
    );
  }
}

// POST /api/arguments - 保存解构分析结果
export async function POST(req: NextRequest) {
  try {
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const body = await req.json();
    const { inputText, analysis } = body;

    console.log('[Arguments POST] 接收到的数据:', {
      inputText: inputText?.substring(0, 100),
      analysisKeys: analysis ? Object.keys(analysis) : 'undefined'
    });

    if (!inputText || !analysis) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 保存到数据库
    const savedAnalysis = await prisma.argumentAnalysis.create({
      data: {
        userId: auth.userId,
        inputText: inputText,
        analysis: analysis,
      },
    });

    console.log('[Arguments POST] 保存成功，ID:', savedAnalysis.id);

    return NextResponse.json({
      success: true,
      id: savedAnalysis.id,
    });
  } catch (error) {
    console.error('保存解构分析失败:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
