import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 思维类型定义
const thinkingTypes = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '分析复杂现象的多重原因，权衡不同选择的利弊得失',
    icon: '🔍',
    learningContent: {
      framework: '多维归因与利弊权衡框架',
      methods: ['多因素分析', '利弊权衡', '系统思考'],
      examples: ['政策影响分析', '商业决策评估', '社会现象解读']
    }
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '质疑论证的基础假设，批判研究方法的合理性',
    icon: '❓',
    learningContent: {
      framework: '前提质疑框架',
      methods: ['假设识别', '方法批判', '逻辑检验'],
      examples: ['学术研究评估', '媒体报道分析', '专家观点质疑']
    }
  },
  {
    id: 'fallacy_detection',
    name: '谬误识别与证据评估',
    description: '识别逻辑谬误，评估证据的可靠性和相关性',
    icon: '⚖️',
    learningContent: {
      framework: '谬误识别框架',
      methods: ['逻辑谬误识别', '证据评估', '论证分析'],
      examples: ['辩论分析', '广告批判', '新闻事实核查']
    }
  },
  {
    id: 'iterative_reflection',
    name: '观点迭代与反思',
    description: '在新信息基础上调整观点，进行深度自我反思',
    icon: '🔄',
    learningContent: {
      framework: '反思迭代框架',
      methods: ['观点修正', '元认知反思', '学习迁移'],
      examples: ['观点演化分析', '决策复盘', '认知偏差纠正']
    }
  },
  {
    id: 'connection_transfer',
    name: '关联与迁移',
    description: '建立跨领域联系，将思维模式迁移到新情境',
    icon: '🔗',
    learningContent: {
      framework: '关联迁移框架',
      methods: ['类比推理', '模式识别', '跨域应用'],
      examples: ['历史借鉴', '跨学科思考', '创新应用']
    }
  }
]

// 批判性思维练习题目种子数据
const criticalThinkingQuestions = [
  // 多维归因与利弊权衡
  {
    thinkingTypeId: 'causal_analysis',
    difficulty: 'beginner',
    topic: '为什么现在的年轻人越来越不愿意结婚？',
    context: '近年来，中国的结婚率持续下降，离婚率上升。2022年全国结婚登记数量为683.3万对，创下1986年以来的新低。同时，初婚年龄不断推迟，一线城市平均初婚年龄已超过30岁。',
    thinkingFramework: {
      coreChallenge: '如何从多个维度分析复杂社会现象的成因，避免单一归因的思维陷阱？',
      commonPitfalls: ['单一因果归因', '忽视结构性因素', '过度个人化解释'],
      excellentResponseIndicators: ['多维度分析', '区分直接和间接原因', '考虑历史和文化背景']
    },
    expectedOutcomes: [
      '能够识别经济、社会、文化等多重影响因素',
      '理解个人选择与社会结构的相互作用',
      '避免简单的道德判断，进行客观分析'
    ]
  },
  {
    thinkingTypeId: 'causal_analysis',
    difficulty: 'intermediate',
    topic: '人工智能是否会加剧社会不平等？',
    context: 'AI技术快速发展，在提高效率的同时也引发担忧。一方面，AI可能替代大量工作岗位；另一方面，掌握AI技术的企业和个人可能获得更大优势。同时，AI的发展需要大量数据和计算资源，这些资源往往集中在少数大公司手中。',
    thinkingFramework: {
      coreChallenge: '如何平衡技术进步带来的机遇与挑战，理性评估其社会影响？',
      commonPitfalls: ['技术决定论', '忽视政策调节作用', '过度乐观或悲观'],
      excellentResponseIndicators: ['多角度利弊分析', '考虑政策干预可能', '历史类比思考']
    },
    expectedOutcomes: [
      '能够分析AI对不同群体的差异化影响',
      '理解技术发展与社会政策的互动关系',
      '提出缓解负面影响的可能方案'
    ]
  },
  // 前提质疑与方法批判
  {
    thinkingTypeId: 'premise_challenge',
    difficulty: 'beginner',
    topic: '\"读书无用论\"是否有道理？',
    context: '近年来，一些人提出"读书无用论"，认为大学毕业生就业困难，收入不如一些没有高学历的人。他们举例说，某些网红、主播收入远超博士生，一些技术工人的薪资也比大学生高。',
    thinkingFramework: {
      coreChallenge: '如何识别和质疑论证中的隐含前提，避免被表面现象误导？',
      commonPitfalls: ['接受未经验证的前提', '忽视样本偏差', '混淆相关与因果'],
      excellentResponseIndicators: ['识别隐含假设', '质疑证据代表性', '区分短期和长期效应']
    },
    expectedOutcomes: [
      '能够识别"读书无用论"的前提假设',
      '质疑个案证据的代表性',
      '理解教育价值的多元性'
    ]
  },
  {
    thinkingTypeId: 'premise_challenge',
    difficulty: 'intermediate',
    topic: '网络调查显示90%的人支持某政策，这个结果可信吗？',
    context: '某网站发布调查称，90%的网民支持延长产假政策。调查通过网站弹窗进行，共收集到50万份回复。媒体广泛报道了这一结果，称"民意明确支持延长产假"。',
    thinkingFramework: {
      coreChallenge: '如何批判性地评估调查研究的方法论，识别可能的偏差和局限？',
      commonPitfalls: ['盲信数据权威', '忽视抽样偏差', '混淆网络民意与真实民意'],
      excellentResponseIndicators: ['质疑抽样方法', '分析潜在偏差', '考虑沉默群体']
    },
    expectedOutcomes: [
      '能够识别网络调查的方法论问题',
      '理解样本代表性的重要性',
      '质疑媒体对数据的解读'
    ]
  },
  // 谬误识别与证据评估
  {
    thinkingTypeId: 'fallacy_detection',
    difficulty: 'beginner',
    topic: '\"他连自己的孩子都教育不好，怎么能当教育部长？\"这个论证有问题吗？',
    context: '在某次网络讨论中，有人批评新任教育部长，理由是"他的孩子学习成绩不好，说明他连自己的孩子都教育不好，怎么能管理全国的教育事业？"这个观点得到了很多人的赞同。',
    thinkingFramework: {
      coreChallenge: '如何识别日常论证中的逻辑谬误，避免被情绪化论证误导？',
      commonPitfalls: ['接受表面合理的论证', '忽视个人与职业能力的区别', '被情绪化语言影响'],
      excellentResponseIndicators: ['识别人身攻击谬误', '区分个人能力与职业能力', '要求相关证据']
    },
    expectedOutcomes: [
      '能够识别人身攻击(ad hominem)谬误',
      '理解个人生活与职业能力的区别',
      '要求更相关的评判标准'
    ]
  },
  {
    thinkingTypeId: 'fallacy_detection',
    difficulty: 'intermediate',
    topic: '\"自从使用了这个学习方法，我的成绩提高了，所以这个方法很有效\"，这个结论可靠吗？',
    context: '小明在社交媒体上分享："我之前成绩一直不好，后来用了某培训机构的学习方法，成绩从60分提高到了85分。这个方法真的很有效，推荐给大家！"这条分享获得了很多点赞和转发。',
    thinkingFramework: {
      coreChallenge: '如何识别因果关系推断中的逻辑问题，避免被个人经验误导？',
      commonPitfalls: ['混淆相关与因果', '忽视其他可能因素', '过度泛化个人经验'],
      excellentResponseIndicators: ['质疑因果关系', '考虑其他变量', '要求更多证据']
    },
    expectedOutcomes: [
      '能够识别"后此谬误"(post hoc)',
      '理解个人经验的局限性',
      '要求更严格的因果证据'
    ]
  },
  // 观点迭代与反思
  {
    thinkingTypeId: 'iterative_reflection',
    difficulty: 'beginner',
    topic: '你曾经坚信的某个观点后来改变了吗？是什么让你改变了想法？',
    context: '每个人在成长过程中都会遇到观点转变的时刻。可能是因为新的经历、新的信息，或者更深入的思考。这种观点的演化是思维成熟的标志，但也需要我们反思：什么样的证据足以改变我们的观点？我们如何避免固执己见，同时又不轻易摇摆？',
    thinkingFramework: {
      coreChallenge: '如何在坚持原则与开放思维之间找到平衡，进行有效的自我反思？',
      commonPitfalls: ['固执己见', '过度摇摆', '缺乏反思深度'],
      excellentResponseIndicators: ['诚实面对观点变化', '分析改变的原因', '总结学习经验']
    },
    expectedOutcomes: [
      '能够诚实反思自己的观点变化',
      '理解观点演化的正常性和必要性',
      '总结有效的思维调整策略'
    ]
  },
  {
    thinkingTypeId: 'iterative_reflection',
    difficulty: 'intermediate',
    topic: '面对与自己观点相冲突的信息时，你通常如何处理？',
    context: '在信息爆炸的时代，我们经常遇到与自己既有观点相冲突的信息。心理学研究表明，人们倾向于寻找支持自己观点的信息（确认偏差），而忽视或排斥相反的证据。这种倾向可能导致观点极化和思维僵化。',
    thinkingFramework: {
      coreChallenge: '如何克服认知偏差，建立有效的信息处理和观点更新机制？',
      commonPitfalls: ['确认偏差', '选择性注意', '情绪化反应'],
      excellentResponseIndicators: ['主动寻求反面证据', '理性分析冲突信息', '建立更新机制']
    },
    expectedOutcomes: [
      '能够识别自己的确认偏差',
      '建立处理冲突信息的策略',
      '培养开放而审慎的思维态度'
    ]
  },
  // 关联与迁移
  {
    thinkingTypeId: 'connection_transfer',
    difficulty: 'beginner',
    topic: '疫情期间的在线教育经验对未来教育发展有什么启示？',
    context: '新冠疫情期间，全球教育系统被迫转向在线模式。这次大规模的在线教育实验暴露了数字鸿沟、师生互动不足等问题，但也展现了教育技术的潜力，推动了教学方式的创新。',
    thinkingFramework: {
      coreChallenge: '如何从特殊情境中提取普遍性经验，并将其迁移到常规情境中？',
      commonPitfalls: ['过度泛化特殊经验', '忽视情境差异', '缺乏系统思考'],
      excellentResponseIndicators: ['区分特殊与普遍因素', '考虑迁移条件', '提出具体建议']
    },
    expectedOutcomes: [
      '能够从疫情经验中提取有价值的教训',
      '理解在线教育与传统教育的互补关系',
      '提出融合式教育发展建议'
    ]
  },
  {
    thinkingTypeId: 'connection_transfer',
    difficulty: 'intermediate',
    topic: '古代"科举制"对现代教育公平有什么借鉴意义？',
    context: '中国古代的科举制度实行了1300多年，被认为是世界上最早的公务员考试制度。它打破了门第出身的限制，为寒门子弟提供了上升通道，但也产生了应试教育、八股文等问题。现代社会仍在探索教育公平的实现路径。',
    thinkingFramework: {
      coreChallenge: '如何从历史经验中汲取智慧，同时避免简单的历史类比？',
      commonPitfalls: ['简单历史类比', '忽视时代差异', '理想化历史经验'],
      excellentResponseIndicators: ['深入分析历史机制', '考虑时代背景差异', '提出现代化改进']
    },
    expectedOutcomes: [
      '能够分析科举制的核心机制和历史作用',
      '理解历史经验的适用条件和局限性',
      '提出现代教育公平的改进思路'
    ]
  }
]

// 引导问题数据
const guidingQuestions = [
  // 多维归因与利弊权衡 - 初级题目
  {
    questionIndex: 0,
    questions: [
      { level: 'beginner', stage: '现象观察', question: '你观察到的年轻人不愿结婚的具体表现有哪些？', orderIndex: 1 },
      { level: 'beginner', stage: '多因素分析', question: '除了经济因素，还有哪些因素可能影响年轻人的结婚意愿？', orderIndex: 2 },
      { level: 'beginner', stage: '历史对比', question: '与父母一代相比，现在年轻人面临的结婚环境有什么不同？', orderIndex: 3 },
      { level: 'beginner', stage: '利弊权衡', question: '从年轻人的角度，结婚和不结婚各有什么利弊？', orderIndex: 4 },
      { level: 'beginner', stage: '深度思考', question: '这种现象对社会发展可能产生什么长远影响？', orderIndex: 5 }
    ]
  },
  // 多维归因与利弊权衡 - 中级题目
  {
    questionIndex: 1,
    questions: [
      { level: 'intermediate', stage: '问题界定', question: '我们如何定义和测量"社会不平等"？AI的影响应该从哪些维度来评估？', orderIndex: 1 },
      { level: 'intermediate', stage: '机制分析', question: 'AI技术可能通过哪些具体机制影响社会不平等？', orderIndex: 2 },
      { level: 'intermediate', stage: '利益相关者', question: 'AI发展过程中，哪些群体可能受益，哪些群体可能受损？', orderIndex: 3 },
      { level: 'intermediate', stage: '政策干预', question: '政府和社会可以采取哪些措施来缓解AI可能带来的负面影响？', orderIndex: 4 },
      { level: 'intermediate', stage: '历史借鉴', question: '历史上其他技术革命是如何影响社会不平等的？有什么经验教训？', orderIndex: 5 }
    ]
  },
  // 前提质疑与方法批判 - 初级题目
  {
    questionIndex: 2,
    questions: [
      { level: 'beginner', stage: '前提识别', question: '"读书无用论"基于哪些假设？这些假设是否成立？', orderIndex: 1 },
      { level: 'beginner', stage: '证据评估', question: '支持"读书无用论"的证据有哪些？这些证据是否具有代表性？', orderIndex: 2 },
      { level: 'beginner', stage: '概念澄清', question: '这里的"读书"和"有用"分别指什么？如何定义"有用"？', orderIndex: 3 },
      { level: 'beginner', stage: '反面思考', question: '有哪些证据可能反驳"读书无用论"？', orderIndex: 4 },
      { level: 'beginner', stage: '综合判断', question: '综合考虑各种因素，你如何评价教育的价值？', orderIndex: 5 }
    ]
  },
  // 前提质疑与方法批判 - 中级题目
  {
    questionIndex: 3,
    questions: [
      { level: 'intermediate', stage: '方法质疑', question: '这个网络调查的抽样方法有什么问题？', orderIndex: 1 },
      { level: 'intermediate', stage: '偏差分析', question: '哪些群体可能没有参与这个调查？他们的缺席如何影响结果？', orderIndex: 2 },
      { level: 'intermediate', stage: '数据解读', question: '90%这个数字真的代表"民意明确支持"吗？', orderIndex: 3 },
      { level: 'intermediate', stage: '改进建议', question: '如果要进行一个更可靠的民意调查，应该如何设计？', orderIndex: 4 },
      { level: 'intermediate', stage: '媒体批判', question: '媒体在报道这个调查结果时可能存在什么问题？', orderIndex: 5 }
    ]
  },
  // 谬误识别与证据评估 - 初级题目
  {
    questionIndex: 4,
    questions: [
      { level: 'beginner', stage: '论证结构', question: '这个批评的论证结构是什么？前提和结论分别是什么？', orderIndex: 1 },
      { level: 'beginner', stage: '谬误识别', question: '这个论证犯了什么逻辑谬误？为什么这样说？', orderIndex: 2 },
      { level: 'beginner', stage: '相关性分析', question: '个人教育子女的能力与管理国家教育事业的能力有必然联系吗？', orderIndex: 3 },
      { level: 'beginner', stage: '标准重构', question: '评价一个教育部长的能力应该看哪些方面？', orderIndex: 4 },
      { level: 'beginner', stage: '理性回应', question: '面对这样的批评，应该如何理性回应？', orderIndex: 5 }
    ]
  },
  // 谬误识别与证据评估 - 中级题目
  {
    questionIndex: 5,
    questions: [
      { level: 'intermediate', stage: '因果质疑', question: '成绩提高一定是因为使用了新的学习方法吗？还有哪些可能的原因？', orderIndex: 1 },
      { level: 'intermediate', stage: '变量控制', question: '在小明学习期间，除了方法改变，还有哪些因素可能发生了变化？', orderIndex: 2 },
      { level: 'intermediate', stage: '样本局限', question: '一个人的经验能说明这个方法对所有人都有效吗？为什么？', orderIndex: 3 },
      { level: 'intermediate', stage: '证据要求', question: '要证明这个学习方法真的有效，需要什么样的证据？', orderIndex: 4 },
      { level: 'intermediate', stage: '批判思维', question: '在社交媒体上看到类似的"成功经验"分享时，应该如何理性对待？', orderIndex: 5 }
    ]
  },
  // 观点迭代与反思 - 初级题目
  {
    questionIndex: 6,
    questions: [
      { level: 'beginner', stage: '经验回顾', question: '请分享一个你观点发生重大改变的具体例子。', orderIndex: 1 },
      { level: 'beginner', stage: '变化分析', question: '是什么具体的信息、经历或思考促使你改变了观点？', orderIndex: 2 },
      { level: 'beginner', stage: '阻力识别', question: '在改变观点的过程中，你遇到了什么内在阻力？', orderIndex: 3 },
      { level: 'beginner', stage: '学习总结', question: '这次观点改变让你学到了什么？', orderIndex: 4 },
      { level: 'beginner', stage: '策略提炼', question: '基于这次经验，你认为什么样的态度有助于观点的健康演化？', orderIndex: 5 }
    ]
  },
  // 观点迭代与反思 - 中级题目
  {
    questionIndex: 7,
    questions: [
      { level: 'intermediate', stage: '行为观察', question: '回想最近一次遇到与你观点冲突的信息，你的第一反应是什么？', orderIndex: 1 },
      { level: 'intermediate', stage: '偏差识别', question: '你能识别出自己在信息处理中的哪些偏差吗？', orderIndex: 2 },
      { level: 'intermediate', stage: '策略分析', question: '你目前使用什么策略来处理冲突信息？这些策略的效果如何？', orderIndex: 3 },
      { level: 'intermediate', stage: '机制设计', question: '你可以设计什么机制来帮助自己更客观地处理冲突信息？', orderIndex: 4 },
      { level: 'intermediate', stage: '平衡艺术', question: '如何在保持观点稳定性和开放性之间找到平衡？', orderIndex: 5 }
    ]
  },
  // 关联与迁移 - 初级题目
  {
    questionIndex: 8,
    questions: [
      { level: 'beginner', stage: '经验总结', question: '疫情期间的在线教育暴露了哪些问题，又展现了哪些可能性？', orderIndex: 1 },
      { level: 'beginner', stage: '普遍提取', question: '从这些特殊经验中，哪些是具有普遍意义的？', orderIndex: 2 },
      { level: 'beginner', stage: '情境分析', question: '疫情期间的在线教育与正常情况下的在线教育有什么不同？', orderIndex: 3 },
      { level: 'beginner', stage: '迁移思考', question: '这些经验如何应用到后疫情时代的教育发展中？', orderIndex: 4 },
      { level: 'beginner', stage: '具体建议', question: '基于这些思考，你对未来教育发展有什么具体建议？', orderIndex: 5 }
    ]
  },
  // 关联与迁移 - 中级题目
  {
    questionIndex: 9,
    questions: [
      { level: 'intermediate', stage: '历史分析', question: '科举制度的核心机制是什么？它是如何促进社会流动的？', orderIndex: 1 },
      { level: 'intermediate', stage: '问题识别', question: '科举制度产生了哪些负面效应？这些问题的根源是什么？', orderIndex: 2 },
      { level: 'intermediate', stage: '时代对比', question: '古代社会与现代社会在教育公平方面面临的挑战有什么异同？', orderIndex: 3 },
      { level: 'intermediate', stage: '机制迁移', question: '科举制度的哪些机制可以借鉴到现代教育制度中？', orderIndex: 4 },
      { level: 'intermediate', stage: '创新设计', question: '结合现代技术和理念，如何设计更公平的教育选拔机制？', orderIndex: 5 }
    ]
  }
]

async function main() {
  console.log('开始种子数据生成...')

  // 1. 创建思维类型
  console.log('创建思维类型...')
  for (const thinkingType of thinkingTypes) {
    await prisma.thinkingType.upsert({
      where: { id: thinkingType.id },
      update: thinkingType,
      create: thinkingType
    })
  }

  // 2. 创建批判性思维练习题目
  console.log('创建批判性思维练习题目...')
  for (let i = 0; i < criticalThinkingQuestions.length; i++) {
    const questionData = criticalThinkingQuestions[i]
    
    const question = await prisma.criticalThinkingQuestion.upsert({
      where: { 
        id: `seed_question_${i + 1}` 
      },
      update: {
        ...questionData,
        id: `seed_question_${i + 1}`
      },
      create: {
        id: `seed_question_${i + 1}`,
        ...questionData
      }
    })

    // 3. 为每个题目创建引导问题
    const questionGuidingQuestions = guidingQuestions[i]
    if (questionGuidingQuestions) {
      for (const gq of questionGuidingQuestions.questions) {
        await prisma.criticalThinkingGuidingQuestion.upsert({
          where: {
            questionId_level_orderIndex: {
              questionId: question.id,
              level: gq.level,
              orderIndex: gq.orderIndex
            }
          },
          update: {
            stage: gq.stage,
            question: gq.question
          },
          create: {
            questionId: question.id,
            level: gq.level,
            stage: gq.stage,
            question: gq.question,
            orderIndex: gq.orderIndex
          }
        })
      }
    }
  }

  console.log('种子数据生成完成！')
  console.log(`- 创建了 ${thinkingTypes.length} 个思维类型`)
  console.log(`- 创建了 ${criticalThinkingQuestions.length} 个练习题目`)
  console.log(`- 创建了 ${guidingQuestions.reduce((sum, gq) => sum + gq.questions.length, 0)} 个引导问题`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })