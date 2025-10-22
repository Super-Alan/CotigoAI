# 批判性思维理论体系设计方案

## 📋 设计目标

在学习中心首页下方创建独立的**批判性思维理论体系**模块，基于五大思维维度 × 5个Level渐进式学习路径，帮助学生系统掌握批判性思维核心理论。

## 🎯 核心设计理念

### 1. 渐进式学习路径
- **Level 1**: 基础识别（认知负荷：低）- 理解基本概念
- **Level 2**: 变量控制（认知负荷：中等）- 应用基础框架
- **Level 3**: 多因素归因（认知负荷：中高）- 综合分析能力
- **Level 4**: 因果网络构建（认知负荷：高）- 系统性思维
- **Level 5**: 创新应用（认知负荷：高）- 跨领域迁移

### 2. 四类学习内容
- 📚 **概念讲解** (Concepts): 理论基础和核心定义
- 🧩 **分析框架** (Frameworks): 结构化思考工具
- 💡 **典型示例** (Examples): 实际案例分析
- 🎯 **练习指南** (Practice Guide): 应用练习方法

### 3. 五大思维维度
1. **多维归因与利弊权衡** (causal_analysis)
2. **前提质疑与方法批判** (premise_challenge)
3. **谬误检测** (fallacy_detection)
4. **迭代反思** (iterative_reflection)
5. **知识迁移** (connection_transfer)

## 🎨 UI/UX 设计方案

### 模块位置
```
学习中心首页结构：
├── Hero Section（标题 + 搜索）
├── 统计概览 + AI每日一问
├── 快速入口
├── 五大核心思维维度卡片
├── 【新增】批判性思维理论体系  ← 这里
└── Call to Action
```

### 视觉设计

#### A. 整体布局
```
┌─────────────────────────────────────────────────────────┐
│  📖 批判性思维理论体系                                      │
│  从基础到高级，系统掌握批判性思维核心理论                    │
│                                                           │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐           │
│  │Lv 1 │  │Lv 2 │  │Lv 3 │  │Lv 4 │  │Lv 5 │           │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘           │
│                                                           │
│  选择Level查看详细内容 →                                   │
│                                                           │
│  ┌──────────────────────────────────────────────┐        │
│  │  🔍 多维归因                                    │        │
│  │  📚 概念讲解 | 🧩 框架 | 💡 示例 | 🎯 练习       │        │
│  └──────────────────────────────────────────────┘        │
│  ...（其他4个维度）                                        │
└─────────────────────────────────────────────────────────┘
```

#### B. Level选择器设计
- **交互方式**: Tab切换 或 Horizontal Scroll Cards
- **视觉反馈**:
  - 当前Level高亮显示
  - 进度条显示学习完成度
  - 锁定机制（可选）：Level 2-5 依赖前置Level完成

#### C. 维度展示卡片
```
┌─────────────────────────────────────────────┐
│  🔍 多维归因与利弊权衡                          │
│  Level 1: 基础识别                            │
│  ────────────────────────────────────────    │
│  📚 概念讲解                                   │
│  • 什么是因果关系？                             │
│  • 相关性 vs 因果性                            │
│  • 认识混淆因素                                │
│                                               │
│  🧩 分析框架                                   │
│  • 5W1H分析法                                 │
│  • 鱼骨图                                      │
│                                               │
│  💡 典型示例                                   │
│  • 案例：成绩提升的真正原因                      │
│                                               │
│  🎯 练习指南                                   │
│  → 开始Level 1练习                             │
│                                               │
│  [下一级别：Level 2 →]                        │
└─────────────────────────────────────────────┘
```

### 交互设计

#### 1. 学习路径导航
- Level选择器：水平滑动或Tab切换
- 维度折叠/展开：Accordion组件
- 进度追踪：每个Level显示完成百分比

#### 2. 内容展示
- **概念讲解**: Markdown渲染，支持图表
- **分析框架**: 可视化流程图/思维导图
- **典型示例**: 对比展示（好 vs 不好）
- **练习指南**: 链接到对应Level的练习题

#### 3. 响应式设计
- 桌面端：2-3列网格布局
- 平板：2列布局
- 移动端：单列垂直布局，卡片可滑动

## 🗄️ 数据模型设计

### 现有数据表复用

#### `level_learning_content` 表
```prisma
model LevelLearningContent {
  id              String       @id @default(cuid())
  thinkingTypeId  String       // 关联思维维度
  level           Int          // 1-5
  contentType     String       // 'concepts' | 'frameworks' | 'examples' | 'practice_guide'
  title           String       // 内容标题
  description     String       // 简短描述
  content         Json         // 完整内容（Markdown + 结构化数据）
  estimatedTime   Int          // 预计学习时间（分钟）
  orderIndex      Int          // 排序索引
  tags            Json         // 标签
  prerequisites   Json         // 前置要求
  createdAt       DateTime
  updatedAt       DateTime

  thinkingType    ThinkingType @relation(...)
}
```

### 数据结构示例

#### 概念讲解 (Concepts)
```json
{
  "sections": [
    {
      "heading": "什么是因果关系？",
      "content": "因果关系是指一个事件（原因）导致另一个事件（结果）发生的关系...",
      "examples": ["示例1", "示例2"],
      "keyPoints": ["要点1", "要点2"]
    }
  ],
  "summary": "本节总结...",
  "nextSteps": "下一步学习建议..."
}
```

#### 分析框架 (Frameworks)
```json
{
  "frameworkName": "5W1H分析法",
  "steps": [
    {"step": "Who", "description": "谁参与了？", "tips": "识别关键角色"},
    {"step": "What", "description": "发生了什么？", "tips": "明确核心事件"}
  ],
  "visualization": {
    "type": "flowchart",
    "data": "mermaid语法或JSON"
  },
  "applicationExample": "实际应用案例..."
}
```

#### 典型示例 (Examples)
```json
{
  "scenario": "某学生成绩提升的案例",
  "question": "是什么导致了成绩提升？",
  "goodAnalysis": "优秀分析示例...",
  "poorAnalysis": "常见错误分析...",
  "expertCommentary": "专家点评...",
  "keyLessons": ["启示1", "启示2"]
}
```

#### 练习指南 (Practice Guide)
```json
{
  "objectives": ["目标1", "目标2"],
  "recommendedQuestions": [
    {"id": "q123", "difficulty": "beginner", "title": "练习题1"}
  ],
  "practiceSteps": [
    "1. 阅读题目，识别关键信息",
    "2. 应用学到的框架",
    "3. 自我评估答案"
  ],
  "timeEstimate": "15分钟",
  "practiceLink": "/learn/critical-thinking/causal_analysis/practice?level=1"
}
```

## 🔌 API 接口设计

### 1. 获取理论体系内容
```typescript
GET /api/critical-thinking/learning-content

Query Parameters:
- thinkingTypeId: string (可选，筛选维度)
- level: number (可选，筛选Level)
- contentType: string (可选，筛选内容类型)

Response:
{
  "success": true,
  "data": {
    "byLevel": {
      "1": [
        {
          "thinkingTypeId": "causal_analysis",
          "contents": {
            "concepts": { /* 概念讲解内容 */ },
            "frameworks": { /* 框架内容 */ },
            "examples": { /* 示例内容 */ },
            "practice_guide": { /* 练习指南 */ }
          }
        }
      ]
    }
  }
}
```

### 2. 记录学习进度
```typescript
POST /api/critical-thinking/theory-progress

Body:
{
  "thinkingTypeId": "causal_analysis",
  "level": 1,
  "contentType": "concepts",
  "completed": true,
  "timeSpent": 300 // 秒
}

Response:
{
  "success": true,
  "data": {
    "progressPercentage": 25,
    "completedContents": 5,
    "totalContents": 20
  }
}
```

## 🎯 前端组件架构

### 组件层级
```
TheorySystemModule/
├── TheorySystemContainer.tsx        # 容器组件
├── LevelSelector.tsx                # Level选择器
├── DimensionAccordion.tsx           # 维度手风琴
├── ContentRenderer/                 # 内容渲染器
│   ├── ConceptsDisplay.tsx         # 概念讲解
│   ├── FrameworksDisplay.tsx       # 框架展示
│   ├── ExamplesDisplay.tsx         # 示例对比
│   └── PracticeGuideDisplay.tsx    # 练习指南
├── ProgressTracker.tsx              # 进度追踪
└── NavigationHints.tsx              # 导航提示
```

### 核心组件设计

#### TheorySystemContainer.tsx
```typescript
'use client'

interface TheorySystemProps {
  initialLevel?: number
  initialDimension?: string
}

export default function TheorySystemContainer({
  initialLevel = 1,
  initialDimension
}: TheorySystemProps) {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel)
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>([])
  const { data, loading } = useTheoryContent(selectedLevel)

  return (
    <div className="theory-system-module">
      <LevelSelector
        currentLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        userProgress={userProgress}
      />

      <DimensionAccordion
        level={selectedLevel}
        dimensions={data.dimensions}
        expanded={expandedDimensions}
        onToggle={handleToggle}
      />
    </div>
  )
}
```

#### LevelSelector.tsx
```typescript
interface LevelSelectorProps {
  currentLevel: number
  onLevelChange: (level: number) => void
  userProgress: Record<number, number> // level -> percentage
}

export default function LevelSelector({
  currentLevel,
  onLevelChange,
  userProgress
}: LevelSelectorProps) {
  const levels = [
    { level: 1, title: '基础识别', difficulty: '低认知负荷' },
    { level: 2, title: '变量控制', difficulty: '中等负荷' },
    { level: 3, title: '多因素归因', difficulty: '中高负荷' },
    { level: 4, title: '因果网络', difficulty: '高负荷' },
    { level: 5, title: '创新应用', difficulty: '高负荷' }
  ]

  return (
    <div className="level-selector">
      {levels.map((levelInfo) => (
        <LevelCard
          key={levelInfo.level}
          {...levelInfo}
          isActive={currentLevel === levelInfo.level}
          progress={userProgress[levelInfo.level] || 0}
          onClick={() => onLevelChange(levelInfo.level)}
        />
      ))}
    </div>
  )
}
```

## 📱 移动端优化

### 设计原则
1. **垂直滚动为主**: Level选择器改为垂直堆叠
2. **按需加载**: 默认折叠所有维度，点击展开
3. **触控优化**: 44px最小触摸区域
4. **简化视觉**: 减少装饰元素，突出核心内容

### 响应式断点
```css
/* 移动端 */
@media (max-width: 640px) {
  .level-selector { flex-direction: column; }
  .dimension-card { padding: 12px; }
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  .level-selector { grid-template-columns: repeat(5, 1fr); }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .theory-system { max-width: 1200px; margin: 0 auto; }
}
```

## 🚀 实施路线图

### Phase 1: 数据准备（1-2天）
- [ ] 创建 Level 1-5 的基础内容结构
- [ ] 为5个维度各准备4类内容（共100个内容单元）
- [ ] 使用AI辅助生成初始内容
- [ ] 内容审核和优化

### Phase 2: API开发（1天）
- [ ] 实现 `/api/critical-thinking/learning-content` 接口
- [ ] 实现 `/api/critical-thinking/theory-progress` 接口
- [ ] 添加缓存机制提升性能

### Phase 3: 前端组件（2-3天）
- [ ] 创建 TheorySystemContainer 容器
- [ ] 实现 LevelSelector 组件
- [ ] 实现 DimensionAccordion 组件
- [ ] 实现4类内容渲染器
- [ ] 添加进度追踪功能

### Phase 4: 集成和测试（1天）
- [ ] 集成到学习中心首页
- [ ] 响应式测试（移动/平板/桌面）
- [ ] 性能优化（懒加载、代码分割）
- [ ] 用户体验优化

### Phase 5: 内容完善（持续）
- [ ] 补充高质量案例
- [ ] 添加可视化图表
- [ ] 收集用户反馈
- [ ] 迭代优化内容

## 📊 成功指标

### 用户参与度
- **目标**: 50%+ 用户至少浏览1个Level的理论内容
- **完成率**: 30%+ 用户完整阅读至少1个维度的Level 1内容

### 学习效果
- **进阶率**: 20%+ 用户从Level 1 进阶到 Level 2
- **练习转化**: 40%+ 理论学习用户会进入对应练习

### 系统性能
- **加载时间**: <2秒加载完整模块
- **交互响应**: <100ms 切换Level或展开维度

## 🎨 设计资源需求

### 图标
- Level 1-5 难度指示图标
- 4类内容类型图标（概念/框架/示例/练习）
- 进度状态图标（未开始/进行中/已完成）

### 配色方案
```css
Level 1 (基础): #3B82F6 (蓝色) - 平和、基础
Level 2 (进阶): #10B981 (绿色) - 成长、发展
Level 3 (中级): #F59E0B (橙色) - 警觉、挑战
Level 4 (高级): #8B5CF6 (紫色) - 深度、专业
Level 5 (大师): #EF4444 (红色) - 精通、卓越
```

## 💡 创新亮点

1. **渐进式揭示**: 通过Level系统控制认知负荷，避免信息过载
2. **四维学习**: 理论+框架+示例+练习，全方位掌握
3. **进度可视化**: 实时追踪学习进度，增强成就感
4. **无缝连接**: 理论学习直接跳转到对应练习题
5. **自适应难度**: 根据用户表现推荐合适的Level

## 📝 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **组件库**: shadcn/ui (Card, Badge, Progress, Tabs, Accordion)
- **数据获取**: React Query (缓存 + 状态管理)
- **内容渲染**: react-markdown (Markdown支持)
- **可视化**: ReactFlow / Mermaid (框架图表)
- **动画**: Framer Motion (交互动画)

## 🔐 权限控制

- **公开访问**: 所有Level 1内容免费访问
- **进阶内容**: Level 2-5 可能需要完成前置Level
- **个性化**: 登录用户可保存学习进度

---

**设计版本**: v1.0
**最后更新**: 2025-01-XX
**负责人**: AI Development Team
