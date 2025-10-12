import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const progress = await prisma.criticalThinkingProgress.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        thinkingType: true
      }
    });

    // Calculate overall stats
    const totalQuestionsCompleted = progress.reduce((sum, p) => sum + p.questionsCompleted, 0);
    const averageScore = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.averageScore, 0) / progress.length
      : 0;

    // Calculate ability scores for radar chart
    const abilityScores = progress.map(p => ({
      thinkingTypeId: p.thinkingTypeId,
      name: p.thinkingType.name,
      score: p.averageScore,
      progress: p.progressPercentage
    }));

    return NextResponse.json({
      success: true,
      data: {
        progress,
        stats: {
          totalQuestionsCompleted,
          averageScore: Math.round(averageScore * 100) / 100
        },
        abilityScores
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取学习进度失败'
        }
      },
      { status: 500 }
    );
  }
}

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
    const { thinkingTypeId, score } = body;

    // Update or create progress record
    const existingProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId: session.user.id,
          thinkingTypeId
        }
      }
    });

    let progress;
    if (existingProgress) {
      // Update existing progress
      const newQuestionsCompleted = existingProgress.questionsCompleted + 1;
      const newTotalScore = existingProgress.averageScore * existingProgress.questionsCompleted + score;
      const newAverageScore = newTotalScore / newQuestionsCompleted;
      const newProgressPercentage = Math.min(100, Math.floor((newQuestionsCompleted / 50) * 100));

      progress = await prisma.criticalThinkingProgress.update({
        where: {
          userId_thinkingTypeId: {
            userId: session.user.id,
            thinkingTypeId
          }
        },
        data: {
          questionsCompleted: newQuestionsCompleted,
          averageScore: newAverageScore,
          progressPercentage: newProgressPercentage,
          lastUpdated: new Date()
        }
      });
    } else {
      // Create new progress record
      progress = await prisma.criticalThinkingProgress.create({
        data: {
          userId: session.user.id,
          thinkingTypeId,
          questionsCompleted: 1,
          averageScore: score,
          progressPercentage: 2,
          lastUpdated: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '更新学习进度失败'
        }
      },
      { status: 500 }
    );
  }
}