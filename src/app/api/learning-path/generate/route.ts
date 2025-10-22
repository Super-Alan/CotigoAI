import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PathGenerationEngine } from '@/lib/services/path-generation-engine';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const generateRequestSchema = z.object({
  thinkingTypeId: z.string().optional(),
  targetLevel: z.number().min(1).max(5).optional(),
  timeAvailable: z.number().positive().optional(),
  learningStyle: z.enum(['theory_first', 'practice_first', 'balanced']).optional(),
  forceRegenerate: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = generateRequestSchema.parse(body);

    // 检查是否已有活跃路径
    const existingPath = await prisma.learningPathState.findFirst({
      where: { userId: session.user.id, status: 'active' }
    });

    if (existingPath && !validatedData.forceRegenerate) {
      const path = JSON.parse(existingPath.pathSteps as string);
      return NextResponse.json({
        success: true,
        data: {
          path: { ...existingPath, steps: path },
          summary: {
            totalSteps: existingPath.totalSteps,
            estimatedTotalTime: existingPath.estimatedTimeLeft,
            dimensionsCovered: existingPath.targetDimensions,
            levelRange: { min: 1, max: 5 }
          }
        },
        cached: true
      });
    }

    // 生成新路径
    const engine = new PathGenerationEngine();
    const generatedPath = await engine.generatePath({
      userId: session.user.id,
      ...validatedData
    });

    // 保存到数据库
    await prisma.learningPathState.upsert({
      where: {
        userId_pathType: {
          userId: session.user.id,
          pathType: 'adaptive'
        }
      },
      update: {
        pathSteps: JSON.stringify(generatedPath.steps),
        totalSteps: generatedPath.steps.length,
        completedSteps: 0,
        currentStepIndex: 0,
        targetDimensions: generatedPath.metadata.targetDimensions,
        learningStyle: generatedPath.metadata.learningStyle,
        estimatedTimeLeft: generatedPath.estimatedTimeLeft,
        lastAccessedAt: new Date()
      },
      create: {
        userId: session.user.id,
        pathType: 'adaptive',
        pathSteps: JSON.stringify(generatedPath.steps),
        totalSteps: generatedPath.steps.length,
        targetDimensions: generatedPath.metadata.targetDimensions,
        learningStyle: generatedPath.metadata.learningStyle,
        estimatedTimeLeft: generatedPath.estimatedTimeLeft
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        path: generatedPath,
        summary: {
          totalSteps: generatedPath.steps.length,
          estimatedTotalTime: generatedPath.estimatedTimeLeft,
          dimensionsCovered: generatedPath.metadata.targetDimensions,
          levelRange: { min: 1, max: 5 }
        }
      }
    });

  } catch (error) {
    console.error('Generate learning path error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate learning path' },
      { status: 500 }
    );
  }
}
