import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserUnifiedProgress } from '@/lib/progress/aggregator';

/**
 * GET /api/learning/progress/unified
 *
 * 获取用户的统一学习进度数据
 *
 * 包含:
 * - 总体进度
 * - 各模块进度及贡献
 * - 五维能力进度
 * - 学习时长统计
 */
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

    const userId = session.user.id;

    // 获取统一进度数据
    const progressData = await getUserUnifiedProgress(userId);

    return NextResponse.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Error fetching unified progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取学习进度失败',
          details: error instanceof Error ? error.message : '未知错误'
        }
      },
      { status: 500 }
    );
  }
}
