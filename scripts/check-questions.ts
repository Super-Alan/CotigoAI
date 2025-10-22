import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkQuestions() {
  console.log('🔍 检查批判性思维题目...\n')

  // 查询所有题目
  const allQuestions = await prisma.criticalThinkingQuestion.findMany({
    include: {
      thinkingType: true,
      guidingQuestions: true
    }
  })

  console.log(`📊 总题目数: ${allQuestions.length}\n`)

  // 按思维类型和Level分组统计
  const stats: Record<string, Record<number, number>> = {}

  allQuestions.forEach(q => {
    if (!stats[q.thinkingTypeId]) {
      stats[q.thinkingTypeId] = {}
    }
    if (!stats[q.thinkingTypeId][q.level]) {
      stats[q.thinkingTypeId][q.level] = 0
    }
    stats[q.thinkingTypeId][q.level]++
  })

  console.log('📈 按思维类型和Level统计:')
  Object.entries(stats).forEach(([typeId, levels]) => {
    const type = allQuestions.find(q => q.thinkingTypeId === typeId)?.thinkingType
    console.log(`\n${type?.icon} ${type?.name} (${typeId}):`)
    Object.entries(levels).forEach(([level, count]) => {
      console.log(`  Level ${level}: ${count} 道题目`)
    })
  })

  // 显示详细题目列表
  console.log('\n\n📋 详细题目列表:')
  allQuestions.forEach(q => {
    console.log(`\n- [${q.thinkingType.icon}] ${q.topic}`)
    console.log(`  ID: ${q.id}`)
    console.log(`  思维类型: ${q.thinkingTypeId}`)
    console.log(`  Level: ${q.level}`)
    console.log(`  引导问题: ${q.guidingQuestions.length} 个`)
    console.log(`  创建时间: ${q.createdAt.toLocaleString('zh-CN')}`)
  })
}

checkQuestions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
