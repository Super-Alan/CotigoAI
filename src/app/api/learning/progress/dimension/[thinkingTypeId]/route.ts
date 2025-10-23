import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDimensionProgress } from '@/lib/progress/aggregator';

/**
 * GET /api/learning/progress/dimension/:thinkingTypeId
 *
 * 获取单个思维维度的详细进度
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { thinkingTypeId: string } }
) {
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
    const { thinkingTypeId } = params;

    // 获取维度进度
    const dimensionData = await getDimensionProgress(userId, thinkingTypeId);

    return NextResponse.json({
      success: true,
      data: dimensionData
    });
  } catch (error) {
    console.error('Error fetching dimension progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取维度进度失败',
          details: error instanceof Error ? error.message : '未知错误'
        }
      },
      { status: 500 }
    );
  }
}
