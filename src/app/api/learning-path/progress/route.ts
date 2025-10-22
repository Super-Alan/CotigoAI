import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { PathStep } from '@/types/learning-path';

const updateProgressSchema = z.object({
  stepId: z.string(),
  action: z.enum(['start', 'complete', 'update']),
  progressPercent: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0).optional()
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stepId, action, progressPercent, timeSpent } = updateProgressSchema.parse(body);

    // 获取当前路径
    const pathState = await prisma.learningPathState.findFirst({
      where: { userId: session.user.id, status: 'active' }
    });

    if (!pathState) {
      return NextResponse.json(
        { success: false, error: 'No active learning path' },
        { status: 404 }
      );
    }

    // 解析步骤
    const steps: PathStep[] = JSON.parse(pathState.pathSteps as string);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Step not found' },
        { status: 404 }
      );
    }

    const step = steps[stepIndex];

    // 检查是否已解锁
    if (step.status === 'locked') {
      return NextResponse.json(
        { success: false, error: 'Step is locked' },
        { status: 403 }
      );
    }

    // 更新步骤状态
    switch (action) {
      case 'start':
        step.status = 'in_progress';
        step.startedAt = new Date();
        break;

      case 'update':
        if (progressPercent !== undefined) {
          step.progressPercent = progressPercent;
        }
        if (timeSpent !== undefined) {
          step.timeSpent = (step.timeSpent || 0) + timeSpent;
        }
        break;

      case 'complete':
        step.status = 'completed';
        step.completed = true;
        step.progressPercent = 100;
        step.completedAt = new Date();
        if (timeSpent !== undefined) {
          step.timeSpent = (step.timeSpent || 0) + timeSpent;
        }
        break;
    }

    // 解锁后续步骤
    const unlockedSteps: PathStep[] = [];
    if (action === 'complete') {
      for (const unlockId of step.unlocks) {
        const unlockIndex = steps.findIndex(s => s.id === unlockId);
        if (unlockIndex !== -1) {
          const unlockStep = steps[unlockIndex];
          // 检查前置条件是否全部满足
          const allPrereqsMet = unlockStep.prerequisites.every(prereqId =>
            steps.find(s => s.id === prereqId)?.completed
          );
          if (allPrereqsMet && unlockStep.status === 'locked') {
            unlockStep.status = 'available';
            unlockedSteps.push(unlockStep);
          }
        }
      }
    }

    // 更新路径统计
    const completedCount = steps.filter(s => s.completed).length;
    const totalTimeSpent = steps.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
    const estimatedTimeLeft = steps
      .filter(s => !s.completed)
      .reduce((sum, s) => sum + s.estimatedTime, 0);

    // 保存到数据库
    await prisma.learningPathState.update({
      where: { id: pathState.id },
      data: {
        pathSteps: JSON.stringify(steps),
        completedSteps: completedCount,
        currentStepIndex: stepIndex,
        totalTimeSpent,
        estimatedTimeLeft,
        lastAccessedAt: new Date(),
        completedAt: completedCount === steps.length ? new Date() : null,
        status: completedCount === steps.length ? 'completed' : 'active'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        step,
        unlockedSteps,
        pathProgress: {
          completedSteps: completedCount,
          totalSteps: steps.length,
          progressPercent: Math.round((completedCount / steps.length) * 100),
          estimatedTimeLeft
        }
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
