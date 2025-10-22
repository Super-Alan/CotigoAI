#!/usr/bin/env tsx
/**
 * AI-Powered Daily Critical Questions Generator
 *
 * Purpose: Generate high-quality questions for the "每日一问" feature using AI
 *
 * Requirements:
 * 1. Categories:
 *    - critical_thinking: 50+ questions (5 thinking dimensions × 3 difficulty levels)
 *    - interview: 30+ questions (top 10 international school interview topics)
 *    - social_issue: 20+ questions (trending social issues)
 * 2. Must not delete existing data
 * 3. Must follow daily_critical_question schema structure
 *
 * Usage: npm run generate:daily-questions
 */

import { PrismaClient } from '@prisma/client'
import { aiRouter } from '../src/lib/ai/router'

const prisma = new PrismaClient()

// 五大思维维度配置
const THINKING_DIMENSIONS = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '分析因果关系，权衡多方面利弊'
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '识别并质疑论证中的隐含前提'
  },
  {
    id: 'fallacy_detection',
    name: '谬误检测',
    description: '识别常见逻辑谬误和思维陷阱'
  },
  {
    id: 'iterative_reflection',
    name: '迭代反思',
    description: '培养元认知能力，持续改进思维质量'
  },
  {
    id: 'connection_transfer',
    name: '知识迁移',
    description: '识别深层结构相似性，实现跨领域迁移'
  }
]

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

// Top 10 国际学校面试主题
const INTERVIEW_TOPICS = [
  { topic: '个人成长与挑战', subcategory: '个人发展' },
  { topic: '领导力与团队合作', subcategory: '软技能' },
  { topic: '全球化与文化理解', subcategory: '国际视野' },
  { topic: '创新思维与问题解决', subcategory: '创造力' },
  { topic: '社会责任与公民意识', subcategory: '价值观' },
  { topic: '学术兴趣与职业规划', subcategory: '目标规划' },
  { topic: '道德困境与价值选择', subcategory: '伦理思考' },
  { topic: '科技发展与人类未来', subcategory: '科技伦理' },
  { topic: '环境保护与可持续发展', subcategory: '环保意识' },
  { topic: '艺术人文与批判性思维', subcategory: '人文素养' }
]

// 热门社会议题
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

/**
 * AI Prompt Templates
 */
const PROMPTS = {
  critical_thinking: (dimension: typeof THINKING_DIMENSIONS[0], difficulty: typeof DIFFICULTY_LEVELS[number]) => `
你是一位资深的批判性思维教育专家，专门设计高质量的思维训练问题。

请基于以下思维维度设计一个${difficulty === 'beginner' ? '初级' : difficulty === 'intermediate' ? '中级' : '高级'}难度的批判性思维问题：

思维维度：${dimension.name}
维度描述：${dimension.description}
难度等级：${difficulty === 'beginner' ? '初级 - 适合初学者，概念清晰，情境简单' : difficulty === 'intermediate' ? '中级 - 需要一定思维深度，情境复杂' : '高级 - 需要深度分析，情境多元且复杂'}

请严格按照以下JSON格式输出（不要包含其他文字说明）：

{
  "question": "问题文本（开放性问题，引导深度思考）",
  "subcategory": "具体子类别（如'因果推理'、'前提识别'等）",
  "tags": ["标签1", "标签2", "标签3"],
  "context": "问题背景说明（可选，帮助理解问题情境）"
}

要求：
1. 问题必须开放性，没有标准答案
2. 问题应引发深度思考，而非简单的是非判断
3. 标签应准确描述问题涉及的关键概念
4. 难度应与指定等级相符
5. 问题应贴近现实生活或学术场景
`.trim(),

  interview: (topic: typeof INTERVIEW_TOPICS[0], difficulty: typeof DIFFICULTY_LEVELS[number]) => `
你是一位资深的国际学校招生官，专门设计高质量的面试问题。

请基于以下主题设计一个${difficulty === 'beginner' ? '基础' : difficulty === 'intermediate' ? '中等' : '高级'}难度的面试问题：

面试主题：${topic.topic}
主题类别：${topic.subcategory}
难度等级：${difficulty === 'beginner' ? '基础 - 考察基本思维和表达能力' : difficulty === 'intermediate' ? '中等 - 考察思维深度和批判性思考' : '高级 - 考察综合思维和创新能力'}

请严格按照以下JSON格式输出（不要包含其他文字说明）：

{
  "question": "面试问题（开放性，考察思维能力和价值观）",
  "subcategory": "${topic.subcategory}",
  "tags": ["标签1", "标签2", "标签3"],
  "context": "问题背景（可选，说明考察重点）"
}

要求：
1. 问题应具有探索性，考察学生的思维方式
2. 避免简单的事实性问题
3. 应能揭示学生的价值观和批判性思维
4. 符合国际学校面试的专业性
5. 标签应准确反映问题考察的核心能力
`.trim(),

  social_issue: (issue: typeof SOCIAL_ISSUES[0], difficulty: typeof DIFFICULTY_LEVELS[number]) => `
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
}

/**
 * 调用AI生成问题
 */
async function generateQuestionWithAI(
  category: 'critical_thinking' | 'interview' | 'social_issue',
  params: any,
  difficulty: typeof DIFFICULTY_LEVELS[number]
): Promise<any> {
  let prompt = ''

  switch (category) {
    case 'critical_thinking':
      prompt = PROMPTS.critical_thinking(params, difficulty)
      break
    case 'interview':
      prompt = PROMPTS.interview(params, difficulty)
      break
    case 'social_issue':
      prompt = PROMPTS.social_issue(params, difficulty)
      break
  }

  try {
    const response = await aiRouter.chat([
      {
        role: 'system',
        content: '你是一位专业的教育内容设计专家，擅长设计高质量的批判性思维问题。请严格按照JSON格式输出，不要包含任何额外的解释文字。'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.8, // 提高创造性
      maxTokens: 1000
    })

    // 解析AI响应
    const responseText = typeof response === 'string' ? response : await streamToString(response)

    // 提取JSON（处理可能的markdown代码块）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('AI响应无法解析为JSON:', responseText)
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

/**
 * 将 ReadableStream 转换为字符串
 */
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

/**
 * 检查问题是否已存在（防止重复）
 */
async function isDuplicateQuestion(question: string): Promise<boolean> {
  const existing = await prisma.dailyCriticalQuestion.findFirst({
    where: {
      question: {
        contains: question.substring(0, 50) // 检查前50个字符是否重复
      }
    }
  })

  return !!existing
}

/**
 * 生成批判性思维问题
 */
async function generateCriticalThinkingQuestions(targetCount: number = 50) {
  console.log('\n📚 开始生成批判性思维问题...')

  const questionsPerDimension = Math.ceil(targetCount / THINKING_DIMENSIONS.length)
  const questionsPerLevel = Math.ceil(questionsPerDimension / DIFFICULTY_LEVELS.length)

  let generatedCount = 0
  let skippedCount = 0

  for (const dimension of THINKING_DIMENSIONS) {
    console.log(`\n  处理维度: ${dimension.name}`)

    for (const difficulty of DIFFICULTY_LEVELS) {
      console.log(`    难度: ${difficulty}`)

      for (let i = 0; i < questionsPerLevel; i++) {
        try {
          const data = await generateQuestionWithAI('critical_thinking', dimension, difficulty)

          // 检查重复
          if (await isDuplicateQuestion(data.question)) {
            console.log(`      ⚠️  跳过重复问题: ${data.question.substring(0, 50)}...`)
            skippedCount++
            continue
          }

          await prisma.dailyCriticalQuestion.create({
            data: {
              question: data.question,
              category: 'critical_thinking',
              subcategory: data.subcategory,
              difficulty, // Note: dailyCriticalQuestion has difficulty field (different table)
              tags: data.tags,
              thinkingTypes: [dimension.id],
              context: data.context,
              isActive: true
            }
          })

          generatedCount++
          console.log(`      ✅ 已生成问题 ${generatedCount}/${targetCount}`)

          // 避免API频率限制
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`      ❌ 生成失败:`, error)
        }
      }
    }
  }

  console.log(`\n✅ 批判性思维问题生成完成: ${generatedCount} 个新问题, ${skippedCount} 个重复跳过`)
}

/**
 * 生成面试问题
 */
async function generateInterviewQuestions(targetCount: number = 30) {
  console.log('\n🎓 开始生成国际学校面试问题...')

  const questionsPerTopic = Math.ceil(targetCount / INTERVIEW_TOPICS.length)

  let generatedCount = 0
  let skippedCount = 0

  for (const topic of INTERVIEW_TOPICS) {
    console.log(`\n  处理主题: ${topic.topic}`)

    // 为每个主题生成不同难度的问题
    const difficulties = DIFFICULTY_LEVELS.slice(0, questionsPerTopic)

    for (const difficulty of difficulties) {
      try {
        const data = await generateQuestionWithAI('interview', topic, difficulty)

        // 检查重复
        if (await isDuplicateQuestion(data.question)) {
          console.log(`    ⚠️  跳过重复问题: ${data.question.substring(0, 50)}...`)
          skippedCount++
          continue
        }

        await prisma.dailyCriticalQuestion.create({
          data: {
            question: data.question,
            category: 'interview',
            subcategory: data.subcategory,
            difficulty, // Note: dailyCriticalQuestion has difficulty field (different table)
            tags: data.tags,
            thinkingTypes: [],
            context: data.context,
            isActive: true
          }
        })

        generatedCount++
        console.log(`    ✅ 已生成问题 ${generatedCount}/${targetCount}`)

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`    ❌ 生成失败:`, error)
      }
    }
  }

  console.log(`\n✅ 面试问题生成完成: ${generatedCount} 个新问题, ${skippedCount} 个重复跳过`)
}

/**
 * 生成社会议题问题
 */
async function generateSocialIssueQuestions(targetCount: number = 20) {
  console.log('\n🌍 开始生成社会议题问题...')

  const questionsPerIssue = Math.ceil(targetCount / SOCIAL_ISSUES.length)

  let generatedCount = 0
  let skippedCount = 0

  for (const issue of SOCIAL_ISSUES) {
    console.log(`\n  处理议题: ${issue.topic}`)

    // 为每个议题生成不同难度的问题
    const difficulties = DIFFICULTY_LEVELS.slice(0, questionsPerIssue)

    for (const difficulty of difficulties) {
      try {
        const data = await generateQuestionWithAI('social_issue', issue, difficulty)

        // 检查重复
        if (await isDuplicateQuestion(data.question)) {
          console.log(`    ⚠️  跳过重复问题: ${data.question.substring(0, 50)}...`)
          skippedCount++
          continue
        }

        await prisma.dailyCriticalQuestion.create({
          data: {
            question: data.question,
            category: 'social_issue',
            subcategory: data.subcategory,
            difficulty, // Note: dailyCriticalQuestion has difficulty field (different table)
            tags: data.tags,
            thinkingTypes: [],
            context: data.context,
            isActive: true
          }
        })

        generatedCount++
        console.log(`    ✅ 已生成问题 ${generatedCount}/${targetCount}`)

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`    ❌ 生成失败:`, error)
      }
    }
  }

  console.log(`\n✅ 社会议题问题生成完成: ${generatedCount} 个新问题, ${skippedCount} 个重复跳过`)
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 AI驱动的每日一问数据生成脚本')
  console.log('=' .repeat(60))

  // 显示当前数据统计
  const currentStats = await prisma.dailyCriticalQuestion.groupBy({
    by: ['category'],
    _count: true
  })

  console.log('\n📊 当前数据统计:')
  currentStats.forEach(stat => {
    console.log(`  ${stat.category}: ${stat._count} 个问题`)
  })

  const totalExisting = await prisma.dailyCriticalQuestion.count()
  console.log(`  总计: ${totalExisting} 个问题\n`)

  // 开始生成
  try {
    // 1. 批判性思维问题 (50题)
    await generateCriticalThinkingQuestions(50)

    // 2. 面试问题 (30题)
    await generateInterviewQuestions(30)

    // 3. 社会议题问题 (20题)
    await generateSocialIssueQuestions(20)

    // 显示最终统计
    const finalStats = await prisma.dailyCriticalQuestion.groupBy({
      by: ['category'],
      _count: true
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 最终数据统计:')
    finalStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat._count} 个问题`)
    })

    const totalFinal = await prisma.dailyCriticalQuestion.count()
    console.log(`  总计: ${totalFinal} 个问题`)
    console.log(`  新增: ${totalFinal - totalExisting} 个问题\n`)

    console.log('✅ 数据生成完成!')
  } catch (error) {
    console.error('❌ 生成过程出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行主函数
main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
