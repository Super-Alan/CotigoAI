import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleQuestions = [
  // 批判性思维问题
  {
    question: '如果一项政策能够带来经济增长，但同时会加剧社会不平等，你会如何评估这项政策的价值？',
    category: 'critical_thinking',
    subcategory: '价值权衡',
    difficulty: 'advanced',
    tags: ['经济政策', '社会公平', '价值判断'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '这个问题涉及经济效率与社会公平之间的权衡，需要考虑短期利益与长期影响。'
  },
  {
    question: '社交媒体的普及究竟是促进了民主还是削弱了民主？请基于证据分析。',
    category: 'critical_thinking',
    subcategory: '技术影响',
    difficulty: 'intermediate',
    tags: ['社交媒体', '民主', '信息传播'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '考虑信息传播、意见极化、假新闻等多个维度。'
  },
  {
    question: '一位候选人宣称："我的支持率上升了30%，这证明我的政策深得民心。"这个论证存在什么问题？',
    category: 'critical_thinking',
    subcategory: '逻辑推理',
    difficulty: 'beginner',
    tags: ['逻辑谬误', '统计推理', '因果关系'],
    thinkingTypes: ['fallacy_detection', 'causal_analysis'],
    context: '关注支持率上升与政策受欢迎程度之间的因果关系假设。'
  },
  {
    question: '人工智能在医疗诊断中的应用是否会取代医生的判断？从多个角度分析这个趋势。',
    category: 'critical_thinking',
    subcategory: '技术伦理',
    difficulty: 'advanced',
    tags: ['人工智能', '医疗', '职业未来'],
    thinkingTypes: ['causal_analysis', 'premise_challenge', 'connection_transfer'],
    context: '考虑技术能力、法律责任、医患关系、就业影响等维度。'
  },
  {
    question: '如何判断一个历史事件的叙述是客观的还是带有偏见的？',
    category: 'critical_thinking',
    subcategory: '信息评估',
    difficulty: 'intermediate',
    tags: ['历史叙事', '客观性', '偏见识别'],
    thinkingTypes: ['premise_challenge', 'iterative_reflection'],
    context: '关注叙述角度、证据选择、语言使用等方面。'
  },

  // 升学面试话题
  {
    question: '如果你是一名城市规划师，面对日益严重的交通拥堵问题，你会提出什么解决方案？请说明你的理由。',
    category: 'interview',
    subcategory: '问题解决',
    difficulty: 'intermediate',
    tags: ['城市规划', '交通', '系统思维'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '香港大学常见面试题型，考察系统思维和解决实际问题的能力。'
  },
  {
    question: '有人认为"失败是成功之母"，但也有人说"成功才是成功之母"。你如何看待这两种观点？',
    category: 'interview',
    subcategory: '观点分析',
    difficulty: 'beginner',
    tags: ['成功', '失败', '学习成长'],
    thinkingTypes: ['premise_challenge', 'iterative_reflection'],
    context: '考察辩证思维和对成功失败关系的理解。'
  },
  {
    question: '在全球化背景下，本地文化应该如何保护和发展？',
    category: 'interview',
    subcategory: '文化议题',
    difficulty: 'advanced',
    tags: ['全球化', '文化保护', '身份认同'],
    thinkingTypes: ['premise_challenge', 'connection_transfer'],
    context: '涉及全球化与本地化的平衡，文化多样性的价值。'
  },
  {
    question: '科技发展是否应该有伦理边界？如果有，应该由谁来划定这些边界？',
    category: 'interview',
    subcategory: '科技伦理',
    difficulty: 'advanced',
    tags: ['科技伦理', '道德边界', '治理'],
    thinkingTypes: ['premise_challenge', 'causal_analysis'],
    context: '考察对科技与社会关系的理解，以及治理结构的思考。'
  },
  {
    question: '如果你可以改变教育体系中的一个方面，你会改变什么？为什么？',
    category: 'interview',
    subcategory: '教育改革',
    difficulty: 'intermediate',
    tags: ['教育', '改革', '创新思维'],
    thinkingTypes: ['premise_challenge', 'causal_analysis'],
    context: '评估对教育问题的洞察和改革思维。'
  },

  // 社会热点话题
  {
    question: '远程工作的普及如何改变了工作与生活的界限？这种改变是积极的还是消极的？',
    category: 'social_issue',
    subcategory: '工作模式',
    difficulty: 'intermediate',
    tags: ['远程工作', '工作生活平衡', '后疫情时代'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '2024年职场趋势热点话题，涉及多个利益相关方。'
  },
  {
    question: '短视频平台对年轻人的信息获取方式产生了什么影响？',
    category: 'social_issue',
    subcategory: '媒体技术',
    difficulty: 'beginner',
    tags: ['短视频', '信息消费', '注意力经济'],
    thinkingTypes: ['causal_analysis', 'iterative_reflection'],
    context: '关注碎片化信息对深度思考的影响。'
  },
  {
    question: '气候变化应对措施是否应该优先于经济发展？如何平衡两者？',
    category: 'social_issue',
    subcategory: '环境政策',
    difficulty: 'advanced',
    tags: ['气候变化', '可持续发展', '经济增长'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '全球热点议题，涉及代际公平、国际合作等复杂问题。'
  },
  {
    question: '数字货币和传统货币相比，有哪些优势和风险？',
    category: 'social_issue',
    subcategory: '金融科技',
    difficulty: 'intermediate',
    tags: ['数字货币', '金融创新', '监管'],
    thinkingTypes: ['causal_analysis', 'premise_challenge'],
    context: '金融科技热点，涉及货币政策、金融稳定等议题。'
  },
  {
    question: '如何看待"内卷"现象？这是个人问题还是系统问题？',
    category: 'social_issue',
    subcategory: '社会现象',
    difficulty: 'intermediate',
    tags: ['内卷', '竞争', '社会结构'],
    thinkingTypes: ['causal_analysis', 'premise_challenge', 'iterative_reflection'],
    context: '中国社会热点话题，需要从个体和结构两个层面分析。'
  }
]

async function main() {
  console.log('🌱 开始种子数据：每日批判性问题库...')

  // 清除现有数据（可选）
  const deleteResult = await prisma.dailyCriticalQuestion.deleteMany({})
  console.log(`✨ 清除了 ${deleteResult.count} 条旧数据`)

  // 批量创建问题
  for (const question of sampleQuestions) {
    const created = await prisma.dailyCriticalQuestion.create({
      data: question
    })
    console.log(`✅ 创建问题: ${created.question.substring(0, 50)}...`)
  }

  console.log(`\n🎉 完成！总共创建了 ${sampleQuestions.length} 个问题`)

  // 统计信息
  const stats = await prisma.dailyCriticalQuestion.groupBy({
    by: ['category'],
    _count: true
  })

  console.log('\n📊 按类别统计:')
  stats.forEach(stat => {
    const categoryNames: Record<string, string> = {
      'critical_thinking': '批判性思维',
      'interview': '升学面试',
      'social_issue': '社会热点'
    }
    console.log(`   - ${categoryNames[stat.category]}: ${stat._count} 个问题`)
  })
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
