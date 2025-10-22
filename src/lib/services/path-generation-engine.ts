/**
 * 学习路径生成引擎
 * Path Generation Engine
 *
 * 根据用户当前状态生成个性化学习路径
 */

import { prisma } from '@/lib/prisma';
import type {
  PathGenerationInput,
  LearningPath,
  PathStep,
  UserState,
} from '@/types/learning-path';
import { THINKING_TYPE_NAMES } from '@/types/learning-path';

export class PathGenerationEngine {
  /**
   * 生成个性化学习路径
   */
  async generatePath(input: PathGenerationInput): Promise<LearningPath> {
    console.log('[PathGenerationEngine] Generating path for user:', input.userId);

    // 1. 获取用户当前状态
    const userState = await this.getUserState(input.userId);

    // 2. 确定学习维度和起始Level
    const dimensions = this.selectDimensions(input, userState);
    const startLevel = this.determineStartLevel(userState, input.thinkingTypeId);

    console.log('[PathGenerationEngine] Selected dimensions:', dimensions);
    console.log('[PathGenerationEngine] Start level:', startLevel);

    // 3. 生成路径步骤序列
    const steps: PathStep[] = [];

    for (const dimension of dimensions) {
      const targetLevel = input.targetLevel || 5;

      for (let level = startLevel; level <= targetLevel; level++) {
        // 3.1 添加理论学习步骤
        const theorySteps = await this.createTheorySteps(dimension, level);
        steps.push(...theorySteps);

        // 3.2 添加实践练习步骤
        const practiceSteps = await this.createPracticeSteps(dimension, level);
        steps.push(...practiceSteps);

        // 3.3 添加评估步骤（每个Level结束，Level 5除外）
        if (level < 5) {
          const assessmentStep = this.createAssessmentStep(dimension, level);
          steps.push(assessmentStep);
        }

        // 3.4 添加反思步骤（Level 3和5）
        if (level === 3 || level === 5) {
          const reflectionStep = this.createReflectionStep(dimension, level);
          steps.push(reflectionStep);
        }
      }
    }

    // 4. 计算prerequisite关系
    const stepsWithPrereqs = this.calculatePrerequisites(steps);

    // 5. 生成路径元数据
    const metadata = {
      targetDimensions: dimensions,
      learningStyle: input.learningStyle || userState.preferences.learningStyle,
      difficultyLevel: 'auto' as const,
      generatedAt: new Date(),
      adaptiveEnabled: userState.preferences.enableAdaptivePath,
    };

    // 6. 计算总时间
    const totalTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);

    return {
      id: `path_${Date.now()}`,
      userId: input.userId,
      pathType: 'adaptive',
      status: 'active',
      steps: stepsWithPrereqs,
      currentStepIndex: 0,
      totalSteps: stepsWithPrereqs.length,
      completedSteps: 0,
      progressPercent: 0,
      totalTimeSpent: 0,
      estimatedTimeLeft: totalTime,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 获取用户状态
   */
  private async getUserState(userId: string): Promise<UserState> {
    // 获取批判性思维进度
    const criticalProgress = await prisma.criticalThinkingProgress.findMany({
      where: { userId },
    });

    // 获取理论学习进度
    const theoryProgress = await prisma.theoryProgress.findMany({
      where: { userId },
      include: {
        theoryContent: true,
      },
    });

    // 获取用户偏好
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    // 如果没有偏好记录，创建默认值
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          preferredLearningStyle: 'balanced',
          preferredDifficulty: 'auto',
          dailyTimeGoal: 30,
        },
      });
    }

    // 获取学习统计
    const sessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const totalTimeSpent = theoryProgress.reduce((sum, tp) => sum + (tp.timeSpent || 0), 0);
    const averageSessionLength = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;

    // 获取连续天数
    const streaks = await prisma.dailyStreak.findMany({
      where: { userId },
      orderBy: { practiceDate: 'desc' },
      take: 100,
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < streaks.length; i++) {
      if (streaks[i].completed) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      userId,
      criticalThinkingProgress: criticalProgress.map((cp) => ({
        thinkingTypeId: cp.thinkingTypeId,
        currentLevel: cp.currentLevel,
        questionsCompleted: cp.questionsCompleted,
        progressPercentage: cp.progressPercentage,
        level1Progress: cp.level1Progress,
        level2Progress: cp.level2Progress,
        level3Progress: cp.level3Progress,
        level4Progress: cp.level4Progress,
        level5Progress: cp.level5Progress,
        level1AverageScore: cp.level1AverageScore,
        level2AverageScore: cp.level2AverageScore,
        level3AverageScore: cp.level3AverageScore,
        level4AverageScore: cp.level4AverageScore,
        level5AverageScore: cp.level5AverageScore,
      })),
      theoryProgress: theoryProgress.map((tp) => ({
        theoryContentId: tp.theoryContentId,
        status: tp.status,
        progressPercent: tp.progressPercent,
        sectionsCompleted: (tp.sectionsCompleted as any) || {
          concepts: false,
          models: false,
          demonstrations: false,
        },
        timeSpent: tp.timeSpent,
        completedAt: tp.completedAt || undefined,
        lastViewedAt: tp.lastViewedAt,
      })),
      preferences: {
        learningStyle: preferences.preferredLearningStyle as any,
        dailyTimeGoal: preferences.dailyTimeGoal,
        enableAdaptivePath: preferences.enableAdaptivePath,
        autoUnlockLevels: preferences.autoUnlockLevels,
      },
      stats: {
        totalTimeSpent: Math.floor(totalTimeSpent / 60), // 转换为分钟
        averageSessionLength: Math.floor(averageSessionLength / 60),
        currentStreak,
        longestStreak,
      },
    };
  }

  /**
   * 选择学习维度
   */
  private selectDimensions(
    input: PathGenerationInput,
    userState: UserState
  ): string[] {
    if (input.thinkingTypeId) {
      return [input.thinkingTypeId];
    }

    // 如果用户没有任何进度，返回所有维度（按推荐顺序）
    if (userState.criticalThinkingProgress.length === 0) {
      return [
        'fallacy_detection', // 最基础
        'causal_analysis',
        'premise_challenge',
        'iterative_reflection',
        'connection_transfer', // 最高级
      ];
    }

    // 根据用户进度选择下一个维度
    const dimensionOrder = [
      'fallacy_detection',
      'causal_analysis',
      'premise_challenge',
      'iterative_reflection',
      'connection_transfer',
    ];

    const completedDimensions = userState.criticalThinkingProgress
      .filter((cp) => cp.progressPercentage >= 80)
      .map((cp) => cp.thinkingTypeId);

    const nextDimension = dimensionOrder.find(
      (dim) => !completedDimensions.includes(dim)
    );

    return nextDimension ? [nextDimension] : [dimensionOrder[0]];
  }

  /**
   * 确定起始Level
   */
  private determineStartLevel(
    userState: UserState,
    thinkingTypeId?: string
  ): number {
    if (!thinkingTypeId) return 1;

    const progress = userState.criticalThinkingProgress.find(
      (cp) => cp.thinkingTypeId === thinkingTypeId
    );

    if (!progress) return 1;

    // 根据当前Level和进度决定起始点
    const currentLevel = progress.currentLevel;
    const levelProgress = [
      progress.level1Progress,
      progress.level2Progress,
      progress.level3Progress,
      progress.level4Progress,
      progress.level5Progress,
    ];

    const currentLevelProgress = levelProgress[currentLevel - 1] || 0;

    // 如果当前Level完成度低于50%，从当前Level开始
    if (currentLevelProgress < 50) {
      return currentLevel;
    }

    // 如果当前Level完成度高于80%，进入下一Level
    if (currentLevelProgress > 80 && currentLevel < 5) {
      return currentLevel + 1;
    }

    return currentLevel;
  }

  /**
   * 创建理论学习步骤
   */
  private async createTheorySteps(
    thinkingTypeId: string,
    level: number
  ): Promise<PathStep[]> {
    const theoryContent = await prisma.theoryContent.findFirst({
      where: {
        thinkingTypeId,
        level,
        isPublished: true,
      },
    });

    if (!theoryContent) {
      console.warn(`[PathGenerationEngine] No theory content found for ${thinkingTypeId} level ${level}`);
      return [];
    }

    const dimensionName = THINKING_TYPE_NAMES[thinkingTypeId] || thinkingTypeId;

    return [
      {
        id: `theory_${thinkingTypeId}_${level}`,
        type: 'learning',
        title: `${dimensionName} - Level ${level} 理论学习`,
        description: theoryContent.description || theoryContent.title,
        thinkingTypeId,
        level,
        contentId: theoryContent.id,
        contentType: 'theory',
        status: 'locked',
        completed: false,
        progressPercent: 0,
        prerequisites: [],
        unlocks: [],
        estimatedTime: theoryContent.estimatedTime,
        difficulty: theoryContent.difficulty as any,
        href: `/learn/critical-thinking/${thinkingTypeId}/theory/${level}`,
      },
    ];
  }

  /**
   * 创建实践练习步骤
   */
  private async createPracticeSteps(
    thinkingTypeId: string,
    level: number
  ): Promise<PathStep[]> {
    const practiceContents = await prisma.levelLearningContent.findMany({
      where: {
        thinkingTypeId,
        level,
      },
      orderBy: { orderIndex: 'asc' },
    });

    const dimensionName = THINKING_TYPE_NAMES[thinkingTypeId] || thinkingTypeId;

    if (practiceContents.length === 0) {
      // 如果没有专门的实践内容，创建通用练习步骤
      return [
        {
          id: `practice_${thinkingTypeId}_${level}`,
          type: 'practice',
          title: `${dimensionName} - Level ${level} 实践练习`,
          description: `完成 Level ${level} 的实践练习题目`,
          thinkingTypeId,
          level,
          contentType: 'practice',
          status: 'locked',
          completed: false,
          progressPercent: 0,
          prerequisites: [],
          unlocks: [],
          estimatedTime: 30,
          difficulty: level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced',
          href: `/learn/critical-thinking/${thinkingTypeId}/practice`,
        },
      ];
    }

    return practiceContents.map((content) => ({
      id: `practice_${content.id}`,
      type: 'practice' as const,
      title: content.title,
      description: content.description,
      thinkingTypeId,
      level,
      contentId: content.id,
      contentType: 'practice' as const,
      status: 'locked' as const,
      completed: false,
      progressPercent: 0,
      prerequisites: [],
      unlocks: [],
      estimatedTime: content.estimatedTime,
      difficulty: (level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced') as any,
      href: `/learn/critical-thinking/${thinkingTypeId}/practice`,
    }));
  }

  /**
   * 创建评估步骤
   */
  private createAssessmentStep(
    thinkingTypeId: string,
    level: number
  ): PathStep {
    const dimensionName = THINKING_TYPE_NAMES[thinkingTypeId] || thinkingTypeId;

    return {
      id: `assessment_${thinkingTypeId}_${level}`,
      type: 'assessment',
      title: `${dimensionName} - Level ${level} 评估测试`,
      description: `完成 Level ${level} 的综合评估`,
      thinkingTypeId,
      level,
      status: 'locked',
      completed: false,
      progressPercent: 0,
      prerequisites: [],
      unlocks: [],
      estimatedTime: 20,
      difficulty: level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced',
      href: `/learn/critical-thinking/${thinkingTypeId}/practice`,
    };
  }

  /**
   * 创建反思步骤
   */
  private createReflectionStep(
    thinkingTypeId: string,
    level: number
  ): PathStep {
    const dimensionName = THINKING_TYPE_NAMES[thinkingTypeId] || thinkingTypeId;

    return {
      id: `reflection_${thinkingTypeId}_${level}`,
      type: 'reflection',
      title: `${dimensionName} - Level ${level} 学习反思`,
      description: `回顾 Level ${level} 的学习内容，总结收获`,
      thinkingTypeId,
      level,
      status: 'locked',
      completed: false,
      progressPercent: 0,
      prerequisites: [],
      unlocks: [],
      estimatedTime: 15,
      difficulty: level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced',
      href: `/learn/critical-thinking/${thinkingTypeId}/practice`,
    };
  }

  /**
   * 计算prerequisite关系
   */
  private calculatePrerequisites(steps: PathStep[]): PathStep[] {
    const stepMap = new Map<string, PathStep>();
    steps.forEach((step) => stepMap.set(step.id, step));

    // 按维度和Level分组
    const grouped: Record<string, PathStep[]> = {};
    for (const step of steps) {
      const key = `${step.thinkingTypeId}_${step.level}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(step);
    }

    // 计算每个步骤的前置条件
    for (const step of steps) {
      step.prerequisites = [];
      step.unlocks = [];

      const sameLevelSteps = grouped[`${step.thinkingTypeId}_${step.level}`] || [];

      // 1. 同Level内的依赖：实践依赖理论
      if (step.type === 'practice') {
        const theoryStep = sameLevelSteps.find(
          (s) => s.type === 'learning' && s.contentType === 'theory'
        );
        if (theoryStep) {
          step.prerequisites.push(theoryStep.id);
        }
      }

      // 2. 评估依赖该Level所有学习和实践
      if (step.type === 'assessment') {
        const learningAndPractice = sameLevelSteps.filter(
          (s) => s.type === 'learning' || s.type === 'practice'
        );
        step.prerequisites.push(...learningAndPractice.map((s) => s.id));
      }

      // 3. 反思依赖评估
      if (step.type === 'reflection') {
        const assessmentStep = sameLevelSteps.find((s) => s.type === 'assessment');
        if (assessmentStep) {
          step.prerequisites.push(assessmentStep.id);
        } else {
          // 如果没有评估，依赖所有学习和实践
          const learningAndPractice = sameLevelSteps.filter(
            (s) => s.type === 'learning' || s.type === 'practice'
          );
          step.prerequisites.push(...learningAndPractice.map((s) => s.id));
        }
      }

      // 4. 同维度Level间依赖
      if (step.level > 1) {
        const prevLevelSteps = grouped[`${step.thinkingTypeId}_${step.level - 1}`] || [];

        // 找到上一Level的最后一个步骤（评估或反思）
        const lastPrevStep =
          prevLevelSteps.find((s) => s.type === 'reflection') ||
          prevLevelSteps.find((s) => s.type === 'assessment') ||
          prevLevelSteps[prevLevelSteps.length - 1];

        if (lastPrevStep && step.type === 'learning') {
          step.prerequisites.push(lastPrevStep.id);
        }
      }
    }

    // 计算unlocks（反向关系）
    for (const step of steps) {
      for (const prereqId of step.prerequisites) {
        const prereqStep = stepMap.get(prereqId);
        if (prereqStep && !prereqStep.unlocks.includes(step.id)) {
          prereqStep.unlocks.push(step.id);
        }
      }
    }

    // 设置初始解锁状态
    for (const step of steps) {
      if (step.prerequisites.length === 0) {
        step.status = 'available';
      }
    }

    return steps;
  }
}
