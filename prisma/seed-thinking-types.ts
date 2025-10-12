import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const thinkingTypesData = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '识别复杂问题的多重原因，权衡不同方案的利弊得失。培养系统性思维，学会从多个角度分析问题的成因，并能够客观评估各种解决方案的优缺点。',
    icon: 'Search',
    learningContent: {
      framework: {
        title: '多维归因分析框架',
        steps: [
          '问题识别：明确需要分析的核心问题',
          '因素梳理：列出所有可能的影响因素',
          '因果关系：分析各因素之间的相互关系',
          '权重评估：评估不同因素的重要程度',
          '方案比较：对比不同解决方案的利弊'
        ]
      },
      methods: [
        {
          name: '鱼骨图分析法',
          description: '系统性地识别问题的各种可能原因',
          application: '适用于复杂问题的原因分析'
        },
        {
          name: '决策矩阵法',
          description: '量化比较不同方案的优劣',
          application: '适用于多方案选择决策'
        },
        {
          name: '系统思维模型',
          description: '从整体角度理解问题的复杂性',
          application: '适用于涉及多个利益相关者的问题'
        }
      ],
      examples: [
        {
          scenario: '大学专业选择',
          analysis: '需要考虑个人兴趣、就业前景、家庭期望、经济因素等多个维度',
          outcome: '通过权衡分析做出最适合的选择'
        },
        {
          scenario: '企业战略决策',
          analysis: '分析市场环境、竞争对手、内部资源、风险因素等',
          outcome: '制定平衡风险与收益的战略方案'
        }
      ]
    }
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '质疑既定假设，批判性评估方法论的有效性。培养独立思考能力，学会识别和挑战隐含的假设，评估研究方法和论证逻辑的合理性。',
    icon: 'HelpCircle',
    learningContent: {
      framework: {
        title: '前提质疑分析框架',
        steps: [
          '假设识别：找出论证中的隐含假设',
          '假设检验：评估假设的合理性和证据支持',
          '方法评估：分析研究方法的适用性和局限性',
          '逻辑检查：检验推理过程的逻辑严密性',
          '替代方案：考虑其他可能的解释或方法'
        ]
      },
      methods: [
        {
          name: '苏格拉底式提问',
          description: '通过连续提问揭示假设和逻辑漏洞',
          application: '适用于深入分析论证结构'
        },
        {
          name: '方法论批判',
          description: '系统评估研究设计和数据收集方法',
          application: '适用于学术研究和科学论文评估'
        },
        {
          name: '反证法思维',
          description: '通过寻找反例来检验假设',
          application: '适用于理论验证和假设检验'
        }
      ],
      examples: [
        {
          scenario: '媒体报道分析',
          analysis: '质疑报道的信息来源、统计方法、样本代表性等',
          outcome: '形成更客观、全面的认知'
        },
        {
          scenario: '学术论文评估',
          analysis: '检查研究假设、实验设计、数据分析方法的合理性',
          outcome: '提高学术批判思维能力'
        }
      ]
    }
  },
  {
    id: 'fallacy_detection',
    name: '谬误识别与证据评估',
    description: '识别逻辑谬误，评估证据的可靠性和相关性。培养逻辑思维能力，学会识别常见的推理错误，并能够客观评估信息的质量和可信度。',
    icon: 'Scale',
    learningContent: {
      framework: {
        title: '谬误识别与证据评估框架',
        steps: [
          '论证结构分析：识别前提和结论',
          '逻辑关系检查：评估前提与结论的逻辑联系',
          '谬误识别：发现常见的逻辑错误',
          '证据评估：检查证据的来源、质量和相关性',
          '结论评价：判断论证的整体可信度'
        ]
      },
      methods: [
        {
          name: '形式逻辑分析',
          description: '检查论证的逻辑结构是否有效',
          application: '适用于演绎推理的评估'
        },
        {
          name: '证据层次评估',
          description: '根据证据类型和质量进行分级评估',
          application: '适用于科学研究和政策分析'
        },
        {
          name: '偏见识别技术',
          description: '识别认知偏见对判断的影响',
          application: '适用于日常决策和信息处理'
        }
      ],
      examples: [
        {
          scenario: '网络信息辨别',
          analysis: '识别虚假信息、确认偏见、权威谬误等',
          outcome: '提高信息素养和批判能力'
        },
        {
          scenario: '商业广告分析',
          analysis: '识别情感诉求、虚假类比、统计误用等手法',
          outcome: '做出更理性的消费决策'
        }
      ]
    }
  },
  {
    id: 'iterative_reflection',
    name: '观点迭代与反思',
    description: '持续反思和改进自己的观点，接受新信息并调整立场。培养元认知能力，学会监控自己的思维过程，并能够根据新证据灵活调整观点。',
    icon: 'RotateCcw',
    learningContent: {
      framework: {
        title: '观点迭代反思框架',
        steps: [
          '观点记录：明确表达当前的观点和理由',
          '证据收集：主动寻找支持和反对的证据',
          '偏见检查：识别可能影响判断的认知偏见',
          '观点调整：根据新信息修正或完善观点',
          '学习总结：反思思维过程中的收获和改进'
        ]
      },
      methods: [
        {
          name: '元认知策略',
          description: '监控和调节自己的思维过程',
          application: '适用于学习和问题解决过程'
        },
        {
          name: '观点演化追踪',
          description: '记录和分析观点变化的轨迹',
          application: '适用于长期学习和认知发展'
        },
        {
          name: '反思性写作',
          description: '通过写作来深化思考和自我反省',
          application: '适用于个人成长和学术发展'
        }
      ],
      examples: [
        {
          scenario: '学术观点演化',
          analysis: '在研究过程中不断修正和完善理论观点',
          outcome: '形成更成熟和准确的学术认知'
        },
        {
          scenario: '职业发展规划',
          analysis: '根据经验和环境变化调整职业目标和策略',
          outcome: '实现更好的职业发展轨迹'
        }
      ]
    }
  },
  {
    id: 'connection_transfer',
    name: '关联和迁移',
    description: '识别不同领域的共性，将知识和方法跨领域应用。培养创新思维能力，学会发现看似无关事物之间的联系，并能够将成功的方法和经验迁移到新的情境中。',
    icon: 'Link',
    learningContent: {
      framework: {
        title: '关联迁移分析框架',
        steps: [
          '模式识别：发现不同情境中的共同模式',
          '结构分析：分析问题的深层结构特征',
          '类比推理：建立不同领域间的类比关系',
          '方法迁移：将成功方法应用到新情境',
          '效果验证：检验迁移应用的有效性'
        ]
      },
      methods: [
        {
          name: '跨学科思维',
          description: '整合不同学科的知识和方法',
          application: '适用于复杂问题的创新解决'
        },
        {
          name: '类比推理法',
          description: '通过相似性建立不同事物间的联系',
          application: '适用于创意思维和问题解决'
        },
        {
          name: '系统映射技术',
          description: '将一个系统的结构映射到另一个系统',
          application: '适用于商业模式创新和技术转移'
        }
      ],
      examples: [
        {
          scenario: '生物学启发的技术创新',
          analysis: '将生物结构和机制应用到工程设计中',
          outcome: '产生仿生学技术突破'
        },
        {
          scenario: '管理方法的跨行业应用',
          analysis: '将成功的管理模式从一个行业迁移到另一个行业',
          outcome: '实现管理创新和效率提升'
        }
      ]
    }
  }
]

async function seedThinkingTypes() {
  console.log('开始初始化思维维度数据...')
  
  for (const thinkingType of thinkingTypesData) {
    try {
      await prisma.thinkingType.upsert({
        where: { id: thinkingType.id },
        update: thinkingType,
        create: thinkingType,
      })
      console.log(`✅ 思维维度 "${thinkingType.name}" 初始化完成`)
    } catch (error) {
      console.error(`❌ 初始化思维维度 "${thinkingType.name}" 失败:`, error)
    }
  }
  
  console.log('思维维度数据初始化完成！')
}

if (require.main === module) {
  seedThinkingTypes()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedThinkingTypes }