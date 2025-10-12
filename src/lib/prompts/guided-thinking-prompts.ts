/**
 * 智能引导思考提示词系统
 * 基于具体题目内容动态生成个性化的引导问题
 */

export interface GuidedQuestion {
  question: string
  purpose: string
  thinkingDirection: string
  keywords: string[]
}

export interface GuidedThinkingResponse {
  questions: GuidedQuestion[]
  thinkingPath: string
  expectedInsights: string[]
}

/**
 * 生成智能引导问题的提示词
 */
export function generateGuidedThinkingPrompt(
  thinkingType: string,
  questionTopic: string,
  questionContext: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): string {
  const difficultyConfig = {
    beginner: {
      questionCount: 3,
      complexity: '基础性',
      description: '帮助初学者建立基本概念框架，问题应当直接、具体，便于理解'
    },
    intermediate: {
      questionCount: 4,
      complexity: '进阶性',
      description: '引导学习者深入分析和思考，问题应当启发性强，促进批判性思维'
    },
    advanced: {
      questionCount: 5,
      complexity: '高级',
      description: '挑战学习者进行深度思考和创新，问题应当开放性强，鼓励多角度分析'
    }
  }

  const config = difficultyConfig[difficulty]

  // 不同思维维度的特定指导
  const dimensionGuidance: Record<string, string> = {
    causal_analysis: `
**因果分析维度要求**：
- 引导区分相关性与因果性
- 帮助识别混淆因素和第三变量
- 促进建立清晰的因果机制
- 引导考虑反向因果和时间序列
- 帮助评估因果关系的强度和适用边界`,

    premise_challenge: `
**前提质疑维度要求**：
- 引导识别显性和隐含前提
- 帮助质疑假设的合理性
- 促进从多个角度重新框定问题
- 引导考虑替代性假设
- 帮助平衡不同利益相关方的观点`,

    fallacy_detection: `
**谬误检测维度要求**：
- 引导识别论证的结构（前提-推理-结论）
- 帮助检测常见逻辑谬误类型
- 促进理解谬误的根源和危害
- 引导提供纠正和改进方法
- 帮助应用伦理学原则（如适用）`,

    iterative_reflection: `
**迭代反思维度要求**：
- 引导元认知意识和自我反思
- 帮助识别习惯性思维模式
- 促进评估自己的思维质量
- 引导识别认知偏差和盲点
- 帮助制定具体可行的改进计划`,

    connection_transfer: `
**知识迁移维度要求**：
- 引导识别问题的深层结构
- 帮助抽象化核心原理和方法
- 促进寻找跨领域的结构相似性
- 引导建立源领域与目标领域的映射
- 帮助测试和调整迁移效果`
  }

  return `你是一位资深的批判性思维教育专家，擅长通过苏格拉底式提问引导学生深度思考。

## 任务
请为以下批判性思维练习题目生成${config.questionCount}个**${config.complexity}引导问题**。

## 题目信息
**思维维度**：${thinkingType}
**题目主题**：${questionTopic}
**题目情境**：${questionContext}
**难度等级**：${difficulty}

## 生成要求
${dimensionGuidance[thinkingType] || ''}

### 问题设计原则
1. **渐进性**：问题应由浅入深，逐步引导学生深化思考
2. **针对性**：紧密结合题目的具体内容和情境，避免泛泛而谈
3. **启发性**：采用开放式提问，激发学生主动思考而非被动接受
4. **脚手架性**：为学生提供思维支架，降低认知负荷
5. **实践导向**：问题应引导学生将理论应用到实际分析中

### ${config.description}

### 思维路径设计
- 第一层问题：理解问题本质，明确关键概念
- 第二层问题：分析具体情境，识别关键要素
- 第三层问题：深入批判性思考，应用思维框架
- ${config.questionCount >= 4 ? '第四层问题：评估和综合，形成完整观点' : ''}
- ${config.questionCount >= 5 ? '第五层问题：迁移和创新，扩展应用范围' : ''}

## 输出格式
请以JSON格式返回结果：

\`\`\`json
{
  "questions": [
    {
      "question": "具体的引导问题（清晰、简洁、有针对性）",
      "purpose": "这个问题的教学目的（帮助学生建立什么认知或技能）",
      "thinkingDirection": "期望的思考方向（学生应当从哪些角度思考）",
      "keywords": ["关键词1", "关键词2", "关键词3"]
    }
  ],
  "thinkingPath": "整体的思维路径描述（说明这些问题如何引导学生从浅到深思考）",
  "expectedInsights": [
    "期望学生获得的关键洞察1",
    "期望学生获得的关键洞察2",
    "期望学生获得的关键洞察3"
  ]
}
\`\`\`

## 示例参考

### 因果分析维度示例
**问题**："研究发现，经常喝咖啡的人心脏病发病率较低。某公司据此推出广告：'每天一杯咖啡，远离心脏病'。"

**引导问题示例**：
1. "这个研究发现的是相关性还是因果性？两者有什么区别？"
   - 目的：建立相关性与因果性的基本概念
   - 方向：从统计关系与因果关系的区别出发

2. "除了'咖啡保护心脏'，还有哪些可能的解释能够说明这种相关性？"
   - 目的：引导识别混淆因素和第三变量
   - 方向：考虑生活方式、经济水平、健康意识等因素

3. "如果要证明咖啡确实能降低心脏病风险，需要满足哪些条件？"
   - 目的：理解建立因果关系的严格要求
   - 方向：时间序列、剂量关系、机制解释、实验验证

现在，请基于上述要求，为给定的题目生成高质量的引导问题。确保问题：
- 紧密结合题目的具体内容
- 符合思维维度的核心要求
- 适配难度等级的认知水平
- 提供清晰的思维支架

请直接返回JSON格式的结果，不要包含其他解释文字。`
}

/**
 * 生成思维提示（学习提示栏的内容）
 */
export function generateThinkingTips(
  thinkingType: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  const baseTips: Record<string, { [key: string]: string[] }> = {
    causal_analysis: {
      beginner: [
        '相关性 ≠ 因果性：两件事同时发生不意味着一件导致另一件',
        '寻找第三变量：可能有共同的原因影响两者',
        '考虑时间顺序：原因必须发生在结果之前'
      ],
      intermediate: [
        '识别混淆因素：控制其他可能影响的变量',
        '建立因果机制：解释A如何导致B的具体路径',
        '考虑反向因果：B是否可能影响A'
      ],
      advanced: [
        '评估因果强度：因果关系的稳定性和普遍性',
        '分析边界条件：在什么情况下因果关系成立',
        '综合多重因果：复杂系统中的交互作用'
      ]
    },
    premise_challenge: {
      beginner: [
        '找出明说的假设：论证中直接陈述的前提',
        '质疑假设合理性：这个假设是否站得住脚',
        '考虑其他可能：是否有替代的理解方式'
      ],
      intermediate: [
        '挖掘隐含假设：论证中没说但必须成立的前提',
        '重新框定问题：从不同角度看待同一问题',
        '平衡多方观点：考虑不同利益相关方的立场'
      ],
      advanced: [
        '解构价值判断：识别背后的价值观和意识形态',
        '批判性重构：基于新前提建立更合理的论证',
        '系统性思考：考虑更大的社会、历史背景'
      ]
    },
    fallacy_detection: {
      beginner: [
        '找出论证结构：前提是什么，结论是什么',
        '检查逻辑跳跃：推理过程是否合理',
        '识别常见谬误：稻草人、滑坡、诉诸权威等'
      ],
      intermediate: [
        '分析谬误类型：形式谬误还是非形式谬误',
        '评估论证强度：即使没有谬误，论证是否充分',
        '提供纠正方案：如何改进这个论证'
      ],
      advanced: [
        '深入谬误根源：为什么这个谬误看起来有道理',
        '伦理维度分析：涉及的伦理原则和冲突',
        '重构有效论证：建立逻辑严密的新论证'
      ]
    },
    iterative_reflection: {
      beginner: [
        '记录思维过程：写下自己是怎么想的',
        '识别思维模式：有什么习惯性的思考方式',
        '评估思维质量：这样思考是否有效'
      ],
      intermediate: [
        '发现认知偏差：有哪些思维盲点或偏见',
        '提取可迁移经验：哪些经验可以用到其他地方',
        '制定改进计划：具体怎样提升思维质量'
      ],
      advanced: [
        '元认知监控：实时观察和调整思维过程',
        '建立反思习惯：形成持续自我改进的机制',
        '追踪长期进展：评估思维能力的发展轨迹'
      ]
    },
    connection_transfer: {
      beginner: [
        '识别核心概念：这个问题的本质是什么',
        '寻找相似场景：在其他领域见过类似的吗',
        '建立初步联系：有什么共同点'
      ],
      intermediate: [
        '抽象化原理：提取深层结构而非表面特征',
        '建立映射关系：明确对应关系',
        '测试迁移效果：应用到新情境是否有效'
      ],
      advanced: [
        '跨域创新：整合多个领域的知识解决问题',
        '调整和优化：根据新情境修正迁移方案',
        '扩展应用范围：探索更多迁移可能'
      ]
    }
  }

  return baseTips[thinkingType]?.[difficulty] || [
    '逐个思考引导问题，不要跳过',
    '每个问题都有其设计目的，帮助你深入思考',
    '写下你的思考过程，有助于后续作答'
  ]
}
