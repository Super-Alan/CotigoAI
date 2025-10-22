/**
 * 学习路径系统类型定义
 * Learning Path System Type Definitions
 */

// ========== 核心路径类型 ==========

/**
 * 学习路径步骤
 */
export interface PathStep {
  id: string;
  type: 'assessment' | 'learning' | 'practice' | 'review' | 'reflection';
  title: string;
  description: string;

  // 关联内容
  thinkingTypeId: string;
  level: number;
  contentId?: string; // theory_content.id 或 LevelLearningContent.id
  contentType?: 'theory' | 'practice';

  // 进度状态
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completed: boolean;
  progressPercent: number; // 0-100

  // 依赖关系
  prerequisites: string[]; // 前置步骤ID数组
  unlocks: string[]; // 解锁的后续步骤ID数组

  // 估算与难度
  estimatedTime: number; // 分钟
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // 导航
  href: string; // 跳转链接

  // 用户数据
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // 实际花费时间（分钟）

  // 自适应元数据
  adaptiveMetadata?: {
    originalEstimatedTime: number;
    adjustmentReason?: string;
    difficultyAdjustment?: number; // -1: 简化, 0: 不变, 1: 提升
    isReinforcementStep?: boolean;
  };
}

/**
 * 完整学习路径
 */
export interface LearningPath {
  id: string;
  userId: string;

  // 路径配置
  pathType: 'adaptive' | 'linear' | 'custom';
  status: 'active' | 'paused' | 'completed';

  // 步骤列表
  steps: PathStep[];

  // 进度统计
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number; // 0-100

  // 时间统计
  totalTimeSpent: number;
  estimatedTimeLeft: number;

  // 元数据
  metadata: {
    targetDimensions: string[];
    learningStyle: 'theory_first' | 'practice_first' | 'balanced';
    difficultyLevel: 'auto' | 'beginner' | 'intermediate' | 'advanced';
    generatedAt: Date;
    lastAdjustedAt?: Date;
    adaptiveEnabled: boolean;
  };

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * 个性化推荐
 */
export interface PersonalizedRecommendation {
  type: 'weakness' | 'strength' | 'next_step' | 'review';
  priority: 'high' | 'medium' | 'low';

  title: string;
  description: string;
  action: string; // 行动按钮文案
  href: string; // 跳转链接

  thinkingTypeId?: string;
  level?: number;

  metadata?: {
    currentScore?: number;
    targetScore?: number;
    estimatedTime?: number;
    lastViewedAt?: Date;
    daysSince?: number;
    retentionProbability?: number;
    [key: string]: any;
  };
}

/**
 * 用户状态（用于路径生成）
 */
export interface UserState {
  userId: string;

  // 批判性思维进度
  criticalThinkingProgress: Array<{
    thinkingTypeId: string;
    currentLevel: number;
    questionsCompleted: number;
    progressPercentage: number;
    level1Progress: number;
    level2Progress: number;
    level3Progress: number;
    level4Progress: number;
    level5Progress: number;
    level1AverageScore: number;
    level2AverageScore: number;
    level3AverageScore: number;
    level4AverageScore: number;
    level5AverageScore: number;
  }>;

  // 理论学习进度
  theoryProgress: Array<{
    theoryContentId: string;
    status: string;
    progressPercent: number;
    sectionsCompleted: {
      concepts: boolean;
      models: boolean;
      demonstrations: boolean;
    };
    timeSpent: number;
    completedAt?: Date;
    lastViewedAt: Date;
  }>;

  // 用户偏好
  preferences: {
    learningStyle: 'theory_first' | 'practice_first' | 'balanced';
    dailyTimeGoal: number;
    enableAdaptivePath: boolean;
    autoUnlockLevels: boolean;
  };

  // 学习统计
  stats: {
    totalTimeSpent: number;
    averageSessionLength: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// ========== 分析类型 ==========

export interface PerformanceMetrics {
  score: number; // 0-1综合得分
  questionsCompleted: number;
  averageTheoryProgress: number; // 0-100
  timeEfficiency: number; // 0-1, 实际时间/预估时间
  strengthAreas: string[]; // 强项维度ID
  weaknessAreas: string[]; // 弱项维度ID
}

export interface WeaknessAnalysis {
  thinkingTypeId: string;
  dimensionName: string;
  score: number; // 0-100
  suggestedLevel: number; // 1-5
  estimatedTime: number; // 分钟
  reason: string;
}

export interface ReviewItem {
  contentId: string;
  contentTitle: string;
  contentUrl: string;
  lastViewedAt: Date;
  daysSince: number;
  retentionProbability: number; // 0-1
}

export interface CompetencyScore {
  overall: number; // 0-1综合得分
  theoryMastery: number; // 0-1
  practiceAccuracy: number; // 0-1
  timeEfficiency: number; // 0-1
  consistencyFactor: number; // 0-1
  level: number; // 1-5推荐Level
}

// ========== API请求/响应类型 ==========

export interface GeneratePathRequest {
  thinkingTypeId?: string;
  targetLevel?: number;
  timeAvailable?: number;
  learningStyle?: 'theory_first' | 'practice_first' | 'balanced';
  forceRegenerate?: boolean;
}

export interface GeneratePathResponse {
  success: boolean;
  data?: {
    path: LearningPath;
    summary: {
      totalSteps: number;
      estimatedTotalTime: number;
      dimensionsCovered: string[];
      levelRange: { min: number; max: number };
    };
  };
  cached?: boolean;
  error?: string;
}

export interface CurrentPathResponse {
  success: boolean;
  data?: {
    path: LearningPath | null;
    currentStep: PathStep | null;
    nextSteps: PathStep[];
    recentlyCompleted: PathStep[];
  };
  error?: string;
}

export interface UpdateProgressRequest {
  stepId: string;
  action: 'start' | 'complete' | 'update';
  progressPercent?: number;
  timeSpent?: number;
}

export interface UpdateProgressResponse {
  success: boolean;
  data?: {
    step: PathStep;
    unlockedSteps: PathStep[];
    pathProgress: {
      completedSteps: number;
      totalSteps: number;
      progressPercent: number;
      estimatedTimeLeft: number;
    };
    achievements?: Achievement[];
  };
  error?: string;
}

export interface RecommendationsResponse {
  success: boolean;
  data?: {
    recommendations: PersonalizedRecommendation[];
    generatedAt: Date;
  };
  error?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  badgeIcon?: string;
  rarity: number;
  earnedAt: Date;
}

// ========== 路径生成配置 ==========

export interface PathGenerationInput {
  userId: string;
  thinkingTypeId?: string;
  targetLevel?: number;
  timeAvailable?: number;
  learningStyle?: 'theory_first' | 'practice_first' | 'balanced';
}

export interface AdaptiveConfig {
  enableDifficultyAdjustment: boolean;
  enableTimeOptimization: boolean;
  enableReinforcementSteps: boolean;
  minStepsPerLevel: number;
  maxStepsPerLevel: number;
}

// ========== 思维维度映射 ==========

export const THINKING_TYPE_NAMES: Record<string, string> = {
  causal_analysis: '多维归因与利弊权衡',
  premise_challenge: '前提质疑与方法批判',
  fallacy_detection: '谬误检测',
  iterative_reflection: '迭代反思',
  connection_transfer: '知识迁移',
};

export const DIFFICULTY_LEVELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

export const STEP_TYPE_LABELS: Record<PathStep['type'], string> = {
  learning: '理论学习',
  practice: '实践练习',
  assessment: '评估测试',
  review: '复习巩固',
  reflection: '反思总结',
};
