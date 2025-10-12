import { NextRequest, NextResponse } from 'next/server'

// 论证结构与写作模板数据
const templatesData = [
  {
    id: 'peel',
    name: 'PEEL 结构',
    category: 'argument',
    description: '一种经典的段落写作结构，适用于学术写作和论证',
    structure: {
      'Point': '提出观点 - 清晰陈述你的主要论点',
      'Evidence': '提供证据 - 引用数据、研究、例子或权威来源',
      'Explain': '解释说明 - 阐述证据如何支持你的观点',
      'Link': '连接总结 - 将论点与整体论证或下一段落连接'
    },
    example: {
      topic: '远程工作的效率',
      content: {
        'Point': '远程工作可以显著提高员工的工作效率。',
        'Evidence': '斯坦福大学的研究显示，远程工作者的生产力提高了13%。',
        'Explain': '这是因为远程工作减少了通勤时间和办公室干扰，让员工能够在最适合自己的环境中专注工作。',
        'Link': '因此，企业应该考虑实施灵活的远程工作政策来提升整体效率。'
      }
    },
    tips: [
      '确保每个部分都简洁明了',
      '证据要具体和可信',
      '解释部分要逻辑清晰',
      '连接要自然流畅'
    ]
  },
  {
    id: 'cer',
    name: 'CER 结构',
    category: 'scientific',
    description: '科学论证的标准结构，强调证据和推理的重要性',
    structure: {
      'Claim': '声明 - 提出可验证的科学声明或假设',
      'Evidence': '证据 - 提供支持声明的观察、数据或实验结果',
      'Reasoning': '推理 - 解释证据如何逻辑性地支持声明'
    },
    example: {
      topic: '植物需要阳光进行光合作用',
      content: {
        'Claim': '植物需要阳光才能正常生长。',
        'Evidence': '实验中，放在阳光下的植物叶子呈现健康的绿色并持续生长，而放在黑暗中的植物叶子变黄且停止生长。',
        'Reasoning': '阳光提供光合作用所需的光能，使植物能够将二氧化碳和水转化为葡萄糖和氧气，为生长提供必要的能量。'
      }
    },
    tips: [
      '声明要具体可测试',
      '证据要来自可靠来源',
      '推理要基于科学原理',
      '避免主观判断'
    ]
  },
  {
    id: 'stakeholder-matrix',
    name: '利益相关者矩阵',
    category: 'analysis',
    description: '系统分析不同利益相关者的立场、影响和利益',
    structure: {
      '识别利益相关者': '列出所有受影响的个人、群体或组织',
      '分析影响程度': '评估每个利益相关者的影响力大小',
      '评估利益关切': '了解各方的核心利益和关切点',
      '制定策略': '针对不同利益相关者制定相应的沟通和合作策略'
    },
    example: {
      topic: '城市新建购物中心项目',
      content: {
        '开发商': { influence: '高', interests: '利润最大化，项目顺利完成', strategy: '提供详细的投资回报分析' },
        '当地居民': { influence: '中', interests: '交通便利，环境不受影响', strategy: '举办社区听证会，解决环境担忧' },
        '政府部门': { influence: '高', interests: '经济发展，城市规划合理', strategy: '展示项目对当地经济的积极影响' },
        '现有商家': { influence: '中', interests: '避免过度竞争，保护现有业务', strategy: '探讨合作机会，差异化定位' }
      }
    },
    tips: [
      '全面识别所有相关方',
      '客观评估影响力',
      '深入了解真实需求',
      '制定针对性策略'
    ]
  },
  {
    id: 'pros-cons',
    name: '利弊权衡框架',
    category: 'decision',
    description: '系统性地分析决策的正面和负面影响',
    structure: {
      '明确决策问题': '清晰定义需要做出的决策',
      '列出优点': '识别所有可能的正面影响和好处',
      '列出缺点': '识别所有可能的负面影响和风险',
      '权重评估': '根据重要性给不同因素分配权重',
      '综合判断': '基于权衡分析做出最终决策'
    },
    example: {
      topic: '是否实施四天工作制',
      content: {
        '优点': [
          '提高员工工作满意度和生活质量',
          '可能提高工作效率和创造力',
          '减少通勤和办公成本',
          '有助于吸引和留住人才'
        ],
        '缺点': [
          '可能影响客户服务连续性',
          '某些行业难以实施',
          '初期可能需要调整期',
          '可能增加单日工作强度'
        ],
        '权重考虑': '员工福利(30%) + 生产效率(25%) + 客户满意度(25%) + 实施成本(20%)',
        '结论': '在试点部门先行实施，根据效果逐步推广'
      }
    },
    tips: [
      '尽可能全面列举',
      '考虑短期和长期影响',
      '量化可量化的因素',
      '考虑不确定性和风险'
    ]
  },
  {
    id: 'steelman',
    name: '钢人技巧',
    category: 'debate',
    description: '以最强有力的形式呈现对方观点，然后进行建设性回应',
    structure: {
      '理解对方观点': '深入了解对方的核心论点和支撑理由',
      '强化表述': '以最有说服力的方式重新表述对方观点',
      '寻找合理性': '识别对方观点中的合理成分',
      '建设性回应': '在承认合理性的基础上提出不同看法',
      '寻求共识': '探索可能的共同点和解决方案'
    },
    example: {
      topic: '关于人工智能发展的辩论',
      content: {
        '对方观点': 'AI发展应该放缓，因为存在风险',
        '钢人表述': 'AI技术的快速发展确实带来了就业替代、隐私安全、算法偏见等重要挑战，谨慎发展有助于确保技术造福人类而非带来伤害。',
        '承认合理性': '这些担忧是完全合理的，历史上技术革命确实带来过社会动荡。',
        '建设性回应': '同时，我们也应该看到AI在医疗、教育、环保等领域的巨大潜力。关键是建立完善的监管框架，而不是停止发展。',
        '寻求共识': '我们都希望AI技术能够安全、公平地发展，也许可以探讨如何在推进技术的同时加强风险管控。'
      }
    },
    tips: [
      '真诚理解对方立场',
      '避免歪曲或弱化',
      '寻找共同价值观',
      '保持尊重和开放'
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let filteredData = templatesData

    // 按类别筛选
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        JSON.stringify(item.structure).toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, structure, example, tips } = body

    // 验证必需字段
    if (!name || !category || !description || !structure) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 生成新的ID
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const newTemplate = {
      id,
      name,
      category,
      description,
      structure,
      example: example || {},
      tips: tips || []
    }

    // 在实际应用中，这里应该保存到数据库
    return NextResponse.json({
      success: true,
      data: newTemplate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}