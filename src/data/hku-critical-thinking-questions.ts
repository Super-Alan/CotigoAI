/**
 * 香港大学风格批判性思维面试题库
 * 每个维度2道中等难度题目
 */

export interface HKUQuestion {
  id: string
  dimension: string
  title: string
  scenario: string
  keyQuestions: string[]
  difficulty: 'intermediate'
  tags: string[]
  expectedThinking: string[]
  realWorldContext: string
}

/**
 * 多维归因与利弊权衡维度题目
 */
export const CAUSAL_ANALYSIS_QUESTIONS: HKUQuestion[] = [
  {
    id: 'causal_1',
    dimension: 'causal_analysis',
    title: '远程办公对员工创新能力的影响',
    scenario: `新冠疫情后，许多科技公司采用混合办公模式。一项调查显示，远程办公员工的专利申请数量比办公室员工少30%。公司管理层据此认为远程办公降低了员工的创新能力，计划强制要求所有员工回到办公室。

研究数据：
- 远程办公员工专利申请：平均2.1件/年
- 办公室员工专利申请：平均3.0件/年
- 远程办公员工工作满意度：8.2/10
- 办公室员工工作满意度：7.1/10
- 远程办公员工离职率：5%
- 办公室员工离职率：12%`,
    keyQuestions: [
      '专利申请数量减少与远程办公之间是相关还是因果关系？',
      '可能存在哪些混淆因素影响了这一结果？',
      '如何设计研究来验证真正的因果关系？',
      '是否存在反向因果的可能性？'
    ],
    difficulty: 'intermediate',
    tags: ['工作模式', '创新', '因果推理', '混淆因素'],
    expectedThinking: [
      '识别可能的混淆因素（如远程员工的工作性质、资历、团队协作需求）',
      '考虑选择偏差（谁选择了远程工作）',
      '质疑单一指标（专利数量）是否能完整衡量创新能力',
      '提出控制变量的研究设计',
      '考虑中介变量（如协作机会、资源获取）'
    ],
    realWorldContext: '这个问题反映了后疫情时代企业面临的真实决策困境，涉及工作模式选择、创新管理、员工福祉等多个维度。'
  },
  {
    id: 'causal_2',
    dimension: 'causal_analysis',
    title: '社交媒体使用与青少年抑郁症的关系',
    scenario: `一项针对香港中学生的纵向研究发现，每天使用社交媒体超过3小时的学生，其抑郁症状评分比使用少于1小时的学生高出40%。研究还发现，抑郁评分与社交媒体使用时间呈现显著正相关（r=0.52, p<0.001）。

基于这一发现，有教育专家建议学校严格限制学生的社交媒体使用时间，以预防青少年抑郁症。

补充数据：
- 高使用组学业压力评分：7.8/10
- 低使用组学业压力评分：5.2/10
- 高使用组课外活动参与度：2.3次/周
- 低使用组课外活动参与度：4.1次/周`,
    keyQuestions: [
      '这是相关性还是因果性？如何区分？',
      '可能的第三变量或混淆因素有哪些？',
      '是否可能存在反向因果（抑郁导致更多社交媒体使用）？',
      '纵向研究能否确立因果关系？还需要什么证据？'
    ],
    difficulty: 'intermediate',
    tags: ['心理健康', '社交媒体', '青少年', '纵向研究'],
    expectedThinking: [
      '识别潜在混淆因素（学业压力、社交支持、家庭环境）',
      '考虑反向因果：抑郁的学生可能更倾向于通过社交媒体寻求慰藉',
      '考虑双向因果：可能存在恶性循环',
      '质疑研究设计：纵向研究优于横断研究，但仍不能完全确立因果',
      '提出实验或准实验设计来验证'
    ],
    realWorldContext: '这是一个具有重大社会意义的问题，涉及青少年心理健康、数字时代的教育政策、家长管理等多个层面。'
  }
]

/**
 * 前提挑战维度题目
 */
export const PREMISE_CHALLENGE_QUESTIONS: HKUQuestion[] = [
  {
    id: 'premise_1',
    dimension: 'premise_challenge',
    title: '大学排名与教育质量的关系',
    scenario: `一位家长在为子女选择大学时，主要依据QS世界大学排名。他认为："排名越高的大学，教育质量就越好，毕业生就业前景就越理想。因此，应该不惜代价让孩子进入排名前50的大学。"

背景信息：
- QS排名主要考虑：学术声誉(40%)、雇主声誉(10%)、师生比(20%)、国际化程度(10%)、论文引用(20%)
- 该学生兴趣：创意设计、艺术创作
- 家庭经济状况：中产，年收入50万港币
- 排名50名大学学费：35万港币/年
- 排名150名大学（设计专业著名）学费：20万港币/年`,
    keyQuestions: [
      '这一论证包含哪些隐含前提？',
      '这些前提在多大程度上成立？',
      '如果重新框定问题，会有什么不同的选择？',
      '不同的价值观会导致什么不同的决策？'
    ],
    difficulty: 'intermediate',
    tags: ['教育选择', '价值判断', '隐含假设', '决策分析'],
    expectedThinking: [
      '识别隐含前提：排名=质量、质量=就业、名校适合所有人',
      '质疑排名指标的全面性（特别对艺术设计专业）',
      '重新框定：从"最好的大学"转向"最适合的大学"',
      '考虑个人特质、专业匹配、经济承受力',
      '提出多元评估框架'
    ],
    realWorldContext: '反映了香港及亚洲家庭在教育选择中的真实困境，涉及教育价值观、经济压力、个人发展等多重考量。'
  },
  {
    id: 'premise_2',
    dimension: 'premise_challenge',
    title: 'AI取代人类工作的辩论',
    scenario: `在一场关于人工智能的辩论中，一方提出："AI将在未来10-20年内取代50%的人类工作，因此我们应该大力发展全民基本收入(UBI)制度，为失业人群提供保障。"

反对方则认为："技术进步一直在创造新工作，工业革命、互联网革命都是如此。担心AI会导致大规模失业是杞人忧天，我们应该投资教育和培训，而不是UBI。"

背景数据：
- 麦肯锡研究：到2030年，AI可能影响全球8亿个工作岗位
- 历史数据：1990-2020年，虽然自动化替代了许多工作，但整体就业率保持稳定
- UBI试点（芬兰）：参与者幸福感提升，但就业率未显著改变`,
    keyQuestions: [
      '双方论证各自基于什么隐含前提？',
      '历史经验能否直接推断未来？这一前提是否合理？',
      '"取代"和"影响"工作的区别是什么？',
      '如何在两种极端观点之间找到更平衡的视角？'
    ],
    difficulty: 'intermediate',
    tags: ['人工智能', '就业', '社会政策', '技术变革'],
    expectedThinking: [
      '识别"历史必然重演"的隐含前提及其局限',
      '质疑"非此即彼"的二元对立',
      '重新框定：AI既是挑战也是机遇',
      '提出渐进式、多管齐下的方案',
      '考虑过渡期的社会支持需求'
    ],
    realWorldContext: '这是全球性的重大议题，涉及技术发展、社会政策、经济转型等多个维度，需要超越简单的二元对立思维。'
  }
]

/**
 * 谬误检测维度题目
 */
export const FALLACY_DETECTION_QUESTIONS: HKUQuestion[] = [
  {
    id: 'fallacy_1',
    dimension: 'fallacy_detection',
    title: '基因编辑婴儿的伦理辩论',
    scenario: `在一场关于基因编辑技术的听证会上，出现了以下论点：

**支持方A**："贺建奎博士已经成功编辑了婴儿基因，这证明技术是可行的。既然技术已经存在，阻止其发展是徒劳的，我们应该积极拥抱这一技术。"

**支持方B**："基因编辑可以消除遗传疾病，任何反对这项技术的人都是在阻碍医学进步，对那些遗传病患者的痛苦视而不见。"

**反对方C**："如果我们允许基因编辑，接下来就会允许设计婴儿的外貌、智商，最终会创造出'超级人类'，导致社会分化。"

**反对方D**："世界顶尖生物伦理学家都反对在现阶段进行人类胚胎基因编辑，他们的意见必然是对的。"`,
    keyQuestions: [
      '每个论点分别犯了什么逻辑谬误？',
      '如何重构这些论证使其更加严密？',
      '在这类伦理议题中，应该如何避免谬误？',
      '什么样的论证框架更合理？'
    ],
    difficulty: 'intermediate',
    tags: ['生物伦理', '逻辑谬误', '基因编辑', '医学伦理'],
    expectedThinking: [
      'A犯了"诉诸现实"谬误（is-ought fallacy）',
      'B犯了"虚假二分法"和"动机归因"谬误',
      'C犯了"滑坡谬误"',
      'D犯了"诉诸权威"谬误',
      '提出基于伦理原则（自主、善行、无伤、公正）的分析框架'
    ],
    realWorldContext: '反映了生物技术快速发展带来的真实伦理挑战，需要在技术可能性和伦理可接受性之间寻找平衡。'
  },
  {
    id: 'fallacy_2',
    dimension: 'fallacy_detection',
    title: '气候变化政策辩论中的逻辑错误',
    scenario: `在一场关于香港气候政策的辩论中，出现了以下论点：

**论点1**："去年冬天是香港50年来最冷的冬天，这证明全球变暖是个骗局。"

**论点2**："97%的气候科学家认同人类活动导致气候变化，所以任何质疑者都是错的。"

**论点3**："如果我们实施严格的碳排放限制，经济会崩溃、失业率会飙升，人们会活不下去。因此我们不应该采取任何气候行动。"

**论点4**："李先生投资了大量太阳能股票，所以他倡导可再生能源的动机是不纯的，他的观点不值得采信。"

**论点5**："人类一直在适应环境变化，过去几千年都是如此，所以气候变化不会有什么大问题。"`,
    keyQuestions: [
      '识别每个论点中的逻辑谬误',
      '分析这些谬误为什么会误导公众？',
      '如何将这些论点重构为更严密的论证？',
      '在科学议题的公共讨论中，如何避免这些谬误？'
    ],
    difficulty: 'intermediate',
    tags: ['气候变化', '科学传播', '公共政策', '论证分析'],
    expectedThinking: [
      '论点1：轶事证据谬误、混淆天气与气候',
      '论点2：诉诸多数/权威，忽视论证本身',
      '论点3：滑坡谬误、虚假二分法、诉诸恐惧',
      '论点4：人身攻击、动机谬误',
      '论点5：不当类比、忽视情境差异',
      '提出基于证据和逻辑的分析框架'
    ],
    realWorldContext: '气候变化是当今最重大的公共议题之一，但公共讨论中充斥着各种逻辑谬误，影响了理性决策。'
  }
]

/**
 * 迭代反思维度题目
 */
export const ITERATIVE_REFLECTION_QUESTIONS: HKUQuestion[] = [
  {
    id: 'reflection_1',
    dimension: 'iterative_reflection',
    title: '学习方法的迭代改进',
    scenario: `张同学是HKU商学院一年级学生。第一学期他沿用中学的学习方法：
- 课前不预习
- 上课认真记笔记
- 考前突击复习
- 背诵大量内容

第一学期成绩：GPA 3.1/4.0，在班上排名中下。

张同学很困惑："我已经很努力了，为什么成绩还是不理想？是我不够聪明，还是方法有问题？"

他注意到成绩优秀的同学似乎花在'死记硬背'上的时间更少，但对概念的理解更深入，能够灵活应用到案例分析中。`,
    keyQuestions: [
      '张同学应该如何系统地反思自己的学习过程？',
      '有哪些认知偏差可能影响了他对自己学习的评估？',
      '如何将反思转化为具体的改进行动？',
      '如何建立持续反思和改进的机制？'
    ],
    difficulty: 'intermediate',
    tags: ['学习方法', '元认知', '自我反思', '持续改进'],
    expectedThinking: [
      '应用Kolb学习圈进行系统反思',
      '识别"努力=效果"的认知偏差',
      '区分表层学习(memorization)和深度学习(understanding)',
      '提出基于spaced repetition、active recall的新方法',
      '设计可衡量的改进指标和反馈机制'
    ],
    realWorldContext: '反映了大学新生普遍面临的学习转型挑战，从被动学习到主动学习，从记忆到理解的转变。'
  },
  {
    id: 'reflection_2',
    dimension: 'iterative_reflection',
    title: '团队项目中的沟通失败反思',
    scenario: `在一个跨专业团队项目中，李同学（工程背景）作为项目经理，领导一个包含商科、设计、文科背景的5人团队。

项目进展困难：
- 团队成员经常误解李同学的指示
- 李同学认为团队成员"不够专业"、"执行力差"
- 最终项目仅获得C等评价

评审反馈："技术方案优秀，但与用户需求脱节，团队协作明显不足。"

李同学反思："为什么我讲得很清楚了，他们还是做不到？是不是我选错了团队成员？还是我的沟通方式有问题？"`,
    keyQuestions: [
      '李同学的思维模式存在什么问题？',
      '他应该如何进行深层反思而不是归因于他人？',
      '有哪些具体的思维习惯需要改变？',
      '如何将这次经历转化为可迁移的领导力提升？'
    ],
    difficulty: 'intermediate',
    tags: ['团队协作', '领导力', '沟通', '归因偏差'],
    expectedThinking: [
      '识别外部归因偏差(fundamental attribution error)',
      '反思"技术专家"与"团队领导"思维模式的差异',
      '认识到单向沟通的局限性',
      '提出建立反馈循环、empathy mapping等方法',
      '从"blame game"转向"growth mindset"'
    ],
    realWorldContext: '跨学科团队协作是现代工作环境的常态，需要超越专业技能的软技能和自我认知能力。'
  }
]

/**
 * 知识迁移维度题目
 */
export const CONNECTION_TRANSFER_QUESTIONS: HKUQuestion[] = [
  {
    id: 'transfer_1',
    dimension: 'connection_transfer',
    title: '医学诊断思维在商业决策中的应用',
    scenario: `王医生是一位经验丰富的急诊科医生，最近转行创业，担任一家健康科技初创公司的CEO。

在医学诊断中，王医生习惯使用的思维框架：
1. 鉴别诊断(Differential Diagnosis)：同时考虑多种可能的病因
2. 排除法则(Rule Out)：优先排除危险但可治疗的情况
3. 贝叶斯推理(Bayesian Reasoning)：基于先验概率更新判断
4. 系统性评估(Systematic Assessment)：ABCDE评估法
5. 决策树(Decision Tree)：基于风险-收益分析选择治疗方案

现在公司面临困境：
- 产品方向模糊，三个潜在市场机会
- 资金只够支撑6个月
- 团队士气低落
- 两个竞争对手已经获得大额融资`,
    keyQuestions: [
      '医学诊断的哪些思维方法可以迁移到商业决策中？',
      '如何将ABCDE评估法的深层结构抽象化？',
      '迁移过程中需要注意哪些情境差异？',
      '能否提出一个融合医学思维的商业决策框架？'
    ],
    difficulty: 'intermediate',
    tags: ['跨领域迁移', '诊断思维', '商业决策', '创业'],
    expectedThinking: [
      '识别深层结构：系统性、概率性、风险评估',
      '建立映射：病因→市场问题，症状→用户反馈，治疗→解决方案',
      '创造性应用：设计商业版的"鉴别诊断"框架',
      '考虑边界条件：商业决策的不确定性更高，但容错性也更大',
      '提出"商业诊断法"：ABCDE=Assess(市场), Brainstorm(方案), Compare(对比), Decide(决策), Execute(执行)'
    ],
    realWorldContext: '许多成功的跨界创新来自于不同领域思维方法的迁移，这需要抽象思维和创造性应用的能力。'
  },
  {
    id: 'transfer_2',
    dimension: 'connection_transfer',
    title: '生态系统原理在组织管理中的迁移',
    scenario: `陈同学在生态学课程中学习了热带雨林生态系统的原理：

核心特征：
1. 高度多样性(Diversity)：物种丰富，生态位多样
2. 相互依存(Interdependence)：复杂的食物网和共生关系
3. 营养循环(Nutrient Cycling)：能量和物质的高效循环
4. 韧性(Resilience)：通过冗余和多样性抵抗干扰
5. 自组织(Self-Organization)：没有中央控制，但整体有序

现在陈同学加入了一家科技公司的组织发展部门，公司正面临：
- 部门间协作困难，"筒仓效应"严重
- 知识和信息流通不畅
- 员工创新动力不足
- 应对市场变化反应慢`,
    keyQuestions: [
      '生态系统的哪些原理可以迁移到组织管理中？',
      '如何建立"组织生态系统"的概念框架？',
      '"营养循环"在组织中的对应物是什么？',
      '这种类比的局限性在哪里？如何避免过度迁移？'
    ],
    difficulty: 'intermediate',
    tags: ['系统思维', '组织管理', '生态学', '类比推理'],
    expectedThinking: [
      '抽象核心原理：多样性→技能多元，相互依存→跨部门协作',
      '创造性映射：营养循环→知识分享，韧性→组织学习能力',
      '提出"组织生态系统"设计原则',
      '识别局限：组织有明确目标和人为设计，生态系统是自然演化',
      '平衡类比：借鉴原理但不机械套用'
    ],
    realWorldContext: '系统思维和跨学科思维是解决复杂组织问题的重要工具，生态学原理已被应用于经济学、管理学等多个领域。'
  }
]

/**
 * 获取所有题目
 */
export function getAllHKUQuestions(): HKUQuestion[] {
  return [
    ...CAUSAL_ANALYSIS_QUESTIONS,
    ...PREMISE_CHALLENGE_QUESTIONS,
    ...FALLACY_DETECTION_QUESTIONS,
    ...ITERATIVE_REFLECTION_QUESTIONS,
    ...CONNECTION_TRANSFER_QUESTIONS
  ]
}

/**
 * 根据维度获取题目
 */
export function getQuestionsByDimension(dimension: string): HKUQuestion[] {
  const allQuestions = getAllHKUQuestions()
  return allQuestions.filter(q => q.dimension === dimension)
}

/**
 * 根据ID获取题目
 */
export function getQuestionById(id: string): HKUQuestion | undefined {
  const allQuestions = getAllHKUQuestions()
  return allQuestions.find(q => q.id === id)
}
