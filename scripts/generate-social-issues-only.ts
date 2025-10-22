#!/usr/bin/env tsx
/**
 * 快速生成社会议题问题（仅 social_issue 类别）
 */

import { PrismaClient } from '@prisma/client'
import { aiRouter } from '../src/lib/ai/router'

const prisma = new PrismaClient()

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

const SOCIAL_ISSUES = [
  { topic: 'AI与就业市场', subcategory: '人工智能' },
  { topic: '教育公平与机会', subcategory: '教育改革' },
  { topic: '气候变化与行动', subcategory: '环境问题' },
  { topic: '隐私保护与数据安全', subcategory: '数字权利' },
  { topic: '贫富差距与社会流动', subcategory: '社会公正' },
  { topic: '心理健康与社会压力', subcategory: '公共健康' },
  { topic: '网络治理与言论自由', subcategory: '网络社会' },
  { topic: '老龄化社会挑战', subcategory: '人口问题' },
  { topic: '性别平等与多元包容', subcategory: '社会平等' },
  { topic: '城市化与生活质量', subcategory: '城市发展' }
]

const PROMPT = (issue: typeof SOCIAL_ISSUES[0], difficulty: typeof DIFFICULTY_LEVELS[number]) => `
你是一位资深的社会学者和教育专家，专门设计引发深度思考的社会议题问题。

请基于以下社会议题设计一个${difficulty === 'beginner' ? '入门' : difficulty === 'intermediate' ? '中等' : '深度'}难度的思考问题：

社会议题：${issue.topic}
议题类别：${issue.subcategory}
难度等级：${difficulty === 'beginner' ? '入门 - 帮助理解议题基本面向' : difficulty === 'intermediate' ? '中等 - 需要分析多方观点' : '深度 - 需要系统性思考和权衡'}

请严格按照以下JSON格式输出（不要包含其他文字说明）：

{
  "question": "思考问题（引导多角度分析社会议题）",
  "subcategory": "${issue.subcategory}",
  "tags": ["标签1", "标签2", "标签3"],
  "context": "议题背景（可选，提供必要的社会背景）"
}

要求：
1. 问题应具有现实意义和时代感
2. 应引导从多个角度思考议题
3. 避免立场先行，鼓励开放性探讨
4. 问题应贴近学生生活经验
5. 标签应准确反映涉及的社会议题维度
`.trim()

async function generateQuestionWithAI(issue: typeof SOCIAL_ISSUES[0], difficulty: typeof DIFFICULTY_LEVELS[number]): Promise<any> {
  try {
    const response = await aiRouter.chat([
      {
        role: 'system',
        content: '你是一位专业的教育内容设计专家，擅长设计高质量的批判性思维问题。请严格按照JSON格式输出，不要包含任何额外的解释文字。'
      },
      {
        role: 'user',
        content: PROMPT(issue, difficulty)
      }
    ], {
      temperature: 0.8,
      maxTokens: 1000
    })

    const responseText = typeof response === 'string' ? response : await streamToString(response)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI响应格式错误')
    }

    const result = JSON.parse(jsonMatch[0])
    return {
      question: result.question,
      subcategory: result.subcategory,
      tags: Array.isArray(result.tags) ? result.tags : [],
      context: result.context || null
    }
  } catch (error) {
    console.error('AI生成问题失败:', error)
    throw error
  }
}

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }
  return result
}

async function isDuplicateQuestion(question: string): Promise<boolean> {
  const existing = await prisma.dailyCriticalQuestion.findFirst({
    where: {
      question: {
        contains: question.substring(0, 50)
      }
    }
  })
  return !!existing
}

async function main() {
  console.log('🌍 开始生成社会议题问题...\n')

  const currentCount = await prisma.dailyCriticalQuestion.count({
    where: { category: 'social_issue' }
  })
  console.log(`当前已有: ${currentCount} 个社会议题问题\n`)

  const targetCount = 20
  const questionsPerIssue = Math.ceil(targetCount / SOCIAL_ISSUES.length)

  let generatedCount = 0
  let skippedCount = 0

  for (const issue of SOCIAL_ISSUES) {
    console.log(`处理议题: ${issue.topic}`)

    const difficulties = DIFFICULTY_LEVELS.slice(0, questionsPerIssue)

    for (const difficulty of difficulties) {
      try {
        const data = await generateQuestionWithAI(issue, difficulty)

        if (await isDuplicateQuestion(data.question)) {
          console.log(`  ⚠️  跳过重复问题`)
          skippedCount++
          continue
        }

        await prisma.dailyCriticalQuestion.create({
          data: {
            question: data.question,
            category: 'social_issue',
            subcategory: data.subcategory,
            difficulty,
            tags: data.tags,
            thinkingTypes: [],
            context: data.context,
            isActive: true
          }
        })

        generatedCount++
        console.log(`  ✅ 已生成问题 ${generatedCount}/${targetCount}`)

        await new Promise(resolve => setTimeout(resolve, 800))
      } catch (error) {
        console.error(`  ❌ 生成失败:`, error)
      }
    }
  }

  const finalCount = await prisma.dailyCriticalQuestion.count({
    where: { category: 'social_issue' }
  })

  console.log('\n' + '='.repeat(60))
  console.log(`✅ 社会议题问题生成完成!`)
  console.log(`   当前总计: ${finalCount} 个问题`)
  console.log(`   本次新增: ${generatedCount} 个问题`)
  console.log(`   重复跳过: ${skippedCount} 个问题\n`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
