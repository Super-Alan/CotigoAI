import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, answers, timeSpent, score, aiFeedback, evaluationDetails } = body;

    // Create practice session record
    const practiceSession = await prisma.criticalThinkingPracticeSession.create({
      data: {
        userId: session.user.id,
        questionId,
        answers: answers || {},
        timeSpent: timeSpent || 0,
        score: score || null,
        aiFeedback: aiFeedback || null,
        evaluationDetails: evaluationDetails || null,
        completedAt: new Date()
      },
      include: {
        question: {
          include: {
            guidingQuestions: true,
            thinkingType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: practiceSession
    });
  } catch (error) {
    console.error('Error creating practice session:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: '创建练习记录失败'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = {
      userId: session.user.id
    };

    if (thinkingTypeId) {
      whereClause.question = {
        thinkingTypeId: thinkingTypeId
      };
    }

    const sessions = await prisma.criticalThinkingPracticeSession.findMany({
      where: whereClause,
      include: {
        question: {
          include: {
            guidingQuestions: true,
            thinkingType: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    console.error('Error fetching practice sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取练习记录失败'
        }
      },
      { status: 500 }
    );
  }
}