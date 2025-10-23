import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - 批量操作题目
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
    const { action, questionIds, updates } = body;

    // 验证必填字段
    if (!action || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: '缺少必填字段或格式错误' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'update_tags':
        // 批量更新标签
        if (!updates?.tags || !Array.isArray(updates.tags)) {
          return NextResponse.json({ error: '缺少标签数据' }, { status: 400 });
        }

        result = await prisma.criticalThinkingQuestion.updateMany({
          where: {
            id: { in: questionIds }
          },
          data: {
            tags: updates.tags
          }
        });
        break;

      case 'update_level':
        // 批量更新Level
        if (!updates?.level || typeof updates.level !== 'number') {
          return NextResponse.json({ error: '缺少Level数据' }, { status: 400 });
        }

        if (updates.level < 1 || updates.level > 5) {
          return NextResponse.json({ error: 'Level必须在1-5之间' }, { status: 400 });
        }

        result = await prisma.criticalThinkingQuestion.updateMany({
          where: {
            id: { in: questionIds }
          },
          data: {
            level: updates.level
          }
        });
        break;

      case 'add_tags':
        // 批量添加标签（不覆盖现有标签）
        if (!updates?.tags || !Array.isArray(updates.tags)) {
          return NextResponse.json({ error: '缺少标签数据' }, { status: 400 });
        }

        // 获取现有题目的标签
        const questions = await prisma.criticalThinkingQuestion.findMany({
          where: { id: { in: questionIds } },
          select: { id: true, tags: true }
        });

        // 为每个题目添加新标签
        await Promise.all(
          questions.map(async (q: any) => {
            const currentTags = Array.isArray(q.tags) ? q.tags : [];
            const newTags = Array.from(new Set([...currentTags, ...updates.tags]));

            return prisma.criticalThinkingQuestion.update({
              where: { id: q.id },
              data: { tags: newTags }
            });
          })
        );

        result = { count: questions.length };
        break;

      case 'delete':
        // 批量删除
        result = await prisma.criticalThinkingQuestion.deleteMany({
          where: {
            id: { in: questionIds }
          }
        });
        break;

      default:
        return NextResponse.json({ error: '不支持的操作类型' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        affected: result.count,
        questionIds
      }
    });

  } catch (error) {
    console.error('批量操作失败:', error);
    return NextResponse.json(
      { error: '批量操作失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
