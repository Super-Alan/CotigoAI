/**
 * Theory System V3 - TypeScript Type Definitions
 *
 * Enhanced type definitions for structured, high-quality theory content
 * Based on design document: docs/theory-system-redesign/02-DATA-ARCHITECTURE-V3.md
 */

// ==================== Core Content Types ====================

/**
 * 概念层级 - 用于多层级概念分解
 */
export interface ConceptLevel {
  title: string; // 子概念标题
  definition: string; // 定义 (100-150字)
  whyImportant: string; // 重要性说明
  example: string; // 示例
  practicalTest: string; // 如何检验是否理解
}

/**
 * 核心概念内容
 * 要求: 结构化、多层级、可视化
 */
export interface ConceptsContent {
  intro: string; // 章节引言 (200-300字)

  concepts: Array<{
    conceptId: string; // 唯一标识符 (如: cause-effect-standards)
    name: string; // 概念名称 (如: 因果关系的三个判定标准)

    // 核心理念 (一句话精髓, 50-80字)
    coreIdea: string;

    // 基础定义
    definition: string; // 精确定义 (100-150字)
    whyImportant: string; // 为什么重要 (80-120字)

    // 多层级概念分解 (2-3层)
    conceptBreakdown?: {
      level1: ConceptLevel;
      level2?: ConceptLevel;
      level3?: ConceptLevel;
    };

    // 批判性思维框架 (3-4步检验方法)
    criticalThinkingFramework: {
      step1: string;
      step2: string;
      step3: string;
      step4?: string;
    };

    // 核心要点 (3-5个)
    keyPoints: string[];

    // 详细误区说明
    commonMisconceptions: Array<{
      misconception: string; // 误区描述
      truth: string; // 正确理解
      realExample: string; // 真实案例对比
    }>;

    // 真实世界应用案例 (2-3个)
    realWorldExamples: Array<{
      scenario: string; // 场景描述 (100-150字)
      application: string; // 如何应用该概念
      outcome: string; // 应用结果
    }>;

    // 增强的可视化指南
    visualizationGuide: {
      type: 'decision-tree' | 'flowchart' | 'comparison-matrix' | 'concept-map';
      description: string; // 图示说明
      structure: Record<string, string>; // 详细结构 (如: { root, branch1, branch2 })
    };
  }>;
}

/**
 * 思维模型内容
 * 要求: 可操作、详细步骤、完整案例
 */
export interface ModelsContent {
  intro: string; // 章节引言 (150-200字)

  models: Array<{
    modelId: string; // 唯一标识符 (如: fishbone-analysis)
    name: string; // 模型名称 (如: 鱼骨图分析法)
    purpose: string; // 模型用途 (50-80字)
    description: string; // 模型说明 (200-300字)

    // 框架核心逻辑
    coreLogic: {
      principle: string; // 底层原理 (为什么这个框架有效)
      whenWorks: string; // 什么情况下有效
      whenFails: string; // 什么情况下失效
    };

    // 模型结构
    structure: {
      type: 'linear' | 'matrix' | 'network' | 'hierarchy';
      components: string[]; // 组件列表
      relationships: string; // 组件关系说明
    };

    // 详细步骤 (3-8步, 每步300-500字)
    steps: Array<{
      stepNumber: number;
      title: string; // 步骤标题
      description: string; // 详细说明 (300-500字)

      // 关键思考点 (3-5个)
      keyThinkingPoints: string[];

      // 常见陷阱 (2-3个)
      commonPitfalls: Array<{
        mistake: string; // 错误描述
        example: string; // 错误示例
        correction: string; // 正确做法
      }>;

      practicalExample: string; // 实际应用示例 (100-150字)
      tips: string; // 实用技巧
      nextStepRationale?: string; // 为什么要进行下一步
    }>;

    // 增强的可视化
    visualization: {
      type: 'flowchart' | 'diagram' | 'table' | 'mindmap';
      description: string; // 可视化描述
      legend: string; // 图例说明
      stepByStepDrawing: string[]; // 绘图步骤 (如何画这个图)
    };

    // 适用性说明
    whenToUse: string; // 适用场景 (80-120字)
    limitations: string; // 局限性 (50-80字)

    // 完整应用案例
    fullApplicationExample: {
      scenario: string; // 背景 (200-300字)
      stepByStepApplication: Array<{
        step: number;
        action: string;
        thinking: string; // 思考过程
        output: string; // 输出结果
      }>;
      outcome: string; // 最终结果 (100-150字)
    };
  }>;
}

/**
 * 实例演示内容
 * 要求: 理论关联、详细过程、可迁移
 */
export interface DemonstrationsContent {
  intro: string; // 章节引言 (100-150字)

  demonstrations: Array<{
    demoId: string; // 唯一标识符
    title: string; // 案例标题
    category: string; // 场景类别 (商业、生活、学术等)

    // 学习目标
    learningObjective: string; // 本案例要学什么 (80-120字)

    // 理论基础 (关联到核心概念和思维模型)
    theoreticalFoundation: {
      conceptsUsed: string[]; // 使用的概念 (如: "因果三标准 (核心概念1.1)")
      modelsUsed: string[]; // 使用的模型 (如: "鱼骨图分析法 (思维模型2.1)")
    };

    // 背景设定
    scenario: {
      background: string; // 背景描述 (300-400字)
      keyData: string[]; // 关键数据点
      problemStatement: string; // 核心问题 (50-80字)
    };

    // 详细分析过程 (每步200-300字)
    stepByStepAnalysis: Array<{
      stepNumber: number;
      action: string; // 分析步骤标题

      // 明确标注使用的理论
      conceptApplied: string; // 使用了哪个概念
      modelApplied?: string; // 使用了哪个模型 (可选)

      thinkingProcess: string; // 详细思维过程 (200-300字)

      // 批判性思考点
      criticalThinkingPoint: string; // 这一步的关键思考点 (80-120字)

      toolOutput: any; // 该步骤的输出结果 (可以是字符串、对象或数组)
      nextStepRationale: string; // 为什么要进行下一步
    }>;

    // 关键洞察 (从案例中学到的通用原则)
    keyInsights: Array<{
      insight: string; // 洞察点 (50-80字)
      explanation: string; // 解释 (100-150字)
      generalPrinciple: string; // 可迁移的通用原则
      applicableScenarios: string; // 适用场景
    }>;

    // 本案例中的常见错误
    commonMistakesInThisCase: Array<{
      mistake: string; // 错误描述
      consequence: string; // 后果
      correction: string; // 正确做法
    }>;

    // 可迁移技能
    transferableSkills: string[]; // 从本案例中学到的可迁移技能

    // 练习引导
    practiceGuidance: string; // 引导用户到练习系统 (50-80字)
  }>;
}

// ==================== Quality Metrics ====================

/**
 * 内容质量指标 (用于自动验证)
 */
export interface QualityMetrics {
  // 核心概念质量
  conceptsScore: {
    totalConcepts: number;
    conceptsWithBreakdown: number; // 有多层级分解的概念数
    conceptsWithFramework: number; // 有批判性思维框架的概念数
    conceptsWithVisualization: number; // 有可视化的概念数
    avgMisconceptionsPerConcept: number; // 平均误区数
    avgExamplesPerConcept: number; // 平均案例数
  };

  // 思维模型质量
  modelsScore: {
    totalModels: number;
    avgStepsPerModel: number; // 平均步骤数
    avgWordCountPerStep: number; // 平均每步字数
    stepsWithThinkingPoints: number; // 有思考点的步骤数
    stepsWithPitfalls: number; // 有陷阱说明的步骤数
    modelsWithFullExample: number; // 有完整案例的模型数
  };

  // 实例演示质量
  demonstrationsScore: {
    totalDemonstrations: number;
    avgStepsPerDemo: number; // 平均分析步骤数
    stepsWithTheoryLink: number; // 标注了理论关联的步骤数
    avgWordCountPerStep: number; // 平均每步字数
    demosWithInsights: number; // 有关键洞察的案例数
    demosWithMistakes: number; // 有常见错误的案例数
  };

  // 整体质量
  totalWords: number; // 总字数
  structureScore: number; // 结构完整性评分 (0-100)
  overallQualityScore: number; // 综合质量评分 (0-100)
}

// ==================== Validation Types ====================

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[]; // 严重错误
  warnings: string[]; // 警告建议
  metrics?: QualityMetrics; // 质量指标
}

/**
 * 验证规则配置
 */
export interface ValidationRules {
  concepts: {
    intro: { minLength: number; maxLength: number };
    coreIdea: { minLength: number; maxLength: number };
    definition: { minLength: number; maxLength: number };
    minCommonMisconceptions: number;
    minRealWorldExamples: number;
  };
  models: {
    intro: { minLength: number; maxLength: number };
    minSteps: number;
    maxSteps: number;
    stepDescription: { minLength: number; maxLength: number };
    minKeyThinkingPoints: number;
    minCommonPitfalls: number;
  };
  demonstrations: {
    intro: { minLength: number; maxLength: number };
    scenario: { minLength: number; maxLength: number };
    thinkingProcess: { minLength: number; maxLength: number };
    minKeyInsights: number;
    minCommonMistakes: number;
    minTransferableSkills: number;
  };
}

// ==================== Database Types ====================

/**
 * Theory Content V3 - Prisma model type augmentation
 */
export interface TheoryContentV3 {
  id: string;
  thinkingTypeId: string;
  level: number;

  // Basic info
  title: string;
  subtitle?: string;
  description: string;
  learningObjectives: any; // JSON

  // Content sections
  conceptsIntro?: string;
  conceptsContent: ConceptsContent;
  modelsIntro?: string;
  modelsContent: ModelsContent;
  demonstrationsIntro?: string;
  demonstrationsContent: DemonstrationsContent;

  // Metadata
  estimatedTime: number;
  difficulty: string;
  tags: string[];
  keywords: string[];
  prerequisites: string[];
  relatedTopics: string[];

  // V3 Quality fields
  qualityMetrics?: QualityMetrics;
  validationStatus: 'draft' | 'validated' | 'published';
  validationErrors?: any; // JSON
  reviewNotes?: string;
  feedbackCount: number;

  // Version
  version: string;
  isPublished: boolean;
  publishedAt?: Date;

  // Stats
  qualityScore?: number;
  viewCount: number;
  completionRate?: number;
  userRating?: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Theory Content Feedback
 */
export interface TheoryContentFeedback {
  id: string;
  theoryContentId: string;
  userId: string;

  feedbackType: 'quality_issue' | 'content_error' | 'suggestion' | 'praise';
  section: 'concepts' | 'models' | 'demonstrations' | 'general';

  rating?: number; // 1-5
  comment: string;
  specificIssue?: {
    conceptId?: string;
    modelId?: string;
    demoId?: string;
    stepNumber?: number;
    issueDescription: string;
  };

  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminResponse?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
