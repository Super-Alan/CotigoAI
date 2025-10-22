import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RecommendationItem {
  type: 'question' | 'concept' | 'level';
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  metadata: {
    thinkingTypeId?: string;
    level?: number;
    difficulty?: string;
    conceptKey?: string;
    estimatedTime?: number;
  };
}

interface RecommendationResponse {
  recommendations: RecommendationItem[];
  summary: {
    totalRecommendations: number;
    highPriority: number;
    focusAreas: string[];
    nextMilestone: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const thinkingTypeId = searchParams.get('thinkingTypeId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const recommendations: RecommendationItem[] = [];

    // 获取用户的所有思维类型进度
    const userProgress = await prisma.criticalThinkingProgress.findMany({
      where: { userId },
      include: {
        thinkingType: true
      }
    });

    // 获取用户的练习记录
    const recentSessions = await prisma.criticalThinkingPracticeSession.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            thinkingType: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 50
    });

    // 获取知识点掌握度
    const knowledgeMastery = await prisma.knowledgePointMastery.findMany({
      where: { userId }
    });

    // 如果指定了思维类型，重点推荐该类型
    if (thinkingTypeId) {
      await generateThinkingTypeRecommendations(
        userId, 
        thinkingTypeId, 
        recommendations, 
        recentSessions, 
        knowledgeMastery
      );
    } else {
      // 全局推荐
      await generateGlobalRecommendations(
        userId, 
        recommendations, 
        userProgress, 
        recentSessions, 
        knowledgeMastery
      );
    }

    // 按优先级排序
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 限制返回数量
    const limitedRecommendations = recommendations.slice(0, limit);

    // 生成摘要
    const summary = {
      totalRecommendations: limitedRecommendations.length,
      highPriority: limitedRecommendations.filter(r => r.priority === 'high').length,
      focusAreas: [...new Set(limitedRecommendations.map(r => r.metadata.conceptKey || '').filter(Boolean))],
      nextMilestone: generateNextMilestone(userProgress, recentSessions)
    };

    const response: RecommendationResponse = {
      recommendations: limitedRecommendations,
      summary
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(
      { error: '获取推荐失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

async function generateThinkingTypeRecommendations(
  userId: string,
  thinkingTypeId: string,
  recommendations: RecommendationItem[],
  recentSessions: any[],
  knowledgeMastery: any[]
) {
  // 获取该思维类型的详细信息
  const thinkingType = await prisma.thinkingType.findUnique({
    where: { id: thinkingTypeId }
  });

  if (!thinkingType) return;

  // 分析用户在该思维类型的表现
  const typeSessions = recentSessions.filter(s => s.question.thinkingTypeId === thinkingTypeId);
  const typeKnowledgeMastery = knowledgeMastery.filter(km => km.thinkingTypeId === thinkingTypeId);

  // 计算各级别的表现
  const levelPerformance: Record<number, { avgScore: number, count: number }> = {};
  typeSessions.forEach(session => {
    const level = session.question.level || 1;
    if (!levelPerformance[level]) {
      levelPerformance[level] = { avgScore: 0, count: 0 };
    }
    if (session.score !== null) {
      levelPerformance[level].avgScore += session.score;
      levelPerformance[level].count++;
    }
  });

  // 计算平均分
  Object.keys(levelPerformance).forEach(level => {
    const perf = levelPerformance[parseInt(level)];
    if (perf.count > 0) {
      perf.avgScore = perf.avgScore / perf.count;
    }
  });

  // 推荐策略1: 薄弱级别加强
  for (let level = 1; level <= 5; level++) {
    const perf = levelPerformance[level];
    if (perf && perf.avgScore < 70 && perf.count >= 2) {
      recommendations.push({
        type: 'level',
        id: `${thinkingTypeId}-level-${level}`,
        title: `${thinkingType.name} - Level ${level} 强化练习`,
        description: `您在Level ${level}的平均分为${Math.round(perf.avgScore)}分，建议加强练习`,
        priority: 'high',
        reason: `Level ${level}表现需要提升`,
        metadata: {
          thinkingTypeId,
          level,
          estimatedTime: 20
        }
      });
    }
  }

  // 推荐策略2: 薄弱概念加强
  const weakConcepts = typeKnowledgeMastery
    .filter(km => km.masteryLevel < 0.6)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 3);

  weakConcepts.forEach(concept => {
    recommendations.push({
      type: 'concept',
      id: `${thinkingTypeId}-concept-${concept.conceptKey}`,
      title: `${concept.conceptKey} 概念强化`,
      description: `该概念掌握度为${Math.round(concept.masteryLevel * 100)}%，建议重点练习`,
      priority: 'medium',
      reason: '概念掌握度较低',
      metadata: {
        thinkingTypeId,
        conceptKey: concept.conceptKey,
        estimatedTime: 15
      }
    });
  });

  // 推荐策略3: 进阶挑战
  const bestLevel = Object.entries(levelPerformance)
    .filter(([_, perf]) => perf.avgScore >= 80 && perf.count >= 3)
    .map(([level, _]) => parseInt(level))
    .sort((a, b) => b - a)[0];

  if (bestLevel && bestLevel < 5) {
    const nextLevel = bestLevel + 1;
    recommendations.push({
      type: 'level',
      id: `${thinkingTypeId}-challenge-${nextLevel}`,
      title: `挑战 Level ${nextLevel}`,
      description: `您在Level ${bestLevel}表现优秀，可以尝试更高难度`,
      priority: 'medium',
      reason: '准备好接受更高挑战',
      metadata: {
        thinkingTypeId,
        level: nextLevel,
        estimatedTime: 25
      }
    });
  }
}

async function generateGlobalRecommendations(
  userId: string,
  recommendations: RecommendationItem[],
  userProgress: any[],
  recentSessions: any[],
  knowledgeMastery: any[]
) {
  // 获取所有思维类型
  const allThinkingTypes = await prisma.thinkingType.findMany();

  // 推荐策略1: 未开始的思维类型
  const practiceThinkingTypes = new Set(userProgress.map(p => p.thinkingTypeId));
  const unpracticedTypes = allThinkingTypes.filter(tt => !practiceThinkingTypes.has(tt.id));

  unpracticedTypes.slice(0, 2).forEach(type => {
    recommendations.push({
      type: 'question',
      id: `new-${type.id}`,
      title: `开始学习 ${type.name}`,
      description: type.description || `探索${type.name}的思维方式`,
      priority: 'medium',
      reason: '拓展思维类型',
      metadata: {
        thinkingTypeId: type.id,
        level: 1,
        estimatedTime: 20
      }
    });
  });

  // 推荐策略2: 最近活跃但表现不佳的类型
  const recentTypePerformance: Record<string, { scores: number[], lastPractice: Date }> = {};
  
  recentSessions.slice(0, 20).forEach(session => {
    const typeId = session.question.thinkingTypeId;
    if (!recentTypePerformance[typeId]) {
      recentTypePerformance[typeId] = { scores: [], lastPractice: session.completedAt };
    }
    if (session.score !== null) {
      recentTypePerformance[typeId].scores.push(session.score);
    }
    if (session.completedAt > recentTypePerformance[typeId].lastPractice) {
      recentTypePerformance[typeId].lastPractice = session.completedAt;
    }
  });

  Object.entries(recentTypePerformance).forEach(([typeId, perf]) => {
    if (perf.scores.length >= 2) {
      const avgScore = perf.scores.reduce((sum, score) => sum + score, 0) / perf.scores.length;
      if (avgScore < 75) {
        const thinkingType = allThinkingTypes.find(tt => tt.id === typeId);
        if (thinkingType) {
          recommendations.push({
            type: 'question',
            id: `improve-${typeId}`,
            title: `${thinkingType.name} 能力提升`,
            description: `最近平均分${Math.round(avgScore)}分，建议继续练习`,
            priority: 'high',
            reason: '最近表现需要改善',
            metadata: {
              thinkingTypeId: typeId,
              estimatedTime: 20
            }
          });
        }
      }
    }
  });

  // 推荐策略3: 长时间未练习的类型
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  Object.entries(recentTypePerformance).forEach(([typeId, perf]) => {
    if (perf.lastPractice < oneWeekAgo) {
      const thinkingType = allThinkingTypes.find(tt => tt.id === typeId);
      if (thinkingType) {
        recommendations.push({
          type: 'question',
          id: `review-${typeId}`,
          title: `复习 ${thinkingType.name}`,
          description: '已经一周未练习，建议复习巩固',
          priority: 'low',
          reason: '长时间未练习',
          metadata: {
            thinkingTypeId: typeId,
            estimatedTime: 15
          }
        });
      }
    }
  });
}

function generateNextMilestone(userProgress: any[], recentSessions: any[]): string {
  if (userProgress.length === 0) {
    return '开始您的第一次批判性思维练习';
  }

  // 找到最活跃的思维类型
  const typeSessionCounts: Record<string, number> = {};
  recentSessions.forEach(session => {
    const typeId = session.question.thinkingTypeId;
    typeSessionCounts[typeId] = (typeSessionCounts[typeId] || 0) + 1;
  });

  const mostActiveType = Object.entries(typeSessionCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (mostActiveType) {
    const [typeId, count] = mostActiveType;
    const progress = userProgress.find(p => p.thinkingTypeId === typeId);
    if (progress && progress.progressPercentage < 100) {
      return `在最活跃的思维类型中达到100%掌握度`;
    }
  }

  // 检查是否有可以解锁的新级别
  const avgProgress = userProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / userProgress.length;
  if (avgProgress < 80) {
    return '将整体掌握度提升到80%以上';
  }

  return '探索新的思维类型或挑战更高难度';
}