/**
 * Seed script for updating ThinkingType learningContent
 * 填充五大思维维度的学习内容数据
 *
 * Usage: npx tsx prisma/seed-learning-content.ts
 */

import { PrismaClient } from '@prisma/client'
import { ALL_LEARNING_CONTENT } from '../src/lib/knowledge/learning-content-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充学习内容数据...\n')

  const thinkingTypes = [
    {
      id: 'causal_analysis',
      name: '多维归因与利弊权衡',
      description: '学习区分相关性与因果性，识别混淆因素，建立可靠的因果推理链。',
      icon: 'git-branch'
    },
    {
      id: 'premise_challenge',
      name: '前提质疑与方法批判',
      description: '学习识别隐含假设，质疑前提合理性，从不同角度重新框定问题。',
      icon: 'search'
    },
    {
      id: 'fallacy_detection',
      name: '谬误检测',
      description: '学习识别常见逻辑谬误，避免被不当论证误导，提升论证质量。',
      icon: 'alert-triangle'
    },
    {
      id: 'iterative_reflection',
      name: '迭代反思',
      description: '通过元认知监控和系统性反思，持续改进思维质量。',
      icon: 'refresh-cw'
    },
    {
      id: 'connection_transfer',
      name: '知识迁移',
      description: '学习识别深层结构相似性，将思维方法跨领域迁移应用。',
      icon: 'share-2'
    }
  ]

  for (const type of thinkingTypes) {
    const learningContent = ALL_LEARNING_CONTENT[type.id]

    if (!learningContent) {
      console.log(`⚠️  跳过 ${type.name} - 无学习内容数据`)
      continue
    }

    try {
      const result = await prisma.thinkingType.upsert({
        where: { id: type.id },
        update: {
          learningContent: learningContent as any
        },
        create: {
          id: type.id,
          name: type.name,
          description: type.description,
          icon: type.icon,
          learningContent: learningContent as any
        }
      })

      console.log(`✅ ${type.name} - 学习内容已更新`)
      console.log(`   - 核心方法: ${learningContent.coreMethod.length} 个`)
      console.log(`   - 常见陷阱: ${learningContent.commonPitfalls.length} 个`)
      console.log(`   - 关键问题: ${learningContent.keyQuestions.length} 个`)
      console.log(`   - 示例对比: ${learningContent.examples.length} 个\n`)
    } catch (error) {
      console.error(`❌ 更新 ${type.name} 失败:`, error)
    }
  }

  console.log('🎉 学习内容数据填充完成！\n')

  // 验证数据
  console.log('🔍 验证数据...\n')
  const allTypes = await prisma.thinkingType.findMany({
    select: {
      id: true,
      name: true,
      learningContent: true
    }
  })

  for (const type of allTypes) {
    const content = type.learningContent as any
    if (content && content.definition) {
      console.log(`✓ ${type.name}: 学习内容完整`)
    } else {
      console.log(`✗ ${type.name}: 学习内容缺失或不完整`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✨ 完成！')
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('💥 发生错误:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
