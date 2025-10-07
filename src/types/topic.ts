// 批判性思维五大维度
export enum CriticalThinkingDimension {
  CAUSAL_ANALYSIS = 'causal_analysis',        // 多维归因与利弊权衡
  PREMISE_CHALLENGE = 'premise_challenge',     // 前提质疑与方法批判
  FALLACY_DETECTION = 'fallacy_detection',     // 谬误识别与证据评估
  ITERATIVE_REFLECTION = 'iterative_reflection', // 观点迭代与反思
  CONNECTION_TRANSFER = 'connection_transfer'   // 关联与迁移
}

// 维度标签映射
export const DIMENSION_LABELS: Record<CriticalThinkingDimension, string> = {
  [CriticalThinkingDimension.CAUSAL_ANALYSIS]: '多维归因与利弊权衡',
  [CriticalThinkingDimension.PREMISE_CHALLENGE]: '前提质疑与方法批判',
  [CriticalThinkingDimension.FALLACY_DETECTION]: '谬误识别与证据评估',
  [CriticalThinkingDimension.ITERATIVE_REFLECTION]: '观点迭代与反思',
  [CriticalThinkingDimension.CONNECTION_TRANSFER]: '关联与迁移'
};

// 维度图标映射
export const DIMENSION_ICONS: Record<CriticalThinkingDimension, string> = {
  [CriticalThinkingDimension.CAUSAL_ANALYSIS]: '🔍',
  [CriticalThinkingDimension.PREMISE_CHALLENGE]: '❓',
  [CriticalThinkingDimension.FALLACY_DETECTION]: '⚖️',
  [CriticalThinkingDimension.ITERATIVE_REFLECTION]: '🔄',
  [CriticalThinkingDimension.CONNECTION_TRANSFER]: '🔗'
};

// 维度颜色映射
export const DIMENSION_COLORS: Record<CriticalThinkingDimension, string> = {
  [CriticalThinkingDimension.CAUSAL_ANALYSIS]: 'blue',
  [CriticalThinkingDimension.PREMISE_CHALLENGE]: 'purple',
  [CriticalThinkingDimension.FALLACY_DETECTION]: 'green',
  [CriticalThinkingDimension.ITERATIVE_REFLECTION]: 'orange',
  [CriticalThinkingDimension.CONNECTION_TRANSFER]: 'pink'
};

// 顶尖高校类型
export type TopUniversity = 'MIT' | 'Oxford' | 'Cambridge' | 'Stanford' | 'Harvard';

// 难度级别
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// 难度标签映射
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: '入门级',
  intermediate: '进阶级',
  advanced: '高级'
};

// 引导性问题
export interface GuidingQuestion {
  level: number;
  stage: string;
  question: string;
}

// 思维框架
export interface ThinkingFramework {
  coreChallenge: string;
  commonPitfalls: string[];
  excellentResponseIndicators: string[];
}

// 生成的话题
export interface GeneratedTopic {
  id?: string;
  topic: string;
  category: string;
  context: string;
  referenceUniversity: TopUniversity;
  dimension: CriticalThinkingDimension;
  difficulty: DifficultyLevel;
  tags: string[];
  thinkingFramework: ThinkingFramework;
  guidingQuestions: GuidingQuestion[];
  expectedOutcomes: string[];
  createdAt?: Date;
}

// 话题生成请求
export interface TopicGenerationRequest {
  dimension?: CriticalThinkingDimension;
  difficulty?: DifficultyLevel;
  preferredDomains?: string[];
  avoidTopics?: string[];
  count: number;
}

// 话题生成响应
export interface TopicGenerationResponse {
  topics: GeneratedTopic[];
  generatedAt: Date;
}
