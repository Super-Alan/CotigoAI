import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 香港大学批判性思维面试题种子数据
 * 每个维度2道中等难度的题目
 */

const hkuQuestions = [
  // 多维归因与利弊权衡维度 (causal_analysis)
  {
    thinkingTypeId: 'causal_analysis',
    difficulty: 'intermediate',
    topic: '环境经济学',
    question: '各国政府在制定环保政策时需要平衡经济发展与环境保护。有人认为"环保政策会阻碍经济发展"，你如何分析这一观点中的因果关系？',
    context: '各国政府在制定环保政策时需要平衡经济发展与环境保护。近年来，碳税、碳交易等政策在多国实施，但也引发了关于经济增长放缓的担忧。',
    tags: ['环境经济学', '气候变化', '经济政策', '多维归因与利弊权衡'],
    thinkingFramework: {
      steps: [
        '识别变量：环保政策（自变量）、经济发展（因变量）',
        '观察相关性：收集数据，分析政策与经济指标的关系',
        '排除混淆：技术创新、全球经济周期、产业结构',
        '建立时间序列：政策实施前后的经济表现',
        '寻找机制：绿色产业、就业转移、创新驱动',
        '验证因果：对比不同国家的政策效果',
        '考虑边界条件：发展阶段、产业结构、政策设计'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '相关性不等于因果性：需要控制其他变量',
        '短期vs长期效应：初期可能有成本，长期带来新增长点',
        '政策设计质量：渐进式vs激进式改革的不同影响'
      ]
    }
  },
  {
    thinkingTypeId: 'causal_analysis',
    difficulty: 'intermediate',
    topic: '教育心理学',
    question: '研究发现，学生的课外补习时间与考试成绩呈正相关。能否据此推断"补习导致成绩提高"？如何验证这一因果关系的可靠性？',
    context: '一项教育研究发现，参加课外补习的学生平均成绩比不参加的学生高15%。许多家长据此认为补习是提高成绩的有效手段，教育培训行业也快速发展。',
    tags: ['教育研究', '因果推理', '混淆变量', '验证方法'],
    thinkingFramework: {
      steps: [
        '识别变量：补习时间、考试成绩',
        '观察相关性：统计数据显示正相关',
        '识别混淆因素：家庭经济条件、学生基础能力、学习动机',
        '考虑反向因果：成绩好的学生更倾向参加补习？',
        '设计验证：随机对照实验、自然实验、倾向得分匹配',
        '寻找机制：知识巩固、个性化辅导、心理支持',
        '边界条件：补习质量、学生特征、学科差异'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '选择偏差：能负担补习的家庭往往有更多教育资源',
        '反向因果：优秀学生更可能参加补习',
        '验证方法：需要控制混淆变量的实验设计'
      ]
    }
  },

  // 前提挑战维度 (premise_challenge)
  {
    thinkingTypeId: 'premise_challenge',
    difficulty: 'intermediate',
    topic: '公共政策',
    question: '政府提议"提高最低工资标准以改善低收入群体生活"。请识别这一政策建议中的显性和隐含前提，并批判性评估其合理性。',
    context: '为应对生活成本上涨，某国政府提议将最低工资标准提高20%。支持者认为这能改善低收入群体生活质量，反对者担心会导致失业率上升和企业负担加重。',
    tags: ['公共政策', '劳动经济学', '前提识别', '政策评估'],
    thinkingFramework: {
      steps: [
        '识别显性前提：生活成本上涨、低收入群体生活困难',
        '挖掘隐含前提：企业有支付能力、不会大规模裁员、工资是主要收入来源',
        '质疑前提合理性：所有企业都能负担？所有低收入者都受益？',
        '重新框定：是否存在更有效的扶贫方式？',
        '多方利益分析：劳动者、企业、消费者、政府',
        '量化前提：具体提高多少？影响多少人和企业？',
        '替代方案：税收抵免、负所得税、技能培训'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '隐含假设：企业利润率足够、劳动力市场弹性小',
        '未考虑：区域差异、行业差异、非正规就业',
        '替代框架：从再分配政策转向人力资本投资'
      ]
    }
  },
  {
    thinkingTypeId: 'premise_challenge',
    difficulty: 'intermediate',
    topic: '科技伦理',
    question: 'AI医疗诊断系统承诺"提高诊断准确率，缓解医疗资源不足"。请分析这一承诺背后的前提假设，并提出可能被忽视的问题。',
    context: '某科技公司推出AI医疗诊断系统，声称在特定疾病诊断上准确率达95%，高于普通医生的85%。公司建议在基层医疗机构广泛应用以缓解医疗资源紧张。',
    tags: ['科技伦理', 'AI应用', '医疗政策', '批判性思维'],
    thinkingFramework: {
      steps: [
        '识别显性前提：AI准确率高、医疗资源不足',
        '挖掘隐含前提：测试环境=实际环境、数据代表性、医生会信任AI',
        '质疑数据来源：训练数据是否涵盖所有人群？',
        '重新框定：是辅助工具还是替代方案？',
        '伦理考量：误诊责任、算法偏见、数据隐私',
        '利益相关方：患者、医生、科技公司、监管机构',
        '替代方案：远程医疗、医生培训、医疗资源分配优化'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '数据偏见：训练数据可能不代表基层患者群体',
        '责任归属：AI出错时的法律和伦理问题',
        '系统性风险：过度依赖技术可能削弱医生诊断能力'
      ]
    }
  },

  // 谬误检测维度 (fallacy_detection)
  {
    thinkingTypeId: 'fallacy_detection',
    difficulty: 'intermediate',
    topic: '医学伦理',
    question: '某制药公司声称："我们的新药在临床试验中安全有效，且获得了三位知名专家的推荐，因此应该批准上市。"请识别这一论证中可能存在的逻辑谬误。',
    context: '某制药公司申请新药上市，提交的证据包括200人的临床试验数据（有效率70%，安全性良好）和三位医学专家的推荐信。监管机构需要评估是否批准。',
    tags: ['医学伦理', '逻辑谬误', '论证分析', '科学方法'],
    thinkingFramework: {
      steps: [
        '识别论证结构：前提1（试验有效）+ 前提2（专家推荐）→ 结论（应批准）',
        '检测诉诸权威谬误：专家推荐≠科学证据充分',
        '检测样本偏小：200人是否足够代表？',
        '检测隐含前提：短期有效=长期安全？',
        '检测利益冲突：专家是否与公司有利益关系？',
        '应用伦理原则：行善、不伤害、自主、公正',
        '重构论证：需要更大样本、长期追踪、独立验证'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '诉诸权威：专家意见不能替代科学证据',
        '样本偏差：200人样本在统计学上可能不足',
        '缺失前提：未提供长期安全性数据和对照组信息'
      ]
    }
  },
  {
    thinkingTypeId: 'fallacy_detection',
    difficulty: 'intermediate',
    topic: '气候政策',
    question: '政治家辩论："如果我们实施严格的碳减排政策，企业成本会上升，然后会转嫁给消费者，导致物价上涨，最终引发经济衰退。所以我们不应该实施碳减排。"请分析这一论证的逻辑问题。',
    context: '在气候政策辩论中，反对派提出上述"滑坡论证"，认为严格的碳减排政策会引发一系列负面连锁反应，最终导致经济灾难。',
    tags: ['气候政策', '滑坡谬误', '因果链条', '政策分析'],
    thinkingFramework: {
      steps: [
        '识别论证结构：A→B→C→D（连锁因果）',
        '检测滑坡谬误：每个环节的必然性如何？',
        '检测过度简化：忽视了技术创新、市场调节等因素',
        '检测假二分法：减排与经济发展真的不可兼得？',
        '寻找反例：欧洲国家的减排与经济表现',
        '应用系统思维：正反馈vs负反馈机制',
        '重构论证：温和渐进的政策设计、绿色转型机遇'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '滑坡谬误：假设每个环节必然发生，忽视中间调节机制',
        '假二分法：暗示只有两种选择（严格减排或不减排）',
        '忽视正面效应：绿色产业发展、能源独立、技术出口'
      ]
    }
  },

  // 迭代反思维度 (iterative_reflection)
  {
    thinkingTypeId: 'iterative_reflection',
    difficulty: 'intermediate',
    topic: '决策心理学',
    question: '回顾你最近做出的一个重要决定（如选择专业、接受工作等）。请识别你在决策过程中可能存在的认知偏差，并反思如何改进未来的决策质量。',
    context: '研究表明，人类决策过程中常受确认偏差、锚定效应、可得性启发等认知偏差影响。自我反思和元认知能力有助于改善决策质量。',
    tags: ['元认知', '认知偏差', '决策分析', '自我反思'],
    thinkingFramework: {
      steps: [
        '描述决策过程：收集信息、权衡利弊、最终选择',
        '识别确认偏差：是否只关注支持性证据？',
        '识别锚定效应：初始信息是否过度影响判断？',
        '识别可得性偏差：是否受近期经历过度影响？',
        '识别沉没成本谬误：是否受已投入资源影响？',
        '反思情绪影响：焦虑、兴奋等情绪如何影响决策？',
        '制定改进计划：决策检查清单、征求反面意见、延迟决策'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '认知偏差普遍存在：即使意识到也难以完全避免',
        '结构化决策流程：清单、反面意见、延迟决策等方法',
        '持续反思习惯：建立决策日志，定期复盘'
      ]
    }
  },
  {
    thinkingTypeId: 'iterative_reflection',
    difficulty: 'intermediate',
    topic: '学习方法论',
    question: '分析你在学习批判性思维过程中的思维模式变化。你发现了哪些以前未曾注意到的思维习惯？如何将这些认识应用到其他领域？',
    context: '批判性思维训练不仅是学习特定技能，更是培养元认知能力——意识到自己的思维过程，识别思维模式，并持续改进。',
    tags: ['元认知', '学习迁移', 'Kolb学习圈', '反思性实践'],
    thinkingFramework: {
      steps: [
        '具体经验：回顾学习批判性思维的具体情境',
        '反思观察：自己的思维方式有何变化？',
        '抽象概括：提取可迁移的思维原则',
        '主动实验：在新情境中测试这些原则',
        '识别思维模式：归纳、演绎、类比等思维方式',
        '发现盲点：过度自信、确认偏差等',
        '迁移应用：如何将批判性思维应用到专业学习、人际关系、职业发展'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '元认知提升：更清楚自己如何思考和学习',
        '思维模式识别：发现习惯性的思维快捷方式',
        '跨领域迁移：批判性思维是通用能力'
      ]
    }
  },

  // 知识迁移维度 (connection_transfer)
  {
    thinkingTypeId: 'connection_transfer',
    difficulty: 'intermediate',
    topic: '跨领域创新',
    question: '生物学中的"自然选择"机制启发了计算机科学的"遗传算法"。请分析这一知识迁移的深层结构，并探讨能否将类似原理应用到社会治理领域。',
    context: '遗传算法是一种模拟生物进化的优化算法：通过选择、交叉、变异等操作，在解空间中搜索最优解。这一跨领域迁移非常成功，启发我们思考其他可能的迁移。',
    tags: ['知识迁移', '类比推理', '跨领域创新', '系统思维'],
    thinkingFramework: {
      steps: [
        '识别源领域原理：变异、选择、遗传的核心机制',
        '抽象化结构：种群、适应度、迭代优化',
        '寻找目标领域：社会治理、政策优化',
        '建立映射：政策=个体、社会效果=适应度',
        '考虑差异：社会系统的伦理约束、不可逆性',
        '测试迁移：A/B测试、试点政策、渐进式改革',
        '优化调整：反馈机制、纠错能力'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '深层结构：迭代优化、选择机制、探索与利用平衡',
        '关键差异：社会系统有伦理约束和不可逆性',
        '创新应用：政策实验、渐进式改革、多中心治理'
      ]
    }
  },
  {
    thinkingTypeId: 'connection_transfer',
    difficulty: 'intermediate',
    topic: '医学与工程',
    question: '医学中的"免疫系统"多层防御机制（物理屏障、先天免疫、适应性免疫）能否启发我们设计更安全的网络安全系统？请进行跨领域类比分析。',
    context: '人体免疫系统是一个高度复杂的多层防御系统，具有识别、记忆、学习和适应能力。网络安全也需要多层防御，这两个领域是否存在深层结构相似性？',
    tags: ['跨领域类比', '系统安全', '多层防御', '适应性系统'],
    thinkingFramework: {
      steps: [
        '识别免疫系统原理：多层防御、模式识别、记忆与学习',
        '抽象化结构：边界防护、威胁识别、响应机制、适应进化',
        '映射到网络安全：防火墙、入侵检测、威胁情报、自适应防御',
        '分析相似性：分层防御、特征识别、历史学习',
        '识别差异：数字vs生物、确定性vs概率性',
        '测试迁移：设计自适应安全系统',
        '评估有效性：对抗新型威胁的能力'
      ]
    },
    expectedOutcomes: {
      keyInsights: [
        '深层相似性：多层防御、模式识别、适应性学习',
        '启发设计：自适应安全系统、威胁情报共享、免疫记忆',
        '局限性：生物系统的试错成本vs数字系统的确定性需求'
      ]
    }
  }
]

async function main() {
  console.log('开始种子数据：香港大学批判性思维面试题...')

  // 首先创建 ThinkingType 数据
  const thinkingTypes = [
    {
      id: 'causal_analysis',
      name: '多维归因与利弊权衡',
      description: '区分相关性与因果性，识别混淆因素，建立可靠的因果推理',
      icon: 'GitBranch',
      learningContent: {
        framework: ['识别变量', '观察相关性', '排除混淆', '建立时间序列', '寻找机制', '验证因果'],
        methods: ['实验设计', '统计分析', '因果推理'],
        examples: ['环保政策与经济', '教育投入与成绩']
      }
    },
    {
      id: 'premise_challenge',
      name: '前提质疑与方法批判',
      description: '识别论证中的隐含前提，质疑其合理性，并重新框定问题',
      icon: 'Search',
      learningContent: {
        framework: ['识别显性前提', '挖掘隐含前提', '质疑前提', '重新框定', '多方视角'],
        methods: ['批判性分析', '问题重构', '利益相关方分析'],
        examples: ['最低工资政策', 'AI医疗诊断']
      }
    },
    {
      id: 'fallacy_detection',
      name: '谬误检测',
      description: '识别常见逻辑谬误，理解其危害，并学会避免这些思维陷阱',
      icon: 'AlertCircle',
      learningContent: {
        framework: ['识别论证结构', '检测形式谬误', '检测非形式谬误', '评估论证强度'],
        methods: ['逻辑分析', '论证重构', '批判性评估'],
        examples: ['诉诸权威', '滑坡论证']
      }
    },
    {
      id: 'iterative_reflection',
      name: '迭代反思',
      description: '培养元认知能力，识别思维模式，并持续改进思维质量',
      icon: 'RefreshCw',
      learningContent: {
        framework: ['描述思维过程', '识别思维模式', '评估思维质量', '制定改进计划'],
        methods: ['元认知反思', 'Kolb学习圈', '反思性实践'],
        examples: ['决策回顾', '学习方法反思']
      }
    },
    {
      id: 'connection_transfer',
      name: '知识迁移',
      description: '识别深层结构相似性，实现知识和技能的跨领域迁移',
      icon: 'Link',
      learningContent: {
        framework: ['识别源领域', '抽象化结构', '建立映射', '测试迁移', '优化调整'],
        methods: ['类比推理', '结构映射', '跨领域创新'],
        examples: ['生物进化→遗传算法', '免疫系统→网络安全']
      }
    }
  ]

  // 创建或更新 ThinkingTypes
  for (const typeData of thinkingTypes) {
    await prisma.thinkingType.upsert({
      where: { id: typeData.id },
      update: typeData,
      create: typeData
    })
    console.log(`✅ 创建/更新思维类型: ${typeData.name}`)
  }

  // 然后创建题目
  for (const questionData of hkuQuestions) {
    const question = await prisma.criticalThinkingQuestion.create({
      data: questionData
    })

    console.log(`✅ 创建题目: ${question.topic} (${question.thinkingTypeId})`)
  }

  console.log('✨ 种子数据完成！共创建', hkuQuestions.length, '道题目')
}

main()
  .catch((e) => {
    console.error('❌ 种子数据错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
