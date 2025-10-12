import { NextRequest, NextResponse } from 'next/server'

// 话题包数据
const topicsData = [
  {
    id: 'policy-efficiency-equity',
    title: '政策评估：效率 vs 公平',
    category: 'policy',
    description: '探讨公共政策制定中效率与公平的权衡，理解不同利益相关者的观点',
    complexity: 'high',
    perspectives: [
      {
        id: 'efficiency-first',
        title: '效率优先观点',
        stance: '政策应该优先考虑整体效率和经济增长',
        keyArguments: [
          '效率提升能创造更多财富，最终惠及所有人',
          '市场机制是资源配置的最佳方式',
          '过度追求公平会损害激励机制',
          '经济增长是解决贫困问题的根本途径'
        ],
        supportingEvidence: [
          '改革开放以来中国经济快速发展的经验',
          '新加坡等国家通过效率优先实现共同富裕',
          '过度福利制度导致的"福利陷阱"现象'
        ],
        stakeholders: ['企业家', '经济学家', '投资者', '高技能工人'],
        values: ['自由', '竞争', '创新', '个人责任']
      },
      {
        id: 'equity-first',
        title: '公平优先观点',
        stance: '政策应该优先保障社会公平和弱势群体权益',
        keyArguments: [
          '公平是社会稳定的基础',
          '机会平等比结果效率更重要',
          '市场失灵需要政府干预纠正',
          '基本权利不应该被市场化'
        ],
        supportingEvidence: [
          '北欧国家高福利高幸福指数的模式',
          '收入不平等加剧导致的社会问题',
          '教育、医疗等公共服务的正外部性'
        ],
        stakeholders: ['工会', '社会工作者', '弱势群体', '左翼政党'],
        values: ['平等', '团结', '社会正义', '集体责任']
      },
      {
        id: 'balanced-approach',
        title: '平衡发展观点',
        stance: '效率与公平应该动态平衡，根据发展阶段调整重点',
        keyArguments: [
          '效率与公平不是零和关系',
          '不同发展阶段需要不同的政策重点',
          '制度设计可以兼顾效率与公平',
          '长期可持续发展需要两者并重'
        ],
        supportingEvidence: [
          '德国社会市场经济模式的成功',
          '中国"先富带动后富"的发展理念',
          '行为经济学关于公平感对效率影响的研究'
        ],
        stakeholders: ['政策制定者', '学者', '中产阶级', '温和派政治家'],
        values: ['平衡', '可持续', '包容', '务实']
      }
    ],
    visualDeconstruction: {
      framework: 'stakeholder-impact-matrix',
      dimensions: ['经济影响', '社会影响', '政治影响', '长期可持续性'],
      analysis: {
        '效率优先政策': {
          '经济影响': { score: 8, description: '促进经济增长，提高整体效率' },
          '社会影响': { score: 4, description: '可能加剧不平等，影响社会凝聚力' },
          '政治影响': { score: 6, description: '获得商界支持，但可能面临民众反对' },
          '长期可持续性': { score: 5, description: '短期效果明显，长期可能面临社会问题' }
        },
        '公平优先政策': {
          '经济影响': { score: 5, description: '可能影响短期效率，但促进消费' },
          '社会影响': { score: 8, description: '提高社会公平，增强社会凝聚力' },
          '政治影响': { score: 7, description: '获得民众支持，符合社会正义理念' },
          '长期可持续性': { score: 7, description: '有利于社会稳定和长期发展' }
        },
        '平衡发展政策': {
          '经济影响': { score: 7, description: '兼顾效率与分配，促进可持续增长' },
          '社会影响': { score: 7, description: '在公平与效率间寻求平衡' },
          '政治影响': { score: 8, description: '获得广泛支持，政治可行性高' },
          '长期可持续性': { score: 8, description: '最有利于长期可持续发展' }
        }
      }
    },
    dialogueRoutes: [
      {
        id: 'business-labor',
        title: '企业主与工人代表对话',
        participants: ['企业主（效率观点）', '工人代表（公平观点）'],
        keyQuestions: [
          '如何在保持竞争力的同时保障工人权益？',
          '最低工资标准应该如何制定？',
          '企业社会责任的边界在哪里？'
        ],
        commonGround: ['都希望经济发展', '都关心就业问题', '都认同法治重要性'],
        tensions: ['短期利润vs长期投资', '个人责任vs社会保障', '市场自由vs政府监管']
      },
      {
        id: 'policy-citizen',
        title: '政策制定者与公民对话',
        participants: ['政策制定者（平衡观点）', '普通公民（多元观点）'],
        keyQuestions: [
          '如何让政策既有效率又公平？',
          '公民如何参与政策制定过程？',
          '如何评估政策的成功？'
        ],
        commonGround: ['都希望社会进步', '都关心下一代', '都认同民主价值'],
        tensions: ['专业判断vs民意', '短期民意vs长期利益', '理想目标vs现实约束']
      }
    ],
    caseStudies: [
      {
        title: '医疗改革案例',
        description: '某国面临医疗费用上涨和医疗资源分配不均的问题',
        scenarios: [
          {
            approach: '市场化改革',
            description: '引入竞争机制，提高医疗服务效率',
            outcomes: ['服务质量提升', '费用可能上涨', '穷人可能看不起病']
          },
          {
            approach: '全民医保',
            description: '政府主导，保障全民基本医疗',
            outcomes: ['覆盖面广', '可能效率较低', '财政负担重']
          },
          {
            approach: '混合模式',
            description: '基本医疗公共化，高端服务市场化',
            outcomes: ['兼顾公平与效率', '实施复杂', '需要精细管理']
          }
        ]
      }
    ]
  },
  {
    id: 'tech-privacy-innovation',
    title: '技术伦理：隐私 vs 创新',
    category: 'technology',
    description: '在数字时代探讨个人隐私保护与技术创新发展之间的平衡',
    complexity: 'high',
    perspectives: [
      {
        id: 'innovation-priority',
        title: '创新优先观点',
        stance: '技术创新应该得到优先保护，隐私保护不应过度限制创新',
        keyArguments: [
          '技术创新推动社会进步和经济发展',
          '数据是新时代的石油，应该充分利用',
          '过度的隐私保护会阻碍有益的技术发展',
          '用户可以通过选择来保护自己的隐私'
        ],
        supportingEvidence: [
          '人工智能在医疗、教育等领域的突破',
          '大数据分析帮助解决社会问题',
          '严格隐私法规对创新企业的负面影响'
        ],
        stakeholders: ['科技公司', '研发人员', '投资者', '技术乐观主义者'],
        values: ['进步', '效率', '自由选择', '经济发展']
      },
      {
        id: 'privacy-priority',
        title: '隐私优先观点',
        stance: '个人隐私是基本权利，技术发展不应以牺牲隐私为代价',
        keyArguments: [
          '隐私是人的基本尊严和自由的体现',
          '数据滥用可能导致歧视和操控',
          '技术公司有责任保护用户数据',
          '隐私保护促进用户信任，有利于长期发展'
        ],
        supportingEvidence: [
          '数据泄露事件造成的严重后果',
          'GDPR等法规的积极影响',
          '隐私侵犯对弱势群体的不成比例影响'
        ],
        stakeholders: ['隐私倡导者', '消费者权益组织', '法律专家', '受害用户'],
        values: ['尊严', '自主权', '安全', '公平']
      },
      {
        id: 'ethical-innovation',
        title: '伦理创新观点',
        stance: '应该推动负责任的创新，在保护隐私的前提下发展技术',
        keyArguments: [
          '隐私保护技术本身就是创新方向',
          '伦理约束能促进更好的技术设计',
          '可持续的创新需要社会信任',
          '技术应该服务于人类福祉'
        ],
        supportingEvidence: [
          '隐私计算技术的快速发展',
          '欧洲在隐私保护下的技术创新',
          '用户对隐私友好产品的偏好增加'
        ],
        stakeholders: ['伦理学家', '负责任的技术公司', '政策制定者', '学术界'],
        values: ['责任', '可持续', '信任', '人本主义']
      }
    ],
    visualDeconstruction: {
      framework: 'risk-benefit-analysis',
      dimensions: ['个人影响', '社会影响', '经济影响', '技术发展'],
      analysis: {
        '宽松隐私政策': {
          '个人影响': { score: 3, description: '个人隐私风险高，但享受便利服务' },
          '社会影响': { score: 4, description: '可能加剧数字鸿沟和社会不平等' },
          '经济影响': { score: 8, description: '促进数字经济快速发展' },
          '技术发展': { score: 9, description: '技术创新速度快，应用广泛' }
        },
        '严格隐私保护': {
          '个人影响': { score: 8, description: '个人隐私得到充分保护' },
          '社会影响': { score: 7, description: '增强社会对技术的信任' },
          '经济影响': { score: 5, description: '可能影响某些商业模式' },
          '技术发展': { score: 4, description: '可能限制某些技术应用' }
        },
        '平衡发展': {
          '个人影响': { score: 7, description: '在便利与隐私间找到平衡' },
          '社会影响': { score: 8, description: '促进技术的负责任发展' },
          '经济影响': { score: 7, description: '推动隐私友好的商业创新' },
          '技术发展': { score: 7, description: '促进隐私保护技术发展' }
        }
      }
    },
    dialogueRoutes: [
      {
        id: 'tech-user',
        title: '科技公司与用户对话',
        participants: ['科技公司代表（创新观点）', '用户代表（隐私观点）'],
        keyQuestions: [
          '如何在提供个性化服务的同时保护隐私？',
          '用户是否真正理解数据使用的价值交换？',
          '技术公司的责任边界在哪里？'
        ],
        commonGround: ['都希望技术改善生活', '都认同透明度重要', '都关心安全问题'],
        tensions: ['商业利益vs用户权益', '便利性vs隐私性', '创新速度vs安全审查']
      },
      {
        id: 'regulator-industry',
        title: '监管者与行业对话',
        participants: ['政府监管者（平衡观点）', '行业代表（创新观点）'],
        keyQuestions: [
          '如何制定既保护隐私又促进创新的法规？',
          '监管应该多严格？如何执行？',
          '如何在全球化背景下协调不同的监管标准？'
        ],
        commonGround: ['都希望技术健康发展', '都关心国际竞争力', '都认同法治重要'],
        tensions: ['监管严格度vs创新自由', '本土保护vs国际合作', '当前利益vs长远发展']
      }
    ],
    caseStudies: [
      {
        title: '人工智能医疗诊断',
        description: 'AI系统需要大量医疗数据训练，但涉及患者隐私',
        scenarios: [
          {
            approach: '开放数据共享',
            description: '医院共享匿名化数据，加速AI发展',
            outcomes: ['AI诊断准确率提升', '医疗成本降低', '存在重新识别风险']
          },
          {
            approach: '严格隐私保护',
            description: '限制数据使用，要求明确同意',
            outcomes: ['隐私得到保护', 'AI发展缓慢', '可能错失医疗突破']
          },
          {
            approach: '联邦学习',
            description: '使用隐私计算技术，数据不出本地',
            outcomes: ['兼顾隐私与创新', '技术复杂度高', '需要新的基础设施']
          }
        ]
      }
    ]
  },
  {
    id: 'social-rights-responsibilities',
    title: '社会议题：权利 vs 责任',
    category: 'social',
    description: '探讨个人权利与社会责任之间的关系，理解自由与义务的平衡',
    complexity: 'medium',
    perspectives: [
      {
        id: 'individual-rights',
        title: '个人权利观点',
        stance: '个人权利是不可侵犯的，社会责任不应过度限制个人自由',
        keyArguments: [
          '个人自由是人类尊严的基础',
          '每个人最了解自己的利益',
          '强制的社会责任可能导致专制',
          '自由选择能促进社会多样性和创新'
        ],
        supportingEvidence: [
          '自由社会的创新能力和活力',
          '强制集体主义的历史教训',
          '个人选择权对幸福感的重要性'
        ],
        stakeholders: ['自由主义者', '个人主义者', '企业家', '艺术家'],
        values: ['自由', '自主', '多样性', '个人责任']
      },
      {
        id: 'social-responsibility',
        title: '社会责任观点',
        stance: '个人应该承担相应的社会责任，权利与义务应该平衡',
        keyArguments: [
          '人是社会性动物，离不开社会支持',
          '个人行为会影响他人和社会',
          '社会责任是享受权利的前提',
          '集体利益有时需要优先于个人利益'
        ],
        supportingEvidence: [
          '疫情期间集体行动的重要性',
          '环境保护需要每个人的参与',
          '社会保障制度的互助性质'
        ],
        stakeholders: ['社区组织者', '环保主义者', '社会工作者', '集体主义者'],
        values: ['团结', '互助', '责任', '可持续']
      },
      {
        id: 'balanced-citizenship',
        title: '平衡公民观点',
        stance: '权利与责任应该相互平衡，根据情境动态调整',
        keyArguments: [
          '权利和责任是相互依存的',
          '不同情境需要不同的平衡点',
          '民主社会需要公民的积极参与',
          '教育和对话能促进理解和合作'
        ],
        supportingEvidence: [
          '成功民主国家的公民参与模式',
          '社区自治的积极效果',
          '公民教育对社会和谐的作用'
        ],
        stakeholders: ['教育工作者', '政治学家', '社区领袖', '温和派公民'],
        values: ['平衡', '参与', '对话', '共识']
      }
    ],
    visualDeconstruction: {
      framework: 'rights-responsibilities-spectrum',
      dimensions: ['个人自由度', '社会凝聚力', '集体效率', '创新活力'],
      analysis: {
        '强调个人权利': {
          '个人自由度': { score: 9, description: '个人享有最大程度的自由' },
          '社会凝聚力': { score: 4, description: '可能导致社会分化' },
          '集体效率': { score: 5, description: '集体行动可能困难' },
          '创新活力': { score: 8, description: '个人创新动力强' }
        },
        '强调社会责任': {
          '个人自由度': { score: 4, description: '个人自由受到一定限制' },
          '社会凝聚力': { score: 8, description: '社会团结度高' },
          '集体效率': { score: 8, description: '集体行动效率高' },
          '创新活力': { score: 5, description: '可能限制个人创新' }
        },
        '权责平衡': {
          '个人自由度': { score: 7, description: '在合理范围内享有自由' },
          '社会凝聚力': { score: 7, description: '通过对话达成共识' },
          '集体效率': { score: 7, description: '在必要时能集体行动' },
          '创新活力': { score: 7, description: '鼓励负责任的创新' }
        }
      }
    },
    dialogueRoutes: [
      {
        id: 'individual-community',
        title: '个人与社区对话',
        participants: ['追求自由的个人', '社区代表'],
        keyQuestions: [
          '个人自由的边界在哪里？',
          '社区有权要求个人做什么？',
          '如何处理个人利益与集体利益的冲突？'
        ],
        commonGround: ['都希望和谐共处', '都认同基本人权', '都关心下一代'],
        tensions: ['个人选择vs社区规范', '隐私权vs知情权', '创新vs稳定']
      },
      {
        id: 'generation-dialogue',
        title: '代际对话',
        participants: ['年轻一代（权利观点）', '年长一代（责任观点）'],
        keyQuestions: [
          '不同代际如何理解权利与责任？',
          '社会变化如何影响权责观念？',
          '如何在传承与创新间找到平衡？'
        ],
        commonGround: ['都关心社会发展', '都希望生活更好', '都重视家庭'],
        tensions: ['传统vs现代', '稳定vs变革', '经验vs创新']
      }
    ],
    caseStudies: [
      {
        title: '疫情防控措施',
        description: '在疫情期间，政府实施各种防控措施，涉及个人自由与公共健康的平衡',
        scenarios: [
          {
            approach: '最小干预',
            description: '主要依靠个人自觉，政府干预最少',
            outcomes: ['个人自由度高', '防控效果可能有限', '依赖公民素质']
          },
          {
            approach: '严格管控',
            description: '实施严格的封锁和管制措施',
            outcomes: ['防控效果好', '个人自由受限', '经济社会成本高']
          },
          {
            approach: '精准防控',
            description: '基于科学数据的精准管控',
            outcomes: ['平衡效果与自由', '需要技术支持', '要求高执行能力']
          }
        ]
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const complexity = searchParams.get('complexity')
    const search = searchParams.get('search')

    let filteredData = topicsData

    // 按类别筛选
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 按复杂度筛选
    if (complexity && complexity !== 'all') {
      filteredData = filteredData.filter(item => item.complexity === complexity)
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.perspectives.some(p => 
          p.title.toLowerCase().includes(searchLower) ||
          p.stance.toLowerCase().includes(searchLower)
        )
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取单个话题详情
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, topicId } = body

    if (action === 'getTopic') {
      const topic = topicsData.find(item => item.id === topicId)
      if (!topic) {
        return NextResponse.json(
          { success: false, error: 'Topic not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: topic
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing topic request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}