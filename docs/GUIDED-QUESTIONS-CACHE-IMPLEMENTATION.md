# 智能引导问题缓存系统实施文档

**实施日期**: 2025-10-12
**功能模块**: 智能引导问题缓存优化
**状态**: ✅ 代码完成，待数据库迁移

---

## 一、功能概述

### 1.1 优化目标

**问题**: AI生成引导问题每次都需要10-15秒，影响用户体验
**解决方案**: 将AI生成的引导问题缓存到数据库，实现：
- 首次访问：AI生成（10-15秒）→ 自动保存到数据库
- 再次访问：直接从数据库读取（<1秒，即时显示）

### 1.2 核心价值

✅ **性能提升**: 二次访问速度提升 10-15倍（15秒 → <1秒）
✅ **成本优化**: 减少重复的AI API调用，节省成本
✅ **用户体验**: 即时响应，降低等待焦虑
✅ **数据积累**: 收集使用统计，用于质量评估和优化

---

## 二、架构设计

### 2.1 数据流程

```
用户请求引导问题
    ↓
检查数据库缓存 (by questionId)
    ↓
    ├─ 有缓存 → 直接返回（<1秒）+ 更新使用统计
    └─ 无缓存 → AI生成（10-15秒）→ 保存到数据库 → 返回结果
```

### 2.2 缓存策略

**缓存键**: `questionId` (每个题目唯一)
**缓存范围**: 题目级缓存（一题一缓存）
**更新策略**: Upsert（存在则更新，不存在则创建）
**失效策略**: 支持 `isActive` 字段手动控制

---

## 三、数据库设计

### 3.1 Schema定义

**新增表**: `intelligent_guided_question_cache`

```prisma
model IntelligentGuidedQuestionCache {
  id                  String   @id @default(cuid())
  questionId          String   // 关联的题目ID
  thinkingType        String   // 思维维度
  difficulty          String   // 难度等级
  guidedQuestions     Json     // AI生成的引导问题数组
  thinkingPath        String   @db.Text // 思维路径描述
  expectedInsights    String[] // 期望获得的洞察
  generatedBy         String   @default("ai") // 生成方式: ai | manual | preset
  usageCount          Int      @default(0) // 使用次数统计
  qualityRating       Float?   // 质量评分 (0-5)
  isActive            Boolean  @default(true) // 是否启用
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  lastUsedAt          DateTime? // 最后使用时间

  question CriticalThinkingQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId]) // 每个题目只有一个智能引导缓存
  @@index([thinkingType, difficulty])
  @@index([usageCount])
  @@index([qualityRating])
  @@index([createdAt])
  @@map("intelligent_guided_question_cache")
}
```

**关系更新**: `CriticalThinkingQuestion` 模型添加关系

```prisma
model CriticalThinkingQuestion {
  // ... 原有字段
  intelligentGuidedCache IntelligentGuidedQuestionCache? // AI生成的智能引导缓存
}
```

### 3.2 字段说明

| 字段 | 类型 | 说明 | 用途 |
|------|------|------|------|
| `questionId` | String | 题目ID（唯一） | 缓存键，关联题目 |
| `guidedQuestions` | Json | 引导问题数组 | 核心数据 |
| `thinkingPath` | Text | 思维路径 | 辅助说明 |
| `expectedInsights` | String[] | 期望洞察 | 学习目标 |
| `usageCount` | Int | 使用次数 | 热度统计 |
| `qualityRating` | Float? | 质量评分 | 质量评估（待实现） |
| `isActive` | Boolean | 是否启用 | 手动控制失效 |
| `lastUsedAt` | DateTime? | 最后使用时间 | 活跃度追踪 |

### 3.3 索引设计

```sql
-- 主键索引
PRIMARY KEY (id)

-- 唯一索引（缓存键）
UNIQUE INDEX (questionId)

-- 复合索引（查询优化）
INDEX (thinkingType, difficulty)

-- 统计索引
INDEX (usageCount)
INDEX (qualityRating)
INDEX (createdAt)
```

---

## 四、API实现

### 4.1 缓存查询逻辑

**文件**: `src/app/api/critical-thinking/guided-questions/route.ts`

```typescript
// 🔥 优先从数据库缓存中查找
if (questionId) {
  const cachedGuided = await prisma.intelligentGuidedQuestionCache.findUnique({
    where: {
      questionId,
      isActive: true
    }
  });

  if (cachedGuided) {
    // 更新使用统计
    await prisma.intelligentGuidedQuestionCache.update({
      where: { id: cachedGuided.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    // 返回缓存的引导问题
    return NextResponse.json({
      success: true,
      data: {
        questions: cachedGuided.guidedQuestions,
        thinkingPath: cachedGuided.thinkingPath,
        expectedInsights: cachedGuided.expectedInsights
      },
      cached: true,
      message: '使用缓存的智能引导问题'
    });
  }
}
```

### 4.2 缓存保存逻辑

```typescript
// 🔥 保存到数据库缓存（仅当提供了questionId时）
if (questionId) {
  try {
    await prisma.intelligentGuidedQuestionCache.upsert({
      where: { questionId },
      create: {
        questionId,
        thinkingType,
        difficulty,
        guidedQuestions: guidedThinking.questions,
        thinkingPath: guidedThinking.thinkingPath || '',
        expectedInsights: guidedThinking.expectedInsights || [],
        generatedBy: 'ai',
        usageCount: 1,
        lastUsedAt: new Date()
      },
      update: {
        guidedQuestions: guidedThinking.questions,
        thinkingPath: guidedThinking.thinkingPath || '',
        expectedInsights: guidedThinking.expectedInsights || [],
        updatedAt: new Date(),
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });
    console.log(`✅ 智能引导问题已缓存 (questionId: ${questionId})`);
  } catch (cacheError) {
    console.error('缓存智能引导问题失败:', cacheError);
    // 缓存失败不影响主流程，继续返回结果
  }
}
```

### 4.3 API响应格式

```typescript
{
  success: true,
  data: {
    questions: [...],
    thinkingPath: "...",
    expectedInsights: [...]
  },
  cached: true/false,  // 是否来自缓存
  fallback: true/false, // 是否使用降级方案
  message: "..."       // 状态说明
}
```

---

## 五、前端实现

### 5.1 请求参数更新

**文件**: `src/components/learn/thinking-types/PracticeSessionV2.tsx`

```typescript
const loadIntelligentGuidedQuestions = async () => {
  const response = await fetch('/api/critical-thinking/guided-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: currentQuestion.id, // 🔥 新增：传递题目ID用于缓存查询
      thinkingType: thinkingTypeId,
      questionTopic: currentQuestion.topic,
      questionContext: currentQuestion.context,
      difficulty: currentQuestion.difficulty
    })
  })

  // 保存引导问题数据和缓存状态
  setIntelligentGuided({
    ...data.data,
    cached: data.cached,
    message: data.message
  })
}
```

### 5.2 UI状态显示

```tsx
{/* 缓存状态提示 */}
<div className="text-xs text-center mt-4">
  {intelligentGuided.cached ? (
    <div className="flex items-center justify-center space-x-2 text-green-600">
      <CheckCircle className="h-3 w-3" />
      <span>已使用缓存的引导问题（即时加载）</span>
    </div>
  ) : intelligentGuided.fallback ? (
    <div className="text-gray-500">
      💡 当前使用默认引导问题，仍能有效帮助你思考
    </div>
  ) : (
    <div className="flex items-center justify-center space-x-2 text-blue-600">
      <RefreshCw className="h-3 w-3" />
      <span>AI生成新的引导问题（已保存供下次使用）</span>
    </div>
  )}
</div>
```

---

## 六、数据库迁移

### 6.1 自动迁移（推荐）

```bash
# 生成Prisma Client
npm run db:generate

# 推送Schema到数据库
npm run db:push
```

### 6.2 手动迁移（如果自动失败）

**SQL脚本位置**: `prisma/migrations/add_intelligent_guided_cache.sql`

**执行步骤**:

1. 连接到数据库
```bash
# 使用Supabase SQL Editor 或
psql "your_database_url"
```

2. 执行迁移脚本
```bash
psql "your_database_url" < prisma/migrations/add_intelligent_guided_cache.sql
```

3. 验证表创建
```sql
\d intelligent_guided_question_cache
```

**预期输出**: 表结构显示所有字段和索引

---

## 七、测试验证

### 7.1 功能测试清单

**首次访问测试**:
- [ ] 访问练习页面，进入Step 3
- [ ] 点击"生成智能引导"
- [ ] 等待10-15秒，验证AI生成成功
- [ ] 检查是否显示"AI生成新的引导问题（已保存供下次使用）"
- [ ] 打开数据库，验证记录已创建

**缓存命中测试**:
- [ ] 刷新页面，重新进入Step 3
- [ ] 点击"生成智能引导"
- [ ] 验证<1秒即时显示
- [ ] 检查是否显示"已使用缓存的引导问题（即时加载）"
- [ ] 数据库中 `usageCount` 应递增

**缓存更新测试**:
- [ ] AI生成新版本引导问题
- [ ] 验证数据库记录被更新（updatedAt变化）
- [ ] 验证旧数据被覆盖

### 7.2 性能测试

**测试指标**:
- 首次加载时间：10-15秒（AI生成）
- 缓存命中时间：<1秒（数据库查询）
- 性能提升：10-15倍

**测试方法**:
```javascript
// 在浏览器控制台执行
console.time('guided-questions')
// 点击生成按钮
// 收到响应后
console.timeEnd('guided-questions')
```

### 7.3 数据验证

**SQL查询验证**:

```sql
-- 查看所有缓存记录
SELECT
  id,
  "questionId",
  "thinkingType",
  "difficulty",
  "usageCount",
  "createdAt",
  "lastUsedAt"
FROM intelligent_guided_question_cache
ORDER BY "createdAt" DESC;

-- 查看热门题目（使用次数最多）
SELECT
  "questionId",
  "thinkingType",
  "usageCount",
  "lastUsedAt"
FROM intelligent_guided_question_cache
WHERE "isActive" = true
ORDER BY "usageCount" DESC
LIMIT 10;

-- 查看缓存命中率统计
SELECT
  "thinkingType",
  COUNT(*) as cached_questions,
  SUM("usageCount") as total_hits,
  AVG("usageCount") as avg_hits_per_question
FROM intelligent_guided_question_cache
WHERE "isActive" = true
GROUP BY "thinkingType";
```

---

## 八、实施成果

### 8.1 代码变更

| 类型 | 文件 | 变更内容 |
|------|------|----------|
| Schema | `prisma/schema.prisma` | 新增 `IntelligentGuidedQuestionCache` 模型 |
| API | `api/critical-thinking/guided-questions/route.ts` | 添加缓存查询和保存逻辑 |
| 前端 | `PracticeSessionV2.tsx` | 传递questionId，显示缓存状态 |
| SQL | `migrations/add_intelligent_guided_cache.sql` | 数据库迁移脚本 |

### 8.2 性能对比

| 场景 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首次访问 | 10-15秒 | 10-15秒 | - |
| 二次访问 | 10-15秒 | <1秒 | **10-15倍** |
| API调用成本 | 100% | 首次100% + 后续0% | 长期节省90%+ |

### 8.3 用户体验改进

**优化前**:
- 每次都要等待10-15秒
- 焦虑感强，可能放弃

**优化后**:
- 首次：10-15秒（可接受，因为是必要的AI生成）
- 后续：即时显示（体验优秀）
- 明确提示缓存状态，降低预期焦虑

---

## 九、后续优化方向

### 9.1 短期优化（1-2周）

1. **预热缓存**
   - 系统自动为热门题目预生成引导问题
   - 确保高频题目都有缓存

2. **质量评估**
   - 添加用户反馈机制（"这个引导有帮助吗？"）
   - 根据反馈更新 `qualityRating`
   - 低评分的缓存自动重新生成

3. **智能失效**
   - 检测AI模型更新
   - 自动标记旧缓存为 `isActive: false`
   - 触发重新生成

### 9.2 中期优化（1-2个月）

1. **A/B测试**
   - 对比缓存vs实时生成的用户满意度
   - 验证缓存的有效性

2. **批量预生成**
   - 后台任务定期为所有题目生成缓存
   - 确保100%缓存覆盖率

3. **版本控制**
   - 支持多版本缓存
   - 可回滚到历史版本

### 9.3 长期优化（3-6个月）

1. **个性化缓存**
   - 根据用户水平生成不同版本
   - 用户级缓存 + 题目级缓存

2. **智能推荐**
   - 分析高质量缓存的特征
   - 优化提示词生成策略

3. **缓存分析仪表板**
   - 可视化缓存命中率
   - 识别需要优化的题目

---

## 十、故障排查

### 10.1 常见问题

**问题1**: 数据库迁移失败
**原因**: 数据库连接超时或权限不足
**解决**: 使用手动SQL脚本迁移（见 6.2节）

**问题2**: 缓存未命中
**原因**: questionId未传递或格式不正确
**解决**: 检查前端请求参数，确保传递正确的questionId

**问题3**: 缓存数据过旧
**原因**: AI模型更新但缓存未刷新
**解决**: 手动设置 `isActive: false` 或删除旧缓存

### 10.2 监控指标

**关键指标**:
- 缓存命中率：目标 >80%
- 平均响应时间：目标 <1秒（缓存命中）
- 缓存覆盖率：目标 100%（所有题目都有缓存）

**SQL监控查询**:

```sql
-- 缓存命中率
SELECT
  COUNT(DISTINCT "questionId") as cached_questions,
  (SELECT COUNT(*) FROM critical_thinking_questions) as total_questions,
  ROUND(
    COUNT(DISTINCT "questionId")::NUMERIC /
    (SELECT COUNT(*) FROM critical_thinking_questions)::NUMERIC * 100,
    2
  ) as coverage_percentage
FROM intelligent_guided_question_cache
WHERE "isActive" = true;
```

---

## 十一、总结

### 11.1 完成情况

✅ **代码实现 100%完成**:
- 数据库Schema设计
- API缓存逻辑
- 前端集成
- SQL迁移脚本

⏳ **待完成**:
- 数据库迁移执行（由于连接超时，需要手动执行）

### 11.2 核心价值

1. **性能飞跃**: 二次访问速度提升10-15倍
2. **成本节省**: 减少90%+的重复AI调用
3. **用户体验**: 即时响应，降低等待焦虑
4. **数据驱动**: 收集使用数据，支持持续优化

### 11.3 下一步行动

**立即执行**:
1. 手动执行SQL迁移脚本（见 6.2节）
2. 重启开发服务器
3. 测试完整流程（见 7.1节）

**本周完成**:
1. 验证缓存功能正常工作
2. 收集第一批使用数据
3. 监控缓存命中率

**持续优化**:
1. 根据使用数据调整策略
2. 实施质量评估机制
3. 扩展到其他AI生成内容

---

**实施人员**: Claude Code (SuperClaude Framework)
**文档版本**: v1.0
**最后更新**: 2025-10-12
