/**
 * AI提示词系统 - 批量生成批判性思维概念内容
 *
 * 基于五大思维维度，为每个维度生成 Level 1-5 的概念内容
 * 每个概念包含：核心概念、思维模型、实例演示
 */

export interface ConceptGenerationInput {
  thinkingTypeName: string
  thinkingTypeDescription: string
  level: number // 1-5
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number // 同一级别内的顺序
}

/**
 * 系统提示词：批判性思维概念生成专家
 */
export const CONCEPT_GENERATION_SYSTEM_PROMPT = `
你是一位资深的批判性思维教育专家，专门设计高质量的碎片化学习内容。

## 你的使命

为学习者提供系统化、渐进式的批判性思维概念学习内容，帮助他们在5-10分钟内掌握一个核心概念。

## 内容设计原则

1. **碎片化学习**：每个概念控制在5-10分钟阅读时间
2. **渐进式难度**：Level 1-5 难度递增，概念逐步深化
3. **实用主义**：所有概念都应该与实际决策、分析场景紧密相关
4. **结构化呈现**：分为 核心概念、思维模型、实例演示 三部分

## 内容结构要求

### 1. 核心概念 (Concepts)
- **简介（概念简介）**：用1-2句话概括这个概念的核心价值
- **详细内容（JSON结构）**：
  - 定义：清晰的概念定义
  - 重要性：为什么要学这个概念
  - 核心要点：3-5个关键知识点
  - 常见误区：2-3个学习者容易犯的错误

### 2. 思维模型 (Models)
- **简介（模型简介）**：用1-2句话介绍思维模型的应用场景
- **详细内容（JSON结构）**：
  - 模型名称
  - 应用步骤：3-5个具体步骤
  - 决策框架：如何运用这个模型做出更好的决策
  - 实践技巧：2-3个实用建议

### 3. 实例演示 (Demonstrations)
- **简介（演示简介）**：用1-2句话说明实例的目的
- **详细内容（JSON结构）**：
  - 场景描述：真实生活或商业场景
  - 问题分析：如何运用前面学到的概念和模型分析问题
  - 解决方案：具体的思维过程和结论
  - 反思与启示：从这个案例中能学到什么

## Level 难度分级指南

**Level 1 (Beginner - 入门级)**
- 最基础的概念，适合完全没有批判性思维基础的学习者
- 使用日常生活中的简单例子
- 避免专业术语，语言通俗易懂

**Level 2 (Beginner - 进阶入门)**
- 引入一些简单的分析框架
- 开始使用轻度的商业或社会案例
- 可以引入少量专业术语，但需要解释

**Level 3 (Intermediate - 中级)**
- 需要综合运用多个概念
- 案例复杂度提升，包含多变量分析
- 引导学习者主动思考和质疑

**Level 4 (Advanced - 高级)**
- 涉及复杂的系统性思维
- 案例具有较高的抽象性
- 需要跨领域的知识迁移能力

**Level 5 (Advanced - 专家级)**
- 最高难度，挑战学习者的认知边界
- 涉及哲学层面的思考
- 案例具有高度复杂性和不确定性

## 输出格式

你必须严格按照以下 JSON 格式输出，不要添加任何额外的文字说明：

\`\`\`json
{
  "title": "概念标题（简洁有力，6-15字）",
  "subtitle": "副标题（可选，进一步说明，10-25字）",
  "description": "概念描述（100-200字，概括性介绍这个概念的核心价值和应用场景）",
  "learningObjectives": [
    "学习目标1：掌握...",
    "学习目标2：能够...",
    "学习目标3：理解..."
  ],
  "conceptsIntro": "核心概念简介（1-2句话）",
  "conceptsContent": {
    "sections": [
      {
        "type": "heading",
        "content": "小标题"
      },
      {
        "type": "text",
        "content": "正文段落"
      },
      {
        "type": "list",
        "items": ["要点1", "要点2", "要点3"]
      }
    ]
  },
  "modelsIntro": "思维模型简介（1-2句话）",
  "modelsContent": {
    "sections": [
      {
        "type": "heading",
        "content": "模型名称"
      },
      {
        "type": "text",
        "content": "模型说明"
      },
      {
        "type": "list",
        "items": ["步骤1", "步骤2", "步骤3"]
      }
    ]
  },
  "demonstrationsIntro": "实例演示简介（1-2句话）",
  "demonstrationsContent": {
    "sections": [
      {
        "type": "heading",
        "content": "案例标题"
      },
      {
        "type": "text",
        "content": "场景描述"
      },
      {
        "type": "text",
        "content": "分析过程"
      },
      {
        "type": "text",
        "content": "结论与启示"
      }
    ]
  },
  "estimatedTime": 8,
  "tags": ["标签1", "标签2", "标签3"],
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4"]
}
\`\`\`

## 质量标准

1. **准确性**：所有概念定义准确无误，符合学术标准
2. **实用性**：所有案例都来自真实场景，具有实践价值
3. **渐进性**：同一维度的概念应该形成递进关系
4. **完整性**：三个部分（概念、模型、演示）缺一不可
5. **可读性**：语言流畅，逻辑清晰，适合目标学习者

现在，请严格按照上述要求生成内容。
`

/**
 * 生成用户提示词
 */
export function generateConceptPrompt(input: ConceptGenerationInput): string {
  const { thinkingTypeName, thinkingTypeDescription, level, difficulty, order } = input

  return `
请为「${thinkingTypeName}」思维维度生成第 ${order} 个概念内容。

## 思维维度背景

**维度名称**：${thinkingTypeName}

**维度描述**：${thinkingTypeDescription}

## 生成要求

- **Level**: ${level} (共5级)
- **难度**: ${difficulty}
- **顺序**: 这是该维度 Level ${level} 中的第 ${order} 个概念
- **字数**: 总字数控制在 1500-2500 字之间
- **阅读时间**: 5-10 分钟

## 特别要求

1. 请确保这个概念与「${thinkingTypeName}」维度高度相关
2. Level ${level} 的难度应该${getLevelGuidance(level)}
3. 三个部分（核心概念、思维模型、实例演示）都必须完整且高质量
4. 案例必须真实可信，具有教育意义
5. 请只输出 JSON，不要有任何额外的说明文字

现在请生成这个概念的完整内容（仅 JSON 格式）。
`
}

/**
 * 获取Level级别指导
 */
function getLevelGuidance(level: number): string {
  const guidance: Record<number, string> = {
    1: '面向初学者，使用日常生活案例，避免专业术语',
    2: '引入简单框架，使用轻度商业案例，可少量专业术语',
    3: '综合运用多个概念，案例复杂度中等，引导主动思考',
    4: '涉及系统性思维，案例具有抽象性，需要跨领域知识',
    5: '最高难度，涉及哲学思考，案例高度复杂且不确定'
  }
  return guidance[level] || '适度调整难度'
}

/**
 * 五大思维维度的内容规划
 *
 * 每个维度 Level 1-5，每个Level 8-10个概念
 * 总计约 200-250 个概念
 */
export const THINKING_DIMENSIONS_PLAN = {
  // 1. 多维归因与利弊权衡 (Causal Analysis)
  causal_analysis: {
    level1: {
      count: 8,
      themes: ['基础因果关系', '相关性vs因果性', '单因素分析', '简单利弊权衡']
    },
    level2: {
      count: 8,
      themes: ['多因素分析', '混淆变量识别', '权衡决策框架', '成本收益分析']
    },
    level3: {
      count: 9,
      themes: ['系统性归因', '复杂因果链', '二阶效应', '权衡矩阵']
    },
    level4: {
      count: 9,
      themes: ['反事实推理', '因果推断方法', '动态系统分析', '多目标优化']
    },
    level5: {
      count: 10,
      themes: ['复杂系统因果', '非线性动力学', '贝叶斯推断', '战略性权衡']
    }
  },

  // 2. 前提质疑与方法批判 (Premise Challenge)
  premise_challenge: {
    level1: {
      count: 8,
      themes: ['假设识别', '前提质疑入门', '问对问题', '方法批判基础']
    },
    level2: {
      count: 8,
      themes: ['隐含前提挖掘', '框架重构', '批判性提问', '方法论比较']
    },
    level3: {
      count: 9,
      themes: ['深层假设分析', '范式转换', '认知偏差识别', '研究设计批判']
    },
    level4: {
      count: 9,
      themes: ['哲学层面质疑', '知识论基础', '方法论创新', '跨学科批判']
    },
    level5: {
      count: 10,
      themes: ['元认知反思', '认识论挑战', '科学革命', '批判理论']
    }
  },

  // 3. 谬误检测 (Fallacy Detection)
  fallacy_detection: {
    level1: {
      count: 8,
      themes: ['常见逻辑谬误', '论证结构识别', '诉诸情感', '稻草人谬误']
    },
    level2: {
      count: 8,
      themes: ['复杂论证分析', '滑坡谬误', '假两难', '诉诸权威']
    },
    level3: {
      count: 9,
      themes: ['统计谬误', '因果谬误', '选择性证据', '确认偏差']
    },
    level4: {
      count: 9,
      themes: ['微妙谬误识别', '语言陷阱', '框架效应', '概念偷换']
    },
    level5: {
      count: 10,
      themes: ['元谬误', '系统性偏差', '认知扭曲', '修辞策略']
    }
  },

  // 4. 迭代反思 (Iterative Reflection)
  iterative_reflection: {
    level1: {
      count: 8,
      themes: ['基础反思能力', '经验总结', '错误复盘', '成长型思维']
    },
    level2: {
      count: 8,
      themes: ['结构化反思', '反馈循环', '学习日志', '认知迭代']
    },
    level3: {
      count: 9,
      themes: ['元认知监控', '思维模式识别', '刻意练习', '双环学习']
    },
    level4: {
      count: 9,
      themes: ['认知重构', '范式迁移', '创新思维', '自我超越']
    },
    level5: {
      count: 10,
      themes: ['意识流分析', '存在主义反思', '哲学沉思', '智慧涌现']
    }
  },

  // 5. 知识迁移 (Connection Transfer)
  connection_transfer: {
    level1: {
      count: 8,
      themes: ['类比思维入门', '模式识别', '相似性发现', '基础迁移']
    },
    level2: {
      count: 8,
      themes: ['跨领域类比', '结构映射', '知识提取', '原理迁移']
    },
    level3: {
      count: 9,
      themes: ['深层结构识别', '概念融合', '创造性联想', '跨界创新']
    },
    level4: {
      count: 9,
      themes: ['抽象化能力', '系统思维', '跨学科整合', '知识网络']
    },
    level5: {
      count: 10,
      themes: ['通识智慧', '统一理论', '范式综合', '元知识架构']
    }
  }
}
