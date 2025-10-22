# Level 1-5 Practice Flow 设计方案

## 1. 概述

基于现有5大核心思维维度（causal_analysis, premise_challenge, fallacy_detection, iterative_reflection, connection_transfer），设计Level 1-5渐进式学习体系。

**认知理论基础**：
- 布鲁姆认知层次理论
- 维果茨基最近发展区理论
- 认知负荷理论

**核心原则**：
- 渐进性：从具体到抽象，从简单到复杂
- 个性化：基于用户能力自适应调整
- 反思性：强化元认知和自我调节

## 2. 数据库Schema扩展

### 2.1 扩展现有表

```prisma
// CriticalThinkingQuestion 添加 level 字段
model CriticalThinkingQuestion {
  // ... 现有字段
  level              Int       @default(1)  // Level 1-5
  learningObjectives Json      // 学习目标
  scaffolding        Json?     // 思维脚手架（Level 1-3使用）
  assessmentCriteria Json      // 评估标准

  @@index([level])
}

// CriticalThinkingProgress 添加 Level 追踪
model CriticalThinkingProgress {
  // ... 现有字段
  currentLevel       Int       @default(1)  // 当前Level
  level1Progress     Int       @default(0)  // Level 1进度 0-100
  level2Progress     Int       @default(0)  // Level 2进度 0-100
  level3Progress     Int       @default(0)  // Level 3进度 0-100
  level4Progress     Int       @default(0)  // Level 4进度 0-100
  level5Progress     Int       @default(0)  // Level 5进度 0-100
  level1Unlocked     Boolean   @default(true)   // Level 1默认解锁
  level2Unlocked     Boolean   @default(false)
  level3Unlocked     Boolean   @default(false)
  level4Unlocked     Boolean   @default(false)
  level5Unlocked     Boolean   @default(false)
}

// CriticalThinkingPracticeSession 添加反思记录
model CriticalThinkingPracticeSession {
  // ... 现有字段
  level              Int       // 练习时的Level
  stepProgress       Json      // 6步进度记录
  reflectionNotes    String?   // 反思笔记
  improvementPlan    String?   // 改进计划
}
```

### 2.2 新增表：学习内容元数据

```prisma
// Level学习内容表
model LevelLearningContent {
  id                String       @id @default(cuid())
  thinkingTypeId    String
  level             Int          // 1-5
  contentType       String       // "theory" | "case_study" | "practice" | "reflection"
  title             String
  description       String
  content           Json         // 内容主体（支持富文本、交互元素）
  estimatedTime     Int          // 预计学习时间（分钟）
  orderIndex        Int          // 排序

  thinkingType      ThinkingType @relation(fields: [thinkingTypeId], references: [id], onDelete: Cascade)

  @@unique([thinkingTypeId, level, contentType, orderIndex])
  @@index([thinkingTypeId])
  @@index([level])
}
```

## 3. Level 1-5 内容框架

### 3.1 因果分析 (causal_analysis)

#### Level 1: 基础识别（认知负荷：低）
- **学习目标**：区分相关性与因果性
- **内容形式**：
  - 交互式动画：展示经典案例（冰淇淋销量vs溺水事件）
  - 游戏化练习：拖拽式分类（相关 vs 因果）
- **思维脚手架**：
  - 时间顺序检查表
  - 第三变量提示卡
- **引导问题示例**：
  - "这两个事件是同时发生的，还是一个在前一个在后？"
  - "有没有其他因素同时影响了这两个现象？"
- **评估标准**：
  - 选择题准确率 ≥ 80%
  - 能正确识别5个简单案例中的相关性vs因果性
- **解锁条件**：完成10道Level 1题目，平均准确率 ≥ 80%

#### Level 2: 变量控制（认知负荷：中等）
- **学习目标**：理解控制变量，识别混淆因素
- **内容形式**：
  - 虚拟实验室：模拟控制变量实验
  - 新闻案例分析：识别未控制的变量
- **思维脚手架**：
  - 变量识别框架
  - 实验设计模板
- **引导问题示例**：
  - "除了研究提到的因素，还有哪些变量可能影响结果？"
  - "如果要验证这个因果关系，需要控制哪些变量？"
- **评估标准**：
  - 能识别至少3个混淆因素
  - 实验设计合理性评分 ≥ 75%
- **解锁条件**：完成8道Level 2题目，平均质量分 ≥ 75%

#### Level 3: 多因素归因（认知负荷：中高）
- **学习目标**：分析多因素交互作用
- **内容形式**：
  - 系统动力学模拟
  - 真实历史/社会案例研究
- **思维脚手架**：
  - 因果链分析工具
  - 权重评估矩阵
- **引导问题示例**：
  - "哪些因素是主要原因？哪些是次要原因？"
  - "这些因素之间是否存在相互作用？"
- **评估标准**：
  - 因果图完整性 ≥ 70%
  - 多因素分析深度评分 ≥ 70%
- **解锁条件**：完成6道Level 3题目，平均质量分 ≥ 70%

#### Level 4: 因果网络构建（认知负荷：高）
- **学习目标**：构建复杂因果关系网络
- **内容形式**：
  - 概念建模工具
  - 跨学科项目
- **思维脚手架**：
  - 系统思维框架
  - 反馈回路识别指南
- **引导问题示例**：
  - "这个系统中存在哪些反馈回路？"
  - "如果改变某个因素，会对整个系统产生什么连锁反应？"
- **评估标准**：
  - 因果网络模型完整性和准确性 ≥ 65%
  - 系统思维能力评分 ≥ 65%
- **解锁条件**：完成5道Level 4题目，平均质量分 ≥ 65%

#### Level 5: 创新应用（认知负荷：高）
- **学习目标**：将因果分析应用于创新问题解决
- **内容形式**：
  - 开放性项目
  - 原创研究设计
- **思维脚手架**：无（完全自主）
- **引导问题示例**：
  - "基于你的因果分析，你会提出什么创新解决方案？"
  - "如何验证你的方案的有效性？"
- **评估标准**：
  - 创新性 + 可行性 + 因果分析严谨性综合评分
- **解锁条件**：无（顶级）

### 3.2 其他4个维度

**premise_challenge, fallacy_detection, iterative_reflection, connection_transfer** 均采用相同的Level 1-5结构，但学习内容和脚手架不同。

详见：
- `docs/critical_thinking_content.md` 中的各维度Level 1-5定义
- `src/lib/knowledge/learning-content-data.ts` 中的现有内容

## 4. 六步练习流程设计

### 4.1 流程概览

```
Step 1: 题目呈现 → Step 2: 引导思考 → Step 3: 完整作答 →
Step 4: 评估反馈 → Step 5: 反思总结 → Step 6: 进阶提示
```

### 4.2 各Step详细设计

#### Step 1: 题目呈现 (Question Presentation)
**目标**：让用户充分理解题目情境和要求

**界面元素**：
- 题目主体（topic + context + question）
- 难度标识（Level 1-5 + beginner/intermediate/advanced）
- 预计用时
- 学习目标标签

**Level差异**：
- **Level 1-2**：提供视觉化辅助（图表、动画）、具体例子
- **Level 3-4**：真实案例、多维度信息、专业术语
- **Level 5**：开放性问题、跨领域整合、最小提示

**交互**：
- "理解题目"确认按钮（防止用户跳过阅读）
- 可选：关键词高亮、背景知识链接

#### Step 2: 引导思考 (Guided Thinking)
**目标**：通过引导问题激活思维框架

**界面元素**：
- 引导问题列表（来自guidingQuestions表）
- 每个问题的"思考提示"（可选展开）
- 用户思考笔记区（非强制）

**Level差异**：
- **Level 1**：封闭式问题、提供检查表、多选项提示
- **Level 2**：半开放式问题、分步引导、框架提示
- **Level 3**：开放式问题、需要综合分析
- **Level 4**：元认知问题、引导反思
- **Level 5**：无引导问题或仅高层次提示

**引导问题数量**：
- Level 1: 5-7个
- Level 2: 4-6个
- Level 3: 3-5个
- Level 4: 2-4个
- Level 5: 0-2个

**交互**：
- 引导问题逐个展开（避免认知负荷过载）
- 可标记"已思考完成"
- 思考笔记自动保存

#### Step 3: 完整作答 (Complete Answer)
**目标**：用户输出完整的批判性思维分析

**界面元素**：
- 富文本编辑器
- 思维框架提示（可选显示/隐藏）
- 字数计数器
- 自动保存提示

**Level差异**：
- **Level 1**：选择题为主 + 简答补充（100-200字）
- **Level 2**：结构化简答（200-400字）、支持列表和图表
- **Level 3**：长篇论述（400-800字）、需要完整论证
- **Level 4**：建模 + 详细解释（600-1000字）、可上传图片/思维导图
- **Level 5**：原创方案设计（800+字）、多媒体支持

**字数要求**（建议）：
- Level 1: 100-200字
- Level 2: 200-400字
- Level 3: 400-800字
- Level 4: 600-1000字
- Level 5: 800+字

**交互**：
- 实时字数统计
- 自动保存草稿（每30秒）
- "提交答案"按钮（确认对话框）

#### Step 4: 评估反馈 (AI Evaluation)
**目标**：提供详细的AI评估和改进建议

**界面元素**：
- 总体评分（0-100分）
- 分项评分（根据thinkingFramework维度）
- 优点（strengths）
- 改进点（improvements）
- 具体建议（suggestions）

**Level差异**：
- **Level 1-2**：详细解释正确思路、对比示例答案
- **Level 3-4**：评估逻辑深度和广度、指出盲点
- **Level 5**：评估创新性 + 可行性 + 影响力

**评估维度**（存储在evaluationDetails.criteria中）：
```json
{
  "criteria": [
    {
      "name": "概念理解",
      "score": 85,
      "feedback": "准确理解了相关性与因果性的区别"
    },
    {
      "name": "分析深度",
      "score": 70,
      "feedback": "识别了主要混淆因素，但未考虑时间序列"
    },
    {
      "name": "论证完整性",
      "score": 75,
      "feedback": "论证结构清晰，但缺少具体证据支持"
    }
  ],
  "overallScore": 77,
  "strengths": "能够系统性地分析问题...",
  "improvements": "建议加强证据收集...",
  "suggestions": ["尝试绘制因果图", "查阅相关研究文献"]
}
```

**交互**：
- 展开/收起各项评分
- "查看示例答案"（Level 1-3）
- "保存反馈"到学习笔记

#### Step 5: 反思总结 (Reflection Summary)
**目标**：引导元认知反思，巩固学习

**界面元素**：
- 反思引导问题（3-5个）
- 反思笔记输入框
- 改进计划输入框
- 关键收获标签选择

**反思引导问题示例**：
- "这次练习中，你最大的收获是什么？"
- "你在思考过程中遇到了什么困难？"
- "AI反馈中哪一点对你最有启发？"
- "下次遇到类似问题，你会采取什么不同的策略？"
- "你发现了自己的哪些思维盲点？"

**Level差异**：
- **Level 1-2**：结构化反思问题、多选标签
- **Level 3-4**：开放式反思、自主总结
- **Level 5**：与领域专家对话、深度反思

**交互**：
- 反思笔记保存到session.reflectionNotes
- 改进计划保存到session.improvementPlan
- 可选：分享到学习社区

#### Step 6: 进阶提示 (Next Level Guidance)
**目标**：激励用户继续学习，提示解锁条件

**界面元素**：
- 当前Level进度条
- 解锁下一Level的条件
- 推荐的下一道题目
- 成就徽章（如果达成里程碑）

**解锁算法**：
```javascript
// Level解锁逻辑
const unlockCriteria = {
  level2: { minQuestions: 10, minAccuracy: 80 },  // Level 1完成10题，80%准确率
  level3: { minQuestions: 8,  minAccuracy: 75 },  // Level 2完成8题，75%准确率
  level4: { minQuestions: 6,  minAccuracy: 70 },  // Level 3完成6题，70%准确率
  level5: { minQuestions: 5,  minAccuracy: 65 }   // Level 4完成5题，65%准确率
}

function checkUnlock(currentLevel, progress) {
  const criteria = unlockCriteria[`level${currentLevel + 1}`]
  if (!criteria) return false

  return progress.questionsCompleted >= criteria.minQuestions &&
         progress.averageScore >= criteria.minAccuracy
}
```

**界面内容**：
- ✅ 已解锁Level：显示"开始Level X练习"按钮
- 🔒 未解锁Level：
  - 显示解锁条件："还需完成X道题目，当前准确率Y%（需要Z%）"
  - 进度条可视化
  - 激励文案："你已经非常接近解锁Level 3！继续努力！"

**交互**：
- "继续练习"按钮 → 推荐下一题
- "返回学习中心"按钮
- "查看进度详情"按钮 → 跳转到进度页面

### 4.3 流程状态管理

**stepProgress JSON结构**：
```json
{
  "currentStep": 3,  // 当前在第几步
  "steps": {
    "1_presentation": {
      "completed": true,
      "timestamp": "2025-01-15T10:23:45Z",
      "timeSpent": 120  // 秒
    },
    "2_guided_thinking": {
      "completed": true,
      "timestamp": "2025-01-15T10:28:30Z",
      "timeSpent": 285,
      "thinkingNotes": "考虑了第三变量..."
    },
    "3_complete_answer": {
      "completed": true,
      "timestamp": "2025-01-15T10:45:12Z",
      "timeSpent": 1002,
      "wordCount": 456,
      "draftSaves": 8
    },
    "4_evaluation": {
      "completed": true,
      "timestamp": "2025-01-15T10:46:05Z",
      "score": 77
    },
    "5_reflection": {
      "completed": true,
      "timestamp": "2025-01-15T10:52:20Z",
      "timeSpent": 375
    },
    "6_next_level": {
      "completed": true,
      "timestamp": "2025-01-15T10:53:00Z"
    }
  },
  "totalTimeSpent": 2184  // 总时长（秒）
}
```

## 5. Admin AI生成增强

### 5.1 生成参数扩展

```typescript
interface AIGenerationRequest {
  thinkingTypeId: string       // 思维维度ID
  level: 1 | 2 | 3 | 4 | 5     // Level级别
  count: number                 // 生成数量
  difficulty: string            // beginner/intermediate/advanced
  topics?: string[]             // 主题领域（可选）
  customPrompt?: string         // 自定义要求（可选）

  // 新增参数
  includeScaffolding: boolean   // 是否生成思维脚手架（Level 1-3）
  includeCaseStudy: boolean     // 是否生成案例分析
  guidingQuestionCount: number  // 引导问题数量（根据Level自动建议）
}
```

### 5.2 AI生成Prompt模板

基于 `critical_thinking_content.md` 的Level 1-5框架，为每个维度和Level设计专用Prompt：

#### 示例：causal_analysis + Level 1

```
你是批判性思维教育专家，需要为Level 1学习者生成"因果分析"练习题。

Level 1学习目标：
- 区分相关性与因果性的基本概念
- 识别简单场景中的因果关系

认知负荷：低
思维脚手架：时间顺序检查表、第三变量提示卡

生成要求：
1. 题目场景要具体、贴近生活
2. 涉及的因果关系要清晰但容易混淆
3. 提供5-7个引导问题，帮助学生逐步分析
4. 思维脚手架包含：
   - 时间顺序检查：哪个先发生？
   - 第三变量提示：还有其他因素吗？

输出JSON格式：
{
  "question": "题目主体",
  "context": "背景信息",
  "topic": "题目标题",
  "level": 1,
  "difficulty": "beginner",
  "tags": ["因果分析", "相关性vs因果性"],
  "thinkingFramework": {
    "steps": ["识别现象", "确认时间顺序", "寻找第三变量", "建立因果推理"]
  },
  "scaffolding": {
    "timeSequenceChecklist": ["事件A发生时间", "事件B发生时间", "时间先后关系"],
    "thirdVariableHints": ["是否有共同原因？", "季节因素？", "人群特征？"]
  },
  "guidingQuestions": [
    {
      "level": "beginner",
      "stage": "理解现象",
      "question": "题目中提到了哪两个同时发生的现象？",
      "orderIndex": 1
    },
    ...
  ],
  "expectedOutcomes": [
    "能够区分相关性和因果性",
    "识别了潜在的混淆因素"
  ],
  "assessmentCriteria": {
    "conceptUnderstanding": "是否理解相关性≠因果性",
    "thirdVariableCons
ideration": "是否考虑了混淆因素",
    "timeSequenceCheck": "是否验证了时间顺序"
  }
}

生成数量：{count}
主题领域：{topics}
{customPrompt}
```

### 5.3 批量生成流程

```
1. 管理员选择参数（维度、Level、数量、难度）
2. 系统加载对应的Prompt模板
3. 调用AI API生成内容
4. 解析JSON响应，验证格式
5. 预览生成结果（前3题）
6. 管理员确认后批量保存到数据库
7. 自动创建关联的guidingQuestions记录
```

## 6. API Endpoints设计

### 6.1 Level-based内容获取

```typescript
// GET /api/critical-thinking/questions/by-level
// 获取指定Level的题目
Query Parameters:
- thinkingTypeId: string
- level: 1-5
- difficulty?: string (可选)
- limit?: number (默认10)

Response:
{
  "questions": [
    {
      "id": "...",
      "level": 1,
      "topic": "...",
      "difficulty": "beginner",
      "learningObjectives": ["...", "..."],
      "scaffolding": {...},
      "guidingQuestionCount": 6
    }
  ],
  "total": 50,
  "userProgress": {
    "currentLevel": 1,
    "level1Progress": 60,
    "level2Unlocked": false
  }
}
```

### 6.2 进度更新

```typescript
// POST /api/critical-thinking/progress/update-level
Body:
{
  "userId": "...",
  "thinkingTypeId": "...",
  "level": 1,
  "score": 85,
  "questionId": "..."
}

Logic:
1. 更新对应Level的进度
2. 计算平均分
3. 检查是否满足解锁条件
4. 如果满足，自动解锁下一Level
5. 返回更新后的进度和解锁状态

Response:
{
  "updatedProgress": {
    "currentLevel": 1,
    "level1Progress": 70,
    "level2Unlocked": false,
    "level2UnlockProgress": {
      "questionsCompleted": 7,
      "questionsRequired": 10,
      "averageScore": 82,
      "requiredScore": 80,
      "message": "还需完成3道题目即可解锁Level 2！"
    }
  }
}
```

### 6.3 学习内容获取

```typescript
// GET /api/critical-thinking/learning-content
// 获取Level的学习内容（理论、案例、反思指导）
Query Parameters:
- thinkingTypeId: string
- level: 1-5
- contentType?: "theory" | "case_study" | "practice" | "reflection"

Response:
{
  "contents": [
    {
      "id": "...",
      "type": "theory",
      "title": "什么是相关性和因果性？",
      "description": "...",
      "content": {
        "sections": [
          {
            "type": "text",
            "content": "..."
          },
          {
            "type": "interactive_animation",
            "data": {...}
          }
        ]
      },
      "estimatedTime": 5
    }
  ]
}
```

## 7. 前端组件重构

### 7.1 PracticeSessionV2 重构要点

```typescript
// 新增State
const [currentStep, setCurrentStep] = useState<1|2|3|4|5|6>(1)
const [stepProgress, setStepProgress] = useState<StepProgress>({})
const [thinkingNotes, setThinkingNotes] = useState('')
const [reflectionNotes, setReflectionNotes] = useState('')
const [improvementPlan, setImprovementPlan] = useState('')

// 6步导航
<StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

// 条件渲染各Step
{currentStep === 1 && <QuestionPresentation />}
{currentStep === 2 && <GuidedThinking />}
{currentStep === 3 && <CompleteAnswer />}
{currentStep === 4 && <AIEvaluation />}
{currentStep === 5 && <ReflectionSummary />}
{currentStep === 6 && <NextLevelGuidance />}
```

### 7.2 Level解锁UI

```typescript
// LevelProgressIndicator组件
<LevelProgressIndicator
  currentLevel={progress.currentLevel}
  levels={[
    { level: 1, unlocked: true, progress: 100 },
    { level: 2, unlocked: true, progress: 60 },
    { level: 3, unlocked: false, progress: 0,
      unlockCriteria: "完成10道Level 2题目，准确率≥75%" }
  ]}
  onLevelClick={handleLevelClick}
/>
```

## 8. 实施优先级

### Phase 1: 数据库和基础架构（3-5天）
1. ✅ 扩展Prisma schema
2. ✅ 运行migration
3. ✅ 创建API endpoints基础结构
4. ✅ 测试数据库操作

### Phase 2: Admin AI生成增强（3-4天）
1. ✅ 设计5个维度 × 5个Level的Prompt模板
2. ✅ 扩展ContentManagement组件
3. ✅ 实现AI生成API
4. ✅ 测试生成质量并迭代Prompt

### Phase 3: Practice Flow重构（5-7天）
1. ✅ 重构PracticeSessionV2组件
2. ✅ 实现6步流程UI
3. ✅ Level差异化逻辑
4. ✅ 集成评估和反思功能

### Phase 4: 进度追踪和解锁系统（2-3天）
1. ✅ 实现Level进度计算
2. ✅ 解锁算法
3. ✅ 进度可视化组件
4. ✅ 激励机制（成就徽章）

### Phase 5: 测试和优化（3-4天）
1. ✅ 端到端测试
2. ✅ 用户体验优化
3. ✅ 性能优化
4. ✅ 文档完善

**总预计时间**：16-23天

## 9. 成功指标

- **内容丰富度**：每个维度每个Level至少10道高质量题目
- **用户参与度**：平均完成率 ≥ 60%（相比当前提升20%）
- **学习效果**：Level进阶用户的平均分提升 ≥ 15%
- **AI生成质量**：管理员接受率 ≥ 70%
- **系统稳定性**：API响应时间 < 2s，错误率 < 1%
