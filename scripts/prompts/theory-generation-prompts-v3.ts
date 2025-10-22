/**
 * Theory Content V3 - AI Prompt Templates
 *
 * Enhanced prompts for generating high-quality theory content.
 * Based on design document: docs/theory-system-redesign/05-CONTENT-GENERATION-V3.md
 */

/**
 * Level configuration interface
 */
export interface LevelConfig {
  level: number;
  levelTitle: string;
  cognitiveLoad: string;
  learningGoals: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Dimension configuration interface
 */
export interface DimensionConfig {
  id: string;
  name: string;
  description: string;
}

/**
 * Generate Concepts Prompt (核心概念)
 *
 * @param dimension - Thinking dimension configuration
 * @param levelConfig - Level-specific configuration
 * @returns Formatted prompt for AI model
 */
export function CONCEPTS_PROMPT_V3(
  dimension: DimensionConfig,
  levelConfig: LevelConfig
): string {
  const { level, levelTitle, cognitiveLoad, learningGoals } = levelConfig;

  return `你是一位资深的批判性思维教育专家和课程设计大师,擅长将复杂理论转化为结构化、易理解的学习内容。

**🚨 关键要求 - 请务必严格遵守**:
1. **必须返回纯JSON格式** - 不要添加任何解释性文字、前言或后缀
2. **JSON必须完整且格式正确** - 确保所有括号、引号、逗号正确闭合
3. **字符串中的特殊字符必须转义** - 如引号使用 \\" , 换行使用 \\n
4. **返回格式**: 直接输出JSON对象，不要用markdown代码块包裹

## 任务背景

请为以下维度和Level设计核心概念内容:

**思维维度**: ${dimension.name}
**维度描述**: ${dimension.description}
**Level**: ${level} - ${levelTitle}
**认知负荷**: ${cognitiveLoad}
**学习目标**: ${learningGoals.join('; ')}

## 输出格式要求

**🎯 输出示例**:
直接返回以下格式的JSON对象，不要有任何额外文字:
{
  "intro": "本章节引言(200-300字,说明本Level要学什么概念,为什么重要)",

  "concepts": [
    {
      "conceptId": "唯一标识符(英文kebab-case,如: causal-relationship-standards)",
      "name": "概念名称(中文,简洁精准,如: 因果关系的三个判定标准)",

      "coreIdea": "核心理念(一句话精髓,50-80字,如: 判断真正的因果关系需要满足时间先后、逻辑必然、排除混淆三个核心标准)",

      "definition": "精确定义(100-150字,学术准确但通俗易懂)",
      "whyImportant": "为什么重要(80-120字,说明掌握这个概念的价值)",

      "conceptBreakdown": {
        "level1": {
          "title": "第一层子概念标题",
          "definition": "定义(100-150字)",
          "whyImportant": "重要性说明",
          "example": "具体示例",
          "practicalTest": "如何检验是否理解(实用测试方法)"
        },
        "level2": {
          "title": "第二层子概念标题(如适用)",
          "definition": "定义",
          "whyImportant": "重要性",
          "example": "示例",
          "practicalTest": "检验方法"
        },
        "level3": {
          "title": "第三层子概念标题(如适用)",
          "definition": "定义",
          "whyImportant": "重要性",
          "example": "示例",
          "practicalTest": "检验方法"
        }
      },

      "criticalThinkingFramework": {
        "step1": "第一步检验方法(如: 时间检查 - 原因是否先于结果?)",
        "step2": "第二步检验方法(如: 变化检查 - 原因改变时结果是否改变?)",
        "step3": "第三步检验方法(如: 混淆检查 - 是否有第三方变量?)",
        "step4": "第四步检验方法(可选,如: 机制检查 - 能否解释为什么?)"
      },

      "keyPoints": [
        "核心要点1(30-50字)",
        "核心要点2(30-50字)",
        "核心要点3(30-50字)",
        "核心要点4(可选)",
        "核心要点5(可选)"
      ],

      "commonMisconceptions": [
        {
          "misconception": "常见误区描述(如: 相关性等于因果性)",
          "truth": "正确理解(如: 相关性只是因果的必要条件,不是充分条件)",
          "realExample": "真实案例对比(如: 鞋码大小与阅读能力正相关(儿童数据),但鞋码不是阅读能力的原因)"
        },
        {
          "misconception": "误区2",
          "truth": "正确理解2",
          "realExample": "案例2"
        }
      ],

      "realWorldExamples": [
        {
          "scenario": "场景描述(100-150字,真实贴近生活)",
          "application": "如何应用该概念",
          "outcome": "应用结果/洞察"
        },
        {
          "scenario": "场景2",
          "application": "应用2",
          "outcome": "结果2"
        }
      ],

      "visualizationGuide": {
        "type": "decision-tree | flowchart | comparison-matrix | concept-map",
        "description": "可视化图示说明(描述如何绘制这个图)",
        "structure": {
          "root": "根节点/起点",
          "branch1": "分支1描述",
          "branch2": "分支2描述",
          "branch3": "分支3(如适用)",
          "legend": "图例说明"
        }
      }
    }
  ]
}

## 质量要求 (必须严格遵守!)

### 结构完整性
- ✅ 必须包含${getLevelConceptCount(level)}个概念
- ✅ 每个概念必须有conceptBreakdown(至少level1${level >= 3 ? ',推荐level1+level2' : ''})
- ✅ 每个概念必须有criticalThinkingFramework(至少3步)
- ✅ 每个概念必须有visualizationGuide

### 内容质量
- ✅ coreIdea必须是一句话精髓,能快速抓住核心
- ✅ conceptBreakdown要层层递进,逻辑清晰
- ✅ commonMisconceptions必须是真实常见的错误,不能编造
- ✅ realWorldExamples必须贴近用户经验,不能过于学术化

### 字数要求
- ✅ intro: 200-300字
- ✅ coreIdea: 50-80字
- ✅ definition: 100-150字
- ✅ whyImportant: 80-120字
- ✅ conceptBreakdown每层definition: 100-150字

${getLevelDifficultyGuidance(level)}

## 🚨 最后提醒 - JSON格式要求

1. **直接输出JSON对象** - 第一个字符就是 { , 最后一个字符是 }
2. **不要使用markdown代码块** - 不要有 \`\`\`json 这样的包裹
3. **确保JSON完整** - 所有对象和数组必须正确闭合
4. **特殊字符转义** - 字符串中的引号、换行符等必须正确转义
5. **验证后再返回** - 在心里检查JSON格式是否完整正确

**正确示例**: { "intro": "...", "concepts": [...] }
**错误示例**: \`\`\`json\\n{ "intro": "...", "concepts": [...] }\\n\`\`\`

现在,请直接输出符合上述要求的JSON对象:`;
}

/**
 * Generate Single Model Prompt (生成单个思维模型)
 *
 * @param dimension - Thinking dimension configuration
 * @param levelConfig - Level-specific configuration
 * @param modelIndex - Which model to generate (1-based: 1, 2, 3)
 * @param existingModels - Already generated models to avoid duplication
 * @returns Formatted prompt for AI model
 */
export function SINGLE_MODEL_PROMPT_V3(
  dimension: DimensionConfig,
  levelConfig: LevelConfig,
  modelIndex: number,
  existingModels: string[] = []
): string {
  const { level, levelTitle, cognitiveLoad } = levelConfig;

  return `你是一位批判性思维方法论专家和教学设计大师,擅长设计实用的思维工具和分析框架。

**🚨 关键要求 - 请务必严格遵守**:
1. **只生成1个思维模型** - 这是第${modelIndex}个模型,返回单个模型对象(不是数组)
2. **必须返回纯JSON格式** - 不要添加任何解释性文字、前言或后缀
3. **JSON必须完整且格式正确** - 确保所有括号、引号、逗号正确闭合
4. **字符串中的特殊字符必须转义** - 如引号使用 \\" , 换行使用 \\n
5. **返回格式**: 直接输出JSON对象，不要用markdown代码块包裹
6. **思维模型步骤描述必须≥300字** - 这是最重要的质量要求!
${existingModels.length > 0 ? `7. **避免重复** - 已生成的模型: ${existingModels.join(', ')}, 请设计不同的模型` : ''}

## 任务背景

你正在为以下维度和Level设计第${modelIndex}个思维模型:

**思维维度**: ${dimension.name}
**维度描述**: ${dimension.description}
**Level**: ${level} - ${levelTitle}
**认知负荷**: ${cognitiveLoad}

## 输出格式要求

**🎯 输出示例**:
直接返回单个模型对象，不要有任何额外文字:
{
  "modelId": "唯一标识符(英文kebab-case,如: five-whys-analysis)",
  "name": "模型名称(中文,简洁好记,如: 5-Why分析法)",
  "purpose": "模型用途(50-80字,一句话说明用来做什么)",
  "description": "模型说明(200-300字,详细介绍模型的背景、原理、价值)",

  "coreLogic": {
    "principle": "底层原理(为什么这个框架有效,理论基础是什么,150-200字)",
    "whenWorks": "什么情况下有效(适用场景,80-120字)",
    "whenFails": "什么情况下失效(不适用场景,局限性,80-120字)"
  },

  "structure": {
    "type": "linear | matrix | network | hierarchy",
    "components": ["组件1", "组件2", "组件3"],
    "relationships": "组件之间的关系说明(如: 顺序执行、矩阵交叉、网络关联)"
  },

  "steps": [
    {
      "stepNumber": 1,
      "title": "步骤标题(动词开头,如: 精确定义问题范围)",
      "description": "详细操作说明(300-500字!)\\n\\n必须包含:\\n- 具体做什么(What)\\n- 如何做(How)\\n- 为什么这样做(Why)\\n- 预期输出是什么(Output)",
      "keyThinkingPoints": ["思考要点1", "思考要点2", "思考要点3"],
      "commonPitfalls": [{"mistake": "常见错误", "example": "错误示例", "correction": "如何纠正"}],
      "practicalExample": "实际案例说明",
      "tips": "实用技巧",
      "nextStepRationale": "为什么下一步很重要"
    }
  ],

  "visualization": {
    "type": "flowchart | diagram | table | mindmap",
    "description": "可视化描述(如何画这个图,包含哪些元素)",
    "legend": "图例说明(符号含义,颜色编码等)",
    "stepByStepDrawing": ["绘图步骤1", "绘图步骤2", "绘图步骤3"]
  },

  "whenToUse": "适用场景(80-120字,什么情况下应该用这个模型)",
  "limitations": "局限性(50-80字,什么情况下不适用或效果不佳)",

  "fullApplicationExample": {
    "scenario": "完整背景描述(200-300字,设定一个真实复杂的场景)",
    "stepByStepApplication": [
      {
        "step": 1,
        "action": "步骤1的具体操作",
        "thinking": "思考过程(为什么这样做,考虑了哪些因素)",
        "output": "该步骤的输出结果(具体内容或数据)"
      }
    ],
    "outcome": "最终结果(100-150字,应用模型后解决了什么问题,得到了什么洞察)"
  }
}

## 质量要求 (必须严格遵守!)

### 步骤详细度 (核心要求!)
- ✅ **每个步骤description必须≥300字** - 这是最重要的质量要求!
- ✅ 每个步骤必须包含3-5个keyThinkingPoints
- ✅ 每个步骤必须包含2-3个commonPitfalls
- ✅ 每个步骤必须有practicalExample和tips
- ✅ 每个步骤(除最后一步)必须有nextStepRationale

### 模型完整性
- ✅ 必须有coreLogic说明(principle + whenWorks + whenFails)
- ✅ 必须有完整的visualization(包含stepByStepDrawing)
- ✅ 必须有fullApplicationExample(覆盖所有步骤)

${getLevelModelComplexityGuidance(level)}

## 🚨 最后提醒 - JSON格式要求

1. **直接输出单个模型JSON对象** - 第一个字符就是 { , 最后一个字符是 }
2. **不要使用markdown代码块** - 不要有 \`\`\`json 这样的包裹
3. **确保JSON完整** - 所有对象和数组必须正确闭合
4. **特殊字符转义** - 字符串中的引号、换行符等必须正确转义
5. **步骤描述≥300字** - 这是质量底线,必须达到!

**正确示例**: { "modelId": "...", "name": "...", "steps": [...] }
**错误示例**: \`\`\`json\\n{ "modelId": "...", "name": "..." }\\n\`\`\`

现在,请直接输出符合上述要求的单个模型JSON对象:`;
}

/**
 * Generate Demonstrations Prompt (实例演示)
 *
 * @param dimension - Thinking dimension configuration
 * @param levelConfig - Level-specific configuration
 * @param conceptsList - List of concepts from generated concepts content
 * @param modelsList - List of models from generated models content
 * @returns Formatted prompt for AI model
 */
export function DEMONSTRATIONS_PROMPT_V3(
  dimension: DimensionConfig,
  levelConfig: LevelConfig,
  conceptsList: string[],
  modelsList: string[]
): string {
  const { level, levelTitle } = levelConfig;

  return `你是一位批判性思维案例分析专家和教学设计大师,擅长通过详细案例展示理论应用。

**🚨 关键要求 - 请务必严格遵守**:
1. **必须生成2个实例演示** - demonstrations数组中必须包含2个完整的演示案例
2. **必须返回纯JSON格式** - 不要添加任何解释性文字、前言或后缀
3. **JSON必须完整且格式正确** - 确保所有括号、引号、逗号正确闭合
4. **字符串中的特殊字符必须转义** - 如引号使用 \\" , 换行使用\\n
5. **返回格式**: 直接输出JSON对象，不要用markdown代码块包裹
6. **每步必须标注conceptApplied** - 这是核心要求!

## 任务背景

请为以下维度和Level设计实例演示内容:

**思维维度**: ${dimension.name}
**Level**: ${level} - ${levelTitle}

**已有理论内容**(请在案例中引用):
- 核心概念: ${conceptsList.join(', ')}
- 思维模型: ${modelsList.join(', ')}

## 输出格式要求

**🎯 输出示例**:
直接返回以下格式的JSON对象，不要有任何额外文字:
{
  "intro": "本章节引言(100-150字,说明案例的学习价值,能学到什么)",

  "demonstrations": [
    {
      "demoId": "唯一标识符(如: ecommerce-retention-analysis)",
      "title": "案例标题(简洁吸引人,如: 电商平台用户流失的多因素归因分析)",
      "category": "场景类别(如: 商业分析 | 生活决策 | 学术研究 | 公共政策)",

      "learningObjective": "本案例学习目标(80-120字,如: 本案例演示如何综合运用'因果三标准'和'鱼骨图分析法'进行系统性问题诊断)",

      "theoreticalFoundation": {
        "conceptsUsed": [
          "因果关系判定三标准 (核心概念1.1)",
          "主要原因vs次要原因 (核心概念2.2)"
        ],
        "modelsUsed": [
          "鱼骨图分析法 (思维模型2.1)"
        ]
      },

      "scenario": {
        "background": "详细背景描述(300-400字)\\n\\n必须包含:\\n- 主体介绍(谁/什么组织)\\n- 时间背景\\n- 问题情境\\n- 关键利益相关者",

        "keyData": [
          "关键数据点1(如: 整体用户留存率: 70% → 45%, 下降25个百分点)",
          "关键数据点2(如: 新用户7日留存: 65% → 30%, 下降35个百分点)",
          "关键数据点3(如: 老用户留存: 85% → 82%, 基本稳定)"
        ],

        "problemStatement": "核心问题(50-80字,如: 如何识别导致用户流失的根本原因,并区分主要原因和次要原因?)"
      },

      "stepByStepAnalysis": [
        {
          "stepNumber": 1,
          "action": "应用XX理论/模型 - 具体操作",

          "conceptApplied": "使用了哪个概念(必须明确标注,如: 精确问题定义 (思维模型2.1步骤1))",
          "modelApplied": "使用了哪个模型(可选,如: 鱼骨图分析法 (思维模型2.1))",

          "thinkingProcess": "完整思维过程(200-300字!)\\n\\n必须包含:\\n- 为什么选择这个理论/模型?\\n- 具体如何应用?\\n- 遇到了什么挑战?\\n- 如何克服?\\n- 得出了什么中间结论?",

          "criticalThinkingPoint": "🎯 关键思考点(80-120字,如: 为什么聚焦新用户? 因为数据显示老用户留存基本稳定,新用户下降幅度更大,符合'抓主要矛盾'原则)",

          "toolOutput": "该步骤的输出结果(可以是字符串、对象或数组)",

          "nextStepRationale": "为什么要进行下一步(如: 问题定义清晰后,下一步需要系统性识别所有可能的影响因素)"
        }
      ],

      "keyInsights": [
        {
          "insight": "洞察点标题(50-80字)",
          "explanation": "详细解释(100-150字)",
          "generalPrinciple": "可迁移的通用原则(如: 当整体指标恶化时,通过分层分析能避免误判)",
          "applicableScenarios": "适用场景(如: 适用于所有聚合指标的分析: 销售下滑、转化率降低等)"
        }
      ],

      "commonMistakesInThisCase": [
        {
          "mistake": "错误描述(如: 只看整体数据,未分层分析)",
          "consequence": "后果(如: 误认为产品整体变差,浪费资源)",
          "correction": "正确做法(如: 始终按关键维度分层查看数据)"
        }
      ],

      "transferableSkills": [
        "可迁移技能1(如: 分层分析技巧可应用于任何聚合指标的诊断)",
        "可迁移技能2(如: 变量控制思维可用于验证任何因果假设)",
        "可迁移技能3"
      ],

      "practiceGuidance": "练习引导(50-80字,如: 完成本案例学习后,建议访问练习系统,尝试分析类似问题)"
    }
  ]
}

## 质量要求 (必须严格遵守!)

### 理论关联 (核心要求!)
- ✅ **每个分析步骤必须标注conceptApplied** - 使用了哪个概念
- ✅ 至少50%的步骤要标注modelApplied - 使用了哪个模型
- ✅ theoreticalFoundation必须列出所有使用的概念和模型

### 分析深度
- ✅ **每个步骤thinkingProcess必须≥200字**
- ✅ 每个步骤必须有criticalThinkingPoint(80-120字)
- ✅ 每个步骤必须有nextStepRationale

### 可迁移性
- ✅ 必须提炼3-5个keyInsights(每个包含generalPrinciple)
- ✅ 必须列出2-4个commonMistakesInThisCase
- ✅ 必须列出3-5个transferableSkills

${getLevelDemoComplexityGuidance(level)}

## 🚨 最后提醒 - JSON格式要求

1. **直接输出JSON对象** - 第一个字符就是 { , 最后一个字符是 }
2. **不要使用markdown代码块** - 不要有 \`\`\`json 这样的包裹
3. **确保JSON完整** - 所有对象和数组必须正确闭合
4. **特殊字符转义** - 字符串中的引号、换行符等必须正确转义
5. **每步标注conceptApplied** - 这是核心要求,不能遗漏!

**正确示例**: { "intro": "...", "demonstrations": [{...}] }
**错误示例**: \`\`\`json\\n{ "intro": "...", "demonstrations": [{...}] }\\n\`\`\`

现在,请直接输出符合上述要求的JSON对象:`;
}

/**
 * Helper: Get concept count based on level
 */
function getLevelConceptCount(level: number): string {
  if (level === 1) return '1-2';
  if (level >= 2 && level <= 3) return '2-3';
  return '2-3';
}

/**
 * Helper: Get level-specific difficulty guidance for concepts
 */
function getLevelDifficultyGuidance(level: number): string {
  if (level === 1) {
    return `### Level 1 难度要求 (基础识别)
- 1-2个基础概念
- 概念简单直接,定义清晰
- 例子来自日常生活
- conceptBreakdown只需level1`;
  }

  if (level >= 2 && level <= 3) {
    return `### Level ${level} 难度要求 (中级应用)
- 2-3个概念
- 引入关系和应用
- 例子涉及工作学习场景
- conceptBreakdown需要level1+level2`;
  }

  return `### Level ${level} 难度要求 (高级综合)
- 2-3个高级概念
- 强调系统性和复杂性
- 例子涉及复杂真实场景
- conceptBreakdown需要level1+level2+level3`;
}

/**
 * Helper: Get model complexity guidance based on level
 */
function getLevelModelComplexityGuidance(level: number): string {
  if (level === 1) {
    return `### Level难度递增
- Level 1: 1个简单线性模型(3-4步)`;
  }

  if (level >= 2 && level <= 3) {
    return `### Level难度递增
- Level ${level}: 1-2个结构化模型(5-6步)`;
  }

  return `### Level难度递增
- Level ${level}: 1-2个复杂系统模型(6-8步)`;
}

/**
 * Helper: Get demonstration complexity guidance based on level
 */
function getLevelDemoComplexityGuidance(level: number): string {
  if (level === 1) {
    return `### Level难度递增
- Level 1: 1-2个简单案例,3-5个分析步骤`;
  }

  if (level >= 2 && level <= 3) {
    return `### Level难度递增
- Level ${level}: 2个中等案例,5-7个分析步骤`;
  }

  return `### Level难度递增
- Level ${level}: 1-2个复杂案例,7-10个分析步骤`;
}
