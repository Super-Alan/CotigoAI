/**
 * 知识点概念映射表
 * 定义每个思维维度下的核心概念和知识点
 */

export interface ConceptInfo {
  key: string         // 概念唯一标识符
  name: string        // 概念中文名称
  description: string // 概念简短描述
}

export interface ThinkingTypeConcepts {
  thinkingTypeId: string
  thinkingTypeName: string
  concepts: ConceptInfo[]
}

/**
 * 五大思维维度的概念映射
 */
export const CONCEPT_MAPPING: Record<string, ThinkingTypeConcepts> = {
  causal_analysis: {
    thinkingTypeId: 'causal_analysis',
    thinkingTypeName: '多维归因与利弊权衡',
    concepts: [
      {
        key: 'correlation_vs_causation',
        name: '相关性与因果性',
        description: '区分两个现象同时发生（相关）与一个现象导致另一个（因果）的差异'
      },
      {
        key: 'confounding_factors',
        name: '混淆因素识别',
        description: '识别可能同时影响两个变量的第三因素'
      },
      {
        key: 'causal_chain',
        name: '因果链建立',
        description: '建立从原因到结果的完整逻辑链条，确认时间顺序和机制'
      },
      {
        key: 'necessity_sufficiency',
        name: '必要条件与充分条件',
        description: '区分必要条件（没它不行）和充分条件（有它就行）'
      },
      {
        key: 'reverse_causality',
        name: '反向因果',
        description: '考虑因果方向是否可能相反（B导致A而非A导致B）'
      }
    ]
  },

  premise_challenge: {
    thinkingTypeId: 'premise_challenge',
    thinkingTypeName: '前提质疑与方法批判',
    concepts: [
      {
        key: 'implicit_premises',
        name: '隐含前提识别',
        description: '发现论证中未明说但必须成立的假设'
      },
      {
        key: 'premise_evaluation',
        name: '前提合理性评估',
        description: '评估前提和假设是否合理、是否有足够证据支持'
      },
      {
        key: 'reframe_problem',
        name: '问题重新框定',
        description: '从不同角度重新理解和定义问题'
      },
      {
        key: 'assumption_testing',
        name: '假设检验',
        description: '设计方法来检验关键假设是否成立'
      },
      {
        key: 'value_judgement',
        name: '价值判断识别',
        description: '识别论证中隐含的价值观和意识形态'
      }
    ]
  },

  fallacy_detection: {
    thinkingTypeId: 'fallacy_detection',
    thinkingTypeName: '谬误检测',
    concepts: [
      {
        key: 'ad_hominem',
        name: '人身攻击谬误',
        description: '攻击论证者本人而非论证内容'
      },
      {
        key: 'straw_man',
        name: '稻草人谬误',
        description: '歪曲对方论点，攻击被歪曲的版本'
      },
      {
        key: 'false_dichotomy',
        name: '非黑即白谬误',
        description: '将复杂问题简化为只有两个对立选项'
      },
      {
        key: 'hasty_generalization',
        name: '草率概括',
        description: '基于少量样本做出全面结论'
      },
      {
        key: 'appeal_to_authority',
        name: '诉诸权威',
        description: '仅因为权威人士说了就相信，而不看证据'
      },
      {
        key: 'circular_reasoning',
        name: '循环论证',
        description: '用结论本身来证明结论'
      }
    ]
  },

  iterative_reflection: {
    thinkingTypeId: 'iterative_reflection',
    thinkingTypeName: '迭代反思',
    concepts: [
      {
        key: 'metacognition',
        name: '元认知意识',
        description: '对自己思维过程的意识和监控'
      },
      {
        key: 'thinking_patterns',
        name: '思维模式识别',
        description: '识别自己习惯性的思维方式和盲点'
      },
      {
        key: 'feedback_integration',
        name: '反馈整合',
        description: '将外部反馈整合到思维改进中'
      },
      {
        key: 'iterative_improvement',
        name: '持续迭代改进',
        description: '通过反复练习和反思逐步提升思维质量'
      },
      {
        key: 'error_analysis',
        name: '错误分析',
        description: '分析思维错误的根本原因'
      }
    ]
  },

  connection_transfer: {
    thinkingTypeId: 'connection_transfer',
    thinkingTypeName: '知识迁移',
    concepts: [
      {
        key: 'deep_structure',
        name: '深层结构识别',
        description: '识别不同问题背后的共同结构'
      },
      {
        key: 'analogical_thinking',
        name: '类比思维',
        description: '通过类比将一个领域的知识应用到另一个领域'
      },
      {
        key: 'abstraction',
        name: '抽象能力',
        description: '从具体案例中抽取通用原则'
      },
      {
        key: 'cross_domain_transfer',
        name: '跨领域迁移',
        description: '将思维方法从一个领域迁移到完全不同的领域'
      },
      {
        key: 'pattern_recognition',
        name: '模式识别',
        description: '识别不同情境中的相似模式'
      }
    ]
  }
}

/**
 * 根据思维维度获取概念列表
 */
export function getConceptsByThinkingType(thinkingTypeId: string): ConceptInfo[] {
  return CONCEPT_MAPPING[thinkingTypeId]?.concepts || []
}

/**
 * 根据概念key获取概念信息
 */
export function getConceptInfo(thinkingTypeId: string, conceptKey: string): ConceptInfo | null {
  const concepts = getConceptsByThinkingType(thinkingTypeId)
  return concepts.find(c => c.key === conceptKey) || null
}

/**
 * 获取所有概念的扁平列表
 */
export function getAllConcepts(): ConceptInfo[] {
  return Object.values(CONCEPT_MAPPING).flatMap(t => t.concepts)
}

/**
 * 根据题目tags提取相关概念keys
 * 这是一个简化版本，未来可以使用AI来更智能地提取
 */
export function extractConceptsFromTags(
  thinkingTypeId: string,
  tags: string[]
): string[] {
  const concepts: string[] = []

  // 基于关键词匹配的规则
  const tagText = tags.join(' ').toLowerCase()

  if (thinkingTypeId === 'causal_analysis') {
    if (tagText.includes('因果') || tagText.includes('相关性')) {
      concepts.push('correlation_vs_causation')
    }
    if (tagText.includes('混淆') || tagText.includes('第三变量')) {
      concepts.push('confounding_factors')
    }
    if (tagText.includes('因果链') || tagText.includes('机制')) {
      concepts.push('causal_chain')
    }
    if (tagText.includes('必要') || tagText.includes('充分')) {
      concepts.push('necessity_sufficiency')
    }
    if (tagText.includes('反向') || tagText.includes('双向')) {
      concepts.push('reverse_causality')
    }
  }

  if (thinkingTypeId === 'premise_challenge') {
    if (tagText.includes('隐含') || tagText.includes('假设')) {
      concepts.push('implicit_premises')
    }
    if (tagText.includes('前提') || tagText.includes('合理性')) {
      concepts.push('premise_evaluation')
    }
    if (tagText.includes('框定') || tagText.includes('重新定义')) {
      concepts.push('reframe_problem')
    }
    if (tagText.includes('检验') || tagText.includes('验证')) {
      concepts.push('assumption_testing')
    }
    if (tagText.includes('价值') || tagText.includes('意识形态')) {
      concepts.push('value_judgement')
    }
  }

  if (thinkingTypeId === 'fallacy_detection') {
    if (tagText.includes('人身攻击')) concepts.push('ad_hominem')
    if (tagText.includes('稻草人')) concepts.push('straw_man')
    if (tagText.includes('非黑即白') || tagText.includes('二分')) {
      concepts.push('false_dichotomy')
    }
    if (tagText.includes('草率') || tagText.includes('概括')) {
      concepts.push('hasty_generalization')
    }
    if (tagText.includes('权威')) concepts.push('appeal_to_authority')
    if (tagText.includes('循环')) concepts.push('circular_reasoning')
  }

  if (thinkingTypeId === 'iterative_reflection') {
    if (tagText.includes('元认知') || tagText.includes('反思')) {
      concepts.push('metacognition')
    }
    if (tagText.includes('模式') || tagText.includes('习惯')) {
      concepts.push('thinking_patterns')
    }
    if (tagText.includes('反馈')) concepts.push('feedback_integration')
    if (tagText.includes('迭代') || tagText.includes('改进')) {
      concepts.push('iterative_improvement')
    }
    if (tagText.includes('错误') || tagText.includes('分析')) {
      concepts.push('error_analysis')
    }
  }

  if (thinkingTypeId === 'connection_transfer') {
    if (tagText.includes('结构') || tagText.includes('模式')) {
      concepts.push('deep_structure')
    }
    if (tagText.includes('类比')) concepts.push('analogical_thinking')
    if (tagText.includes('抽象')) concepts.push('abstraction')
    if (tagText.includes('跨领域') || tagText.includes('迁移')) {
      concepts.push('cross_domain_transfer')
    }
    if (tagText.includes('模式识别')) concepts.push('pattern_recognition')
  }

  // 如果没有匹配到任何概念，返回该维度的第一个概念作为默认
  if (concepts.length === 0) {
    const firstConcept = getConceptsByThinkingType(thinkingTypeId)[0]
    if (firstConcept) {
      concepts.push(firstConcept.key)
    }
  }

  return [...new Set(concepts)] // 去重
}
