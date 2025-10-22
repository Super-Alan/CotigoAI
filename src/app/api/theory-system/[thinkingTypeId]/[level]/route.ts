import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/theory-system/[thinkingTypeId]/[level]
 * 获取指定Level的完整理论内容
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { thinkingTypeId: string; level: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { thinkingTypeId, level } = params;
    const levelNum = parseInt(level, 10);

    if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
      return NextResponse.json(
        { error: 'Invalid level. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // 获取理论内容（包含完整的3个章节）
    const theoryContent = await prisma.theoryContent.findFirst({
      where: {
        thinkingTypeId,
        level: levelNum,
        isPublished: true,
      },
      include: {
        thinkingType: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
      orderBy: {
        version: 'desc', // 获取最新版本
      },
    });

    if (!theoryContent) {
      return NextResponse.json(
        { error: 'Theory content not found for this level' },
        { status: 404 }
      );
    }

    // 获取或创建用户进度记录
    let userProgress = await prisma.theoryProgress.findUnique({
      where: {
        userId_theoryContentId: {
          userId: session.user.id,
          theoryContentId: theoryContent.id,
        },
      },
    });

    // 如果没有进度记录，创建一个新的
    if (!userProgress) {
      userProgress = await prisma.theoryProgress.create({
        data: {
          userId: session.user.id,
          theoryContentId: theoryContent.id,
          status: 'in_progress',
          progressPercent: 0,
          sectionsCompleted: { concepts: false, models: false, demonstrations: false },
          timeSpent: 0,
          startedAt: new Date(),
        },
      });
    } else {
      // 更新最后访问时间
      userProgress = await prisma.theoryProgress.update({
        where: {
          id: userProgress.id,
        },
        data: {
          lastViewedAt: new Date(),
        },
      });
    }

    // 更新浏览次数
    await prisma.theoryContent.update({
      where: { id: theoryContent.id },
      data: {
        viewCount: { increment: 1 },
      },
    });

    // 获取前置和后续Level信息
    const previousLevel = levelNum > 1 ? levelNum - 1 : null;
    const nextLevel = levelNum < 5 ? levelNum + 1 : null;

    const relatedLevels = await prisma.theoryContent.findMany({
      where: {
        thinkingTypeId,
        isPublished: true,
        level: {
          in: [previousLevel, nextLevel].filter((l) => l !== null) as number[],
        },
      },
      select: {
        id: true,
        level: true, // difficulty removed
        title: true,
      },
    });

    const previous = relatedLevels.find((l) => l.level === previousLevel);
    const next = relatedLevels.find((l) => l.level === nextLevel);

    return NextResponse.json({
      content: theoryContent,
      userProgress,
      navigation: {
        previous: previous || null,
        next: next || null,
      },
    });
  } catch (error) {
    console.error('Error fetching theory content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
