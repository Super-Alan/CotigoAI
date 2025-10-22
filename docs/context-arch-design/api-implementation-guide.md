# API实现指南

## 文档信息

- **版本**: v1.0
- **创建日期**: 2025-10-19
- **目的**: 详细的API端点实现指南

---

## API端点列表

### 1. 学习内容API

#### GET `/api/critical-thinking/learning-content`

**用途**: 获取指定思维维度和Level的学习内容

**Query参数**:
```typescript
{
  thinkingTypeId: string      // 必需: causal_analysis | premise_challenge | ...
  level: number               // 必需: 1-5
  contentType?: string        // 可选: concepts | frameworks | examples | practice_guide
}
```

**Response**:
```typescript
{
  success: boolean
  data: {
    contents: Array<{
      id: string
      level: number
      contentType: string
      title: string
      description: string
      content: {
        sections: Array<{
          type: "text" | "table" | "code" | "callout" | "interactive"
          title?: string
          content?: string
          [key: string]: any
        }>
      }
      estimatedTime: number
      tags: string[]
      orderIndex: number
    }>
  }
}
```

**实现代码**: `src/app/api/critical-thinking/learning-content/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 1. 认证检查
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    // 2. 解析查询参数
    const searchParams = req.nextUrl.searchParams
    const thinkingTypeId = searchParams.get('thinkingTypeId')
    const level = searchParams.get('level')
    const contentType = searchParams.get('contentType')

    if (!thinkingTypeId || !level) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      )
    }

    // 3. 验证Level范围
    const levelNum = parseInt(level)
    if (levelNum < 1 || levelNum > 5) {
      return NextResponse.json(
        { success: false, error: 'Level必须在1-5之间' },
        { status: 400 }
      )
    }

    // 4. 构建查询条件
    const where: any = {
      thinkingTypeId,
      level: levelNum
    }

    if (contentType) {
      where.contentType = contentType
    }

    // 5. 查询数据库
    const contents = await prisma.levelLearningContent.findMany({
      where,
      orderBy: {
        orderIndex: 'asc'
      },
      select: {
        id: true,
        level: true,
        contentType: true,
        title: true,
        description: true,
        content: true,
        estimatedTime: true,
        tags: true,
        orderIndex: true
      }
    })

    // 6. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        contents
      }
    })

  } catch (error) {
    console.error('获取学习内容失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

---

### 2. Level题目API

#### GET `/api/critical-thinking/questions/by-level`

**用途**: 获取指定Level的练习题目

**Query参数**:
```typescript
{
  thinkingTypeId: string
  level: number
  difficulty?: string      // 可选: beginner | intermediate | advanced
  limit?: number           // 默认10
}
```

**Response**:
```typescript
{
  success: boolean
  data: {
    questions: Array<{
      id: string
      topic: string
      context: string | null
      question: string
      difficulty: string
      level: number
      learningObjectives: string[]
      scaffolding?: any
      guidingQuestions: Array<{
        question: string
        level: string
        stage: string
      }>
    }>
    userProgress: {
      currentLevel: number
      level1Progress: number
      level2Progress: number
      // ...
      level1Unlocked: boolean
      level2Unlocked: boolean
      // ...
    }
  }
}
```

**实现代码**: `src/app/api/critical-thinking/questions/by-level/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const thinkingTypeId = searchParams.get('thinkingTypeId')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!thinkingTypeId || !level) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      )
    }

    const levelNum = parseInt(level)

    // 构建查询条件
    const where: any = {
      thinkingTypeId,
      level: levelNum
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // 查询题目
    const questions = await prisma.criticalThinkingQuestion.findMany({
      where,
      take: limit,
      include: {
        guidingQuestions: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 查询用户进度
    const userProgress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId: session.user.id,
          thinkingTypeId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        questions,
        userProgress: userProgress || {
          currentLevel: 1,
          level1Unlocked: true,
          level2Unlocked: false,
          // ... 其他默认值
        }
      }
    })

  } catch (error) {
    console.error('获取题目失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

---

### 3. Level进度更新API

#### POST `/api/critical-thinking/progress/update-level`

**用途**: 更新用户在特定Level的进度，自动检查解锁条件

**Request Body**:
```typescript
{
  userId: string
  thinkingTypeId: string
  level: number
  score: number          // 0-100
  questionId: string
}
```

**Response**:
```typescript
{
  success: boolean
  data: {
    updatedProgress: {
      currentLevel: number
      level1Progress: number
      level2Progress: number
      // ...
      level2Unlocked: boolean
      level3Unlocked: boolean
      // ...
    }
    levelUnlockStatus?: {
      unlocked: boolean
      level: number
      message: string
      questionsCompleted: number
      questionsRequired: number
      averageScore: number
      requiredScore: number
    }
  }
}
```

**实现代码**: `src/app/api/critical-thinking/progress/update-level/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Level解锁条件
const UNLOCK_CRITERIA = {
  level2: { minQuestions: 10, minAccuracy: 80 },
  level3: { minQuestions: 8, minAccuracy: 75 },
  level4: { minQuestions: 6, minAccuracy: 70 },
  level5: { minQuestions: 5, minAccuracy: 65 }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, thinkingTypeId, level, score, questionId } = body

    // 1. 查找或创建进度记录
    let progress = await prisma.criticalThinkingProgress.findUnique({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      }
    })

    if (!progress) {
      progress = await prisma.criticalThinkingProgress.create({
        data: {
          userId,
          thinkingTypeId,
          currentLevel: 1,
          level1Unlocked: true
        }
      })
    }

    // 2. 更新对应Level的进度
    const levelKey = `level${level}`
    const questionsCompletedKey = `${levelKey}QuestionsCompleted`
    const averageScoreKey = `${levelKey}AverageScore`

    const currentQuestions = (progress as any)[questionsCompletedKey] || 0
    const currentAvgScore = (progress as any)[averageScoreKey] || 0

    // 计算新的平均分
    const newAvgScore =
      (currentAvgScore * currentQuestions + score) / (currentQuestions + 1)

    // 计算进度百分比（假设每个Level需要10道题完成）
    const newProgress = Math.min(((currentQuestions + 1) / 10) * 100, 100)

    // 3. 更新进度
    const updateData: any = {
      [`${levelKey}Progress`]: newProgress,
      [questionsCompletedKey]: currentQuestions + 1,
      [averageScoreKey]: newAvgScore,
      questionsCompleted: progress.questionsCompleted + 1,
      lastPracticeAt: new Date()
    }

    // 4. 检查是否解锁下一Level
    let levelUnlockStatus: any = null
    const nextLevel = level + 1

    if (nextLevel <= 5) {
      const criteria = UNLOCK_CRITERIA[`level${nextLevel}` as keyof typeof UNLOCK_CRITERIA]

      if (criteria) {
        const shouldUnlock =
          currentQuestions + 1 >= criteria.minQuestions &&
          newAvgScore >= criteria.minAccuracy

        if (shouldUnlock && !(progress as any)[`level${nextLevel}Unlocked`]) {
          updateData[`level${nextLevel}Unlocked`] = true
          updateData.currentLevel = nextLevel

          levelUnlockStatus = {
            unlocked: true,
            level: nextLevel,
            message: `恭喜！你已解锁Level ${nextLevel}！`,
            questionsCompleted: currentQuestions + 1,
            questionsRequired: criteria.minQuestions,
            averageScore: newAvgScore,
            requiredScore: criteria.minAccuracy
          }
        } else if (!shouldUnlock) {
          levelUnlockStatus = {
            unlocked: false,
            level: nextLevel,
            message: `还需完成${criteria.minQuestions - (currentQuestions + 1)}道题目，当前准确率${newAvgScore.toFixed(1)}%（需要${criteria.minAccuracy}%）`,
            questionsCompleted: currentQuestions + 1,
            questionsRequired: criteria.minQuestions,
            averageScore: newAvgScore,
            requiredScore: criteria.minAccuracy
          }
        }
      }
    }

    // 5. 执行更新
    const updatedProgress = await prisma.criticalThinkingProgress.update({
      where: {
        userId_thinkingTypeId: {
          userId,
          thinkingTypeId
        }
      },
      data: updateData
    })

    // 6. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        updatedProgress,
        levelUnlockStatus
      }
    })

  } catch (error) {
    console.error('更新进度失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
```

---

## 实施清单

### Phase 1: 核心API实现

- [ ] 创建`/api/critical-thinking/learning-content/route.ts`
- [ ] 创建`/api/critical-thinking/questions/by-level/route.ts`
- [ ] 创建`/api/critical-thinking/progress/update-level/route.ts`
- [ ] 编写单元测试
- [ ] Postman测试集

### Phase 2: 错误处理

- [ ] 统一错误格式
- [ ] 参数验证中间件
- [ ] 速率限制
- [ ] 日志记录

### Phase 3: 性能优化

- [ ] Redis缓存学习内容
- [ ] 数据库查询优化
- [ ] 响应压缩
- [ ] CDN集成

---

**文档状态**: ✅ API设计完成，可开始实施
