# 统一学习进度计算系统设计

## 概述

设计一个统一的进度计算系统,整合所有学习模块的进度数据:
1. **批判性思维练习** (Critical Thinking Practice)
2. **理论学习** (Theory Learning)
3. **课程学习** (Level Learning Content)
4. **每日练习** (Daily Practice)
5. **对话学习** (Conversation Learning)

## 进度计算架构

### 1. 总体进度公式

```
总进度 = Σ(模块权重 × 模块进度) / Σ(模块权重)

模块权重分配:
- 批判性思维练习: 40%
- 理论学习: 25%
- 课程学习: 20%
- 每日练习: 10%
- 对话学习: 5%
```

### 2. 各模块进度计算

#### A. 批判性思维练习进度 (40%)

**数据源**: `CriticalThinkingProgress` 表

**计算公式**:
```typescript
练习进度 = (数量进度 × 50%) + (级别进度 × 50%)

其中:
- 数量进度 = min(100, (questionsCompleted / 50) × 100)
- 级别进度 = (currentLevel / 5) × 100
```

**示例**:
- 22题 + Level 5 → (44% × 0.5) + (100% × 0.5) = 72%
- 50题 + Level 5 → (100% × 0.5) + (100% × 0.5) = 100%

#### B. 理论学习进度 (25%)

**数据源**: `TheoryProgress` 表

**计算公式**:
```typescript
理论进度 = Σ(单篇内容进度) / 总内容数

单篇内容进度 = progressPercent (0-100)

完成标准:
- progressPercent >= 80: 视为完成
- status = "completed": 100%
- 章节完成: sectionsCompleted 中所有章节为 true
```

**权重细化**:
```typescript
理论内容权重 (按Level):
- Level 1: 10%
- Level 2: 15%
- Level 3: 20%
- Level 4: 25%
- Level 5: 30%
```

#### C. 课程学习进度 (20%)

**数据源**: `LevelLearningContent` 表 + 用户学习记录

**计算公式**:
```typescript
课程进度 = Σ(Level进度 × Level权重) / Σ(Level权重)

Level进度 = 已完成内容数 / 该Level总内容数

Level权重:
- Level 1: 10%
- Level 2: 15%
- Level 3: 20%
- Level 4: 25%
- Level 5: 30%
```

**完成标准**:
- 内容类型完成判定:
  - `concepts`: 阅读完成 + 测验通过
  - `frameworks`: 阅读完成 + 应用练习
  - `examples`: 案例学习完成
  - `practice_guide`: 指南阅读完成

#### D. 每日练习进度 (10%)

**数据源**: `PracticeSession` 表

**计算公式**:
```typescript
每日练习进度 = min(100, (最近30天完成天数 / 30) × 100)

激励加成:
- 连续3天: +5%
- 连续7天: +10%
- 连续14天: +15%
- 连续30天: +20%
```

#### E. 对话学习进度 (5%)

**数据源**: `Conversation` 表

**计算公式**:
```typescript
对话进度 = min(100, (有效对话数 / 20) × 100)

有效对话标准:
- messageCount >= 5
- timeSpent >= 180秒 (3分钟)
- status = "completed"
```

## 数据库Schema更新

### 新增表: `UserOverallProgress`

```prisma
model UserOverallProgress {
  id                      String   @id @default(cuid())
  userId                  String   @unique

  // 总体进度
  overallProgress         Int      @default(0)  // 0-100

  // 各模块进度
  practiceProgress        Int      @default(0)  // 批判性思维练习
  theoryProgress          Int      @default(0)  // 理论学习
  courseProgress          Int      @default(0)  // 课程学习
  dailyPracticeProgress   Int      @default(0)  // 每日练习
  conversationProgress    Int      @default(0)  // 对话学习

  // 各维度进度 (5个思维维度)
  dimensionProgress       Json     @default("{}")  // { "causal_analysis": 72, ... }

  // 时间统计
  totalTimeSpent          Int      @default(0)  // 总学习时长(秒)
  lastUpdated             DateTime @default(now()) @updatedAt

  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([overallProgress])
  @@map("user_overall_progress")
}
```

### 更新表: `LevelContentProgress`

```prisma
model LevelContentProgress {
  id              String   @id @default(cuid())
  userId          String
  contentId       String
  thinkingTypeId  String
  level           Int      // 1-5

  // 进度状态
  status          String   @default("not_started")  // not_started | in_progress | completed
  progressPercent Int      @default(0)  // 0-100

  // 完成标准
  readCompleted   Boolean  @default(false)
  quizPassed      Boolean  @default(false)
  practicesDone   Boolean  @default(false)

  // 时间记录
  timeSpent       Int      @default(0)  // 秒
  startedAt       DateTime?
  completedAt     DateTime?
  lastViewedAt    DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content         LevelLearningContent @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@unique([userId, contentId])
  @@index([userId, thinkingTypeId, level])
  @@map("level_content_progress")
}
```

## API设计

### 1. 统一进度查询API

**端点**: `GET /api/learning/progress/unified`

**响应**:
```json
{
  "success": true,
  "data": {
    "overallProgress": 68,
    "modules": {
      "practice": {
        "progress": 72,
        "weight": 40,
        "contribution": 28.8,
        "details": {
          "questionsCompleted": 22,
          "currentLevel": 5,
          "averageScore": 85
        }
      },
      "theory": {
        "progress": 65,
        "weight": 25,
        "contribution": 16.25,
        "details": {
          "completedContents": 13,
          "totalContents": 20,
          "averageCompletionRate": 65
        }
      },
      "course": {
        "progress": 55,
        "weight": 20,
        "contribution": 11.0,
        "details": {
          "level1": 100,
          "level2": 80,
          "level3": 60,
          "level4": 40,
          "level5": 20
        }
      },
      "dailyPractice": {
        "progress": 70,
        "weight": 10,
        "contribution": 7.0,
        "details": {
          "activeDaysLast30": 21,
          "currentStreak": 7,
          "streakBonus": 10
        }
      },
      "conversation": {
        "progress": 50,
        "weight": 5,
        "contribution": 2.5,
        "details": {
          "effectiveConversations": 10,
          "targetConversations": 20
        }
      }
    },
    "dimensions": {
      "causal_analysis": 72,
      "premise_challenge": 68,
      "fallacy_detection": 100,
      "iterative_reflection": 65,
      "connection_transfer": 55
    },
    "timeStats": {
      "totalTimeSpent": 18650,
      "thisWeek": 3600,
      "lastUpdated": "2025-10-23T10:30:00Z"
    }
  }
}
```

### 2. 进度更新API

**端点**: `POST /api/learning/progress/update`

**请求体**:
```json
{
  "module": "practice" | "theory" | "course" | "dailyPractice" | "conversation",
  "action": "complete" | "update" | "increment",
  "data": {
    // 模块特定数据
  }
}
```

### 3. 维度进度查询API

**端点**: `GET /api/learning/progress/dimension/:thinkingTypeId`

**响应**:
```json
{
  "success": true,
  "data": {
    "thinkingTypeId": "fallacy_detection",
    "overallProgress": 72,
    "breakdown": {
      "practice": 72,
      "theory": 80,
      "course": 65,
      "dailyPractice": 70,
      "conversation": 60
    },
    "levelProgress": {
      "level1": 100,
      "level2": 100,
      "level3": 80,
      "level4": 60,
      "level5": 40
    }
  }
}
```

## 实现步骤

### Phase 1: 数据库Schema更新
1. ✅ 创建 `UserOverallProgress` 表
2. ✅ 创建 `LevelContentProgress` 表
3. ✅ 运行迁移: `npm run db:push`

### Phase 2: 进度计算服务
1. 创建 `src/lib/progress/calculator.ts` - 核心计算逻辑
2. 创建 `src/lib/progress/aggregator.ts` - 数据聚合服务
3. 创建 `src/lib/progress/updater.ts` - 进度更新服务

### Phase 3: API实现
1. 实现 `/api/learning/progress/unified` - 统一进度查询
2. 实现 `/api/learning/progress/update` - 进度更新
3. 实现 `/api/learning/progress/dimension/:id` - 维度进度
4. 更新现有API以触发进度更新

### Phase 4: 前端集成
1. 更新 `ProgressDashboard.tsx` 使用新API
2. 创建进度可视化组件
3. 实现实时进度更新

### Phase 5: 后台任务
1. 创建每日进度重新计算任务
2. 实现进度数据一致性检查
3. 添加进度变化通知

## 进度展示设计

### Dashboard布局

```
┌─────────────────────────────────────────────────────────┐
│  总体进度: 68%                                           │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░                                  │
│  本周 +5%  总学习时长: 5.2小时                          │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬─────────────────┐
│ 批判性思维练习   │ 理论学习         │ 课程学习        │
│ 72% (权重40%)    │ 65% (权重25%)    │ 55% (权重20%)   │
│ 贡献: 28.8%      │ 贡献: 16.25%     │ 贡献: 11.0%     │
├──────────────────┼──────────────────┼─────────────────┤
│ 每日练习         │ 对话学习         │                 │
│ 70% (权重10%)    │ 50% (权重5%)     │                 │
│ 贡献: 7.0%       │ 贡献: 2.5%       │                 │
└──────────────────┴──────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────┐
│  五维能力雷达图                                          │
│                                                          │
│       多维归因 72%                                        │
│           /\                                             │
│          /  \                                            │
│  前提质疑 68% --- 谬误检测 100%                         │
│          \  /                                            │
│           \/                                             │
│    迭代反思 65% --- 知识迁移 55%                         │
└─────────────────────────────────────────────────────────┘
```

## 性能优化

### 缓存策略
1. **Redis缓存**: 用户进度数据缓存5分钟
2. **增量更新**: 只重新计算变化的模块
3. **异步计算**: 大量数据计算放入后台队列

### 查询优化
1. 使用数据库索引: `userId`, `thinkingTypeId`, `level`
2. 批量查询: 一次性获取所有需要的数据
3. 分页加载: 详细进度数据按需加载

## 测试计划

### 单元测试
- [ ] 进度计算函数测试
- [ ] 权重分配测试
- [ ] 边界条件测试

### 集成测试
- [ ] API端点测试
- [ ] 数据库更新测试
- [ ] 缓存一致性测试

### 性能测试
- [ ] 大量用户数据下的查询性能
- [ ] 并发进度更新测试
- [ ] 缓存命中率测试

## 监控指标

1. **准确性指标**
   - 进度计算错误率
   - 数据一致性检查失败率

2. **性能指标**
   - API响应时间 (目标: <500ms)
   - 进度更新延迟 (目标: <1s)
   - 缓存命中率 (目标: >80%)

3. **用户体验指标**
   - Dashboard加载时间 (目标: <2s)
   - 进度更新可见延迟 (目标: <3s)

## 未来扩展

1. **智能推荐**: 基于进度数据推荐下一步学习内容
2. **学习路径**: 自动生成个性化学习路径
3. **进度预测**: 预测用户完成时间
4. **同伴对比**: 匿名化进度对比和排行
5. **学习报告**: 周报/月报自动生成

---

**创建日期**: 2025-10-23
**最后更新**: 2025-10-23
**状态**: 设计完成,待实施
