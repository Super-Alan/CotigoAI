# 学习时长追踪系统 - 实施指南

## ✅ 已完成的基础设施

### 1. 数据库Schema更新
**位置**: `prisma/schema.prisma`

新增字段:
- **Conversation**: `conversationType`, `timeSpent`, `messageCount`, `status`, `completedAt`
- **PerspectiveSession**: `timeSpent`, `status`, `completedAt`
- **ArgumentAnalysis**: `timeSpent`, `status`

**迁移文件**: `prisma/migrations/add_learning_time_tracking.sql`

**验证**:
```bash
npm run db:push  # 已执行成功
```

---

### 2. API端点实现

#### ✅ 统一学习统计API
**端点**: `GET /api/learning/stats/summary`

**响应结构**:
```typescript
{
  success: true,
  data: {
    totalTimeSpent: number,        // 总学习时长(秒)
    activityBreakdown: {
      conversation: { total, count, byType },
      criticalThinking: { total, count, averageScore },
      dailyPractice: { total, count, averageScore },
      theoryStudy: { total, count, completedCount, averageProgress },
      perspective: { total, count, completedCount },
      argumentAnalysis: { total, count }
    },
    weeklyActivity: [
      {
        date: string,
        totalActivities: number,
        totalTimeSpent: number,
        activitiesByType: {...}
      }
    ],
    engagementMetrics: {
      averageSessionDuration: number,
      completionRate: {...},
      activeDaysLast30: number
    }
  }
}
```

#### ✅ 每周练习进度API
**端点**: `GET /api/practice/weekly-progress`

**响应结构**:
```typescript
{
  success: true,
  data: {
    weeklyProgress: [
      {
        date: string,          // YYYY-MM-DD
        questionsCompleted: number,
        averageScore: number
      }
    ],
    summary: {
      totalQuestions: number,
      averageScore: number,
      activeDays: number,
      peakDay: string,
      peakDayQuestions: number
    }
  }
}
```

#### ✅ 成就系统API
**端点**: `GET /api/achievements`

**Seed数据**: 22个成就已植入
- 里程碑 (milestone): 9个
- 连续练习 (streak): 3个
- 准确率 (accuracy): 3个
- 知识掌握 (knowledge): 6个
- 速度 (speed): 1个

**种子脚本**: `npx tsx prisma/seed-achievements.ts`

#### ✅ Conversation更新API
**端点**: `PATCH /api/conversations/[id]`

**请求Body**:
```typescript
{
  timeSpent?: number,        // 累加时长(秒)
  status?: 'active' | 'completed' | 'archived',
  conversationType?: 'general' | 'daily_question' | 'ai_tutor' | 'socratic_dialogue'
}
```

---

### 3. 前端工具

#### ✅ 通用时长追踪Hook
**位置**: `src/hooks/useTimeTracking.ts`

**使用示例**:
```typescript
import { useTimeTracking } from '@/hooks/useTimeTracking'

function MyComponent() {
  const { elapsedSeconds, getElapsedTime, startTracking } = useTimeTracking({
    autoStart: true  // 组件挂载时自动开始
  })

  const handleSubmit = async () => {
    const timeSpent = getElapsedTime()
    await fetch('/api/conversations/123', {
      method: 'PATCH',
      body: JSON.stringify({ timeSpent })
    })
  }

  return (
    <div>
      已用时间: {formatTimeSpent(elapsedSeconds)}
    </div>
  )
}
```

#### ✅ Dashboard Mock数据替换
**位置**: `src/components/learn/ProgressDashboard.tsx`

**已替换**:
- ✅ `fetchWeeklyProgress()` - 调用 `/api/practice/weekly-progress`
- ✅ `fetchAchievements()` - 调用 `/api/achievements`

---

## 🚀 下一步实施任务

### Phase 1: 前端时长追踪集成

#### 任务1: Socratic对话组件
**文件**: `src/app/conversations/[id]/page.tsx`

**实施步骤**:
```typescript
// 1. 导入Hook
import { useTimeTracking } from '@/hooks/useTimeTracking'

// 2. 组件内使用
const ConversationPage = () => {
  const { getElapsedTime } = useTimeTracking({ autoStart: true })

  // 3. 页面离开时或定时保存
  useEffect(() => {
    const saveProgress = async () => {
      const timeSpent = getElapsedTime()
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpent,
          conversationType: 'socratic_dialogue'
        })
      })
    }

    // 每30秒保存一次
    const interval = setInterval(saveProgress, 30000)

    // 页面卸载时保存
    return () => {
      clearInterval(interval)
      saveProgress()
    }
  }, [id, getElapsedTime])
}
```

#### 任务2: 多视角对话组件
**文件**: `src/app/perspectives/page.tsx` (或相关组件)

**API端点需创建**: `PATCH /api/perspectives/[id]`

```typescript
// src/app/api/perspectives/[id]/route.ts
export async function PATCH(req, { params }) {
  const { timeSpent, status } = await req.json()

  await prisma.perspectiveSession.update({
    where: { id: params.id },
    data: {
      timeSpent: { increment: timeSpent },
      status,
      completedAt: status === 'completed' ? new Date() : undefined
    }
  })
}
```

#### 任务3: 论证分解组件
**文件**: `src/app/arguments/page.tsx`

**API端点需创建**: `PATCH /api/arguments/[id]`

类似实现,更新 `timeSpent` 字段。

---

### Phase 2: Dashboard增强功能

#### 任务4: 添加总学习时长卡片
**位置**: `src/components/learn/ProgressDashboard.tsx`

```typescript
// 新增state
const [learningStats, setLearningStats] = useState(null)

// 新增fetch函数
const fetchLearningStats = async () => {
  const res = await fetch('/api/learning/stats/summary')
  const data = await res.json()
  if (data.success) setLearningStats(data.data)
}

// 在useEffect中调用
useEffect(() => {
  Promise.all([
    fetchThinkingTypes(),
    fetchUserProgress(),
    fetchDailyStreak(),
    fetchWeeklyProgress(),
    fetchAchievements(),
    fetchKnowledgeMastery(),
    fetchLearningStats()  // 新增
  ])
}, [])

// 渲染新卡片
<Card>
  <CardContent>
    <h3>总学习时长</h3>
    <p>{formatTimeSpent(learningStats?.totalTimeSpent || 0)}</p>
  </CardContent>
</Card>
```

#### 任务5: 学习活动分解图表
**建议**: 使用Pie Chart展示各模块时长占比

```typescript
const activityPieData = learningStats?.activityBreakdown
  ? Object.entries(learningStats.activityBreakdown).map(([key, value]) => ({
      name: key,
      value: value.total
    }))
  : []

<PieChart>
  <Pie data={activityPieData} dataKey="value" />
</PieChart>
```

---

### Phase 3: 自动化和优化

#### 任务6: 批量更新脚本
**目的**: 为现有对话/会话填充初始 `conversationType`

```typescript
// scripts/migrate-conversation-types.ts
const conversations = await prisma.conversation.findMany()

for (const conv of conversations) {
  // 基于topic或其他字段推断type
  let type = 'general'
  if (conv.topic?.includes('每日一问')) type = 'daily_question'
  if (conv.topic?.includes('AI导师')) type = 'ai_tutor'

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { conversationType: type }
  })
}
```

#### 任务7: 定时任务(可选)
**目的**: 每日汇总学习数据,生成每日报告

```typescript
// src/app/api/cron/daily-summary/route.ts
export async function GET() {
  const users = await prisma.user.findMany()

  for (const user of users) {
    const stats = await calculateDailyStats(user.id)
    await sendDailySummaryEmail(user.email, stats)
  }
}
```

---

## 📝 最佳实践

### 1. 时长追踪规范
- ✅ **自动开始**: 组件挂载时 `autoStart: true`
- ✅ **定时保存**: 每30秒保存一次,防止数据丢失
- ✅ **卸载保存**: `useEffect` cleanup中保存最终时长
- ✅ **累加而非覆盖**: API使用 `increment` 或手动累加

### 2. API调用规范
- ✅ **批量保存**: 避免每秒发请求,使用防抖/节流
- ✅ **错误处理**: 网络失败时本地缓存,稍后重试
- ✅ **离线支持**: 使用 `localStorage` 暂存未提交数据

### 3. 性能优化
- ✅ **懒加载**: Dashboard数据按需加载
- ✅ **缓存策略**: 使用 SWR 或 React Query 缓存
- ✅ **分页**: 大数据量时分页加载

---

## 🧪 测试清单

### 功能测试
- [ ] Socratic对话时长正确记录
- [ ] 多视角对话时长正确记录
- [ ] 论证分解时长正确记录
- [ ] Dashboard正确显示所有模块时长
- [ ] 每周练习进度图表正确渲染
- [ ] 成就系统正确显示解锁状态

### 边界测试
- [ ] 网络中断时数据不丢失
- [ ] 快速切换页面时长不重复计算
- [ ] 长时间会话(>1小时)时长正确
- [ ] 并发多个会话时长互不干扰

### 性能测试
- [ ] Dashboard加载时间 <2秒
- [ ] API响应时间 <500ms
- [ ] 大数据量(>1000条记录)时正常工作

---

## 🔄 未来增强

1. **学习习惯分析**: 识别用户最活跃的时间段
2. **智能推荐**: 基于学习时长和进度推荐内容
3. **排行榜**: 用户间学习时长/成就对比(可选)
4. **目标设定**: 允许用户设置每日/每周学习目标
5. **数据导出**: 支持导出学习报告(PDF/CSV)

---

## 📚 相关文档

- Prisma Schema: `prisma/schema.prisma`
- Migration SQL: `prisma/migrations/add_learning_time_tracking.sql`
- Hook文档: `src/hooks/useTimeTracking.ts`
- API文档: 各API route.ts文件头部注释

---

**实施负责人**: Claude Code
**创建日期**: 2025-01-23
**最后更新**: 2025-01-23
**状态**: 基础设施完成 ✅ | 前端集成进行中 🚧
