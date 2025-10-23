// ============ 通用类型 ============
export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

// ============ AI模型类型 ============
export type AIModel = 'deepseek-v3.1' | 'qwen3-max';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIRequestOptions = {
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
};

// ============ 苏格拉底对话类型 ============
export type MessageType = 'initial' | 'followup';

export type ConversationWithMessages = {
  id: string;
  userId: string;
  title: string;
  topic: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

// ============ 论点解构类型 ============
export type EvidenceType = '事实' | '数据' | '案例';
export type EvidenceStrength = 'strong' | 'moderate' | 'weak';
export type AssumptionImpact = 'high' | 'medium' | 'low';
export type FallacySeverity = 'major' | 'minor';

export type Evidence = {
  text: string;
  type: EvidenceType;
  strength: EvidenceStrength;
};

export type Assumption = {
  assumption: string;
  validity: string;
  impact: AssumptionImpact;
};

export type Fallacy = {
  type: string;
  description: string;
  location: string;
  severity: FallacySeverity;
};

export type ArgumentAnalysisResult = {
  mainClaim: string;
  evidence: Evidence[];
  assumptions: Assumption[];
  fallacies: Fallacy[];
};

// ============ 多棱镜视角类型 ============
export type RoleConfig = {
  name: string;
  background: string;
  values: string[];
  systemPrompt: string;
};

export type PerspectiveData = {
  id: string;
  roleName: string;
  viewpoint: string;
  roleConfig: RoleConfig;
  createdAt: Date;
};

export type PerspectiveSessionWithData = {
  id: string;
  userId: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
  perspectives: PerspectiveData[];
  messages: {
    id: string;
    perspectiveId: string | null;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

// ============ 用户类型 ============
export type UserWithSettings = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  settings: {
    defaultModel: string;
    theme: string;
    language: string;
    enableAnalytics: boolean;
  } | null;
};

// ============ 批判性思维类型 ============
export type ThinkingTypeId = 'causal_analysis' | 'premise_challenge' | 'fallacy_detection' | 'iterative_reflection' | 'connection_transfer';

export type ThinkingType = {
  id: ThinkingTypeId;
  name: string;
  description: string;
  icon: string;
  learningContent: {
    framework: string;
    methods: string[];
    examples?: any[];
  };
  createdAt: Date;
};

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CognitiveLevel = 1 | 2 | 3 | 4 | 5;

export type CriticalThinkingQuestion = {
  id: string;
  thinkingTypeId: ThinkingTypeId;
  content: string;  // 题目主要内容
  scenario?: string;  // 背景情境描述
  topic: string;
  context: string;
  tags: string[];
  thinkingFramework: {
    coreChallenge: string;
    commonPitfalls: string[];
    excellentResponseIndicators: string[];
  };
  expectedOutcomes: string[];
  guidingQuestions?: {
    id: string;
    question: string;
    purpose: string;
    orderIndex: number;
  }[];
  // Level 1-5 fields (removed difficulty field)
  level: CognitiveLevel;
  learningObjectives?: string[];
  scaffolding?: {
    tools?: string[];
    checklists?: string[];
    frameworks?: string[];
    hints?: string[];
  };
  assessmentCriteria?: {
    [key: string]: {
      weight: number;
      description: string;
    };
  };
  caseAnalysis?: any; // JSON field from database
  isCompleted?: boolean; // Added by API for completion status
  completedAt?: Date | null; // Added by API for completion tracking
  lastScore?: number | null; // Added by API for last score
  createdAt: Date;
};

export type CriticalThinkingGuidingQuestion = {
  id: string;
  questionId: string;
  level: string; // Changed from DifficultyLevel to string (e.g., "level_1", "level_2")
  stage: string;
  question: string;
  orderIndex: number;
};

export type CriticalThinkingProgress = {
  id: string;
  userId: string;
  thinkingTypeId: ThinkingTypeId;
  progressPercentage: number;
  questionsCompleted: number;
  averageScore: number;
  lastUpdated: Date;
  // Level 1-5 progression tracking
  currentLevel: CognitiveLevel;
  level1Progress: number;  // 0-100
  level2Progress: number;
  level3Progress: number;
  level4Progress: number;
  level5Progress: number;
  level1Unlocked: boolean;
  level2Unlocked: boolean;
  level3Unlocked: boolean;
  level4Unlocked: boolean;
  level5Unlocked: boolean;
};

export type PracticeStepProgress = {
  currentStep: number;  // 1-6
  steps: {
    [key: string]: {
      completed: boolean;
      timestamp?: string;
      timeSpent?: number;
      data?: any;
    };
  };
  totalTimeSpent: number;
};

export type CriticalThinkingPracticeSession = {
  id: string;
  userId: string;
  questionId: string;
  answers: {
    stage: string;
    answer: string;
    timestamp: Date;
  }[];
  score?: number;
  aiFeedback?: string;
  evaluationDetails?: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  timeSpent: number;
  completedAt: Date;
  // Level-based practice tracking
  level: CognitiveLevel;
  stepProgress?: PracticeStepProgress;
  reflectionNotes?: string;
  improvementPlan?: string;
};

export type ThinkingTypeProgress = {
  type: ThinkingTypeId;
  progress: number;
  questionsCompleted: number;
  averageScore: number;
};

export type PracticeStats = {
  totalQuestions: number;
  correctRate: number;
  totalTimeSpent: number;
};

export type AbilityScore = {
  type: ThinkingTypeId;
  score: number;
  label: string;
};

export type ProgressResponse = {
  overallProgress: number;
  typeProgress: ThinkingTypeProgress[];
  practiceStats: PracticeStats;
  abilityRadar: AbilityScore[];
};

export type PracticeEvaluation = {
  score: number; // 百分制总分 (0-100)
  scores: {
    depth: number; // 思维深度 (0-100)
    logic: number; // 逻辑性 (0-100)
    critical: number; // 批判性 (0-100)
    completeness: number; // 完整性 (0-100)
    innovation: number; // 创新性 (0-100)
  };
  feedback: string;
  suggestions: string[];
  strengths: string;
  improvements: string;
  keyLearnings: string;
};

export type LevelContentType = 'theory' | 'case_study' | 'practice' | 'reflection';

export type LevelLearningContent = {
  id: string;
  thinkingTypeId: ThinkingTypeId;
  level: CognitiveLevel;
  contentType: LevelContentType;
  title: string;
  description: string;
  content: {
    sections?: Array<{
      type: 'text' | 'interactive_animation' | 'game' | 'video' | 'checklist';
      content: string | any;
    }>;
    [key: string]: any;
  };
  estimatedTime: number;  // minutes
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LevelUnlockCriteria = {
  minQuestions: number;
  minAccuracy: number;  // percentage 0-100
};

export type LevelUnlockProgress = {
  questionsCompleted: number;
  questionsRequired: number;
  averageScore: number;
  requiredScore: number;
  canUnlock: boolean;
  message: string;
};
