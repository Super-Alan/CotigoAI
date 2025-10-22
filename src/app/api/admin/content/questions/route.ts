import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 查询题库
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    // difficulty parameter removed
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: any = {};
    if (thinkingTypeId) where.thinkingTypeId = thinkingTypeId;
    // difficulty filter removed
    if (level) where.level = parseInt(level);
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: 'insensitive' } },
        { question: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 查询总数
    const total = await prisma.criticalThinkingQuestion.count({ where });

    // 查询题目列表
    const questions = await prisma.criticalThinkingQuestion.findMany({
      where,
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        guidingQuestions: {
          orderBy: {
            orderIndex: 'asc'
          }
        },
        _count: {
          select: {
            practiceSessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('查询题库失败:', error);
    return NextResponse.json(
      { error: '查询失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// POST - 创建题目
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查管理员权限
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const {
      thinkingTypeId,
      level, // difficulty removed
      topic,
      context,
      question,
      tags = [],
      thinkingFramework,
      expectedOutcomes = [],
      caseAnalysis,
      guidingQuestions = [],
      learningObjectives = [],
      scaffolding = null,
      assessmentCriteria = null,
      isPublic = true
    } = body;

    // 验证必填字段
    if (!thinkingTypeId || !level || !topic || !context) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 验证 Level 范围
    if (level < 1 || level > 5) {
      return NextResponse.json({ error: 'Level 必须在 1-5 之间' }, { status: 400 });
    }

    // 创建问题
    const savedQuestion = await prisma.criticalThinkingQuestion.create({
      data: {
        thinkingTypeId,
        topic,
        context,
        question: question || topic,
        // difficulty field removed
        tags,
        thinkingFramework,
        expectedOutcomes,
        caseAnalysis,
        level,
        learningObjectives,
        scaffolding,
        assessmentCriteria,
      }
    });

    // 保存引导问题
    if (guidingQuestions && guidingQuestions.length > 0) {
      for (let i = 0; i < guidingQuestions.length; i++) {
        const guidingQ = guidingQuestions[i];
        await prisma.criticalThinkingGuidingQuestion.create({
          data: {
            questionId: savedQuestion.id,
            level: guidingQ.level || 'beginner', // Use level from guiding question or default
            stage: guidingQ.stage || 'general',
            question: guidingQ.question,
            orderIndex: i + 1
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedQuestion.id,
        topic: savedQuestion.topic,
        // difficulty field removed
        level: savedQuestion.level
      }
    });

  } catch (error) {
    console.error('保存问题失败:', error);
    return NextResponse.json(
      { error: '保存失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
