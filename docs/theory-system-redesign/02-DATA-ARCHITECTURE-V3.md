# 批判性思维理论体系 - 数据架构设计 V3 (质量增强版)

## 核心设计原则

### 1. 结构化优先
所有关键内容必须结构化存储,避免纯文本长段落,确保前端可以灵活渲染和突出重点。

### 2. 理论引用可追溯
实例演示中的每个分析步骤都能追溯到使用的概念和模型,建立清晰的知识关联。

### 3. 质量可验证
数据结构支持自动化质量检查,如字段完整性、字数要求、必填项验证等。

---

## 数据库Schema设计

### TheoryContent (核心表 - 增强版)

```prisma
model TheoryContent {
  id             String   @id @default(cuid())
  thinkingTypeId String   // 思维维度ID: causal_analysis, premise_challenge等
  level          Int      // Level 1-5

  // ===== 基础元数据 =====
  title          String
  subtitle       String?
  description    String   @db.Text
  learningObjectives Json  // 学习目标数组

  // ===== 核心概念章节 (结构化JSON) =====
  conceptsIntro      String?  @db.Text
  conceptsContent    Json     // ConceptsContent结构

  // ===== 思维模型章节 (结构化JSON) =====
  modelsIntro        String?  @db.Text
  modelsContent      Json     // ModelsContent结构

  // ===== 实例演示章节 (结构化JSON) =====
  demonstrationsIntro String?  @db.Text
  demonstrationsContent Json   // DemonstrationsContent结构

  // ===== 学习辅助信息 =====
  estimatedTime      Int      // 预计学习时间（分钟）
  difficulty         String   // beginner | intermediate | advanced
  tags               String[] // 标签数组
  keywords           String[] // 关键词（用于搜索）
  prerequisites      String[] // 前置内容ID数组
  relatedTopics      String[] // 相关主题ID数组

  // ===== 内容质量元数据 (新增) =====
  qualityMetrics     Json?    // 质量指标: { conceptsScore, modelsScore, demonstrationsScore, totalWords, structureScore }
  validationStatus   String   @default("draft") // draft | validated | published
  validationErrors   Json?    // 验证错误记录
  reviewNotes        String?  @db.Text // 人工审核备注

  // ===== 版本管理 =====
  version            String   @default("1.0.0")
  isPublished        Boolean  @default(false)
  publishedAt        DateTime?

  // ===== 使用统计 =====
  viewCount          Int      @default(0)
  completionRate     Float?
  userRating         Float?
  feedbackCount      Int      @default(0)

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // ===== 关系 =====
  thinkingType       ThinkingType @relation(fields: [thinkingTypeId], references: [id], onDelete: Cascade)
  userProgress       TheoryProgress[]
  contentFeedback    TheoryContentFeedback[]

  @@unique([thinkingTypeId, level, version])
  @@index([thinkingTypeId])
  @@index([level])
  @@index([isPublished])
  @@index([validationStatus])
  @@map("theory_content")
}
```

### TheoryContentFeedback (新增 - 用户反馈表)

```prisma
model TheoryContentFeedback {
  id              String   @id @default(cuid())
  theoryContentId String
  userId          String

  // 反馈类型
  feedbackType    String   // quality_issue | content_error | suggestion
  section         String   // concepts | models | demonstrations

  // 详细反馈
  rating          Int?     // 1-5星评分
  comment         String   @db.Text
  specificIssue   Json?    // { conceptId, stepNumber, issueDescription }

  // 处理状态
  status          String   @default("pending") // pending | reviewed | resolved
  adminResponse   String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  theoryContent   TheoryContent @relation(fields: [theoryContentId], references: [id], onDelete: Cascade)
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([theoryContentId])
  @@index([userId])
  @@index([status])
  @@map("theory_content_feedback")
}
```

---

## JSON结构定义 (TypeScript类型)

### 1. ConceptsContent (核心概念)

```typescript
/**
 * 核心概念章节内容
 * 要求: 结构化、多层级、可视化
 */
interface ConceptsContent {
  intro: string; // 章节引言 (200-300字)

  concepts: Array<{
    conceptId: string; // 唯一标识符 (如: cause-effect-standards)
    name: string; // 概念名称 (如: 因果关系的三个判定标准)

    // 🆕 核心理念 (一句话精髓, 50-80字)
    coreIdea: string;

    // 基础定义
    definition: string; // 精确定义 (100-150字)
    whyImportant: string; // 为什么重要 (80-120字)

    // 🆕 多层级概念分解 (2-3层)
    conceptBreakdown?: {
      level1: ConceptLevel;
      level2?: ConceptLevel;
      level3?: ConceptLevel;
    };

    // 🆕 批判性思维框架 (3-4步检验方法)
    criticalThinkingFramework: {
      step1: string;
      step2: string;
      step3: string;
      step4?: string;
    };

    // 核心要点 (3-5个)
    keyPoints: string[];

    // 🆕 详细误区说明
    commonMisconceptions: Array<{
      misconception: string; // 误区描述
      truth: string; // 正确理解
      realExample: string; // 真实案例对比
    }>;

    // 🆕 真实世界应用案例 (2-3个)
    realWorldExamples: Array<{
      scenario: string; // 场景描述 (100-150字)
      application: string; // 如何应用该概念
      outcome: string; // 应用结果
    }>;

    // 🆕 增强的可视化指南
    visualizationGuide: {
      type: 'decision-tree' | 'flowchart' | 'comparison-matrix' | 'concept-map';
      description: string; // 图示说明
      structure: Record<string, string>; // 详细结构 (如: { root, branch1, branch2 })
    };
  }>;
}

/**
 * 概念层级 (用于多层级分解)
 */
interface ConceptLevel {
  title: string; // 子概念标题
  definition: string; // 定义 (100-150字)
  whyImportant: string; // 重要性说明
  example: string; // 示例
  practicalTest: string; // 如何检验是否理解
}
```

### 2. ModelsContent (思维模型)

```typescript
/**
 * 思维模型章节内容
 * 要求: 可操作、详细步骤、完整案例
 */
interface ModelsContent {
  intro: string; // 章节引言 (150-200字)

  models: Array<{
    modelId: string; // 唯一标识符 (如: fishbone-analysis)
    name: string; // 模型名称 (如: 鱼骨图分析法)
    purpose: string; // 模型用途 (50-80字)
    description: string; // 模型说明 (200-300字)

    // 🆕 框架核心逻辑
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

    // 🆕 详细步骤 (3-8步, 每步300-500字)
    steps: Array<{
      stepNumber: number;
      title: string; // 步骤标题
      description: string; // 详细说明 (300-500字)

      // 🆕 关键思考点 (3-5个)
      keyThinkingPoints: string[];

      // 🆕 常见陷阱 (2-3个)
      commonPitfalls: Array<{
        mistake: string; // 错误描述
        example: string; // 错误示例
        correction: string; // 正确做法
      }>;

      practicalExample: string; // 实际应用示例 (100-150字)
      tips: string; // 实用技巧
      nextStepRationale?: string; // 🆕 为什么要进行下一步
    }>;

    // 🆕 增强的可视化
    visualization: {
      type: 'flowchart' | 'diagram' | 'table' | 'mindmap';
      description: string; // 可视化描述
      legend: string; // 图例说明
      stepByStepDrawing: string[]; // 🆕 绘图步骤 (如何画这个图)
    };

    // 适用性说明
    whenToUse: string; // 适用场景 (80-120字)
    limitations: string; // 局限性 (50-80字)

    // 🆕 完整应用案例
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
```

### 3. DemonstrationsContent (实例演示)

```typescript
/**
 * 实例演示章节内容
 * 要求: 理论关联、详细过程、可迁移
 */
interface DemonstrationsContent {
  intro: string; // 章节引言 (100-150字)

  demonstrations: Array<{
    demoId: string; // 唯一标识符
    title: string; // 案例标题
    category: string; // 场景类别 (商业、生活、学术等)

    // 🆕 学习目标
    learningObjective: string; // 本案例要学什么 (80-120字)

    // 🆕 理论基础 (关联到核心概念和思维模型)
    theoreticalFoundation: {
      conceptsUsed: string[]; // 使用的概念 (如: "因果三标准 (核心概念1.1)")
      modelsUsed: string[]; // 使用的模型 (如: "鱼骨图分析法 (思维模型2.1)")
    };

    // 背景设定
    scenario: {
      background: string; // 背景描述 (300-400字)
      keyData: string[]; // 🆕 关键数据点
      problemStatement: string; // 核心问题 (50-80字)
    };

    // 🆕 详细分析过程 (每步200-300字)
    stepByStepAnalysis: Array<{
      stepNumber: number;
      action: string; // 分析步骤标题

      // 🆕 明确标注使用的理论
      conceptApplied: string; // 使用了哪个概念
      modelApplied?: string; // 使用了哪个模型 (可选)

      thinkingProcess: string; // 详细思维过程 (200-300字)

      // 🆕 批判性思考点
      criticalThinkingPoint: string; // 这一步的关键思考点 (80-120字)

      toolOutput: any; // 该步骤的输出结果 (可以是字符串、对象或数组)
      nextStepRationale: string; // 🆕 为什么要进行下一步
    }>;

    // 🆕 关键洞察 (从案例中学到的通用原则)
    keyInsights: Array<{
      insight: string; // 洞察点 (50-80字)
      explanation: string; // 解释 (100-150字)
      generalPrinciple: string; // 可迁移的通用原则
      applicableScenarios: string; // 适用场景
    }>;

    // 🆕 本案例中的常见错误
    commonMistakesInThisCase: Array<{
      mistake: string; // 错误描述
      consequence: string; // 后果
      correction: string; // 正确做法
    }>;

    // 🆕 可迁移技能
    transferableSkills: string[]; // 从本案例中学到的可迁移技能

    // 🆕 练习引导
    practiceGuidance: string; // 引导用户到练习系统 (50-80字)
  }>;
}
```

### 4. QualityMetrics (质量指标)

```typescript
/**
 * 内容质量指标 (用于自动验证)
 */
interface QualityMetrics {
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
```

---

## 数据验证规则

### 核心概念验证规则

```typescript
const conceptsValidation = {
  intro: { minLength: 200, maxLength: 400 },
  concepts: {
    minCount: 1,
    maxCount: 5,
    fields: {
      conceptId: { required: true, pattern: /^[a-z0-9-]+$/ },
      name: { required: true, minLength: 5, maxLength: 50 },
      coreIdea: { required: true, minLength: 50, maxLength: 120 },
      definition: { required: true, minLength: 100, maxLength: 200 },
      whyImportant: { required: true, minLength: 80, maxLength: 150 },
      conceptBreakdown: {
        required: false,
        level1: { required: true },
        level2: { required: false },
      },
      criticalThinkingFramework: {
        required: true,
        minSteps: 3,
        maxSteps: 4,
      },
      keyPoints: { minCount: 3, maxCount: 5 },
      commonMisconceptions: { minCount: 2, maxCount: 4 },
      realWorldExamples: { minCount: 1, maxCount: 3 },
      visualizationGuide: { required: true },
    },
  },
};
```

### 思维模型验证规则

```typescript
const modelsValidation = {
  intro: { minLength: 150, maxLength: 250 },
  models: {
    minCount: 1,
    maxCount: 3,
    fields: {
      modelId: { required: true, pattern: /^[a-z0-9-]+$/ },
      name: { required: true, minLength: 5, maxLength: 50 },
      purpose: { required: true, minLength: 50, maxLength: 100 },
      coreLogic: { required: true },
      steps: {
        minCount: 3,
        maxCount: 8,
        stepValidation: {
          description: { minLength: 300, maxLength: 600 },
          keyThinkingPoints: { minCount: 3, maxCount: 5 },
          commonPitfalls: { minCount: 2, maxCount: 3 },
          practicalExample: { minLength: 100, maxLength: 200 },
        },
      },
      visualization: { required: true },
      fullApplicationExample: { required: true },
    },
  },
};
```

### 实例演示验证规则

```typescript
const demonstrationsValidation = {
  intro: { minLength: 100, maxLength: 200 },
  demonstrations: {
    minCount: 1,
    maxCount: 3,
    fields: {
      demoId: { required: true, pattern: /^[a-z0-9-]+$/ },
      learningObjective: { required: true, minLength: 80, maxLength: 150 },
      theoreticalFoundation: {
        conceptsUsed: { minCount: 1 },
        modelsUsed: { minCount: 0 }, // 可选
      },
      scenario: {
        background: { minLength: 300, maxLength: 500 },
        keyData: { minCount: 3 },
      },
      stepByStepAnalysis: {
        minCount: 3,
        maxCount: 10,
        stepValidation: {
          conceptApplied: { required: true },
          thinkingProcess: { minLength: 200, maxLength: 400 },
          criticalThinkingPoint: { minLength: 80, maxLength: 150 },
        },
      },
      keyInsights: { minCount: 3, maxCount: 5 },
      commonMistakesInThisCase: { minCount: 2, maxCount: 4 },
      transferableSkills: { minCount: 3, maxCount: 5 },
    },
  },
};
```

---

## 迁移策略

### 从现有Schema迁移到V3

```sql
-- 1. 添加新字段
ALTER TABLE theory_content
ADD COLUMN "qualityMetrics" JSONB,
ADD COLUMN "validationStatus" TEXT DEFAULT 'draft',
ADD COLUMN "validationErrors" JSONB,
ADD COLUMN "reviewNotes" TEXT,
ADD COLUMN "feedbackCount" INTEGER DEFAULT 0;

-- 2. 创建索引
CREATE INDEX idx_theory_content_validation_status
ON theory_content(validation_status);

-- 3. 创建反馈表
CREATE TABLE theory_content_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  theory_content_id TEXT NOT NULL REFERENCES theory_content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  section TEXT NOT NULL,
  rating INTEGER,
  comment TEXT NOT NULL,
  specific_issue JSONB,
  status TEXT DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_theory_content ON theory_content_feedback(theory_content_id);
CREATE INDEX idx_feedback_user ON theory_content_feedback(user_id);
CREATE INDEX idx_feedback_status ON theory_content_feedback(status);
```

---

## 总结

新的数据架构具有以下特点:

1. **结构化优先**: 所有内容都有明确的JSON Schema,避免纯文本
2. **理论可追溯**: 实例演示的每一步都关联到概念和模型
3. **质量可验证**: 内置验证规则和质量指标
4. **用户反馈闭环**: 新增反馈表,持续改进内容质量
5. **版本管理**: 支持内容迭代和A/B测试

下一步: 创建增强版AI Prompt模板
