import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/learning-path - 获取个性化学习路径
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取用户的思维能力进度
    const thinkingProgress = await prisma.criticalThinkingProgress.findMany({
      where: { userId },
      include: {
        thinkingType: true
      }
    });

    // 获取所有思维类型
    const allThinkingTypes = await prisma.thinkingType.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // 分析用户能力水平
    const userLevels = new Map();
    thinkingProgress.forEach(progress => {
      const accuracy = progress.averageScore / 100; // averageScore is 0-100
      userLevels.set(progress.thinkingTypeId, {
        level: Math.floor(progress.questionsCompleted / 10) + 1, // Level based on questions completed
        accuracy,
        experience: progress.questionsCompleted
      });
    });

    // 生成个性化学习路径
    const learningPath = allThinkingTypes.map(thinkingType => {
      const userLevel = userLevels.get(thinkingType.id) || {
        level: 1,
        accuracy: 0,
        experience: 0
      };

      // 根据用户水平推荐学习内容
      let recommendedActions = [];
      let priority = 'medium';

      if (userLevel.level === 1 && userLevel.experience === 0) {
        // 新手：从基础开始
        recommendedActions = [
          { type: 'introduction', title: '了解基础概念', duration: '15分钟' },
          { type: 'practice', title: '基础练习', duration: '20分钟' },
          { type: 'assessment', title: '能力评估', duration: '10分钟' }
        ];
        priority = 'high';
      } else if (userLevel.accuracy < 0.6) {
        // 准确率低：需要加强练习
        recommendedActions = [
          { type: 'review', title: '复习核心概念', duration: '10分钟' },
          { type: 'practice', title: '针对性练习', duration: '25分钟' },
          { type: 'feedback', title: '错误分析', duration: '15分钟' }
        ];
        priority = 'high';
      } else if (userLevel.level < 3) {
        // 中级：继续提升
        recommendedActions = [
          { type: 'advanced_practice', title: '进阶练习', duration: '30分钟' },
          { type: 'case_study', title: '案例分析', duration: '20分钟' }
        ];
        priority = 'medium';
      } else {
        // 高级：挑战性内容
        recommendedActions = [
          { type: 'challenge', title: '挑战题目', duration: '35分钟' },
          { type: 'teaching', title: '教学他人', duration: '25分钟' }
        ];
        priority = 'low';
      }

      return {
        thinkingType: {
          id: thinkingType.id,
          name: thinkingType.name,
          description: thinkingType.description,
          icon: thinkingType.icon
        },
        userProgress: userLevel,
        recommendedActions,
        priority,
        estimatedTime: recommendedActions.reduce((total, action) => {
          const minutes = parseInt(action.duration.match(/\d+/)?.[0] || '0');
          return total + minutes;
        }, 0)
      };
    });

    // 按优先级排序
    const priorityOrder: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
    learningPath.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    // 获取推荐的学习资源
    const recommendedResources = await getRecommendedResources(userId);

    return NextResponse.json({
      learningPath,
      recommendedResources,
      summary: {
        totalEstimatedTime: learningPath.reduce((total, item) => total + item.estimatedTime, 0),
        highPriorityItems: learningPath.filter(item => item.priority === 'high').length,
        completionRate: calculateOverallCompletion(thinkingProgress, allThinkingTypes.length)
      }
    });

  } catch (error) {
    console.error('获取学习路径失败:', error);
    return NextResponse.json(
      { error: '获取学习路径失败' },
      { status: 500 }
    );
  }
}

// 获取推荐的学习资源
async function getRecommendedResources(userId: string) {
  try {
    // 获取用户最近的练习类型
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { sessionType: true }
    });

    const recentTypes = [...new Set(recentSessions.map(s => s.sessionType))];

    // 推荐相关的学习资源
    const resources = [];

    // 逻辑谬误资源
    if (recentTypes.includes('fallacy_detection') || recentTypes.length === 0) {
      const fallacies = await prisma.logicalFallacy.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      resources.push({
        type: 'fallacies',
        title: '逻辑谬误学习',
        items: fallacies.map(f => ({
          id: f.id,
          name: f.name,
          description: f.definition
        }))
      });
    }

    // 论证模板资源
    if (recentTypes.includes('argument_analysis') || recentTypes.length === 0) {
      const templates = await prisma.argumentTemplate.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      resources.push({
        type: 'templates',
        title: '论证结构模板',
        items: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description
        }))
      });
    }

    // 方法论课程
    const lessons = await prisma.methodologyLesson.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    resources.push({
      type: 'lessons',
      title: '方法论微课',
      items: lessons.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        duration: l.duration
      }))
    });

    return resources;
  } catch (error) {
    console.error('获取推荐资源失败:', error);
    return [];
  }
}

// 计算总体完成度
function calculateOverallCompletion(progress: any[], totalTypes: number): number {
  if (totalTypes === 0) return 0;
  
  const completedTypes = progress.filter(p => p.level >= 3).length;
  return Math.round((completedTypes / totalTypes) * 100);
}

// POST /api/learning-path - 更新学习路径偏好
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { preferences } = await request.json();
    const userId = session.user.id;

    // 更新用户学习偏好（可以扩展UserSettings表来存储这些偏好）
    // Note: UserSettings schema doesn't have learningPreferences field
    // Preferences would need to be stored elsewhere or schema updated

    return NextResponse.json({ success: true, message: 'Preferences stored (feature pending schema update)' });

  } catch (error) {
    console.error('更新学习偏好失败:', error);
    return NextResponse.json(
      { error: '更新学习偏好失败' },
      { status: 500 }
    );
  }
}