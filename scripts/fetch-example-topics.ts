import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fetchExampleTopics() {
  try {
    console.log('正在查询五大思维维度的示例题目...\n')

    const dimensions = [
      'causal_analysis',
      'premise_challenge',
      'fallacy_detection',
      'iterative_reflection',
      'connection_transfer'
    ]

    for (const dimension of dimensions) {
      console.log(`\n========== ${dimension} ==========`)

      const topics = await prisma.generatedConversationTopic.findMany({
        where: {
          dimension: dimension,
          isPublic: true
        },
        orderBy: [
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 2,
        select: {
          id: true,
          topic: true,
          context: true,
          difficulty: true,
          tags: true,
          thinkingFramework: true,
          guidingQuestions: true,
          expectedOutcomes: true
        }
      })

      if (topics.length === 0) {
        console.log(`  ⚠️  暂无 ${dimension} 维度的公开题目`)
      } else {
        topics.forEach((topic, index) => {
          console.log(`\n  题目 ${index + 1}:`)
          console.log(`  标题: ${topic.topic}`)
          console.log(`  难度: ${topic.difficulty}`)
          console.log(`  标签: ${topic.tags.join(', ')}`)
          console.log(`  背景: ${topic.context.substring(0, 100)}...`)
          console.log(`  思维框架:`, JSON.stringify(topic.thinkingFramework, null, 2))
          console.log(`  引导问题:`, JSON.stringify(topic.guidingQuestions, null, 2))
          console.log(`  预期产出:`, topic.expectedOutcomes)
        })
      }
    }

    // 保存到文件
    const allData: any = {}

    for (const dimension of dimensions) {
      const topics = await prisma.generatedConversationTopic.findMany({
        where: {
          dimension: dimension,
          isPublic: true
        },
        orderBy: [
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 2
      })

      allData[dimension] = topics
    }

    const fs = require('fs')
    const path = require('path')
    const outputPath = path.join(__dirname, '..', 'exports', 'example-topics.json')

    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8')
    console.log(`\n✅ 数据已保存到: ${outputPath}`)

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fetchExampleTopics()
