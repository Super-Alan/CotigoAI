/**
 * Level-based Question Generation Prompts
 * 基于5个Level的题目生成提示词库
 *
 * 每个Level对应不同的认知层次和难度要求：
 * Level 1: 识别与理解 - 掌握基本概念和识别方法
 * Level 2: 初步应用 - 能够进行基础分析和简单应用
 * Level 3: 深入分析 - 能够进行深入分析和复杂推理
 * Level 4: 综合运用 - 能够综合运用多种思维工具
 * Level 5: 创新应用 - 能够创新性地应用和拓展思维方法
 */

export interface LevelBasedPromptConfig {
  level: number
  thinkingType: string
  cognitiveDepth: string
  questionStyle: string
  scaffolding: string
  caseStudyComplexity: string
  guidedQuestionCount: string
  assessmentCriteria: string[]
}

// Level 1: 基础入门 - 识别与理解
const LEVEL_1_CONFIG: Omit<LevelBasedPromptConfig, 'thinkingType'> = {
  level: 1,
  cognitiveDepth: '识别和理解基本概念，能够在简单、清晰的情境中应用',
  questionStyle: '封闭式问题，有明确的判断标准，情境简单直接',
  scaffolding: '提供详细的思维脚手架、示例和提示',
  caseStudyComplexity: '简单、单一变量的案例，有明确的对错答案',
  guidedQuestionCount: '5-7个引导问题',
  assessmentCriteria: [
    '能否正确识别核心概念',
    '能否理解基本原理',
    '能否在简单情境中应用'
  ]
}

// Level 2: 初步应用 - 简单分析
const LEVEL_2_CONFIG: Omit<LevelBasedPromptConfig, 'thinkingType'> = {
  level: 2,
  cognitiveDepth: '进行基础分析，理解概念之间的关系，能够在常见场景中应用',
  questionStyle: '半开放式问题，需要分析和解释，但有相对明确的框架',
  scaffolding: '提供分析框架和关键提示，但减少直接示例',
  caseStudyComplexity: '涉及2-3个变量的中等复杂案例，需要基础推理',
  guidedQuestionCount: '4-6个引导问题',
  assessmentCriteria: [
    '能否进行基础因果分析',
    '能否识别关键变量',
    '能否提供有逻辑的解释',
    '能否应用基本分析框架'
  ]
}

// Level 3: 深入分析 - 复杂推理
const LEVEL_3_CONFIG: Omit<LevelBasedPromptConfig, 'thinkingType'> = {
  level: 3,
  cognitiveDepth: '深度分析复杂问题，理解多层次因果关系，能够进行批判性评估',
  questionStyle: '开放式问题，需要深入分析和多角度思考',
  scaffolding: '提供高层次的分析方向，学习者需自主构建论证',
  caseStudyComplexity: '多变量、有争议性的复杂案例，没有标准答案',
  guidedQuestionCount: '3-5个引导问题',
  assessmentCriteria: [
    '能否识别多重因果关系',
    '能否进行批判性分析',
    '能否考虑多个视角',
    '能否构建连贯的论证',
    '能否识别隐含假设'
  ]
}

// Level 4: 综合运用 - 跨域整合
const LEVEL_4_CONFIG: Omit<LevelBasedPromptConfig, 'thinkingType'> = {
  level: 4,
  cognitiveDepth: '综合运用多种思维工具，跨领域整合知识，能够处理高度复杂和模糊的问题',
  questionStyle: '复杂开放式问题，需要整合多种方法和视角',
  scaffolding: '最小化脚手架，主要提供战略性思考方向',
  caseStudyComplexity: '真实世界的复杂问题，涉及多个领域和利益相关方',
  guidedQuestionCount: '2-4个引导问题',
  assessmentCriteria: [
    '能否综合运用多种分析方法',
    '能否跨领域整合知识',
    '能否处理不确定性和模糊性',
    '能否平衡多个相互冲突的因素',
    '能否提出创新性见解'
  ]
}

// Level 5: 专家创新 - 创新应用
const LEVEL_5_CONFIG: Omit<LevelBasedPromptConfig, 'thinkingType'> = {
  level: 5,
  cognitiveDepth: '创新性应用思维方法，能够拓展和重构理论框架，解决前沿和开放性问题',
  questionStyle: '完全开放式、探索性问题，可能没有已知答案',
  scaffolding: '无脚手架，仅提供问题背景和探索方向',
  caseStudyComplexity: '前沿问题、理论难题或需要创新解决方案的真实挑战',
  guidedQuestionCount: '0-2个开放性引导问题',
  assessmentCriteria: [
    '能否提出原创性见解',
    '能否拓展现有理论框架',
    '能否设计创新性解决方案',
    '能否进行元认知反思',
    '能否对领域做出贡献'
  ]
}

interface GenerateLevelBasedPromptOptions {
  thinkingTypeId: string
  level: number
  count?: number
  topics?: string[]
  customPrompt?: string
  includeScaffolding?: boolean
  includeCaseStudy?: boolean
}

/**
 * 为特定思维维度和Level生成题目的系统提示词
 */
export function generateLevelBasedPrompt(
  optionsOrThinkingType: GenerateLevelBasedPromptOptions | string,
  levelParam?: number
): string {
  // Support both old signature (thinkingType, level) and new signature (options object)
  let thinkingType: string
  let level: number
  let count: number = 1
  let topics: string[] = []
  let customPrompt: string = ''
  let includeScaffolding: boolean = false
  let includeCaseStudy: boolean = true

  if (typeof optionsOrThinkingType === 'string') {
    // Old signature: generateLevelBasedPrompt(thinkingType, level)
    thinkingType = optionsOrThinkingType
    level = levelParam!
  } else {
    // New signature: generateLevelBasedPrompt(options)
    thinkingType = optionsOrThinkingType.thinkingTypeId
    level = optionsOrThinkingType.level
    count = optionsOrThinkingType.count ?? 1
    topics = optionsOrThinkingType.topics ?? []
    customPrompt = optionsOrThinkingType.customPrompt ?? ''
    includeScaffolding = optionsOrThinkingType.includeScaffolding ?? (level <= 2)
    includeCaseStudy = optionsOrThinkingType.includeCaseStudy ?? true
  }

  const levelConfig = getLevelConfig(level)
  const typeConfig = getThinkingTypeConfig(thinkingType)

  return `你是一位资深的批判性思维教育专家，专门设计Level ${level}（${getLevelName(level)}）的【${typeConfig.name}】练习题。

## 认知层次要求
${levelConfig.cognitiveDepth}

## 题目设计规范

### 1. 问题特征
${levelConfig.questionStyle}

### 2. 脚手架支持
${includeScaffolding ? levelConfig.scaffolding : '不提供脚手架，鼓励学习者自主构建思维框架'}

### 3. 案例复杂度
${levelConfig.caseStudyComplexity}

### 4. 引导问题数量
生成${levelConfig.guidedQuestionCount}

### 5. 评估标准
${levelConfig.assessmentCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 思维维度专业要求
${typeConfig.levelRequirements[level]}

${topics.length > 0 ? `## 主题方向\n请围绕以下主题设计题目：${topics.join('、')}\n` : ''}
${customPrompt ? `## 特殊要求\n${customPrompt}\n` : ''}

## 输出格式
请生成${count > 1 ? `${count}道` : '一道'}符合以上要求的练习题，每道题包含以下部分：

1. **题目标题** (topic): 简洁的题目标题
2. **题目内容** (question): ${typeConfig.questionGuidance[level]}
3. **背景信息** (context): 提供必要的背景信息，${levelConfig.caseStudyComplexity}
4. **引导问题** (guidingQuestions): ${levelConfig.guidedQuestionCount}，每个问题包含：
   - question: 引导问题内容
   - purpose: 这个问题的设计目的
   - stage: 思维阶段 (understanding/analysis/evaluation/synthesis)
   - orderIndex: 顺序索引
5. **学习目标** (learningObjectives): 明确的学习目标数组
6. **评估标准** (assessmentCriteria): 基于上述评估标准的JSON数组
${includeScaffolding ? '7. **思维脚手架** (scaffolding): 提供具体的思维框架、提示或工具（JSON对象）' : ''}
${includeCaseStudy ? `${includeScaffolding ? '8' : '7'}. **案例分析** (caseAnalysis): 专业的案例分析（JSON对象，包含：核心要点、分析框架、多维度思考、反思与启示）` : ''}

## 质量要求
- 确保题目贴近真实场景，有实际应用价值
- 问题表述清晰、专业，符合Level ${level}的认知要求
- 引导问题应循序渐进，帮助学习者构建思维路径
- 避免过于学术化或脱离实际的理论问题
- 确保评估标准可操作、可测量

请以JSON格式输出，格式为：
\`\`\`json
{
  "questions": [
    {
      "topic": "题目标题",
      "question": "题目内容",
      "context": "背景信息",
      "guidingQuestions": [...],
      "learningObjectives": [...],
      "assessmentCriteria": [...]${includeScaffolding ? ',\n      "scaffolding": {...}' : ''}${includeCaseStudy ? ',\n      "caseAnalysis": {...}' : ''}
    }
  ]
}
\`\`\`
确保JSON格式正确，可以被解析。`
}

/**
 * 为特定思维维度和Level生成案例分析的提示词
 */
export function generateCaseAnalysisPrompt(thinkingType: string, level: number, questionContent: string): string {
  const levelConfig = getLevelConfig(level)
  const typeConfig = getThinkingTypeConfig(thinkingType)

  return `你是一位资深的批判性思维教育专家，为Level ${level}（${getLevelName(level)}）的【${typeConfig.name}】练习题生成专业的案例分析。

## 题目内容
${questionContent}

## Level ${level} 案例分析要求
${typeConfig.caseAnalysisRequirements[level]}

## 案例复杂度
${levelConfig.caseStudyComplexity}

## 输出结构
请生成包含以下部分的案例分析：

1. **核心要点** (keyPoints): 3-5个核心要点，每个要点简洁清晰
2. **分析框架** (framework): 适用于此题的分析框架或方法论
3. **多维度思考** (perspectives): 从多个角度分析问题
   - 每个角度包含标题和详细分析
   - Level ${level}应包含${level <= 2 ? '2-3' : level <= 4 ? '3-4' : '4-5'}个不同角度
4. **反思与启示** (reflections): 引导学习者深度思考的反思问题和启示

## 质量标准
- 案例分析应与题目紧密相关
- 分析深度应匹配Level ${level}的认知要求
- 提供具体的思维示范，而非直接给出答案
- 启发性强，帮助学习者建立思维模型

请以JSON格式输出案例分析结果。`
}

/**
 * 获取Level配置
 */
function getLevelConfig(level: number): Omit<LevelBasedPromptConfig, 'thinkingType'> {
  const configs = [LEVEL_1_CONFIG, LEVEL_2_CONFIG, LEVEL_3_CONFIG, LEVEL_4_CONFIG, LEVEL_5_CONFIG]
  return configs[level - 1] || LEVEL_1_CONFIG
}

/**
 * 获取Level名称
 */
function getLevelName(level: number): string {
  const names = ['基础入门', '初步应用', '深入分析', '综合运用', '专家创新']
  return names[level - 1] || '基础入门'
}

/**
 * 思维维度配置
 */
interface ThinkingTypeConfig {
  id: string
  name: string
  levelRequirements: Record<number, string>
  questionGuidance: Record<number, string>
  caseAnalysisRequirements: Record<number, string>
}

const THINKING_TYPE_CONFIGS: Record<string, ThinkingTypeConfig> = {
  causal_analysis: {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    levelRequirements: {
      1: '能够区分相关性与因果性，识别简单的因果关系',
      2: '理解控制变量的重要性，识别混淆因素，进行基础的因果分析',
      3: '分析多个因素如何共同影响结果，理解因果链和反馈回路',
      4: '构建复杂的因果关系网络，理解系统性思维，整合多领域知识',
      5: '创新性地应用因果分析解决前沿问题，提出原创性的因果模型'
    },
    questionGuidance: {
      1: '一个明确的因果判断问题，情境简单，有清晰的对错标准',
      2: '需要控制变量分析的情境，要求识别混淆因素',
      3: '涉及多重因果关系的复杂问题，需要构建因果链',
      4: '需要跨领域整合的系统性问题，涉及多个相互作用的因素',
      5: '开放性的复杂问题，需要创新性的因果分析框架'
    },
    caseAnalysisRequirements: {
      1: '提供清晰的因果vs相关性对比示例，展示经典案例（如冰淇淋与溺水）',
      2: '展示如何识别和控制变量，分析混淆因素的影响',
      3: '构建多因素因果分析框架，展示如何绘制因果链',
      4: '展示系统思维工具的应用，分析复杂因果网络',
      5: '展示创新性的因果建模方法，讨论前沿应用场景'
    }
  },
  premise_challenge: {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    levelRequirements: {
      1: '能够识别论证中的明显前提，理解前提的概念',
      2: '能够质疑论证的显性和隐性前提，评估前提的合理性',
      3: '能够深入分析前提的假设基础，识别方法论局限',
      4: '能够系统性地批判分析框架和方法论，提出替代方案',
      5: '能够重构分析框架，创新性地质疑和改进方法论'
    },
    questionGuidance: {
      1: '一个包含明显前提的简单论证，要求识别前提',
      2: '一个论证或研究设计，要求质疑其前提的合理性',
      3: '一个复杂论证，要求深入分析其假设基础和方法论局限',
      4: '一个理论框架或研究范式，要求系统性批判分析',
      5: '一个前沿问题，要求创新性地重构分析框架'
    },
    caseAnalysisRequirements: {
      1: '清晰展示如何识别论证中的前提，提供具体示例',
      2: '展示如何系统性地质疑前提，提供质疑框架',
      3: '分析前提背后的深层假设，展示方法论批判的路径',
      4: '展示如何批判性评估整个分析框架，提出替代视角',
      5: '展示创新性的框架重构方法，讨论理论创新路径'
    }
  },
  fallacy_detection: {
    id: 'fallacy_detection',
    name: '谬误检测',
    levelRequirements: {
      1: '能够识别常见的逻辑谬误（如稻草人、诉诸权威）',
      2: '能够分析谬误产生的原因，理解不同谬误之间的关系',
      3: '能够在复杂论证中识别隐蔽的谬误，分析其危害',
      4: '能够系统性地检测多重叠加的谬误，评估论证质量',
      5: '能够创新性地识别新型谬误模式，提出谬误分类框架'
    },
    questionGuidance: {
      1: '一个包含明显谬误的简单论证，要求识别谬误类型',
      2: '多个论证，要求分析谬误产生的原因和影响',
      3: '一个复杂的论证或文本，要求识别其中的隐蔽谬误',
      4: '一个真实的辩论或论文，要求系统性地检测并评估谬误',
      5: '一个新兴的论证模式或现象，要求识别新型谬误'
    },
    caseAnalysisRequirements: {
      1: '清晰解释常见谬误类型，提供容易理解的示例',
      2: '分析谬误的深层原因，展示如何避免谬误',
      3: '展示如何在复杂文本中识别隐蔽谬误的方法',
      4: '提供系统性的谬误检测框架和工具',
      5: '讨论新型谬误模式，展示谬误理论的前沿发展'
    }
  },
  iterative_reflection: {
    id: 'iterative_reflection',
    name: '迭代反思',
    levelRequirements: {
      1: '能够进行基础的反思，识别自己思考过程中的问题',
      2: '能够系统性地反思思维过程，识别思维模式和偏差',
      3: '能够进行深度的元认知反思，改进思维策略',
      4: '能够在复杂情境中持续迭代优化思维过程',
      5: '能够创新性地发展元认知策略，建立个人思维框架'
    },
    questionGuidance: {
      1: '一个简单的问题解决场景，要求反思思考过程',
      2: '一个需要多步骤思考的问题，要求识别思维模式',
      3: '一个复杂的决策场景，要求进行元认知分析',
      4: '一个需要多轮迭代的开放性问题，要求持续优化思维',
      5: '一个创新性问题，要求发展新的元认知策略'
    },
    caseAnalysisRequirements: {
      1: '展示基础的反思方法，提供反思问题清单',
      2: '分析常见的思维模式和偏差，提供识别方法',
      3: '展示深度元认知分析的框架和工具',
      4: '提供迭代优化思维的系统方法',
      5: '讨论创新性的元认知策略，展示个人框架发展路径'
    }
  },
  connection_transfer: {
    id: 'connection_transfer',
    name: '知识迁移',
    levelRequirements: {
      1: '能够识别不同领域之间的表面相似性',
      2: '能够进行基础的类比推理，迁移简单的方法和概念',
      3: '能够识别深层结构相似性，进行跨领域的知识迁移',
      4: '能够系统性地整合多领域知识，解决复杂问题',
      5: '能够创新性地建立新的跨领域连接，拓展知识边界'
    },
    questionGuidance: {
      1: '两个有明显相似性的情境，要求识别共同点',
      2: '一个问题和一个已知解决方案，要求进行类比迁移',
      3: '两个表面不同但结构相似的领域，要求深层迁移',
      4: '一个需要整合多领域知识的复杂问题',
      5: '一个开放性问题，要求创新性地建立跨领域连接'
    },
    caseAnalysisRequirements: {
      1: '展示清晰的类比示例，说明表面相似性',
      2: '分析如何进行有效的类比推理和方法迁移',
      3: '展示深层结构分析方法，提供迁移框架',
      4: '提供跨领域知识整合的系统方法',
      5: '讨论创新性的知识连接，展示理论拓展路径'
    }
  }
}

/**
 * 获取思维维度配置
 */
function getThinkingTypeConfig(thinkingType: string): ThinkingTypeConfig {
  return THINKING_TYPE_CONFIGS[thinkingType] || THINKING_TYPE_CONFIGS.causal_analysis
}

/**
 * 导出配置供外部使用
 */
export const LEVEL_CONFIGS = {
  1: LEVEL_1_CONFIG,
  2: LEVEL_2_CONFIG,
  3: LEVEL_3_CONFIG,
  4: LEVEL_4_CONFIG,
  5: LEVEL_5_CONFIG
}

export { THINKING_TYPE_CONFIGS }
