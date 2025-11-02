/**
 * 批量生成概念内容脚本
 *
 * 基于五大思维维度，使用 AI 批量生成 Level 1-5 的概念内容
 * 存储到 concept_content 表
 *
 * 使用方式：
 * 1. 生成所有内容：npm run generate:concepts
 * 2. 生成特定维度：npm run generate:concepts -- --dimension causal_analysis
 * 3. 生成特定级别：npm run generate:concepts -- --level 1
 * 4. 测试模式（只生成1个）：npm run generate:concepts -- --test
 */

import { PrismaClient } from '@prisma/client'
import { aiRouter } from '../src/lib/ai/router'
import {
  CONCEPT_GENERATION_SYSTEM_PROMPT,
  generateConceptPrompt,
  THINKING_DIMENSIONS_PLAN,
  type ConceptGenerationInput
} from '../src/lib/prompts/concept-generation-prompts'

const prisma = new PrismaClient()

// 思维维度ID映射
const THINKING_TYPE_IDS: Record<string, string> = {
  causal_analysis: 'causal_analysis',
  premise_challenge: 'premise_challenge',
  fallacy_detection: 'fallacy_detection',
  iterative_reflection: 'iterative_reflection',
  connection_transfer: 'connection_transfer'
}

// 思维维度名称映射
const THINKING_TYPE_NAMES: Record<string, string> = {
  causal_analysis: '多维归因与利弊权衡',
  premise_challenge: '前提质疑与方法批判',
  fallacy_detection: '谬误检测',
  iterative_reflection: '迭代反思',
  connection_transfer: '知识迁移'
}

// Level 难度映射
const LEVEL_DIFFICULTY_MAP: Record<number, 'beginner' | 'intermediate' | 'advanced'> = {
  1: 'beginner',
  2: 'beginner',
  3: 'intermediate',
  4: 'advanced',
  5: 'advanced'
}

/**
 * 生成单个概念内容
 */
async function generateSingleConcept(
  input: ConceptGenerationInput
): Promise<any | null> {
  try {
    console.log(`\n🤖 正在生成概念: ${input.thinkingTypeName} - Level ${input.level} - #${input.order}...`)

    const userPrompt = generateConceptPrompt(input)

    // 调用 AI 生成内容
    const response = await aiRouter.chat(
      [
        { role: 'system', content: CONCEPT_GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      {
        temperature: 0.8, // 适度创造性
        stream: false
      }
    )

    if (!response || typeof response !== 'string') {
      throw new Error('AI 返回格式错误')
    }

    // 提取 JSON（移除可能的 markdown 代码块标记）
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // 解析 JSON
    const conceptData = JSON.parse(cleanedResponse)

    // 验证必需字段
    const requiredFields = [
      'title',
      'description',
      'learningObjectives',
      'conceptsIntro',
      'conceptsContent',
      'modelsIntro',
      'modelsContent',
      'demonstrationsIntro',
      'demonstrationsContent',
      'estimatedTime',
      'tags',
      'keywords'
    ]

    for (const field of requiredFields) {
      if (!conceptData[field]) {
        throw new Error(`缺少必需字段: ${field}`)
      }
    }

    console.log(`✅ 成功生成: ${conceptData.title}`)
    return conceptData
  } catch (error) {
    console.error(`❌ 生成失败:`, error)
    return null
  }
}

/**
 * 保存概念到数据库
 */
async function saveConceptToDatabase(
  thinkingTypeId: string,
  level: number,
  order: number,
  conceptData: any,
  modelName: string
) {
  try {
    const concept = await prisma.conceptContent.create({
      data: {
        thinkingTypeId,
        level,
        order,
        title: conceptData.title,
        subtitle: conceptData.subtitle || null,
        description: conceptData.description,
        learningObjectives: conceptData.learningObjectives,
        conceptsIntro: conceptData.conceptsIntro,
        conceptsContent: conceptData.conceptsContent,
        modelsIntro: conceptData.modelsIntro,
        modelsContent: conceptData.modelsContent,
        demonstrationsIntro: conceptData.demonstrationsIntro,
        demonstrationsContent: conceptData.demonstrationsContent,
        estimatedTime: conceptData.estimatedTime || 10,
        difficulty: LEVEL_DIFFICULTY_MAP[level],
        tags: conceptData.tags || [],
        keywords: conceptData.keywords || [],
        isPublished: true,
        generatedBy: 'ai',
        generationModel: modelName,
        generatedAt: new Date()
      }
    })

    console.log(`💾 已保存到数据库: ID=${concept.id}`)
    return concept
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`⚠️  跳过重复记录: ${thinkingTypeId} - Level ${level} - Order ${order}`)
      return null
    }
    console.error(`❌ 保存失败:`, error.message)
    return null
  }
}

/**
 * 批量生成概念内容
 */
async function generateConceptsForDimension(
  dimensionKey: string,
  level?: number
) {
  const dimensionId = THINKING_TYPE_IDS[dimensionKey]
  const dimensionName = THINKING_TYPE_NAMES[dimensionKey]
  const plan = (THINKING_DIMENSIONS_PLAN as any)[dimensionKey]

  if (!plan) {
    console.error(`❌ 未找到维度规划: ${dimensionKey}`)
    return
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📚 开始生成: ${dimensionName}`)
  console.log(`${'='.repeat(60)}`)

  // 获取思维维度描述
  const thinkingType = await prisma.thinkingType.findUnique({
    where: { id: dimensionId }
  })

  if (!thinkingType) {
    console.error(`❌ 未找到思维维度: ${dimensionId}`)
    return
  }

  // 获取当前使用的 AI 模型
  const modelName = process.env.ACTIVE_AI_MODEL || 'deepseek-v3.1'

  // 生成每个 Level 的概念
  const levels = level ? [level] : [1, 2, 3, 4, 5]

  for (const lv of levels) {
    const levelKey = `level${lv}` as keyof typeof plan
    const levelPlan = plan[levelKey]

    if (!levelPlan) continue

    console.log(`\n📖 Level ${lv} - 计划生成 ${levelPlan.count} 个概念`)

    for (let order = 1; order <= levelPlan.count; order++) {
      const input: ConceptGenerationInput = {
        thinkingTypeName: dimensionName,
        thinkingTypeDescription: thinkingType.description,
        level: lv,
        difficulty: LEVEL_DIFFICULTY_MAP[lv],
        order
      }

      // 生成概念
      const conceptData = await generateSingleConcept(input)

      if (!conceptData) {
        console.log(`⏭️  跳过当前概念，继续下一个...`)
        continue
      }

      // 保存到数据库
      await saveConceptToDatabase(dimensionId, lv, order, conceptData, modelName)

      // 添加延时，避免 API 限流
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log(`\n✅ ${dimensionName} 生成完成！`)
}

/**
 * 主函数
 */
async function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2)
    const dimensionArg = args.find(arg => arg.startsWith('--dimension='))?.split('=')[1]
    const levelArg = args.find(arg => arg.startsWith('--level='))?.split('=')[1]
    const testMode = args.includes('--test')

    console.log('\n' + '='.repeat(70))
    console.log('🚀 批判性思维概念内容批量生成工具')
    console.log('='.repeat(70))

    // 测试模式：只生成 1 个概念
    if (testMode) {
      console.log('\n🧪 测试模式：只生成 1 个概念\n')

      const testInput: ConceptGenerationInput = {
        thinkingTypeName: '多维归因与利弊权衡',
        thinkingTypeDescription: '培养多角度分析因果关系的能力，学会全面权衡决策的利弊',
        level: 1,
        difficulty: 'beginner',
        order: 1
      }

      const conceptData = await generateSingleConcept(testInput)

      if (conceptData) {
        const modelName = process.env.ACTIVE_AI_MODEL || 'deepseek-v3.1'
        await saveConceptToDatabase(
          'causal_analysis',
          1,
          1,
          conceptData,
          modelName
        )
      }

      console.log('\n✅ 测试完成！')
      return
    }

    // 正常模式
    const dimensions = dimensionArg
      ? [dimensionArg]
      : Object.keys(THINKING_TYPE_IDS)

    const level = levelArg ? parseInt(levelArg) : undefined

    console.log(`\n📋 生成计划:`)
    console.log(`- 维度: ${dimensions.join(', ') || '全部'}`)
    console.log(`- 级别: ${level || '全部 (1-5)'}`)
    console.log(`- AI 模型: ${process.env.ACTIVE_AI_MODEL || 'deepseek-v3.1'}`)

    for (const dimension of dimensions) {
      await generateConceptsForDimension(dimension, level)
    }

    console.log('\n' + '='.repeat(70))
    console.log('🎉 所有概念生成完成！')
    console.log('='.repeat(70))

    // 统计生成结果
    const total = await prisma.conceptContent.count()
    console.log(`\n📊 数据库统计:`)
    console.log(`- 总概念数: ${total}`)

    for (const dimension of Object.keys(THINKING_TYPE_IDS)) {
      const count = await prisma.conceptContent.count({
        where: { thinkingTypeId: THINKING_TYPE_IDS[dimension] }
      })
      console.log(`- ${THINKING_TYPE_NAMES[dimension]}: ${count}`)
    }

  } catch (error) {
    console.error('\n❌ 发生错误:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 执行主函数
main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
