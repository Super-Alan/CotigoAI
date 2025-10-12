import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: params.id }
    });

    if (!thinkingType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '思维类型不存在'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: thinkingType
    });
  } catch (error) {
    console.error('Error fetching thinking type:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '获取思维类型失败'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, icon, learningContent } = body;

    const thinkingType = await prisma.thinkingType.update({
      where: { id: params.id },
      data: {
        name,
        description,
        icon,
        learningContent
      }
    });

    return NextResponse.json({
      success: true,
      data: thinkingType
    });
  } catch (error) {
    console.error('Error updating thinking type:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '更新思维类型失败'
        }
      },
      { status: 500 }
    );
  }
}