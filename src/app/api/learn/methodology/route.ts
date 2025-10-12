import { NextRequest, NextResponse } from 'next/server'

// 方法论微课数据
const methodologyData = [
  {
    id: 'sampling-extrapolation',
    title: '样本与外推',
    category: 'statistics',
    difficulty: 'beginner',
    duration: '15分钟',
    objectives: [
      '理解样本代表性的重要性',
      '识别常见的抽样偏误',
      '学会评估外推的合理性',
      '掌握样本量计算的基本原则'
    ],
    content: {
      introduction: '样本是我们了解总体的窗口，但这扇窗户可能会扭曲我们的视野。学会正确的抽样和外推方法，是批判性思维的基础技能。',
      sections: [
        {
          title: '什么是代表性样本？',
          content: '代表性样本应该在关键特征上反映总体的分布。比如研究全国大学生的学习习惯，样本应该包含不同地区、不同类型大学、不同专业的学生。',
          keyPoints: [
            '样本应覆盖总体的主要子群',
            '避免系统性偏差',
            '考虑样本的时间代表性'
          ]
        },
        {
          title: '常见抽样偏误',
          content: '选择偏误、生存偏误、自选择偏误等会导致样本不能代表总体，从而影响结论的可靠性。',
          examples: [
            '网络调查只能覆盖有网络的人群',
            '电话调查排除了没有固定电话的人群',
            '志愿者样本可能过度代表某些特征'
          ]
        },
        {
          title: '外推的边界',
          content: '从样本得出的结论不能无限制地推广。需要考虑时间、地点、人群等因素的限制。',
          guidelines: [
            '明确目标总体的范围',
            '考虑环境和时间的变化',
            '识别可能的调节变量'
          ]
        }
      ]
    },
    interactiveTask: {
      type: 'scenario-analysis',
      title: '评估研究的外推性',
      scenario: '一项关于"手机使用对睡眠质量影响"的研究，样本为某大学200名大一学生，研究时间为2023年3月。研究发现睡前使用手机1小时以上的学生睡眠质量显著较差。',
      questions: [
        {
          question: '这个研究的样本有什么局限性？',
          options: [
            '样本量太小',
            '只包含大一学生，年龄范围窄',
            '只来自一所大学',
            '研究时间太短'
          ],
          correctAnswers: [1, 2],
          explanation: '样本主要局限在于人群的代表性：只包含大一学生（年龄、生活方式相对单一）且只来自一所大学（可能有特定的校园文化）。200的样本量对于这类研究是合理的。'
        },
        {
          question: '这个结论可以推广到哪些人群？',
          options: [
            '所有大学生',
            '所有年轻人',
            '所有人',
            '需要更多研究才能确定'
          ],
          correctAnswers: [3],
          explanation: '由于样本的局限性，不能直接推广到更广泛的人群。需要包含不同年龄、职业、生活环境的人群的研究来验证这个发现。'
        }
      ]
    },
    keyTakeaways: [
      '好的样本是推理的基础，坏的样本会误导结论',
      '外推需要谨慎，要考虑样本的代表性限制',
      '批判性地评估研究样本是理解研究价值的关键',
      '在应用研究结论时，要考虑自己是否属于研究的目标人群'
    ]
  },
  {
    id: 'experiment-control',
    title: '实验与对照',
    category: 'methodology',
    difficulty: 'intermediate',
    duration: '20分钟',
    objectives: [
      '理解对照组的重要性',
      '识别实验设计中的混淆变量',
      '学会评估因果推断的强度',
      '掌握随机化的作用和局限'
    ],
    content: {
      introduction: '实验是建立因果关系的金标准，但设计不良的实验可能得出错误结论。学会识别实验设计的优劣，是评估证据质量的核心技能。',
      sections: [
        {
          title: '对照组的作用',
          content: '对照组帮助我们回答"如果没有干预会怎样？"这个关键问题。没有对照组，我们无法确定观察到的变化是否真的由干预引起。',
          types: [
            '空白对照：不接受任何处理',
            '安慰剂对照：接受无效处理',
            '积极对照：接受已知有效的处理'
          ]
        },
        {
          title: '混淆变量的识别',
          content: '混淆变量是同时影响自变量和因变量的第三方因素，会导致虚假的因果关系。',
          examples: [
            '研究教育方法时，学生的家庭背景可能是混淆变量',
            '研究药物效果时，患者的年龄、性别可能是混淆变量',
            '研究工作效率时，员工的经验水平可能是混淆变量'
          ]
        },
        {
          title: '随机化的力量',
          content: '随机分组可以平衡已知和未知的混淆变量，是建立因果推断的重要工具。',
          benefits: [
            '消除选择偏误',
            '平衡组间差异',
            '支持统计推断'
          ]
        }
      ]
    },
    interactiveTask: {
      type: 'design-evaluation',
      title: '评估实验设计',
      scenario: '某公司想测试新的员工培训方法是否能提高工作效率。他们让愿意参加新培训的员工参加实验组，其他员工作为对照组，三个月后比较两组的工作效率。',
      questions: [
        {
          question: '这个实验设计的主要问题是什么？',
          options: [
            '没有随机分组',
            '对照组没有接受任何培训',
            '实验时间太短',
            '没有盲法设计'
          ],
          correctAnswers: [0],
          explanation: '最大的问题是没有随机分组。愿意参加新培训的员工可能本身就更积极、更有学习动机，这会混淆培训效果的评估。'
        },
        {
          question: '如何改进这个实验设计？',
          options: [
            '随机选择员工参加新培训',
            '让对照组接受传统培训',
            '延长观察期到一年',
            '以上都是'
          ],
          correctAnswers: [3],
          explanation: '理想的设计应该包括：随机分组消除选择偏误，对照组接受传统培训作为基线比较，更长的观察期确保效果的持续性。'
        }
      ]
    },
    keyTakeaways: [
      '对照组是评估因果关系的必要条件',
      '随机化是消除混淆变量的有效方法',
      '实验设计的质量直接影响结论的可信度',
      '在评估研究时，要特别关注实验的内部效度'
    ]
  },
  {
    id: 'statistics-causation',
    title: '统计与因果',
    category: 'statistics',
    difficulty: 'advanced',
    duration: '25分钟',
    objectives: [
      '区分相关性和因果性',
      '理解统计显著性的含义和局限',
      '学会解读效应量和置信区间',
      '掌握因果推断的基本原则'
    ],
    content: {
      introduction: '统计数据经常被误用来支持因果声明。学会正确解读统计结果，区分相关性和因果性，是现代公民的必备技能。',
      sections: [
        {
          title: '相关性 vs 因果性',
          content: '相关性只表示两个变量之间存在统计关联，而因果性要求一个变量的变化直接导致另一个变量的变化。',
          criteria: [
            '时间顺序：原因必须在结果之前',
            '统计关联：原因和结果必须相关',
            '排除其他解释：没有其他合理的解释'
          ]
        },
        {
          title: '统计显著性的陷阱',
          content: 'p值只告诉我们观察到的差异在零假设下出现的概率，不能直接说明效应的大小或实际意义。',
          misconceptions: [
            'p<0.05不等于效应很大',
            'p<0.05不等于结果重要',
            'p<0.05不等于结果可重复'
          ]
        },
        {
          title: '效应量和实际意义',
          content: '效应量衡量差异的大小，比统计显著性更能反映实际意义。',
          measures: [
            "Cohen's d：标准化均值差异",
            '相关系数：关联强度',
            '决定系数：解释的方差比例'
          ]
        }
      ]
    },
    interactiveTask: {
      type: 'interpretation',
      title: '解读研究结果',
      scenario: '一项研究发现，使用某学习App的学生考试成绩平均提高了3分（满分100分），p=0.03，Cohen\'s d=0.2。研究者声称"App显著提高学习效果"。',
      questions: [
        {
          question: '如何评价"显著提高"这个说法？',
          options: [
            '正确，p<0.05表示效果显著',
            '误导，效应量很小',
            '需要更多信息才能判断',
            '完全错误'
          ],
          correctAnswers: [1],
          explanation: '虽然统计上显著（p<0.05），但效应量很小（d=0.2被认为是小效应），实际提高只有3%，可能没有实际意义。'
        },
        {
          question: '这个结果能证明App导致成绩提高吗？',
          options: [
            '能，因为有统计显著性',
            '不能，这可能只是相关性',
            '能，因为有对照组',
            '不确定，需要看研究设计'
          ],
          correctAnswers: [3],
          explanation: '仅从这些统计结果无法判断因果关系。需要了解研究设计：是否有随机分组？是否控制了其他变量？是否排除了其他解释？'
        }
      ]
    },
    keyTakeaways: [
      '相关性不等于因果性，需要满足更严格的条件',
      '统计显著性不等于实际重要性',
      '效应量比p值更能反映实际意义',
      '因果推断需要结合统计证据和研究设计'
    ]
  },
  {
    id: 'ethics-risk',
    title: '伦理审视与风险边界',
    category: 'ethics',
    difficulty: 'intermediate',
    duration: '18分钟',
    objectives: [
      '识别研究和决策中的伦理问题',
      '学会进行风险-收益分析',
      '理解知情同意的重要性',
      '掌握伦理决策的基本框架'
    ],
    content: {
      introduction: '批判性思维不仅要求逻辑正确，还要求伦理合理。学会识别和评估伦理问题，是负责任思考的重要组成部分。',
      sections: [
        {
          title: '伦理原则框架',
          content: '现代伦理学提供了多个评估框架，帮助我们系统地思考道德问题。',
          frameworks: [
            '后果主义：关注行动的结果和影响',
            '义务论：关注行动本身的对错',
            '美德伦理：关注行动者的品格',
            '关怀伦理：关注关系和责任'
          ]
        },
        {
          title: '风险评估矩阵',
          content: '系统评估潜在风险的概率和影响，帮助做出平衡的决策。',
          dimensions: [
            '概率：风险发生的可能性',
            '影响：风险造成的后果严重程度',
            '可控性：我们对风险的控制能力',
            '可逆性：风险后果的可逆程度'
          ]
        },
        {
          title: '利益相关者分析',
          content: '识别所有可能受影响的群体，确保决策考虑到各方利益。',
          steps: [
            '识别直接和间接利益相关者',
            '评估对各方的影响',
            '考虑弱势群体的特殊需求',
            '寻求公平和包容的解决方案'
          ]
        }
      ]
    },
    interactiveTask: {
      type: 'ethical-dilemma',
      title: '伦理决策分析',
      scenario: '一家科技公司开发了一个AI招聘系统，可以大大提高招聘效率，但测试发现系统对某些群体存在轻微偏见。公司面临是否发布这个系统的决策。',
      questions: [
        {
          question: '从不同伦理框架看，应该如何决策？',
          options: [
            '后果主义：如果整体收益大于风险，应该发布',
            '义务论：存在偏见就是错误的，不应发布',
            '美德伦理：取决于公司的价值观和品格',
            '以上都有道理，需要综合考虑'
          ],
          correctAnswers: [3],
          explanation: '不同伦理框架会给出不同的指导，现实中的伦理决策往往需要综合多个视角，寻找平衡点。'
        },
        {
          question: '应该采取什么行动？',
          options: [
            '立即发布，在使用中改进',
            '继续改进，消除偏见后再发布',
            '发布但加上警告和监控',
            '征求利益相关者意见后决定'
          ],
          correctAnswers: [1, 3],
          explanation: '最佳做法可能是继续改进系统消除偏见，同时征求受影响群体的意见。如果必须发布，应该加上适当的警告和持续监控。'
        }
      ]
    },
    keyTakeaways: [
      '伦理考量应该贯穿整个思考和决策过程',
      '不同伦理框架提供不同视角，都有价值',
      '风险评估要考虑概率、影响、可控性等多个维度',
      '利益相关者分析确保决策的公平性和包容性'
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    let filteredData = methodologyData

    // 按类别筛选
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 按难度筛选
    if (difficulty && difficulty !== 'all') {
      filteredData = filteredData.filter(item => item.difficulty === difficulty)
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.content.introduction.toLowerCase().includes(searchLower) ||
        item.objectives.some(obj => obj.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    })
  } catch (error) {
    console.error('Error fetching methodology lessons:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取单个课程详情
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, lessonId, answers } = body

    if (action === 'getLesson') {
      const lesson = methodologyData.find(item => item.id === lessonId)
      if (!lesson) {
        return NextResponse.json(
          { success: false, error: 'Lesson not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: lesson
      })
    }

    if (action === 'submitQuiz') {
      const lesson = methodologyData.find(item => item.id === lessonId)
      if (!lesson) {
        return NextResponse.json(
          { success: false, error: 'Lesson not found' },
          { status: 404 }
        )
      }

      // 评估答案
      const results = lesson.interactiveTask.questions.map((question, index) => {
        const userAnswers = answers[index] || []
        const correctAnswers = question.correctAnswers
        const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())
        
        return {
          questionIndex: index,
          isCorrect,
          userAnswers,
          correctAnswers,
          explanation: question.explanation
        }
      })

      const score = results.filter(r => r.isCorrect).length / results.length * 100

      return NextResponse.json({
        success: true,
        data: {
          score: Math.round(score),
          results,
          feedback: score >= 80 ? '优秀！你很好地掌握了这节课的内容。' :
                   score >= 60 ? '不错！建议再复习一下错误的部分。' :
                   '需要加强！建议重新学习课程内容。'
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing methodology request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}