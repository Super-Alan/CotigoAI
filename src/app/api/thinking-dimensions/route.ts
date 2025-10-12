import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/thinking-dimensions - 获取思维维度数据和用户进度
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 获取所有思维维度
    const thinkingTypes = await prisma.thinkingType.findMany({
      orderBy: { createdAt: 'asc' }
    });

    let userProgress = [];
    
    if (session?.user?.id) {
      // 如果用户已登录，获取用户进度
      userProgress = await prisma.criticalThinkingProgress.findMany({
        where: { userId: session.user.id },
        include: {
          thinkingType: true
        }
      });
    }

    // 组合数据
    const dimensionsWithProgress = thinkingTypes.map(thinkingType => {
      const progress = userProgress.find(p => p.thinkingTypeId === thinkingType.id);
      
      return {
        id: thinkingType.id,
        name: thinkingType.name,
        description: thinkingType.description,
        icon: thinkingType.icon,
        learningFramework: thinkingType.learningFramework,
        methods: thinkingType.methods,
        examples: thinkingType.examples,
        userProgress: progress ? {
          level: progress.level,
          experience: progress.experience,
          totalQuestions: progress.totalQuestions,
          correctAnswers: progress.correctAnswers,
          accuracy: progress.totalQuestions > 0 ? 
            Math.round((progress.correctAnswers / progress.totalQuestions) * 100) : 0,
          nextLevelExp: (progress.level * 100) - progress.experience
        } : null
      };
    });

    return NextResponse.json({
      dimensions: dimensionsWithProgress,
      isAuthenticated: !!session?.user?.id
    });

  } catch (error) {
    console.error('获取思维维度数据失败:', error);
    return NextResponse.json(
      { error: '获取思维维度数据失败' },
      { status: 500 }
    );
  }
}

// POST /api/thinking-dimensions - 创建新的思维维度（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 这里可以添加管理员权限检查
    // const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: '权限不足' }, { status: 403 });
    // }

    const {
      name,
      description,
      icon,
      learningFramework,
      methods,
      examples
    } = await request.json();

    // 验证必填字段
    if (!name || !description) {
      return NextResponse.json(
        { error: '名称和描述为必填字段' },
        { status: 400 }
      );
    }

    const newThinkingType = await prisma.thinkingType.create({
      data: {
        name,
        description,
        icon: icon || 'brain',
        learningFramework: learningFramework || {},
        methods: methods || [],
        examples: examples || []
      }
    });

    return NextResponse.json({
      success: true,
      thinkingType: newThinkingType
    });

  } catch (error) {
    console.error('创建思维维度失败:', error);
    return NextResponse.json(
      { error: '创建思维维度失败' },
      { status: 500 }
    );
  }
}