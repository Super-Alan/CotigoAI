/**
 * 统一推荐服务
 *
 * 整合学习路径和每日练习，提供一致的学习建议
 * 核心理念：学习路径为主线，每日练习为执行
 */

import { prisma } from '@/lib/prisma';
import { PathGenerationEngine } from './path-generation-engine';

export interface DailyTask {
  // 任务基本信息
  id: string;
  type: 'theory' | 'practice' | 'review' | 'mixed';
  thinkingTypeId: string;
  thinkingTypeName: string;
  level: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // 任务内容
  title: string;
  description: string;
  estimatedTime: number; // 分钟

  // 路径上下文
  context: {
    // 当前进度
    pathProgress: number; // 0-100
    currentPhase: string; // 例如："基础巩固阶段"
    currentPhaseProgress: number; // 当前阶段进度

    // 目标说明
    whyThisTask: string; // 为什么推荐这个任务
    whatYouWillLearn: string[]; // 将学到什么

    // 里程碑
    nextMilestone: string; // 下一个里程碑
    milestoneProgress: number; // 距离里程碑的进度

    // 元数据
    totalSteps: number;
    completedSteps: number;
    currentStepIndex: number;
  };

  // 完成状态
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;

  // 其他元数据
  isFirstTime?: boolean; // 是否首次使用
  pathId?: string; // 关联的路径ID
  stepId?: string; // 路径步骤ID
}

export interface OptionalPractice {
  id: string;
  thinkingTypeId: string;
  title: string;
  description: string;
  difficulty: string;
  icon: string;
  color: string;
  estimatedTime: number;
  reason?: string; // 推荐理由
}

export class UnifiedRecommendationService {
  /**
   * 获取用户的今日任务
   */
  async getDailyTask(userId: string): Promise<DailyTask> {
    // 1. 获取或创建学习路径
    const path = await this.getOrCreatePath(userId);

    // 2. 检查今日是否已完成任务
    const todayCompletion = await this.getTodayCompletion(userId);

    if (todayCompletion) {
      // 今日已完成，返回已完成的任务信息
      return this.buildCompletedTask(path, todayCompletion);
    }

    // 3. 获取当前应该完成的步骤
    const currentStep = this.getCurrentStep(path);

    // 4. 构建今日任务
    return this.buildDailyTask(userId, path, currentStep);
  }

  /**
   * 获取或创建学习路径
   */
  private async getOrCreatePath(userId: string) {
    // 查找活跃的学习路径
    let path = await prisma.learningPathState.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    // 如果没有路径，生成默认路径
    if (!path) {
      const engine = new PathGenerationEngine();
      const generatedPath = await engine.generatePath({
        userId,
        learningStyle: 'balanced', // 默认平衡型
        targetLevel: 5 // 默认目标Level 5
      });

      // 保存到数据库
      path = await prisma.learningPathState.create({
        data: {
          userId,
          pathType: 'adaptive',
          pathSteps: JSON.stringify(generatedPath.steps),
          totalSteps: generatedPath.steps.length,
          completedSteps: 0,
          currentStepIndex: 0,
          targetDimensions: generatedPath.metadata.targetDimensions,
          learningStyle: generatedPath.metadata.learningStyle,
          estimatedTimeLeft: generatedPath.estimatedTimeLeft,
          status: 'active'
        }
      });
    }

    return path;
  }

  /**
   * 获取今日完成记录
   */
  private async getTodayCompletion(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.criticalThinkingPracticeSession.findFirst({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow
        },
        score: {
          gte: 60 // 及格分数
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        question: {
          include: {
            thinkingType: true
          }
        }
      }
    });
  }

  /**
   * 获取当前步骤
   */
  private getCurrentStep(path: any) {
    const steps = JSON.parse(path.pathSteps as string);
    const currentIndex = path.currentStepIndex || 0;

    // 确保索引不越界
    if (currentIndex >= steps.length) {
      // 路径已完成，返回最后一步
      return steps[steps.length - 1];
    }

    return steps[currentIndex];
  }

  /**
   * 构建已完成的任务
   */
  private async buildCompletedTask(path: any, completion: any): Promise<DailyTask> {
    const steps = JSON.parse(path.pathSteps as string);
    const currentIndex = path.currentStepIndex || 0;
    const currentStep = steps[currentIndex];

    // 获取思维类型信息
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: completion.question.thinkingTypeId }
    });

    return {
      id: completion.id,
      type: 'practice',
      thinkingTypeId: completion.question.thinkingTypeId,
      thinkingTypeName: thinkingType?.name || '批判性思维',
      level: completion.question.level,
      difficulty: this.mapLevelToDifficulty(completion.question.level),
      title: `${thinkingType?.name || '练习'} Level ${completion.question.level}`,
      description: '今日练习已完成',
      estimatedTime: 15,
      context: {
        pathProgress: Math.round((path.completedSteps / path.totalSteps) * 100),
        currentPhase: this.getPhaseFromStep(currentStep),
        currentPhaseProgress: this.getPhaseProgress(steps, currentIndex),
        whyThisTask: currentStep?.rationale || '巩固学习成果',
        whatYouWillLearn: currentStep?.expectedOutcomes || [],
        nextMilestone: this.getNextMilestone(steps, currentIndex),
        milestoneProgress: this.getMilestoneProgress(steps, currentIndex),
        totalSteps: path.totalSteps,
        completedSteps: path.completedSteps,
        currentStepIndex: currentIndex
      },
      isCompleted: true,
      completedAt: completion.completedAt,
      score: completion.score,
      pathId: path.id,
      stepId: currentStep?.id
    };
  }

  /**
   * 构建今日任务
   */
  private async buildDailyTask(userId: string, path: any, currentStep: any): Promise<DailyTask> {
    const steps = JSON.parse(path.pathSteps as string);
    const currentIndex = path.currentStepIndex || 0;

    // 获取思维类型信息
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: currentStep.thinkingTypeId }
    });

    // 检查是否是首次使用
    const sessionCount = await prisma.criticalThinkingPracticeSession.count({
      where: { userId }
    });

    const isFirstTime = sessionCount === 0;

    return {
      id: currentStep.id,
      type: currentStep.type || 'practice',
      thinkingTypeId: currentStep.thinkingTypeId,
      thinkingTypeName: thinkingType?.name || '批判性思维',
      level: currentStep.level,
      difficulty: this.mapLevelToDifficulty(currentStep.level),
      title: currentStep.title || `${thinkingType?.name} Level ${currentStep.level}`,
      description: currentStep.description || thinkingType?.description || '批判性思维练习',
      estimatedTime: currentStep.estimatedTime || 15,
      context: {
        pathProgress: Math.round((path.completedSteps / path.totalSteps) * 100),
        currentPhase: this.getPhaseFromStep(currentStep),
        currentPhaseProgress: this.getPhaseProgress(steps, currentIndex),
        whyThisTask: currentStep.rationale || this.generateDefaultRationale(currentStep, isFirstTime),
        whatYouWillLearn: currentStep.expectedOutcomes || this.getDefaultOutcomes(currentStep),
        nextMilestone: this.getNextMilestone(steps, currentIndex),
        milestoneProgress: this.getMilestoneProgress(steps, currentIndex),
        totalSteps: path.totalSteps,
        completedSteps: path.completedSteps,
        currentStepIndex: currentIndex
      },
      isCompleted: false,
      isFirstTime,
      pathId: path.id,
      stepId: currentStep.id
    };
  }

  /**
   * 获取额外练习选项
   */
  async getOptionalPractices(userId: string, excludeThinkingTypeId?: string): Promise<OptionalPractice[]> {
    // 获取所有思维类型
    const thinkingTypes = await prisma.thinkingType.findMany({
      where: excludeThinkingTypeId ? {
        id: { not: excludeThinkingTypeId }
      } : undefined
    });

    // 获取用户进度
    const userProgress = await prisma.criticalThinkingProgress.findMany({
      where: { userId }
    });

    const progressMap = new Map(
      userProgress.map(p => [p.thinkingTypeId, p])
    );

    // 构建练习选项
    return thinkingTypes.map(type => {
      const progress = progressMap.get(type.id);
      const currentLevel = progress?.currentLevel || 1;

      return {
        id: type.id,
        thinkingTypeId: type.id,
        title: type.name,
        description: type.description,
        difficulty: this.mapLevelToDifficulty(currentLevel),
        icon: this.getIconForType(type.id),
        color: this.getColorForType(type.id),
        estimatedTime: 15,
        reason: progress ? `继续Level ${currentLevel}的学习` : '开始新的学习维度'
      };
    });
  }

  /**
   * 完成任务并更新路径
   */
  async completeTask(userId: string, taskData: {
    stepId: string;
    questionId: string;
    score: number;
    timeSpent: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. 获取学习路径
      const path = await tx.learningPathState.findFirst({
        where: { userId, status: 'active' }
      });

      if (!path) {
        throw new Error('No active learning path found');
      }

      const steps = JSON.parse(path.pathSteps as string);
      const stepIndex = steps.findIndex((s: any) => s.id === taskData.stepId);

      if (stepIndex === -1) {
        throw new Error('Step not found in path');
      }

      // 2. 更新步骤状态
      steps[stepIndex].completed = true;
      steps[stepIndex].completedAt = new Date();
      steps[stepIndex].score = taskData.score;
      steps[stepIndex].timeSpent = taskData.timeSpent;

      // 3. 计算新的进度
      const completedSteps = steps.filter((s: any) => s.completed).length;
      const progressPercent = Math.round((completedSteps / steps.length) * 100);

      // 4. 更新路径
      await tx.learningPathState.update({
        where: { id: path.id },
        data: {
          pathSteps: JSON.stringify(steps),
          completedSteps,
          currentStepIndex: Math.min(stepIndex + 1, steps.length - 1),
          progressPercent,
          lastAccessedAt: new Date()
        }
      });

      return {
        success: true,
        newProgress: progressPercent,
        completedSteps,
        totalSteps: steps.length,
        nextStep: steps[stepIndex + 1] || null
      };
    });
  }

  // ============ Helper Methods ============

  private mapLevelToDifficulty(level: number): 'beginner' | 'intermediate' | 'advanced' {
    if (level <= 2) return 'beginner';
    if (level <= 4) return 'intermediate';
    return 'advanced';
  }

  private getPhaseFromStep(step: any): string {
    const level = step.level || 1;
    if (level <= 2) return '基础巩固阶段';
    if (level <= 3) return '能力提升阶段';
    if (level <= 4) return '深度思考阶段';
    return '高级挑战阶段';
  }

  private getPhaseProgress(steps: any[], currentIndex: number): number {
    const currentStep = steps[currentIndex];
    const currentLevel = currentStep?.level || 1;

    // 统计当前级别的步骤
    const sameLevelSteps = steps.filter((s: any) => s.level === currentLevel);
    const completedSameLevelSteps = sameLevelSteps.filter((s: any) => s.completed && s.level === currentLevel);

    return sameLevelSteps.length > 0
      ? Math.round((completedSameLevelSteps.length / sameLevelSteps.length) * 100)
      : 0;
  }

  private getNextMilestone(steps: any[], currentIndex: number): string {
    const currentStep = steps[currentIndex];
    const currentLevel = currentStep?.level || 1;

    // 找到下一个不同级别的步骤
    const nextLevelStep = steps.slice(currentIndex + 1).find((s: any) => s.level !== currentLevel);

    if (nextLevelStep) {
      return `完成 Level ${currentLevel}，进入 Level ${nextLevelStep.level}`;
    }

    // 如果没有更高级别，表示即将完成整个路径
    return '完成整个学习路径';
  }

  private getMilestoneProgress(steps: any[], currentIndex: number): number {
    const currentStep = steps[currentIndex];
    const currentLevel = currentStep?.level || 1;

    // 统计当前级别的所有步骤
    const levelSteps = steps.filter((s: any) => s.level === currentLevel);
    const completedLevelSteps = levelSteps.filter((s: any) => s.completed);

    return levelSteps.length > 0
      ? Math.round((completedLevelSteps.length / levelSteps.length) * 100)
      : 0;
  }

  private generateDefaultRationale(step: any, isFirstTime: boolean): string {
    if (isFirstTime) {
      return '从基础开始，建立批判性思维的核心能力';
    }

    const level = step.level || 1;
    const thinkingTypeName = step.thinkingTypeName || '批判性思维';

    if (level === 1) {
      return `掌握${thinkingTypeName}的基本概念和方法`;
    } else if (level === 2) {
      return `巩固${thinkingTypeName}的核心技能`;
    } else if (level === 3) {
      return `提升${thinkingTypeName}的应用能力`;
    } else if (level === 4) {
      return `深化${thinkingTypeName}的理解和实践`;
    } else {
      return `挑战${thinkingTypeName}的高级应用场景`;
    }
  }

  private getDefaultOutcomes(step: any): string[] {
    const level = step.level || 1;
    const outcomes = [
      `理解Level ${level}的核心概念`,
      `掌握相关的分析方法`,
      `能够识别常见的思维模式`
    ];

    if (level >= 3) {
      outcomes.push('能够在实际场景中应用所学');
    }

    if (level >= 4) {
      outcomes.push('能够进行批判性评估和改进');
    }

    return outcomes;
  }

  private getIconForType(thinkingTypeId: string): string {
    const iconMap: { [key: string]: string } = {
      'causal_analysis': 'BarChart3',
      'premise_challenge': 'Lightbulb',
      'fallacy_detection': 'Target',
      'iterative_reflection': 'Users',
      'connection_transfer': 'Settings'
    };
    return iconMap[thinkingTypeId] || 'Brain';
  }

  private getColorForType(thinkingTypeId: string): string {
    const colorMap: { [key: string]: string } = {
      'causal_analysis': 'bg-blue-50 border-blue-200',
      'premise_challenge': 'bg-green-50 border-green-200',
      'fallacy_detection': 'bg-red-50 border-red-200',
      'iterative_reflection': 'bg-purple-50 border-purple-200',
      'connection_transfer': 'bg-orange-50 border-orange-200'
    };
    return colorMap[thinkingTypeId] || 'bg-gray-50 border-gray-200';
  }
}

// 导出单例
export const unifiedRecommendation = new UnifiedRecommendationService();
