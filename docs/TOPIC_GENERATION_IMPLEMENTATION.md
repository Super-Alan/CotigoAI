# 话题生成功能实现文档

## 📋 概述

本文档记录了将 5 大类专业提示词应用到 CotigoAI 话题生成功能的完整实现过程。

## 🎯 实现目标

1. 为 5 大批判性思维维度创建专业的提示词系统
2. 集成提示词到话题生成功能
3. 优化前端界面展示生成的话题
4. 提升话题生成的专业性和质量

## 📁 文件结构

```
CotigoAI/
├── src/
│   ├── prompts/
│   │   └── topic-generation/
│   │       ├── causal-analysis.ts          # 多维归因与利弊权衡
│   │       ├── premise-challenge.ts         # 前提质疑与方法批判
│   │       ├── fallacy-detection.ts         # 逻辑谬误识别与证据评估
│   │       ├── iterative-reflection.ts      # 自我认知与观点迭代
│   │       └── connection-transfer.ts       # 跨领域关联与迁移
│   ├── lib/
│   │   └── topicGenerator.ts               # 话题生成器（已更新）
│   ├── app/
│   │   ├── api/
│   │   │   └── topics/
│   │   │       └── generate/
│   │   │           └── route.ts            # API 路由（已更新）
│   │   └── conversations/
│   │       └── page.tsx                    # 对话页面（已优化）
│   └── types/
│       └── topic.ts                        # 类型定义
└── docs/
    └── TOPIC_GENERATION_IMPLEMENTATION.md  # 本文档
```

## 🔧 核心实现

### 1. 专业提示词系统

每个提示词文件包含以下核心部分：

#### 1.1 身份设定
定义 AI 的专业角色和核心使命，例如：
- 多维归因：批判性思维教育专家
- 前提质疑：学术严谨的批判性思维导师
- 逻辑谬误：逻辑思维专家
- 观点迭代：元认知专家
- 跨领域迁移：跨学科思维专家

#### 1.2 难度分级标准
为每个维度定义 3 个难度级别：

**beginner（初级）**
- 议题范围、矛盾冲突、分析维度
- 示例场景和参考例题

**intermediate（中级）**
- 更复杂的议题范围和利益冲突
- 跨领域分析要求

**advanced（高级）**
- 全球性、系统性问题
- 深层信念挑战和复杂度

#### 1.3 话题结构设计

**A. 核心话题（topic）**
- 格式规范：150-300 字
- 必须包含背景、冲突点、开放式问题

**B. 情境背景（context）**
- 200-400 字详细背景
- 包含现实依据、利益相关方、历史脉络

**C. 思维框架（thinkingFramework）**
```typescript
{
  coreChallenge: "核心考察能力",
  commonPitfalls: ["错误1", "错误2", "错误3"],
  excellentResponseIndicators: ["标志1", "标志2", "标志3"]
}
```

**D. 引导问题（guidingQuestions）**
3 个层级的问题链：
- Level 1: 基础理解与澄清
- Level 2: 深入分析与拆解
- Level 3: 评估决策与迁移

**E. 预期学习成果（expectedOutcomes）**
4-5 个具体的能力提升目标

#### 1.4 质量保障机制

**优秀话题特征（5 个维度）**
- 现实相关性、思维激发性、平衡性、实用性、层次清晰性

**需要避免的问题（5 个维度）**
- 道德绑架、信息不足、假大空、技术壁垒、立场预设

**最终检查清单（7 项验证）**
- 基于真实议题、多个对立观点、足够背景信息、思维进阶、难度匹配等

### 2. 话题生成器更新

#### 2.1 buildSystemPrompt()
```typescript
export function buildSystemPrompt(dimension?: CriticalThinkingDimension): string {
  if (dimension) {
    const promptMap: Record<CriticalThinkingDimension, string> = {
      [CriticalThinkingDimension.CAUSAL_ANALYSIS]: causalAnalysisPrompt,
      [CriticalThinkingDimension.PREMISE_CHALLENGE]: premiseChallengePrompt,
      [CriticalThinkingDimension.FALLACY_DETECTION]: fallacyDetectionPrompt,
      [CriticalThinkingDimension.ITERATIVE_REFLECTION]: iterativeReflectionPrompt,
      [CriticalThinkingDimension.CONNECTION_TRANSFER]: connectionTransferPrompt,
    };
    return promptMap[dimension];
  }
  // 未指定维度时使用通用提示词
  return `...通用提示词...`;
}
```

**关键改进：**
- 根据维度动态选择专业提示词
- 保留通用提示词作为后备
- 支持混合维度生成

#### 2.2 buildUserPrompt()
```typescript
export function buildUserPrompt(params: TopicGenerationRequest): string {
  const difficulty = params.difficulty || 'intermediate';
  const preferredDomains = params.preferredDomains?.join(', ') || '';

  return `现在，请根据以下参数生成话题：

  **参数设置：**
  - 难度级别：${difficulty}
  - 偏好领域：${preferredDomains || '无特定偏好'}

  **输出格式：**
  直接输出 JSON 对象，不要添加 markdown 标记
  ...
  `;
}
```

**关键改进：**
- 简化提示词结构
- 明确 JSON 格式要求
- 支持模板变量替换

#### 2.3 generateTopicsWithLLM()
```typescript
export async function generateTopicsWithLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedTopic[]> {
  // 增加详细日志
  console.log('[LLM] System Prompt 长度:', systemPrompt.length);
  console.log('[LLM] User Prompt 长度:', userPrompt.length);

  // 增加 max_tokens 到 8000
  // 添加 response_format: { type: 'json_object' }
  // 改进 JSON 解析逻辑
  // 支持单个对象和数组两种格式

  const topicsArray: GeneratedTopic[] = Array.isArray(parsedData)
    ? parsedData
    : [parsedData];

  return topicsArray;
}
```

**关键改进：**
- 增加详细的日志记录
- 提高 token 限制到 8000
- 要求 JSON 格式响应
- 更健壮的 JSON 解析
- 支持多种返回格式

### 3. API 路由更新

```typescript
// src/app/api/topics/generate/route.ts
export async function POST(req: NextRequest) {
  // ...

  // 传递维度参数给 buildSystemPrompt
  const systemPrompt = buildSystemPrompt(body.dimension);
  const userPrompt = buildUserPrompt(body);

  // 调用 LLM 生成话题
  const topics = await generateTopicsWithLLM(systemPrompt, userPrompt);

  // ...
}
```

**关键改进：**
- 传递维度参数启用专业提示词
- 保持其他逻辑不变

### 4. 前端界面优化

#### 4.1 添加专业提示词提示
```tsx
<div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 ...">
  <span className="text-2xl">✨</span>
  <div>
    <p className="font-semibold">专业提示词系统已启用</p>
    <p className="text-sm">
      基于 QS Top 10 高校面试题深度优化，每个维度都有专业的出题框架和质量保障机制。
    </p>
  </div>
</div>
```

#### 4.2 优化话题卡片展示
```tsx
<details>
  <summary>查看引导问题框架 →</summary>
  <div className="space-y-3">
    {/* 常见思维误区 - 红色背景 */}
    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <p className="font-medium">⚠️ 常见思维误区：</p>
      <ul>
        {genTopic.thinkingFramework.commonPitfalls.map(...)}
      </ul>
    </div>

    {/* 引导问题 - 3 个阶段 */}
    <div className="space-y-2">
      {genTopic.guidingQuestions.map(...)}
    </div>

    {/* 学习成果 - 绿色背景 */}
    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <p className="font-medium">🎯 学习成果：</p>
      <ul>
        {genTopic.expectedOutcomes.map(...)}
      </ul>
    </div>
  </div>
</details>
```

**关键改进：**
- 新增常见思维误区展示（红色背景）
- 新增学习成果展示（绿色背景）
- 改进引导问题的展示格式
- 去除 level 数字，直接显示 stage 名称
- 优化深色模式适配

## 🎨 提示词设计亮点

### 1. 结构化设计
每个提示词都遵循统一的结构：
- 身份设定 → 核心使命 → 设计原则 → 难度分级 → 结构设计 → 质量标准 → 示例参考 → 检查清单

### 2. 难度适配
为不同水平的学生提供合适的挑战：
- beginner: 日常场景，2-3 步分析
- intermediate: 社会议题，3-4 维度分析
- advanced: 全球视野，4-5 层深度分析

### 3. 质量保障
多层次的质量控制机制：
- ✅ 5 个优秀话题特征
- ❌ 5 个需要避免的问题
- [ ] 7 项最终检查清单

### 4. 实战导向
所有示例都来自真实高校面试题：
- MIT: 工程权衡、系统优化
- Oxford: 政策哲学、论证批判
- Cambridge: 科学推理、第一性原理
- Stanford: 设计思维、人本创新
- Harvard: 伦理困境、领导力反思

## 📊 技术规格

### Token 预算
- System Prompt: 3000-15000 tokens（根据维度不同）
- User Prompt: 200-500 tokens
- LLM 响应: 2000-6000 tokens
- 总计: 约 5000-20000 tokens/话题

### API 参数
```typescript
{
  model: 'qwen-plus',
  temperature: 0.8,           // 提高创造性
  max_tokens: 8000,           // 支持长提示词响应
  response_format: {          // 要求 JSON 格式
    type: 'json_object'
  }
}
```

### 数据模型
```prisma
model GeneratedConversationTopic {
  id                   String   @id @default(cuid())
  userId               String?
  topic                String   @db.Text
  category             String
  context              String   @db.Text
  referenceUniversity  String
  dimension            String
  difficulty           String
  tags                 String[]
  thinkingFramework    Json
  guidingQuestions     Json
  expectedOutcomes     String[]
  isPublic             Boolean  @default(false)
  usageCount           Int      @default(0)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## 🔄 工作流程

### 用户生成话题流程
1. 用户访问 `/conversations` 页面
2. 切换到「✨ 定制生成」Tab
3. 选择批判性思维维度（或选择混合训练）
4. 选择难度级别（或选择混合难度）
5. 点击「✨ 生成专属话题推荐」
6. 系统调用 API 生成话题
7. 自动切换到「📚 话题广场」显示生成结果
8. 用户可以点击「开始训练 →」开始对话

### 后端生成流程
1. API 接收生成请求（维度、难度、数量）
2. 根据维度选择专业提示词
3. 构建用户提示词（包含参数）
4. 调用 LLM API 生成话题
5. 解析 JSON 响应
6. 保存到数据库
7. 返回生成结果给前端

## 📈 性能指标

### 响应时间
- API 调用: 5-15 秒
- 数据库保存: <100ms
- 页面渲染: <50ms

### Token 消耗
- 单个话题: 5000-20000 tokens
- 批量生成（6个）: 30000-120000 tokens

### 数据存储
- 单个话题: 2-5 KB
- 包含 JSON 字段: thinkingFramework, guidingQuestions

## 🐛 已知问题和解决方案

### 问题 1: LLM 返回格式不一致
**解决方案：**
- 在 User Prompt 中明确要求 JSON 格式
- 添加 `response_format: { type: 'json_object' }`
- 支持解析单个对象和数组两种格式

### 问题 2: 提示词过长导致 token 超限
**解决方案：**
- 将 max_tokens 提升到 8000
- 专业提示词设计时控制长度
- 使用模板变量替换避免重复

### 问题 3: 前端展示 guidingQuestions 的 level 字段
**解决方案：**
- 修改为直接显示 stage 名称
- 去除数字索引，使用更友好的阶段名称

## 🚀 未来优化方向

### 1. 提示词优化
- [ ] 收集用户反馈，优化提示词质量
- [ ] A/B 测试不同提示词版本
- [ ] 添加更多示例和参考案例

### 2. 功能增强
- [ ] 支持自定义偏好领域
- [ ] 添加话题收藏功能
- [ ] 实现话题评分系统
- [ ] 基于历史记录的个性化推荐

### 3. 性能优化
- [ ] 实现提示词缓存
- [ ] 批量生成优化
- [ ] 异步生成和轮询机制

### 4. 质量监控
- [ ] 添加生成质量评估指标
- [ ] 实现自动质量检测
- [ ] 建立话题质量反馈循环

## 📚 参考资料

- [QS Top 10 高校批判性思维面试题分类](../topic-case.md)
- [话题推荐设计文档](./TOPIC_RECOMMENDATION_DESIGN.md)
- [Prisma Schema](../../prisma/schema.prisma)
- [测试指南](../test-topic-generation.md)

## 🎉 总结

通过本次实现，我们成功地：

1. ✅ 为 5 大批判性思维维度创建了专业的提示词系统
2. ✅ 集成提示词到现有的话题生成功能
3. ✅ 优化了前端界面，提升用户体验
4. ✅ 建立了完整的质量保障机制
5. ✅ 提供了详细的测试和文档

这套系统将帮助学生获得更专业、更有针对性的批判性思维训练话题，提升整体学习效果。
