# 每日练习与学习路径整合设计方案

## 问题分析

### 当前系统存在的问题

#### 1. **功能隔离导致的用户困惑**

**每日练习 (`/learn/daily`)**:
- ✅ 强调连续打卡、保持streak
- ✅ 提供6种练习类型选择（5大思维维度 + 混合）
- ✅ 智能推荐基于历史数据
- ❌ **没有明确的学习目标和路径指引**
- ❌ **用户不知道为什么要做这个练习**
- ❌ **缺乏"我在整体学习路径的哪个位置"的感知**

**学习路径 (`/learn/path`)**:
- ✅ 提供清晰的阶段性学习规划
- ✅ 显示总体进度和预计时间
- ✅ AI生成个性化路径
- ❌ **与每日练习完全脱节**
- ❌ **用户不知道如何通过每日练习推进路径**
- ❌ **路径只是"展示"而非"驱动"学习行为**

#### 2. **重复的推荐系统**

- 每日练习有自己的 `smart-recommender`
- 学习路径有自己的 `PathGenerationEngine`
- 两个系统互不通信，可能给出冲突的建议

#### 3. **用户心智模型不清晰**

用户面临的困惑：
- "我应该先做每日练习还是先看学习路径？"
- "每日练习和学习路径是什么关系？"
- "我做完每日练习后，学习路径会更新吗？"
- "为什么今天推荐我练习A，但学习路径显示我应该学B？"

---

## 设计原则

### 核心理念：**学习路径为主线，每日练习为执行**

```
学习路径 (What & Why) ←→ 每日练习 (How & When)
   ↓                           ↓
 长期规划                    当日行动
 目标导向                    习惯养成
 结构化进度                  碎片化执行
```

### 设计目标

1. **单一真相来源**: 学习路径是唯一的学习规划，每日练习从路径中提取任务
2. **目标感增强**: 用户清楚知道"今天的练习帮助我达成哪个阶段目标"
3. **进度可视化**: 每日练习完成后，学习路径实时更新进度
4. **智能简化**: 合并推荐系统，提供一致的学习建议

---

## 整合方案

### 方案A: **路径驱动型（推荐）**

#### 核心逻辑
```
用户打开每日练习
  ↓
检查学习路径当前步骤
  ↓
生成今日任务（基于路径下一步）
  ↓
完成练习 → 更新路径进度
  ↓
显示"你已完成路径X%，下一步是Y"
```

#### 实现细节

**1. 数据流整合**

```typescript
// 新的统一推荐服务
class UnifiedRecommendationService {
  async getDailyTask(userId: string) {
    // 1. 获取或生成学习路径
    const path = await this.getOrCreatePath(userId);

    // 2. 找到当前步骤
    const currentStep = path.steps[path.currentStepIndex];

    // 3. 如果今天已完成当前步骤，推进到下一步
    if (await this.isStepCompletedToday(userId, currentStep.id)) {
      return this.getNextStepTask(path);
    }

    // 4. 返回当前步骤的练习任务
    return {
      task: currentStep,
      context: {
        pathProgress: path.progressPercent,
        currentPhase: currentStep.phase,
        whyThisTask: currentStep.rationale,
        nextMilestone: this.getNextMilestone(path)
      }
    };
  }
}
```

**2. UI整合设计**

```tsx
// 新的每日练习主页面
<DailyPracticeMain>
  {/* 顶部：学习路径进度条 */}
  <PathProgressBar
    currentPhase="基础巩固"
    progress={35}
    nextMilestone="完成谬误检测Level 3"
  />

  {/* 主卡片：今日任务 */}
  <TodayTaskCard>
    <Badge>路径推荐</Badge>
    <h2>今日目标：谬误检测 Level 2</h2>
    <p>📍 你正在进行：基础巩固阶段（第1周/共8周）</p>
    <p>🎯 完成后将解锁：前提质疑练习</p>

    <Button>开始今日练习</Button>
  </TodayTaskCard>

  {/* 次要：其他练习选项 */}
  <OptionalPracticeSection>
    <h3>额外练习（可选）</h3>
    <p>完成今日目标后，你可以选择：</p>
    {/* 其他5大维度 */}
  </OptionalPracticeSection>

  {/* 底部：快速入口 */}
  <QuickActions>
    <Link to="/learn/path">查看完整学习路径</Link>
    <Link to="/learn/daily/progress">学习统计</Link>
  </QuickActions>
</DailyPracticeMain>
```

**3. 数据库Schema调整**

```prisma
// 扩展 LearningPathState 表
model LearningPathState {
  // ... 现有字段

  // 新增：每日任务追踪
  dailyTaskHistory  Json[]  // [{date, stepId, completed, score}]
  lastDailyTaskDate DateTime?
  consecutiveDays   Int @default(0)

  // 新增：路径元数据
  generatedReason   String? // AI生成路径的原因
  adaptationHistory Json[]  // 路径自适应调整历史
}

// 新表：每日任务完成记录
model DailyTaskCompletion {
  id        String   @id @default(cuid())
  userId    String
  pathId    String
  stepId    String
  date      DateTime @default(now())
  completed Boolean
  score     Float?
  timeSpent Int?     // 秒

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([userId, pathId])
}
```

---

### 方案B: **双轨制（保留灵活性）**

#### 核心逻辑
```
用户可选择：
1. 跟随学习路径（系统推荐）
2. 自由练习（自主选择）

系统智能识别：
- 如果用户连续3天跟随路径 → 强化路径引导
- 如果用户频繁自由练习 → 弱化路径，提供灵活推荐
```

#### 实现细节

**1. 用户偏好设置**

```typescript
// 用户学习偏好
interface UserLearningPreference {
  mode: 'guided' | 'flexible' | 'hybrid';
  guidedWeight: number; // 0-1，系统推荐的权重
}

// 动态调整算法
class AdaptiveLearningEngine {
  async adjustPreference(userId: string) {
    const recentBehavior = await this.analyzeRecentBehavior(userId, 7);

    if (recentBehavior.pathFollowRate > 0.8) {
      // 高路径遵循率 → 增强引导
      return { mode: 'guided', guidedWeight: 0.9 };
    } else if (recentBehavior.pathFollowRate < 0.3) {
      // 低路径遵循率 → 增强灵活性
      return { mode: 'flexible', guidedWeight: 0.3 };
    } else {
      // 混合模式
      return { mode: 'hybrid', guidedWeight: 0.6 };
    }
  }
}
```

**2. UI自适应展示**

```tsx
// 根据用户偏好动态调整UI
<DailyPracticeMain preference={userPreference}>
  {userPreference.mode === 'guided' && (
    <GuidedModeUI>
      {/* 突出显示路径推荐 */}
      <PathRecommendationCard primary />
      <OptionalPractices collapsed />
    </GuidedModeUI>
  )}

  {userPreference.mode === 'flexible' && (
    <FlexibleModeUI>
      {/* 平铺所有选项 */}
      <AllPracticeTypes equalWeight />
      <PathSuggestion subtle />
    </FlexibleModeUI>
  )}

  {userPreference.mode === 'hybrid' && (
    <HybridModeUI>
      {/* 路径推荐 + 其他选项 */}
      <TwoColumnLayout>
        <PathRecommendation weight={0.6} />
        <QuickPractices weight={0.4} />
      </TwoColumnLayout>
    </HybridModeUI>
  )}
</DailyPracticeMain>
```

---

## 推荐实施方案：**方案A（路径驱动型）**

### 为什么选择方案A？

1. **降低认知负荷**: 用户不需要在"跟随路径"和"自由练习"之间纠结
2. **目标感更强**: 每天清楚知道"为什么做这个练习"
3. **进度可视化**: 学习路径成为核心进度仪表盘
4. **实施更简单**: 数据流清晰，逻辑统一

### 实施路线图

#### Phase 1: 核心整合（1-2天）

**任务清单**:
- [ ] 创建 `UnifiedRecommendationService` 统一推荐服务
- [ ] 实现 `getDailyTaskFromPath()` 方法
- [ ] 修改 `/api/daily-practice/status` 返回路径上下文
- [ ] 更新 `DailyPracticeMain` UI组件

**关键文件**:
```
/src/lib/services/unified-recommendation.ts  (新建)
/src/app/api/daily-practice/status/route.ts  (修改)
/src/components/learn/daily/DailyPracticeMain.tsx  (重构)
```

#### Phase 2: 进度同步（1天）

**任务清单**:
- [ ] 创建 `DailyTaskCompletion` 数据表
- [ ] 实现练习完成后更新路径进度
- [ ] 在学习路径页面显示"今日已完成"标记
- [ ] 实现路径步骤自动推进逻辑

**关键文件**:
```
/prisma/schema.prisma  (修改)
/src/app/api/daily-practice/submit/route.ts  (修改)
/src/app/api/learning-path/progress/route.ts  (修改)
```

#### Phase 3: UI优化（1-2天）

**任务清单**:
- [ ] 设计并实现 `PathProgressBar` 组件
- [ ] 创建 `TodayTaskCard` 组件（显示路径上下文）
- [ ] 优化 `OptionalPracticeSection` 样式
- [ ] 移动端适配

**关键文件**:
```
/src/components/learn/daily/PathProgressBar.tsx  (新建)
/src/components/learn/daily/TodayTaskCard.tsx  (新建)
/src/components/learn/daily/DailyPracticeMain.tsx  (重构)
```

#### Phase 4: 智能推荐升级（1天）

**任务清单**:
- [ ] 合并 `smart-recommender.ts` 和 `path-generation-engine.ts` 逻辑
- [ ] 实现路径自适应调整算法
- [ ] 添加"今日任务完成，明日预告"功能
- [ ] 实现智能难度调整

**关键文件**:
```
/src/lib/services/unified-recommendation.ts  (扩展)
/src/lib/services/adaptive-path-engine.ts  (新建)
```

---

## UI/UX设计细节

### 1. 每日练习主页面（重设计）

#### 信息架构
```
┌─────────────────────────────────────┐
│ [← 返回学习中心]                    │
├─────────────────────────────────────┤
│                                      │
│ ░░░░░░░░░░░ 35% ░░░░░░░░░░░         │ ← 路径总进度
│ 基础巩固阶段 (第1周/共8周)           │
│                                      │
├─────────────────────────────────────┤
│                                      │
│ 📅 今日任务                          │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 路径推荐                      │ │
│ │                                 │ │
│ │ 谬误检测 Level 2                │ │ ← 主任务卡片
│ │ 中级 · 预计15分钟                │ │
│ │                                 │ │
│ │ 📍 当前位置：基础巩固阶段         │ │
│ │ 💡 完成后解锁：前提质疑练习       │ │
│ │                                 │ │
│ │ [开始今日练习 →]                 │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ✅ 今日任务已完成！                   │ ← 完成状态
│ 🔥 连续打卡 5 天 | 🏆 本周 4/7      │
│                                      │
├─────────────────────────────────────┤
│                                      │
│ 💪 额外练习（可选）                   │
│                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │多维归因│ │前提质疑│ │迭代反思│   │ ← 其他维度
│ │ 中级   │ │ 中级   │ │ 中级   │   │
│ └────────┘ └────────┘ └────────┘   │
│                                      │
├─────────────────────────────────────┤
│                                      │
│ [查看完整学习路径]  [学习统计]        │ ← 快速入口
│                                      │
└─────────────────────────────────────┘
```

#### 交互流程

**未完成状态**:
1. 用户看到今日任务卡片（高亮）
2. 显示路径上下文："你正在 X 阶段，完成后将达成 Y"
3. 点击"开始今日练习" → 跳转到对应练习页面

**已完成状态**:
1. 显示完成徽章和庆祝动画
2. 展示"明日预告"：下一步学习内容
3. 解锁"额外练习"选项（可选）

### 2. 学习路径页面（优化）

#### 新增功能

**今日任务高亮**:
```tsx
<PathTimeline steps={path.steps}>
  {steps.map(step => (
    <StepCard
      key={step.id}
      isToday={step.id === todayTaskId}  // ← 新增
      completed={step.completed}
    >
      {step.isToday && (
        <Badge>📅 今日任务</Badge>
      )}
      {/* ... */}
    </StepCard>
  ))}
</PathTimeline>
```

**快速开始按钮**:
```tsx
{todayStep && !todayStep.completed && (
  <FloatingActionButton
    onClick={() => router.push('/learn/daily')}
  >
    开始今日练习 →
  </FloatingActionButton>
)}
```

---

## 数据一致性保证

### 状态同步机制

```typescript
// 练习完成后的同步逻辑
async function onPracticeComplete(userId: string, practiceData: PracticeData) {
  await prisma.$transaction(async (tx) => {
    // 1. 记录每日练习完成
    await tx.dailyTaskCompletion.create({
      data: {
        userId,
        stepId: practiceData.stepId,
        date: new Date(),
        completed: true,
        score: practiceData.score,
        timeSpent: practiceData.timeSpent
      }
    });

    // 2. 更新学习路径进度
    const path = await tx.learningPathState.findFirst({
      where: { userId, status: 'active' }
    });

    if (path) {
      const steps = JSON.parse(path.pathSteps as string);
      const stepIndex = steps.findIndex(s => s.id === practiceData.stepId);

      if (stepIndex !== -1) {
        steps[stepIndex].completed = true;
        steps[stepIndex].completedAt = new Date();

        await tx.learningPathState.update({
          where: { id: path.id },
          data: {
            pathSteps: JSON.stringify(steps),
            completedSteps: { increment: 1 },
            currentStepIndex: stepIndex + 1,
            progressPercent: Math.round(((stepIndex + 1) / steps.length) * 100),
            lastAccessedAt: new Date()
          }
        });
      }
    }

    // 3. 更新streak和统计
    await updateUserStreak(userId, tx);
  });
}
```

---

## 边缘情况处理

### 1. 用户没有学习路径

**情况**: 新用户第一次打开每日练习
**处理**:
```typescript
if (!existingPath) {
  // 自动生成默认路径
  const defaultPath = await generateDefaultPath(userId);

  // 返回第一步作为今日任务
  return {
    todayTask: defaultPath.steps[0],
    isFirstTime: true,
    message: '我们为你生成了个性化学习路径，从基础开始吧！'
  };
}
```

### 2. 用户跳过今日任务

**情况**: 用户选择"额外练习"而非路径推荐
**处理**:
```typescript
// 记录偏离行为，但不惩罚
await logPathDeviation(userId, {
  expectedStep: todayTask.id,
  actualPractice: userChoice,
  reason: 'user_preference'
});

// 如果连续3天偏离，弹出提示
if (recentDeviations >= 3) {
  showSuggestion({
    title: '注意到你最近偏离了学习路径',
    message: '是否需要重新生成更符合你的路径？',
    actions: ['保持当前路径', '重新生成路径']
  });
}
```

### 3. 路径过时

**情况**: 用户长时间未练习，路径不再适合
**处理**:
```typescript
// 检查路径是否过期
if (daysSinceLastAccess > 14) {
  // 触发路径评估
  const needsUpdate = await evaluatePathRelevance(userId, currentPath);

  if (needsUpdate) {
    showModal({
      title: '学习路径可能需要更新',
      message: '距离上次练习已过去2周，是否重新评估路径？',
      actions: ['继续原路径', '重新评估路径']
    });
  }
}
```

---

## 性能优化

### 1. 路径数据缓存

```typescript
// Redis缓存热路径数据
const CACHE_TTL = 3600; // 1小时

async function getCachedPath(userId: string) {
  const cacheKey = `learning-path:${userId}`;

  // 尝试从缓存读取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 缓存未命中，从数据库读取
  const path = await prisma.learningPathState.findFirst({
    where: { userId, status: 'active' }
  });

  if (path) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(path));
  }

  return path;
}
```

### 2. 推荐计算优化

```typescript
// 预计算明日任务（每日凌晨2点）
cron.schedule('0 2 * * *', async () => {
  const activeUsers = await getActiveUsers();

  for (const user of activeUsers) {
    // 预计算明日推荐
    const tomorrowTask = await calculateNextDayTask(user.id);

    // 存入缓存
    await redis.setex(
      `tomorrow-task:${user.id}`,
      86400, // 24小时
      JSON.stringify(tomorrowTask)
    );
  }
});
```

---

## 测试计划

### 单元测试

```typescript
describe('UnifiedRecommendationService', () => {
  it('should return current step task for user with active path', async () => {
    const service = new UnifiedRecommendationService();
    const task = await service.getDailyTask(testUserId);

    expect(task).toBeDefined();
    expect(task.context.pathProgress).toBeGreaterThan(0);
  });

  it('should generate default path for new user', async () => {
    const task = await service.getDailyTask(newUserId);

    expect(task.isFirstTime).toBe(true);
    expect(task.todayTask.level).toBe(1);
  });

  it('should advance to next step after completion', async () => {
    await service.completeTask(testUserId, currentStepId);
    const nextTask = await service.getDailyTask(testUserId);

    expect(nextTask.todayTask.id).not.toBe(currentStepId);
  });
});
```

### 集成测试

```typescript
describe('Daily Practice + Learning Path Integration', () => {
  it('should update path progress when daily task completed', async () => {
    // 1. 获取今日任务
    const task = await fetch('/api/daily-practice/status');
    const stepId = task.data.todayTask.id;

    // 2. 完成练习
    await fetch('/api/daily-practice/submit', {
      method: 'POST',
      body: JSON.stringify({ stepId, score: 85 })
    });

    // 3. 验证路径更新
    const path = await fetch('/api/learning-path/current');
    expect(path.data.path.completedSteps).toHaveIncreased();
  });
});
```

---

## 监控指标

### 核心指标

1. **路径遵循率** = (跟随路径练习次数 / 总练习次数) × 100%
   - 目标: >80%

2. **路径完成率** = (完整完成路径的用户数 / 生成路径的用户数) × 100%
   - 目标: >60%

3. **每日任务完成率** = (完成今日任务的用户数 / 活跃用户数) × 100%
   - 目标: >70%

4. **用户困惑度** = 通过埋点统计"返回"、"切换页面"等行为
   - 目标: 降低30%

### 监控实现

```typescript
// 埋点示例
async function trackUserBehavior(userId: string, event: AnalyticsEvent) {
  await analytics.track({
    userId,
    event: event.name,
    properties: {
      pathFollowRate: await calculatePathFollowRate(userId),
      dailyTaskCompleted: event.name === 'daily_task_completed',
      timestamp: new Date()
    }
  });
}
```

---

## 总结

### 核心改进

1. **统一入口**: 每日练习成为学习路径的执行入口
2. **目标明确**: 用户清楚知道"今天为什么做这个练习"
3. **进度可视**: 每日进度直接反映在学习路径上
4. **降低困惑**: 消除"先做哪个"的选择焦虑

### 预期收益

- ✅ 用户完成率提升 **30%+**
- ✅ 平均学习时长增加 **25%+**
- ✅ 用户留存率提升 **20%+**
- ✅ 用户困惑度降低 **40%+**

### 下一步行动

1. **本周**: 完成Phase 1核心整合
2. **下周**: 完成Phase 2进度同步 + Phase 3 UI优化
3. **第3周**: 完成Phase 4智能推荐升级 + 全面测试
4. **第4周**: 灰度发布 + 监控指标 + 迭代优化

---

**创建时间**: 2025-10-23
**状态**: 设计方案已完成，待评审和实施
**负责人**: Claude Code
