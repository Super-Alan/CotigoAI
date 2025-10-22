import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { PathStep } from '@/types/learning-path';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    // 获取活跃路径
    const pathState = await prisma.learningPathState.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (!pathState) {
      return NextResponse.json({
        success: true,
        data: {
          path: null,
          currentStep: null,
          nextSteps: [],
          recentlyCompleted: []
        }
      });
    }

    // 解析步骤
    const steps: PathStep[] = JSON.parse(pathState.pathSteps as string);

    // 找到当前步骤
    const currentStep = steps[pathState.currentStepIndex] || null;

    // 找到接下来可解锁的步骤（最多5个）
    const nextSteps = steps
      .filter(step => step.status === 'available' && !step.completed)
      .slice(0, 5);

    // 最近完成的步骤（最多3个）
    const recentlyCompleted = includeCompleted
      ? steps
          .filter(step => step.completed)
          .sort((a, b) => {
            const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 3)
      : [];

    // 构建完整路径对象
    const path = {
      id: pathState.id,
      userId: pathState.userId,
      pathType: pathState.pathType,
      status: pathState.status,
      steps,
      currentStepIndex: pathState.currentStepIndex,
      totalSteps: pathState.totalSteps,
      completedSteps: pathState.completedSteps,
      progressPercent: Math.round((pathState.completedSteps / pathState.totalSteps) * 100),
      totalTimeSpent: pathState.totalTimeSpent,
      estimatedTimeLeft: pathState.estimatedTimeLeft || 0,
      metadata: {
        targetDimensions: pathState.targetDimensions,
        learningStyle: pathState.learningStyle as any,
        difficultyLevel: pathState.difficultyLevel as any,
        generatedAt: pathState.createdAt,
        adaptiveEnabled: true
      },
      createdAt: pathState.createdAt,
      updatedAt: pathState.updatedAt,
      startedAt: pathState.startedAt,
      completedAt: pathState.completedAt || undefined
    };

    return NextResponse.json({
      success: true,
      data: {
        path,
        currentStep,
        nextSteps,
        recentlyCompleted
      }
    });

  } catch (error) {
    console.error('Get current path error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get current path' },
      { status: 500 }
    );
  }
}
