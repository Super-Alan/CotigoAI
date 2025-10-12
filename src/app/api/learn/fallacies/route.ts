import { NextRequest, NextResponse } from 'next/server'

// 逻辑谬误数据
const fallaciesData = [
  {
    id: 'ad-hominem',
    name: '人身攻击',
    category: 'logical',
    definition: '通过攻击论证者的个人特征而非其论证本身来反驳观点',
    signals: ['转移话题到个人品格', '使用贬低性标签', '质疑动机而非论据'],
    countermeasures: ['重新聚焦到论证内容', '指出攻击与论题无关', '要求对方回到事实讨论'],
    examples: [
      {
        scenario: '政策辩论',
        fallacy: '"你支持这个政策是因为你从中获利"',
        correction: '"让我们讨论这个政策的具体影响和数据"'
      }
    ]
  },
  {
    id: 'straw-man',
    name: '稻草人谬误',
    category: 'logical',
    definition: '歪曲或简化对方观点，然后攻击这个被歪曲的版本',
    signals: ['过度简化复杂观点', '夸大对方立场', '攻击极端版本'],
    countermeasures: ['澄清真实立场', '要求准确复述', '提供具体例子'],
    examples: [
      {
        scenario: '环保讨论',
        fallacy: '"环保主义者想让我们回到石器时代"',
        correction: '"环保主义者主张可持续发展，不是拒绝所有技术"'
      }
    ]
  },
  {
    id: 'slippery-slope',
    name: '滑坡谬误',
    category: 'logical',
    definition: '认为一个行动必然导致一系列负面后果，而没有充分证据',
    signals: ['使用"必然导致"等绝对词汇', '缺乏中间步骤的证据', '夸大后果严重性'],
    countermeasures: ['要求每步推理的证据', '指出中间可能的干预', '质疑因果链的必然性'],
    examples: [
      {
        scenario: '教育政策',
        fallacy: '"如果允许学生使用计算器，他们就不会算数了"',
        correction: '"需要研究计算器使用对数学能力的具体影响"'
      }
    ]
  },
  {
    id: 'hasty-generalization',
    name: '以偏概全',
    category: 'logical',
    definition: '基于少数案例或不充分的样本得出普遍性结论',
    signals: ['样本量过小', '缺乏代表性', '忽略反例'],
    countermeasures: ['要求更大样本', '寻找反例', '检查样本代表性'],
    examples: [
      {
        scenario: '职业刻板印象',
        fallacy: '"我认识的几个程序员都很内向，所以程序员都很内向"',
        correction: '"需要更大规模的调查来了解程序员的性格分布"'
      }
    ]
  },
  {
    id: 'correlation-causation',
    name: '相关不等于因果',
    category: 'statistical',
    definition: '仅因为两个变量相关就认为存在因果关系',
    signals: ['混淆相关性和因果性', '忽略第三变量', '时间顺序错误'],
    countermeasures: ['寻找第三变量', '检查时间顺序', '要求因果机制解释'],
    examples: [
      {
        scenario: '健康研究',
        fallacy: '"冰淇淋销量和溺水事故相关，所以冰淇淋导致溺水"',
        correction: '"两者都与夏季气温相关，气温是共同原因"'
      }
    ]
  },
  {
    id: 'confirmation-bias',
    name: '确认偏误',
    category: 'cognitive',
    definition: '倾向于寻找、解释和记住支持既有信念的信息',
    signals: ['选择性关注支持信息', '忽略反驳证据', '过度解读支持性数据'],
    countermeasures: ['主动寻找反驳证据', '考虑替代解释', '使用系统性搜索方法'],
    examples: [
      {
        scenario: '投资决策',
        fallacy: '只关注支持某股票的分析报告，忽略负面消息',
        correction: '系统性收集正面和负面信息，进行平衡分析'
      }
    ]
  },
  {
    id: 'availability-heuristic',
    name: '可得性启发',
    category: 'cognitive',
    definition: '基于容易回想起的信息来判断概率或重要性',
    signals: ['过度依赖近期事件', '被媒体报道影响', '忽略基础概率'],
    countermeasures: ['查找统计数据', '考虑基础概率', '避免媒体偏见'],
    examples: [
      {
        scenario: '风险评估',
        fallacy: '因为最近看到飞机事故新闻就认为飞行很危险',
        correction: '查看飞行安全的统计数据和与其他交通方式的比较'
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let filteredData = fallaciesData

    // 按类别筛选
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.definition.toLowerCase().includes(searchLower) ||
        item.signals.some(signal => signal.toLowerCase().includes(searchLower)) ||
        item.countermeasures.some(measure => measure.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    })
  } catch (error) {
    console.error('Error fetching fallacies:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, definition, signals, countermeasures, examples } = body

    // 验证必需字段
    if (!name || !category || !definition) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 生成新的ID
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const newFallacy = {
      id,
      name,
      category,
      definition,
      signals: signals || [],
      countermeasures: countermeasures || [],
      examples: examples || []
    }

    // 在实际应用中，这里应该保存到数据库
    // 现在只是返回创建的数据
    return NextResponse.json({
      success: true,
      data: newFallacy
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating fallacy:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}