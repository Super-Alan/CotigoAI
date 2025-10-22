# 批判性思维理论体系 - AI内容生成方案 V3 (质量增强版)

## 核心改进点

### 相比V2版本的提升

1. **思维模型**: 步骤描述从简洁变为详细(300-500字/步),包含关键思考点和常见陷阱
2. **核心概念**: 从文本段落变为多层级结构化内容,配备批判性思维框架
3. **实例演示**: 每步明确标注使用的理论,展示完整思维过程,提炼可迁移原则

---

## AI Prompt模板

### Prompt 1: 核心概念 (Concepts) - 增强版

````markdown
你是一位资深的批判性思维教育专家和课程设计大师,擅长将复杂理论转化为结构化、易理解的学习内容。

**重要提示**: 这是批判性思维教育的核心内容,直接影响学习者的思维能力发展。请务必认真对待,提供高质量、结构化的内容!

## 任务背景

请为以下维度和Level设计核心概念内容:

**思维维度**: {dimension.name}
**维度描述**: {dimension.description}
**Level**: {level} - {levelTitle}
**认知负荷**: {cognitiveLoad}
**学习目标**: {learningGoals}

## 输出要求

请严格按照以下JSON格式输出(不要包含其他文字说明):

```json
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
```

## 质量要求 (必须严格遵守!)

### 结构完整性
- ✅ 必须包含2-4个概念(Level 1: 1-2个,Level 2-3: 2-3个,Level 4-5: 2-3个)
- ✅ 每个概念必须有conceptBreakdown(至少level1,推荐level1+level2)
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

### Level难度递增原则

#### Level 1 (基础识别)
- 1-2个基础概念
- 概念简单直接,定义清晰
- 例子来自日常生活
- conceptBreakdown只需level1

#### Level 2-3 (中级应用)
- 2-3个概念
- 引入关系和应用
- 例子涉及工作学习场景
- conceptBreakdown需要level1+level2

#### Level 4-5 (高级综合)
- 2-3个高级概念
- 强调系统性和复杂性
- 例子涉及复杂真实场景
- conceptBreakdown需要level1+level2+level3

## 示例参考 (causal_analysis维度)

### Level 1示例 - 基础因果关系
```json
{
  "conceptId": "basic-causation",
  "name": "因果关系的基本概念",
  "coreIdea": "因果关系是指一个事件(原因)的发生导致另一个事件(结果)必然发生的关系",
  "conceptBreakdown": {
    "level1": {
      "title": "时间先后性 - 因果的第一要素",
      "definition": "原因必须发生在结果之前,这是因果关系的基本前提。如果时间顺序颠倒或同时发生,就不可能是因果关系。",
      "whyImportant": "违反时间顺序是最明显的非因果关系标志,检查时间顺序可以快速排除伪因果",
      "example": "✅ 正确: 下雨(原因) → 地面湿(结果) | ❌ 错误: 地面湿 → 下雨",
      "practicalTest": "问自己: 如果X发生在Y之前,这在现实中是否合理?"
    }
  }
}
```

### Level 3示例 - 多因素因果
```json
{
  "conceptId": "multi-factor-causation",
  "name": "多因素因果关系",
  "coreIdea": "复杂现象通常由多个因素共同作用导致,需要识别主要原因、次要原因和混淆因素",
  "conceptBreakdown": {
    "level1": {
      "title": "主要原因vs次要原因",
      "definition": "主要原因对结果的影响权重大(通常>50%),次要原因影响权重小。识别主次有助于抓住关键问题。",
      "whyImportant": "避免'眉毛胡子一把抓',将有限资源集中在解决主要问题上",
      "example": "某电商销量下滑: 主要原因是竞品降价(贡献60%),次要原因是物流延迟(贡献15%)",
      "practicalTest": "如果只解决这个因素,结果会改善多少?超过50%说明是主要原因"
    },
    "level2": {
      "title": "混淆因素识别",
      "definition": "混淆因素是同时影响原因和结果的第三方变量,会造成虚假的因果关系。",
      "whyImportant": "不识别混淆因素会导致错误的因果结论和无效的干预措施",
      "example": "冰淇淋销量↑与溺水事故↑相关,但真正原因是夏季气温(混淆因素)同时影响两者",
      "practicalTest": "思考: 是否存在其他因素Z同时影响X和Y?"
    }
  }
}
```

## 最后提醒

1. **输出必须是合法的JSON** - 可以直接用JSON.parse()解析
2. **不要偷工减料** - 每个必填字段都要认真填写
3. **真实案例优先** - 避免编造不实际的例子
4. **结构化思维** - 用conceptBreakdown帮助学习者层层理解
5. **可操作性** - criticalThinkingFramework要让学习者能实际运用

现在,请开始生成内容!
````

---

### Prompt 2: 思维模型 (Models) - 增强版

````markdown
你是一位批判性思维方法论专家和教学设计大师,擅长设计实用的思维工具和分析框架。

**重要提示**: 思维模型是学习者能否实际应用的关键!必须详细、可操作、有实例,绝不能简洁敷衍!

## 任务背景

请为以下维度和Level设计思维模型内容:

**思维维度**: {dimension.name}
**Level**: {level} - {levelTitle}
**认知负荷**: {cognitiveLoad}

## 输出要求

```json
{
  "intro": "本章节引言(150-200字,说明为什么需要这些模型,它们解决什么问题)",

  "models": [
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
          "description": "详细操作说明(300-500字!)\\n\\n必须包含:\\n- 具体做什么(What)\\n- 如何做(How)\\n- 为什么这样做(Why)\\n- 预期输出是什么(Output)\\n\\n示例格式:\\n将模糊的问题转化为可分析的具体陈述。使用5W1H框架: 谁(Who)受到影响? 什么(What)现象需要分析? 何时(When)发生? 何地(Where)发生? 为什么(Why)重要? 如何(How)衡量?\\n\\n例如,将'公司业绩不好'具体化为'华东区2024年Q1销售额同比下降25%,影响整体利润率'。\\n\\n为什么要这样定义? 因为具体的问题陈述才能进行针对性分析,模糊的问题会导致分析方向不明确。\\n\\n预期输出: 一个清晰、可衡量、有边界的问题陈述。",

          "keyThinkingPoints": [
            "🎯 明确性: 问题陈述是否足够具体,可以直接分析?",
            "📊 可衡量: 是否有明确的指标来判断问题的严重程度?",
            "🔍 边界清晰: 问题的范围是否界定清楚,不会过于宽泛?"
          ],

          "commonPitfalls": [
            {
              "mistake": "问题定义过于宽泛",
              "example": "'提升用户体验'过于模糊,无法直接分析",
              "correction": "具体化为'将移动端结账流程从5步缩减到3步,目标降低20%的弃单率'"
            },
            {
              "mistake": "混淆现象和问题",
              "example": "'销售额下降'是现象,不是问题",
              "correction": "问题应该是'为什么销售额下降?'或'如何恢复销售额?'"
            }
          ],

          "practicalExample": "某电商平台发现'用户流失严重' → 精确定义为'过去30天内,新注册用户7日留存率从65%降至42%,主要流失发生在首次购买前'",

          "tips": "使用SMART原则检查问题定义: 具体(Specific)、可衡量(Measurable)、可分析(Analyzable)、相关性(Relevant)、有时限(Time-bound)",

          "nextStepRationale": "问题定义清晰后,下一步需要系统性识别所有可能的影响因素,避免遗漏关键原因"
        },
        {
          "stepNumber": 2,
          "title": "步骤2标题",
          "description": "详细说明(300-500字!)",
          "keyThinkingPoints": ["思考点1", "思考点2", "思考点3"],
          "commonPitfalls": [
            {
              "mistake": "错误描述",
              "example": "错误示例",
              "correction": "正确做法"
            }
          ],
          "practicalExample": "实际应用示例",
          "tips": "实用技巧",
          "nextStepRationale": "为什么要进行下一步"
        }
        // ... 3-8个步骤
      ],

      "visualization": {
        "type": "flowchart | diagram | table | mindmap",
        "description": "可视化描述(如何画这个图,包含哪些元素)",
        "legend": "图例说明(符号含义,颜色编码等)",
        "stepByStepDrawing": [
          "绘图步骤1: 画出主框架(如: 中心问题写在鱼头位置)",
          "绘图步骤2: 添加主要类别(如: 画出4-6根主骨,代表主要因素类别)",
          "绘图步骤3: 填充细节(如: 在每根主骨上添加子因素)",
          "绘图步骤4: 标注关系(如: 用箭头表示因果关系,用颜色区分重要性)"
        ]
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
          },
          {
            "step": 2,
            "action": "步骤2的具体操作",
            "thinking": "思考过程",
            "output": "输出结果"
          }
          // ... 覆盖所有步骤
        ],
        "outcome": "最终结果(100-150字,应用模型后解决了什么问题,得到了什么洞察)"
      }
    }
  ]
}
```

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

### Level难度递增
- Level 1: 1个简单线性模型(3-4步)
- Level 2-3: 1-2个结构化模型(5-6步)
- Level 4-5: 1-2个复杂系统模型(6-8步)

## 示例参考

### Level 1 - 简单线性模型
```json
{
  "name": "5-Why分析法",
  "coreLogic": {
    "principle": "通过连续追问'为什么'深挖根本原因。基于假设: 表面问题通常由更深层的原因导致,通过5次左右的追问可以找到根本原因。",
    "whenWorks": "适用于单一因果链清晰的问题,如设备故障、流程问题、质量缺陷等",
    "whenFails": "不适用于多因素复杂问题(如市场变化),因为无法处理多个并行原因"
  },
  "steps": [
    {
      "stepNumber": 1,
      "title": "明确初始问题现象",
      "description": "清楚描述观察到的问题现象,使用客观数据而非主观判断。\n\n具体做什么: 将问题以'发生了什么'的形式陈述,包含时间、地点、影响范围等关键信息。\n\n如何做: 收集第一手观察数据,询问相关人员,查看记录日志。避免使用'经常''可能''大概'等模糊词汇,用具体数字和事实描述。\n\n为什么这样做: 准确的问题陈述是后续分析的基础。如果起点错误,所有分析都会偏离方向。\n\n预期输出: 一个清晰、具体、可验证的问题陈述,如'2024年3月15日上午10点,生产线2号机器停机,导致当日产量减少30%'。",
      "keyThinkingPoints": [
        "🎯 具体性: 是否包含了时间、地点、具体影响?",
        "📊 可验证: 是否可以通过数据或观察验证?",
        "🔍 客观性: 是否避免了主观臆断?"
      ],
      "commonPitfalls": [
        {
          "mistake": "问题描述过于主观",
          "example": "'设备总是出问题'过于模糊主观",
          "correction": "'过去7天内,2号机器停机3次,每次平均停机2小时'"
        }
      ],
      "practicalExample": "发现网站加载慢 → 明确为'首页加载时间从1.2秒增加到5.8秒(增长4.8倍),影响80%用户,始于3月1日系统更新后'",
      "tips": "问自己: 一个从未接触过这个问题的人,能否根据我的描述复现问题?",
      "nextStepRationale": "问题现象明确后,开始第一次追问为什么,寻找直接原因"
    }
  ]
}
```

## 最后提醒

1. **步骤描述不能少于300字** - 这是质量底线!
2. **必须包含完整应用案例** - 让学习者看到模型的实际效果
3. **关键思考点要实用** - 不是理论陈述,而是具体检查项
4. **常见陷阱要真实** - 基于实际使用中的常见错误

现在,请开始生成内容!
````

---

### Prompt 3: 实例演示 (Demonstrations) - 增强版

````markdown
你是一位批判性思维案例分析专家和教学设计大师,擅长通过详细案例展示理论应用。

**重要提示**: 实例演示是连接理论与实践的桥梁!必须明确标注每步使用的理论,展示完整思维过程,提炼可迁移原则!

## 任务背景

请为以下维度和Level设计实例演示内容:

**思维维度**: {dimension.name}
**Level**: {level} - {levelTitle}

**已有理论内容**(请在案例中引用):
- 核心概念: {conceptsList}
- 思维模型: {modelsList}

## 输出要求

```json
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
          "主要原因vs次要原因 (核心概念2.2)",
          "混淆因素识别 (核心概念1.3)"
        ],
        "modelsUsed": [
          "鱼骨图分析法 (思维模型2.1)",
          "变量控制分析 (思维模型1.2)"
        ]
      },

      "scenario": {
        "background": "详细背景描述(300-400字)\\n\\n必须包含:\\n- 主体介绍(谁/什么组织)\\n- 时间背景\\n- 问题情境\\n- 关键利益相关者\\n\\n示例: 某在线教育平台'学习星球'成立于2020年,主营K12在线课程。2024年Q1,公司遭遇严重的用户留存危机...",

        "keyData": [
          "关键数据点1(如: 整体用户留存率: 70% → 45%, 下降25个百分点)",
          "关键数据点2(如: 新用户7日留存: 65% → 30%, 下降35个百分点)",
          "关键数据点3(如: 老用户留存: 85% → 82%, 基本稳定)",
          "关键数据点4(如: 同期变化: 新推广渠道上线、UI改版、价格调整)"
        ],

        "problemStatement": "核心问题(50-80字,如: 如何识别导致用户流失的根本原因,并区分主要原因和次要原因?)"
      },

      "stepByStepAnalysis": [
        {
          "stepNumber": 1,
          "action": "应用鱼骨图 - 定义问题",

          "conceptApplied": "精确问题定义 (思维模型2.1步骤1)",
          "modelApplied": "鱼骨图分析法 (思维模型2.1)",

          "thinkingProcess": "完整思维过程(200-300字!)\\n\\n必须包含:\\n- 为什么选择这个理论/模型?\\n- 具体如何应用?\\n- 遇到了什么挑战?\\n- 如何克服?\\n- 得出了什么中间结论?\\n\\n示例:\\n将模糊的'用户流失'具体化为可衡量指标。使用SMART原则: 将问题定义为'2024年Q1新用户7日留存率从65%降至30%'。\\n\\n为什么这样定义? 因为数据显示老用户留存稳定(85%→82%),主要问题在新用户。将问题聚焦在新用户留存,可以更精准地分析原因。\\n\\n遇到的挑战: 最初想分析'整体用户流失',但这个问题太宽泛,既包括新用户也包括老用户,难以找到统一的原因。\\n\\n如何克服: 通过分层数据分析,发现新用户和老用户的留存表现差异巨大,决定先聚焦主要问题(新用户)。",

          "criticalThinkingPoint": "🎯 为什么聚焦新用户? 因为数据显示老用户留存基本稳定,新用户下降幅度更大(35个百分点 vs 3个百分点),符合'抓主要矛盾'原则。如果不分层分析,会误判为产品整体变差,导致错误决策。",

          "toolOutput": "明确问题: 新用户7日留存率异常下降(从65%降至30%)",

          "nextStepRationale": "问题定义清晰后,下一步需要系统性识别所有可能的影响因素,使用鱼骨图的分类框架确保不遗漏主要因素"
        },
        {
          "stepNumber": 2,
          "action": "应用鱼骨图 - 识别主要类别",
          "conceptApplied": "多因素分类框架 (思维模型2.1步骤2)",
          "thinkingProcess": "思维过程(200-300字!)",
          "criticalThinkingPoint": "关键思考点(80-120字)",
          "toolOutput": "该步骤的输出结果",
          "nextStepRationale": "为什么要进行下一步"
        }
        // ... 3-10个步骤
      ],

      "keyInsights": [
        {
          "insight": "分层分析揭示真相",
          "explanation": "整体数据显示留存下降,但分层后发现老用户稳定、新用户极低,精准定位了问题根源。如果只看整体数据,会误认为产品整体变差,可能错误地大规模改版产品。",
          "generalPrinciple": "当整体指标恶化时,通过分层(按渠道、时间、用户群)分析能避免误判,找到真正的问题所在",
          "applicableScenarios": "适用于所有聚合指标的分析: 销售下滑、转化率降低、用户流失、成本上升等"
        },
        {
          "insight": "控制变量隔离因果",
          "explanation": "通过对比老渠道用户(未受新渠道影响),排除了产品因素,确认渠道质量是主因",
          "generalPrinciple": "寻找自然对照组,验证因果假设,排除干扰因素",
          "applicableScenarios": "A/B测试设计、市场实验、政策效果评估、产品改进验证"
        }
      ],

      "commonMistakesInThisCase": [
        {
          "mistake": "只看整体数据,未分层分析",
          "consequence": "误认为产品整体变差,可能错误地大规模改版产品,浪费大量资源但解决不了问题",
          "correction": "始终按关键维度(渠道、时间、用户群、产品版本等)分层查看数据,精准定位问题"
        },
        {
          "mistake": "因UI改版时间接近就认为是主因",
          "consequence": "投入大量资源优化UI,但留存仍不会明显改善(实际只贡献5%)",
          "correction": "用对照组验证假设: 老用户也经历了UI改版但留存稳定,证明UI非主因"
        }
      ],

      "transferableSkills": [
        "分层分析技巧可应用于任何聚合指标的诊断(销售、转化、留存、成本等)",
        "变量控制思维可用于验证任何因果假设(营销效果、产品改进、政策影响等)",
        "贡献度量化方法可指导任何资源分配决策(时间优先级、预算分配、人力投入等)"
      ],

      "practiceGuidance": "完成本案例学习后,建议访问练习系统,尝试分析类似的多因素问题(如: 产品销量下滑、网站转化率降低等),巩固分层分析和变量控制技能"
    }
  ]
}
```

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

### Level难度递增
- Level 1: 1-2个简单案例,3-5个分析步骤
- Level 2-3: 2个中等案例,5-7个分析步骤
- Level 4-5: 1-2个复杂案例,7-10个分析步骤

## 最后提醒

1. **必须明确标注每步使用的理论** - 这是核心价值!
2. **思维过程不能少于200字** - 要展示完整思考链条!
3. **关键洞察要可迁移** - 不是总结案例,而是提炼通用原则!
4. **常见错误要具体** - 说明后果和正确做法!

现在,请开始生成内容!
````

---

## 内容质量验证脚本

### 自动化验证器

```typescript
// scripts/validate-theory-content.ts

interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  metrics: QualityMetrics;
}

class TheoryContentValidator {
  // 验证核心概念
  validateConcepts(content: ConceptsContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 字数检查
    if (content.intro.length < 200 || content.intro.length > 400) {
      errors.push(`intro字数不符: ${content.intro.length}字(要求200-400)`);
    }

    content.concepts.forEach((concept, index) => {
      // 必填字段检查
      if (!concept.coreIdea) {
        errors.push(`概念${index + 1}缺少coreIdea`);
      } else if (concept.coreIdea.length < 50 || concept.coreIdea.length > 120) {
        warnings.push(`概念${index + 1} coreIdea字数: ${concept.coreIdea.length}(建议50-120)`);
      }

      // conceptBreakdown检查
      if (!concept.conceptBreakdown || !concept.conceptBreakdown.level1) {
        errors.push(`概念${index + 1}缺少conceptBreakdown.level1`);
      }

      // criticalThinkingFramework检查
      if (!concept.criticalThinkingFramework) {
        errors.push(`概念${index + 1}缺少criticalThinkingFramework`);
      } else {
        const steps = Object.keys(concept.criticalThinkingFramework).length;
        if (steps < 3) {
          errors.push(`概念${index + 1} criticalThinkingFramework至少需要3步,当前${steps}步`);
        }
      }

      // commonMisconceptions检查
      if (!concept.commonMisconceptions || concept.commonMisconceptions.length < 2) {
        warnings.push(`概念${index + 1}误区数量少于2个`);
      }

      // visualizationGuide检查
      if (!concept.visualizationGuide) {
        errors.push(`概念${index + 1}缺少visualizationGuide`);
      }
    });

    return {
      isValid: errors.length === 0,
      score: this.calculateScore(errors, warnings),
      errors,
      warnings,
      metrics: this.calculateConceptsMetrics(content),
    };
  }

  // 验证思维模型
  validateModels(content: ModelsContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    content.models.forEach((model, index) => {
      // coreLogic检查
      if (!model.coreLogic) {
        errors.push(`模型${index + 1}缺少coreLogic`);
      }

      // 步骤检查(核心质量要求!)
      model.steps.forEach((step, stepIndex) => {
        // 字数检查
        if (step.description.length < 300) {
          errors.push(
            `模型${index + 1}步骤${stepIndex + 1} description字数不足: ${step.description.length}字(要求≥300)`
          );
        }

        // keyThinkingPoints检查
        if (!step.keyThinkingPoints || step.keyThinkingPoints.length < 3) {
          warnings.push(`模型${index + 1}步骤${stepIndex + 1} keyThinkingPoints少于3个`);
        }

        // commonPitfalls检查
        if (!step.commonPitfalls || step.commonPitfalls.length < 2) {
          warnings.push(`模型${index + 1}步骤${stepIndex + 1} commonPitfalls少于2个`);
        }

        // practicalExample检查
        if (!step.practicalExample) {
          errors.push(`模型${index + 1}步骤${stepIndex + 1}缺少practicalExample`);
        }
      });

      // fullApplicationExample检查
      if (!model.fullApplicationExample) {
        errors.push(`模型${index + 1}缺少fullApplicationExample`);
      }

      // visualization检查
      if (!model.visualization || !model.visualization.stepByStepDrawing) {
        errors.push(`模型${index + 1}缺少完整的visualization`);
      }
    });

    return {
      isValid: errors.length === 0,
      score: this.calculateScore(errors, warnings),
      errors,
      warnings,
      metrics: this.calculateModelsMetrics(content),
    };
  }

  // 验证实例演示
  validateDemonstrations(content: DemonstrationsContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    content.demonstrations.forEach((demo, index) => {
      // learningObjective检查
      if (!demo.learningObjective) {
        errors.push(`案例${index + 1}缺少learningObjective`);
      }

      // theoreticalFoundation检查(核心要求!)
      if (!demo.theoreticalFoundation) {
        errors.push(`案例${index + 1}缺少theoreticalFoundation`);
      } else {
        if (!demo.theoreticalFoundation.conceptsUsed || demo.theoreticalFoundation.conceptsUsed.length === 0) {
          errors.push(`案例${index + 1}未标注使用的概念`);
        }
      }

      // stepByStepAnalysis检查
      demo.stepByStepAnalysis.forEach((step, stepIndex) => {
        // conceptApplied检查(核心要求!)
        if (!step.conceptApplied) {
          errors.push(`案例${index + 1}步骤${stepIndex + 1}未标注conceptApplied`);
        }

        // thinkingProcess字数检查
        if (step.thinkingProcess.length < 200) {
          errors.push(
            `案例${index + 1}步骤${stepIndex + 1} thinkingProcess字数不足: ${step.thinkingProcess.length}字(要求≥200)`
          );
        }

        // criticalThinkingPoint检查
        if (!step.criticalThinkingPoint) {
          warnings.push(`案例${index + 1}步骤${stepIndex + 1}缺少criticalThinkingPoint`);
        }

        // nextStepRationale检查
        if (stepIndex < demo.stepByStepAnalysis.length - 1 && !step.nextStepRationale) {
          warnings.push(`案例${index + 1}步骤${stepIndex + 1}缺少nextStepRationale`);
        }
      });

      // keyInsights检查
      if (!demo.keyInsights || demo.keyInsights.length < 3) {
        warnings.push(`案例${index + 1} keyInsights少于3个`);
      }

      // commonMistakesInThisCase检查
      if (!demo.commonMistakesInThisCase || demo.commonMistakesInThisCase.length < 2) {
        warnings.push(`案例${index + 1} commonMistakesInThisCase少于2个`);
      }

      // transferableSkills检查
      if (!demo.transferableSkills || demo.transferableSkills.length < 3) {
        warnings.push(`案例${index + 1} transferableSkills少于3个`);
      }
    });

    return {
      isValid: errors.length === 0,
      score: this.calculateScore(errors, warnings),
      errors,
      warnings,
      metrics: this.calculateDemonstrationsMetrics(content),
    };
  }

  // 计算评分
  private calculateScore(errors: string[], warnings: string[]): number {
    const errorPenalty = errors.length * 15; // 每个错误扣15分
    const warningPenalty = warnings.length * 5; // 每个警告扣5分
    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  // 计算质量指标
  private calculateConceptsMetrics(content: ConceptsContent): any {
    return {
      totalConcepts: content.concepts.length,
      conceptsWithBreakdown: content.concepts.filter((c) => c.conceptBreakdown).length,
      conceptsWithFramework: content.concepts.filter((c) => c.criticalThinkingFramework).length,
      avgMisconceptionsPerConcept:
        content.concepts.reduce((sum, c) => sum + (c.commonMisconceptions?.length || 0), 0) / content.concepts.length,
    };
  }

  private calculateModelsMetrics(content: ModelsContent): any {
    return {
      totalModels: content.models.length,
      avgStepsPerModel: content.models.reduce((sum, m) => sum + m.steps.length, 0) / content.models.length,
      avgWordCountPerStep:
        content.models.reduce((sum, m) => sum + m.steps.reduce((s, step) => s + step.description.length, 0), 0) /
        content.models.reduce((sum, m) => sum + m.steps.length, 0),
      modelsWithFullExample: content.models.filter((m) => m.fullApplicationExample).length,
    };
  }

  private calculateDemonstrationsMetrics(content: DemonstrationsContent): any {
    return {
      totalDemonstrations: content.demonstrations.length,
      avgStepsPerDemo:
        content.demonstrations.reduce((sum, d) => sum + d.stepByStepAnalysis.length, 0) /
        content.demonstrations.length,
      stepsWithTheoryLink: content.demonstrations.reduce(
        (sum, d) => sum + d.stepByStepAnalysis.filter((s) => s.conceptApplied).length,
        0
      ),
    };
  }
}

// 使用示例
const validator = new TheoryContentValidator();
const result = validator.validateConcepts(conceptsContent);

if (!result.isValid) {
  console.error('内容质量验证失败:');
  result.errors.forEach((err) => console.error(`  ❌ ${err}`));
  result.warnings.forEach((warn) => console.warn(`  ⚠️  ${warn}`));
} else {
  console.log(`✅ 内容质量验证通过 (评分: ${result.score}/100)`);
}
```

---

## 生成流程

### 第一阶段: 试点生成 (1个维度 × 1个Level)

```bash
npm run generate:theory -- --dimension causal_analysis --level 1 --validate
```

1. 生成3个章节(concepts, models, demonstrations)
2. 自动验证质量
3. 人工审核
4. 根据反馈调整Prompt
5. 重新生成并对比

### 第二阶段: 批量生成 (5个维度 × 5个Level)

```bash
npm run generate:theory -- --all --validate --retry-on-fail
```

1. 使用优化后的Prompt批量生成
2. 每生成5个内容暂停人工抽查
3. 发现问题及时调整
4. 最终人工全量审核

---

## 总结

新的内容生成方案V3相比V2的核心提升:

1. **思维模型**: 步骤描述≥300字,包含关键思考点、常见陷阱、完整案例
2. **核心概念**: 多层级分解、批判性思维框架、详细可视化指南
3. **实例演示**: 明确理论关联、展示思维过程、提炼通用原则

**质量保障**:
- AI Prompt强制要求详细度
- 自动化验证脚本
- 人工审核机制

下一步: 更新生成脚本实现
