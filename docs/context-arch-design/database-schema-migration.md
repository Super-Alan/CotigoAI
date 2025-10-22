# 数据库Schema迁移方案

## 文档信息

- **版本**: v1.0
- **创建日期**: 2025-10-19
- **目的**: 详细的数据库Schema扩展和迁移方案
- **技术栈**: PostgreSQL + Prisma ORM

---

## 一、Schema扩展概览

### 1.1 新增表

| 表名 | 用途 | 记录数预估 |
|------|------|-----------|
| `LevelLearningContent` | 存储Level 1-5学习内容 | ~100-150条 |

### 1.2 扩展现有表

| 表名 | 新增字段 | 用途 |
|------|---------|------|
| `CriticalThinkingQuestion` | `level`, `learningObjectives`, `scaffolding`, `assessmentCriteria` | Level分级和教学支持 |
| `CriticalThinkingProgress` | `currentLevel`, `level1-5Progress`, `level1-5Unlocked` | Level进度追踪 |
| `CriticalThinkingPracticeSession` | `level`, `stepProgress`, `reflectionNotes`, `improvementPlan` | 6步练习流程 |

---

## 二、详细Schema定义

### 2.1 新增表：LevelLearningContent

```prisma
// 学习内容表 - 存储5维度 × 5级别 × 4类型的学习材料
model LevelLearningContent {
  id                String       @id @default(cuid())
  thinkingTypeId    String       // 关联到ThinkingType
  level             Int          // 1-5
  contentType       String       // "concepts" | "frameworks" | "examples" | "practice_guide"
  title             String       // 内容标题
  description       String       @db.Text  // 内容简介
  content           Json         // 内容主体（支持Markdown、交互元素）
  estimatedTime     Int          // 预计学习时间（分钟）
  orderIndex        Int          // 同类型内容的排序
  tags              String[]     // 标签数组
  prerequisites     String[]     // 前置内容ID数组

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // 关联关系
  thinkingType      ThinkingType @relation(fields: [thinkingTypeId], references: [id], onDelete: Cascade)

  // 索引
  @@unique([thinkingTypeId, level, contentType, orderIndex])
  @@index([thinkingTypeId])
  @@index([level])
  @@index([contentType])

  @@map("level_learning_contents")
}
```

**字段说明**:

- **id**: 唯一标识符（CUID）
- **thinkingTypeId**: 思维维度ID（causal_analysis, premise_challenge等）
- **level**: Level级别（1-5）
- **contentType**: 内容类型
  - `concepts`: 概念讲解
  - `frameworks`: 分析框架
  - `examples`: 典型示例
  - `practice_guide`: 实践练习指南
- **title**: 内容标题（如"相关性 vs 因果性"）
- **description**: 内容简介（用于预览和搜索）
- **content**: JSON格式的内容主体
- **estimatedTime**: 预计学习时间（分钟）
- **orderIndex**: 排序索引（用于控制同类型内容的显示顺序）
- **tags**: 标签数组（用于搜索和分类）
- **prerequisites**: 前置内容ID（学习路径依赖）

**Content JSON结构**:
```json
{
  "sections": [
    {
      "type": "text",
      "title": "核心概念",
      "content": "Markdown格式的文本内容..."
    },
    {
      "type": "table",
      "title": "关键区别",
      "headers": ["维度", "相关性", "因果性"],
      "rows": [
        ["时间关系", "可同时发生", "必须原因在前"],
        ["必然性", "共同变化但无必然联系", "原因导致结果"]
      ]
    },
    {
      "type": "code",
      "language": "javascript",
      "title": "解锁算法示例",
      "code": "function checkLevelUnlock() {...}"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "注意",
      "content": "相关性 ≠ 因果性"
    },
    {
      "type": "interactive",
      "componentType": "checklist",
      "title": "因果分析检查清单",
      "items": [
        "□ 原因发生在结果之前",
        "□ 时间延迟合理",
        "□ 能解释作用机制"
      ]
    }
  ]
}
```

---

### 2.2 扩展表：CriticalThinkingQuestion

```prisma
model CriticalThinkingQuestion {
  id                String    @id @default(cuid())
  thinkingTypeId    String
  topic             String
  context           String?   @db.Text
  question          String    @db.Text
  difficulty        String    // "beginner" | "intermediate" | "advanced"
  tags              String[]
  caseAnalysis      Json?
  thinkingFramework Json?
  expectedOutcomes  Json?

  // ===== 新增字段 =====
  level              Int       @default(1)  // Level 1-5
  learningObjectives Json      // ["目标1", "目标2", "目标3"]
  scaffolding        Json?     // Level 1-3的思维脚手架
  assessmentCriteria Json      // 评估标准
  // ==================

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  thinkingType      ThinkingType @relation(fields: [thinkingTypeId], references: [id], onDelete: Cascade)
  guidingQuestions  GuidingQuestion[]
  practiceSessions  CriticalThinkingPracticeSession[]

  @@index([thinkingTypeId])
  @@index([difficulty])
  @@index([level])  // 新增索引

  @@map("critical_thinking_questions")
}
```

**新增字段说明**:

- **level**: Level级别（1-5）
- **learningObjectives**: 学习目标数组
  ```json
  [
    "区分相关性与因果性",
    "识别虚假相关",
    "应用因果分析三步法"
  ]
  ```
- **scaffolding**: 思维脚手架（仅Level 1-3）
  ```json
  {
    "timeSequenceChecklist": [
      "事件A发生时间",
      "事件B发生时间",
      "时间先后关系"
    ],
    "thirdVariableHints": [
      "是否有共同原因？",
      "季节因素？",
      "人群特征？"
    ]
  }
  ```
- **assessmentCriteria**: 评估标准
  ```json
  {
    "conceptUnderstanding": "是否理解相关性≠因果性",
    "thirdVariableConsideration": "是否考虑了混淆因素",
    "timeSequenceCheck": "是否验证了时间顺序"
  }
  ```

---

### 2.3 扩展表：CriticalThinkingProgress

```prisma
model CriticalThinkingProgress {
  id                String    @id @default(cuid())
  userId            String
  thinkingTypeId    String
  questionsCompleted Int      @default(0)
  progressPercentage Int      @default(0)
  averageScore      Float     @default(0)
  lastPracticeAt    DateTime?

  // ===== 新增字段 =====
  currentLevel       Int       @default(1)   // 当前所在Level
  level1Progress     Int       @default(0)   // Level 1进度 0-100
  level2Progress     Int       @default(0)   // Level 2进度 0-100
  level3Progress     Int       @default(0)   // Level 3进度 0-100
  level4Progress     Int       @default(0)   // Level 4进度 0-100
  level5Progress     Int       @default(0)   // Level 5进度 0-100
  level1Unlocked     Boolean   @default(true)   // Level 1默认解锁
  level2Unlocked     Boolean   @default(false)
  level3Unlocked     Boolean   @default(false)
  level4Unlocked     Boolean   @default(false)
  level5Unlocked     Boolean   @default(false)
  level1QuestionsCompleted Int @default(0)  // Level 1完成题目数
  level2QuestionsCompleted Int @default(0)
  level3QuestionsCompleted Int @default(0)
  level4QuestionsCompleted Int @default(0)
  level5QuestionsCompleted Int @default(0)
  level1AverageScore Float    @default(0)    // Level 1平均分
  level2AverageScore Float    @default(0)
  level3AverageScore Float    @default(0)
  level4AverageScore Float    @default(0)
  level5AverageScore Float    @default(0)
  // ==================

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  thinkingType      ThinkingType @relation(fields: [thinkingTypeId], references: [id], onDelete: Cascade)

  @@unique([userId, thinkingTypeId])
  @@index([userId])

  @@map("critical_thinking_progress")
}
```

**新增字段说明**:

- **currentLevel**: 用户当前所在的Level（1-5）
- **levelXProgress**: 各Level的进度百分比（0-100）
- **levelXUnlocked**: 各Level的解锁状态（boolean）
- **levelXQuestionsCompleted**: 各Level完成的题目数
- **levelXAverageScore**: 各Level的平均分

---

### 2.4 扩展表：CriticalThinkingPracticeSession

```prisma
model CriticalThinkingPracticeSession {
  id                String    @id @default(cuid())
  userId            String
  questionId        String
  userAnswer        String    @db.Text
  score             Float?
  feedback          String?   @db.Text
  status            String    // "in_progress" | "completed" | "abandoned"
  evaluationDetails Json?

  // ===== 新增字段 =====
  level              Int       // 练习时的Level
  stepProgress       Json      // 6步进度记录
  reflectionNotes    String?   @db.Text  // Step 5的反思笔记
  improvementPlan    String?   @db.Text  // Step 5的改进计划
  // ==================

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  completedAt       DateTime?

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question          CriticalThinkingQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
  @@index([status])

  @@map("critical_thinking_practice_sessions")
}
```

**新增字段说明**:

- **level**: 练习时的Level级别
- **stepProgress**: 6步练习流程的进度记录
  ```json
  {
    "currentStep": 3,
    "steps": {
      "1_presentation": {
        "completed": true,
        "timestamp": "2025-01-15T10:23:45Z",
        "timeSpent": 120
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
    "totalTimeSpent": 2184
  }
  ```
- **reflectionNotes**: Step 5的反思笔记
- **improvementPlan**: Step 5的改进计划

---

## 三、迁移步骤

### 3.1 准备工作

**1. 备份现有数据库**
```bash
# 本地数据库备份
npm run db:backup:local

# 远程数据库备份（如果有）
npm run db:backup:remote
```

**2. 测试环境验证**
- 在测试数据库上先执行迁移
- 验证数据完整性
- 测试新功能

---

### 3.2 Prisma Migration

**Step 1: 更新schema.prisma**

```bash
# 编辑 prisma/schema.prisma
# 添加上述所有新增和修改的model定义
```

**Step 2: 生成迁移文件**

```bash
npx prisma migrate dev --name add_level_based_learning_system
```

这将：
- 自动生成SQL迁移文件（`prisma/migrations/xxx_add_level_based_learning_system/migration.sql`）
- 执行迁移到本地数据库
- 重新生成Prisma Client

**Step 3: 检查生成的SQL**

```sql
-- CreateTable
CREATE TABLE "level_learning_contents" (
    "id" TEXT NOT NULL,
    "thinkingTypeId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "tags" TEXT[],
    "prerequisites" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_learning_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "level_learning_contents_thinkingTypeId_idx" ON "level_learning_contents"("thinkingTypeId");
CREATE INDEX "level_learning_contents_level_idx" ON "level_learning_contents"("level");
CREATE INDEX "level_learning_contents_contentType_idx" ON "level_learning_contents"("contentType");
CREATE UNIQUE INDEX "level_learning_contents_thinkingTypeId_level_contentType_ord_key" ON "level_learning_contents"("thinkingTypeId", "level", "contentType", "orderIndex");

-- AlterTable
ALTER TABLE "critical_thinking_questions" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "learningObjectives" JSONB,
ADD COLUMN "scaffolding" JSONB,
ADD COLUMN "assessmentCriteria" JSONB;

CREATE INDEX "critical_thinking_questions_level_idx" ON "critical_thinking_questions"("level");

-- AlterTable
ALTER TABLE "critical_thinking_progress" ADD COLUMN "currentLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "level1Progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level2Progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level3Progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level4Progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level5Progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level1Unlocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "level2Unlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "level3Unlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "level4Unlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "level5Unlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "level1QuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level2QuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level3QuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level4QuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level5QuestionsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "level1AverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "level2AverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "level3AverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "level4AverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "level5AverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "critical_thinking_practice_sessions" ADD COLUMN "level" INTEGER,
ADD COLUMN "stepProgress" JSONB,
ADD COLUMN "reflectionNotes" TEXT,
ADD COLUMN "improvementPlan" TEXT;

-- AddForeignKey
ALTER TABLE "level_learning_contents" ADD CONSTRAINT "level_learning_contents_thinkingTypeId_fkey"
FOREIGN KEY ("thinkingTypeId") REFERENCES "thinking_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

**Step 4: 重新生成Prisma Client**

```bash
npm run db:generate
```

---

### 3.3 数据迁移脚本

**创建迁移脚本**: `prisma/migrations/migrate-existing-data.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据迁移...')

  // 1. 更新现有题目的level字段
  console.log('步骤1: 为现有题目设置level...')

  // 根据difficulty自动分配level
  await prisma.criticalThinkingQuestion.updateMany({
    where: { difficulty: 'beginner' },
    data: { level: 1 }
  })

  await prisma.criticalThinkingQuestion.updateMany({
    where: { difficulty: 'intermediate' },
    data: { level: 2 }
  })

  await prisma.criticalThinkingQuestion.updateMany({
    where: { difficulty: 'advanced' },
    data: { level: 3 }
  })

  // 2. 初始化现有用户的Level进度
  console.log('步骤2: 初始化用户Level进度...')

  const progressRecords = await prisma.criticalThinkingProgress.findMany({
    include: { thinkingType: true }
  })

  for (const progress of progressRecords) {
    const completedQuestions = progress.questionsCompleted
    let currentLevel = 1
    let level2Unlocked = false

    // 根据完成题目数判断初始Level
    if (completedQuestions >= 10) {
      currentLevel = 2
      level2Unlocked = true
    }

    await prisma.criticalThinkingProgress.update({
      where: { id: progress.id },
      data: {
        currentLevel,
        level1Progress: completedQuestions >= 10 ? 100 : completedQuestions * 10,
        level1Unlocked: true,
        level2Unlocked,
        level1QuestionsCompleted: Math.min(completedQuestions, 10),
        level1AverageScore: progress.averageScore
      }
    })
  }

  // 3. 更新现有练习会话的level字段
  console.log('步骤3: 更新练习会话level...')

  const sessions = await prisma.criticalThinkingPracticeSession.findMany({
    include: { question: true }
  })

  for (const session of sessions) {
    await prisma.criticalThinkingPracticeSession.update({
      where: { id: session.id },
      data: {
        level: session.question.level || 1,
        stepProgress: {
          currentStep: 6,
          steps: {
            '1_presentation': { completed: true },
            '2_guided_thinking': { completed: true },
            '3_complete_answer': { completed: true },
            '4_evaluation': { completed: true, score: session.score || 0 },
            '5_reflection': { completed: true },
            '6_next_level': { completed: true }
          }
        }
      }
    })
  }

  console.log('数据迁移完成！')
}

main()
  .catch((e) => {
    console.error('迁移失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**执行迁移脚本**:
```bash
npx tsx prisma/migrations/migrate-existing-data.ts
```

---

### 3.4 验证迁移结果

**验证脚本**: `scripts/verify-migration.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('开始验证迁移结果...\n')

  // 1. 检查新表
  const contentCount = await prisma.levelLearningContent.count()
  console.log(`✅ LevelLearningContent表: ${contentCount}条记录`)

  // 2. 检查扩展字段
  const questionsWithLevel = await prisma.criticalThinkingQuestion.count({
    where: { level: { not: null } }
  })
  const totalQuestions = await prisma.criticalThinkingQuestion.count()
  console.log(`✅ 题目level字段: ${questionsWithLevel}/${totalQuestions}`)

  // 3. 检查进度数据
  const progressWithLevel = await prisma.criticalThinkingProgress.count({
    where: { currentLevel: { not: null } }
  })
  const totalProgress = await prisma.criticalThinkingProgress.count()
  console.log(`✅ 进度currentLevel字段: ${progressWithLevel}/${totalProgress}`)

  // 4. 检查练习会话
  const sessionsWithLevel = await prisma.criticalThinkingPracticeSession.count({
    where: { level: { not: null } }
  })
  const totalSessions = await prisma.criticalThinkingPracticeSession.count()
  console.log(`✅ 练习会话level字段: ${sessionsWithLevel}/${totalSessions}`)

  // 5. 检查数据完整性
  const orphanedQuestions = await prisma.criticalThinkingQuestion.count({
    where: { thinkingType: null }
  })
  console.log(`✅ 孤立题目: ${orphanedQuestions} (应为0)`)

  console.log('\n迁移验证完成！')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**执行验证**:
```bash
npx tsx scripts/verify-migration.ts
```

---

## 四、回滚方案

### 4.1 创建回滚迁移

```bash
npx prisma migrate dev --name rollback_level_based_learning_system
```

**手动编辑回滚SQL**:
```sql
-- DropForeignKey
ALTER TABLE "level_learning_contents" DROP CONSTRAINT "level_learning_contents_thinkingTypeId_fkey";

-- DropTable
DROP TABLE "level_learning_contents";

-- DropIndex
DROP INDEX "critical_thinking_questions_level_idx";

-- AlterTable
ALTER TABLE "critical_thinking_questions" DROP COLUMN "level",
DROP COLUMN "learningObjectives",
DROP COLUMN "scaffolding",
DROP COLUMN "assessmentCriteria";

-- AlterTable
ALTER TABLE "critical_thinking_progress" DROP COLUMN "currentLevel",
DROP COLUMN "level1Progress",
DROP COLUMN "level2Progress",
DROP COLUMN "level3Progress",
DROP COLUMN "level4Progress",
DROP COLUMN "level5Progress",
DROP COLUMN "level1Unlocked",
DROP COLUMN "level2Unlocked",
DROP COLUMN "level3Unlocked",
DROP COLUMN "level4Unlocked",
DROP COLUMN "level5Unlocked",
DROP COLUMN "level1QuestionsCompleted",
DROP COLUMN "level2QuestionsCompleted",
DROP COLUMN "level3QuestionsCompleted",
DROP COLUMN "level4QuestionsCompleted",
DROP COLUMN "level5QuestionsCompleted",
DROP COLUMN "level1AverageScore",
DROP COLUMN "level2AverageScore",
DROP COLUMN "level3AverageScore",
DROP COLUMN "level4AverageScore",
DROP COLUMN "level5AverageScore";

-- AlterTable
ALTER TABLE "critical_thinking_practice_sessions" DROP COLUMN "level",
DROP COLUMN "stepProgress",
DROP COLUMN "reflectionNotes",
DROP COLUMN "improvementPlan";
```

---

## 五、性能优化

### 5.1 索引策略

**已创建的索引**:
- `LevelLearningContent`: `thinkingTypeId`, `level`, `contentType`, 复合唯一索引
- `CriticalThinkingQuestion`: `level`
- `CriticalThinkingProgress`: 无额外索引（已有userId, thinkingTypeId）

**查询优化建议**:
```sql
-- 常见查询1: 获取特定Level的学习内容
EXPLAIN ANALYZE
SELECT * FROM level_learning_contents
WHERE "thinkingTypeId" = 'causal_analysis'
  AND level = 1
ORDER BY "orderIndex";
-- 使用复合索引，性能优异

-- 常见查询2: 获取用户在特定维度的进度
EXPLAIN ANALYZE
SELECT * FROM critical_thinking_progress
WHERE "userId" = 'xxx'
  AND "thinkingTypeId" = 'causal_analysis';
-- 使用唯一索引，性能优异
```

### 5.2 JSON字段优化

**避免深层嵌套查询**:
```typescript
// ❌ 不推荐: 直接在数据库查询JSON字段
const contents = await prisma.levelLearningContent.findMany({
  where: {
    content: {
      path: ['sections', 0, 'type'],
      equals: 'text'
    }
  }
})

// ✅ 推荐: 应用层过滤
const allContents = await prisma.levelLearningContent.findMany({
  where: { thinkingTypeId, level }
})
const textContents = allContents.filter(c =>
  c.content.sections?.[0]?.type === 'text'
)
```

---

## 六、监控与维护

### 6.1 数据监控

**监控指标**:
- 学习内容表记录数（目标: 100-150条）
- 各Level题目分布（目标: Level 1-5均衡）
- 用户Level解锁率（目标: ≥70%解锁Level 2）
- 数据库查询性能（目标: P95 < 100ms）

**监控SQL**:
```sql
-- 统计各Level的学习内容数量
SELECT level, "contentType", COUNT(*) as count
FROM level_learning_contents
GROUP BY level, "contentType"
ORDER BY level, "contentType";

-- 统计各Level的题目数量
SELECT level, COUNT(*) as count
FROM critical_thinking_questions
GROUP BY level
ORDER BY level;

-- 统计用户Level解锁情况
SELECT
  COUNT(CASE WHEN "level2Unlocked" = true THEN 1 END) * 100.0 / COUNT(*) as level2_unlock_rate,
  COUNT(CASE WHEN "level3Unlocked" = true THEN 1 END) * 100.0 / COUNT(*) as level3_unlock_rate
FROM critical_thinking_progress;
```

### 6.2 定期维护

**每周任务**:
- 检查孤立数据（无关联的内容）
- 清理过期的练习会话（>90天未更新）
- 更新统计缓存

**每月任务**:
- 分析慢查询日志
- 优化高频查询索引
- 数据库性能报告

---

## 七、常见问题

### Q1: 迁移后现有用户的进度如何处理？

**A**: 自动迁移脚本会：
- 保留用户的总体进度（`questionsCompleted`, `averageScore`）
- 根据完成题目数判断初始Level（≥10题自动解锁Level 2）
- 将历史平均分映射到`level1AverageScore`

### Q2: 如果迁移失败如何恢复？

**A**:
1. 立即停止应用
2. 从备份恢复数据库（`npm run db:backup:local`生成的备份）
3. 执行回滚迁移
4. 验证数据完整性
5. 重新启动应用

### Q3: 新旧题目如何共存？

**A**:
- 旧题目自动分配Level（根据difficulty）
- 新题目创建时必须指定Level
- API支持同时查询旧题目和新题目

---

## 八、相关文档

- 📄 [学习内容体系重构方案](./learning-content-system-redesign.md)
- 📄 [五大维度详细内容规格](./five-dimensions-content-specs.md)
- 📄 [API实现指南](./api-implementation-guide.md)
- 📄 [前端实现指南](./frontend-implementation-guide.md)

---

**文档状态**: ✅ Schema设计完成，迁移脚本已准备
