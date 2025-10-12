import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThinkingType } from '@/types';

export async function GET() {
  try {
    const thinkingTypes = await prisma.thinkingType.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: { types: thinkingTypes }
    });
  } catch (error) {
    console.error('Error fetching thinking types:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, learningContent } = body;

    const thinkingType = await prisma.thinkingType.create({
      data: {
        id,
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
    console.error('Error creating thinking type:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: '创建思维类型失败'
        }
      },
      { status: 500 }
    );
  }
}