import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - 导出内容数据
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!adminUser || !adminUser.permissions || !Array.isArray(adminUser.permissions) || !adminUser.permissions.includes('CONTENT_MANAGEMENT')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const { type, format = 'json', filters = {} } = body;

    // 验证必填字段
    if (!type) {
      return NextResponse.json({ error: '缺少内容类型' }, { status: 400 });
    }

    let data: any[];
    let filename: string;

    switch (type) {
      case 'questions':
        // 构建筛选条件
        const questionWhere: any = {};
        if (filters.thinkingTypeId) questionWhere.thinkingTypeId = filters.thinkingTypeId;
        if (filters.level) questionWhere.level = parseInt(filters.level);

        data = await prisma.criticalThinkingQuestion.findMany({
          where: questionWhere,
          include: {
            thinkingType: {
              select: { id: true, name: true, icon: true }
            },
            guidingQuestions: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        filename = `questions-export-${Date.now()}`;
        break;

      case 'topics':
        const topicWhere: any = {};
        if (filters.category) topicWhere.category = filters.category;
        if (filters.difficulty) topicWhere.difficulty = filters.difficulty;
        if (filters.dimension) topicWhere.dimension = filters.dimension;

        data = await prisma.generatedConversationTopic.findMany({
          where: topicWhere,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        filename = `topics-export-${Date.now()}`;
        break;

      case 'learning_content':
        const contentWhere: any = {};
        if (filters.thinkingTypeId) contentWhere.thinkingTypeId = filters.thinkingTypeId;
        if (filters.level) contentWhere.level = parseInt(filters.level);
        if (filters.contentType) contentWhere.contentType = filters.contentType;

        data = await prisma.levelLearningContent.findMany({
          where: contentWhere,
          include: {
            thinkingType: {
              select: { id: true, name: true, icon: true }
            }
          },
          orderBy: [
            { thinkingTypeId: 'asc' },
            { level: 'asc' },
            { orderIndex: 'asc' }
          ]
        });

        filename = `learning-content-export-${Date.now()}`;
        break;

      default:
        return NextResponse.json({ error: '不支持的内容类型' }, { status: 400 });
    }

    if (format === 'json') {
      // 返回JSON格式
      return NextResponse.json({
        success: true,
        data: {
          type,
          exportedAt: new Date().toISOString(),
          count: data.length,
          items: data
        }
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.json"`,
          'Content-Type': 'application/json'
        }
      });
    } else if (format === 'csv') {
      // 简化版CSV导出（仅基础字段）
      let csvContent = '';

      if (type === 'questions') {
        // CSV头
        csvContent = 'ID,标题,思维类型,Level,标签,创建时间\n';

        // CSV数据行
        data.forEach((item: any) => {
          const tags = Array.isArray(item.tags) ? item.tags.join(';') : '';
          csvContent += `"${item.id}","${item.topic}","${item.thinkingType.name}","${item.level}","${tags}","${item.createdAt}"\n`;
        });
      } else if (type === 'topics') {
        csvContent = 'ID,话题,分类,难度,维度,标签,使用次数,创建时间\n';

        data.forEach((item: any) => {
          const tags = Array.isArray(item.tags) ? item.tags.join(';') : '';
          csvContent += `"${item.id}","${item.topic}","${item.category}","${item.difficulty}","${item.dimension}","${tags}","${item.usageCount}","${item.createdAt}"\n`;
        });
      } else if (type === 'learning_content') {
        csvContent = 'ID,标题,思维类型,Level,内容类型,预计时间,排序,创建时间\n';

        data.forEach((item: any) => {
          csvContent += `"${item.id}","${item.title}","${item.thinkingType.name}","${item.level}","${item.contentType}","${item.estimatedTime}","${item.orderIndex}","${item.createdAt}"\n`;
        });
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
          'Content-Type': 'text/csv; charset=utf-8'
        }
      });
    } else {
      return NextResponse.json({ error: '不支持的导出格式' }, { status: 400 });
    }

  } catch (error) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { error: '导出失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
