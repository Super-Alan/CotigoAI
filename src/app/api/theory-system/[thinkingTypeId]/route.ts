import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/theory-system/[thinkingTypeId]
 * 获取指定思维维度的理论体系概览
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { thinkingTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { thinkingTypeId } = params;

    // 获取思维维度信息
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: thinkingTypeId },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
    });

    if (!thinkingType) {
      return NextResponse.json(
        { error: 'Thinking type not found' },
        { status: 404 }
      );
    }

    // 获取所有已发布的理论内容（Level 1-5）
    const theoryContents = await prisma.theoryContent.findMany({
      where: {
        thinkingTypeId,
        isPublished: true,
      },
      select: {
        id: true,
        level: true,
        title: true,
        subtitle: true,
        description: true,
        learningObjectives: true,
        estimatedTime: true,
        tags: true,
        version: true,
        viewCount: true,
        completionRate: true,
        userRating: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    // 获取用户进度
    const userProgress = await prisma.theoryProgress.findMany({
      where: {
        userId: session.user.id,
        theoryContent: {
          thinkingTypeId,
        },
      },
      select: {
        theoryContentId: true,
        status: true,
        progressPercent: true,
        sectionsCompleted: true,
        timeSpent: true,
        lastViewedAt: true,
        completedAt: true,
      },
    });

    // 构建进度映射
    const progressMap = new Map(
      userProgress.map((p) => [p.theoryContentId, p])
    );

    // 合并内容和进度
    const levelsWithProgress = theoryContents.map((content) => {
      const progress = progressMap.get(content.id);
      return {
        ...content,
        userProgress: progress || {
          status: 'not_started',
          progressPercent: 0,
          sectionsCompleted: { concepts: false, models: false, demonstrations: false },
          timeSpent: 0,
          lastViewedAt: null,
          completedAt: null,
        },
      };
    });

    // 计算整体维度进度
    const overallProgress = {
      totalLevels: levelsWithProgress.length,
      completedLevels: levelsWithProgress.filter(
        (l) => l.userProgress.status === 'completed'
      ).length,
      inProgressLevels: levelsWithProgress.filter(
        (l) => l.userProgress.status === 'in_progress'
      ).length,
      averageProgress:
        levelsWithProgress.reduce(
          (sum, l) => sum + l.userProgress.progressPercent,
          0
        ) / (levelsWithProgress.length || 1),
      totalTimeSpent: levelsWithProgress.reduce(
        (sum, l) => sum + l.userProgress.timeSpent,
        0
      ),
    };

    return NextResponse.json({
      thinkingType,
      levels: levelsWithProgress,
      overallProgress,
    });
  } catch (error) {
    console.error('Error fetching theory system overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
