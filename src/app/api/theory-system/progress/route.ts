import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/theory-system/progress
 * 更新用户学习进度
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      theoryContentId,
      action, // 'update_section' | 'update_progress' | 'complete' | 'bookmark' | 'rate'
      data,
    } = body;

    if (!theoryContentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: theoryContentId, action' },
        { status: 400 }
      );
    }

    // 验证理论内容是否存在
    const theoryContent = await prisma.theoryContent.findUnique({
      where: { id: theoryContentId },
    });

    if (!theoryContent) {
      return NextResponse.json(
        { error: 'Theory content not found' },
        { status: 404 }
      );
    }

    // 获取或创建进度记录
    let progress = await prisma.theoryProgress.findUnique({
      where: {
        userId_theoryContentId: {
          userId: session.user.id,
          theoryContentId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.theoryProgress.create({
        data: {
          userId: session.user.id,
          theoryContentId,
          status: 'in_progress',
          progressPercent: 0,
          sectionsCompleted: { concepts: false, models: false, demonstrations: false },
          timeSpent: 0,
          startedAt: new Date(),
        },
      });
    }

    // 根据不同action更新进度
    let updatedProgress;

    switch (action) {
      case 'update_section': {
        // 更新章节完成状态
        const { section, completed } = data as {
          section: 'concepts' | 'models' | 'demonstrations';
          completed: boolean;
        };

        if (!['concepts', 'models', 'demonstrations'].includes(section)) {
          return NextResponse.json(
            { error: 'Invalid section name' },
            { status: 400 }
          );
        }

        const sectionsCompleted = progress.sectionsCompleted as Record<string, boolean>;
        sectionsCompleted[section] = completed;

        // 计算进度百分比
        const completedCount = Object.values(sectionsCompleted).filter(Boolean).length;
        const progressPercent = Math.round((completedCount / 3) * 100);

        // 判断是否全部完成
        const allCompleted = completedCount === 3;
        const newStatus = allCompleted ? 'completed' : 'in_progress';

        updatedProgress = await prisma.theoryProgress.update({
          where: { id: progress.id },
          data: {
            sectionsCompleted,
            progressPercent,
            status: newStatus,
            completedAt: allCompleted ? new Date() : null,
            lastViewedAt: new Date(),
          },
        });

        // 如果完成，更新理论内容的完成率
        if (allCompleted) {
          await updateContentCompletionRate(theoryContentId);
        }

        break;
      }

      case 'update_progress': {
        // 更新学习时间、滚动深度等
        const { timeSpent, scrollDepth, interactionCount } = data as {
          timeSpent?: number;
          scrollDepth?: number;
          interactionCount?: number;
        };

        updatedProgress = await prisma.theoryProgress.update({
          where: { id: progress.id },
          data: {
            ...(timeSpent !== undefined && {
              timeSpent: progress.timeSpent + timeSpent,
            }),
            ...(scrollDepth !== undefined && { scrollDepth }),
            ...(interactionCount !== undefined && {
              interactionCount: progress.interactionCount + interactionCount,
            }),
            lastViewedAt: new Date(),
          },
        });

        break;
      }

      case 'complete': {
        // 手动标记完成
        updatedProgress = await prisma.theoryProgress.update({
          where: { id: progress.id },
          data: {
            status: 'completed',
            progressPercent: 100,
            sectionsCompleted: {
              concepts: true,
              models: true,
              demonstrations: true,
            },
            completedAt: new Date(),
            lastViewedAt: new Date(),
          },
        });

        await updateContentCompletionRate(theoryContentId);

        break;
      }

      case 'bookmark': {
        // 切换收藏状态
        const { bookmarked } = data as { bookmarked: boolean };

        updatedProgress = await prisma.theoryProgress.update({
          where: { id: progress.id },
          data: {
            bookmarked,
            lastViewedAt: new Date(),
          },
        });

        break;
      }

      case 'rate': {
        // 用户自评
        const { selfRating, confidenceLevel, needsReview, notes } = data as {
          selfRating?: number;
          confidenceLevel?: 'low' | 'medium' | 'high';
          needsReview?: boolean;
          notes?: string;
        };

        if (selfRating !== undefined && (selfRating < 1 || selfRating > 5)) {
          return NextResponse.json(
            { error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }

        updatedProgress = await prisma.theoryProgress.update({
          where: { id: progress.id },
          data: {
            ...(selfRating !== undefined && { selfRating }),
            ...(confidenceLevel !== undefined && { confidenceLevel }),
            ...(needsReview !== undefined && { needsReview }),
            ...(notes !== undefined && { notes }),
            lastViewedAt: new Date(),
          },
        });

        // 如果有评分，更新内容的平均评分
        if (selfRating !== undefined) {
          await updateContentUserRating(theoryContentId);
        }

        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error updating theory progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/theory-system/progress
 * 获取用户的所有学习进度
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const thinkingTypeId = searchParams.get('thinkingTypeId');

    const where = {
      userId: session.user.id,
      ...(thinkingTypeId && {
        theoryContent: {
          thinkingTypeId,
        },
      }),
    };

    const progressRecords = await prisma.theoryProgress.findMany({
      where,
      include: {
        theoryContent: {
          select: {
            id: true,
            title: true,
            level: true,
            thinkingTypeId: true,
            estimatedTime: true,
          },
        },
      },
      orderBy: {
        lastViewedAt: 'desc',
      },
    });

    // 统计信息
    const stats = {
      totalItems: progressRecords.length,
      completed: progressRecords.filter((p) => p.status === 'completed').length,
      inProgress: progressRecords.filter((p) => p.status === 'in_progress').length,
      totalTimeSpent: progressRecords.reduce((sum, p) => sum + p.timeSpent, 0),
      averageProgress:
        progressRecords.reduce((sum, p) => sum + p.progressPercent, 0) /
        (progressRecords.length || 1),
      bookmarked: progressRecords.filter((p) => p.bookmarked).length,
      needsReview: progressRecords.filter((p) => p.needsReview).length,
    };

    return NextResponse.json({
      progress: progressRecords,
      stats,
    });
  } catch (error) {
    console.error('Error fetching theory progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 辅助函数：更新内容完成率
 */
async function updateContentCompletionRate(theoryContentId: string) {
  try {
    const totalUsers = await prisma.theoryProgress.count({
      where: { theoryContentId },
    });

    const completedUsers = await prisma.theoryProgress.count({
      where: {
        theoryContentId,
        status: 'completed',
      },
    });

    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    await prisma.theoryContent.update({
      where: { id: theoryContentId },
      data: { completionRate },
    });
  } catch (error) {
    console.error('Error updating completion rate:', error);
  }
}

/**
 * 辅助函数：更新内容用户评分
 */
async function updateContentUserRating(theoryContentId: string) {
  try {
    const ratings = await prisma.theoryProgress.findMany({
      where: {
        theoryContentId,
        selfRating: { not: null },
      },
      select: {
        selfRating: true,
      },
    });

    if (ratings.length > 0) {
      const averageRating =
        ratings.reduce((sum, r) => sum + (r.selfRating || 0), 0) / ratings.length;

      await prisma.theoryContent.update({
        where: { id: theoryContentId },
        data: { userRating: averageRating },
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}
