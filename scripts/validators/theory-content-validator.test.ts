/**
 * Theory Content V3 Validator - Test Suite
 *
 * Tests validation logic for Theory Content V3
 */

import { TheoryContentValidator, validateTheoryContent } from './theory-content-validator';
import type {
  ConceptsContent,
  ModelsContent,
  DemonstrationsContent,
} from '@/types/theory-content-v3';

// ==================== Test Data ====================

/**
 * Valid concepts content for testing
 */
const validConceptsContent: ConceptsContent = {
  intro:
    '本章介绍因果关系分析的核心概念。因果关系是批判性思维中最重要的概念之一，它帮助我们理解现象之间的真实联系，避免将相关性误认为因果性。我们将学习如何识别真正的因果关系、区分混淆因素，以及建立可靠的因果推理。掌握这些概念对于科学研究、商业决策和日常生活都具有重要意义。',
  concepts: [
    {
      conceptId: 'cause-effect-standards',
      name: '因果关系的三个判定标准',
      coreIdea:
        '真正的因果关系必须满足时间先后、相关性和排除混淆因素三个条件，缺一不可。',
      definition:
        '因果关系是指一个事件(原因)直接导致另一个事件(结果)发生的关系。判定因果关系需要三个标准：时间先后性(原因发生在结果之前)、相关性(原因和结果之间存在统计关联)、排他性(排除其他可能的解释)。',
      whyImportant:
        '许多决策错误源于将相关性误认为因果性。理解这三个标准能帮助我们避免错误推理，做出更准确的判断。',
      conceptBreakdown: {
        level1: {
          title: '时间先后性',
          definition:
            '原因必须发生在结果之前。这是因果关系的基本条件，违反时间顺序的关系不可能是因果关系。',
          whyImportant: '排除逆因果谬误，确保推理方向正确。',
          example: '吃药后头痛消失，而不是头痛消失后才吃药。',
          practicalTest: '问自己：这个"原因"是否真的发生在"结果"之前？',
        },
        level2: {
          title: '相关性',
          definition:
            '原因和结果之间必须存在统计上的关联。当原因出现时，结果出现的概率显著增加；当原因不出现时，结果出现的概率显著降低。',
          whyImportant: '仅有时间先后不足以证明因果，还需要有实际的关联。',
          example: '吸烟者肺癌发病率明显高于非吸烟者。',
          practicalTest: '收集数据验证：有原因时结果是否更常出现？',
        },
        level3: {
          title: '排他性',
          definition:
            '排除其他可能的解释。即使存在时间先后和相关性，也可能是由第三个因素(混淆因素)同时影响了原因和结果。',
          whyImportant: '避免将相关性误认为因果性，这是最常见的逻辑错误。',
          example:
            '冰淇淋销量和溺水死亡人数相关，但真正的原因是夏季高温这个混淆因素。',
          practicalTest: '思考：是否存在第三个因素同时影响了两者？',
        },
      },
      criticalThinkingFramework: {
        step1: '确认时间顺序：原因是否真的发生在结果之前？',
        step2: '检验相关性：数据是否显示原因和结果之间的统计关联？',
        step3: '排除混淆因素：是否存在其他可能的解释？',
        step4: '考虑反向因果：结果是否可能反过来影响原因？',
      },
      keyPoints: [
        '因果关系需要满足三个标准，缺一不可',
        '相关性不等于因果性',
        '混淆因素是最常被忽视的陷阱',
        '反向因果也是一种常见错误',
      ],
      commonMisconceptions: [
        {
          misconception: '只要两个事件同时发生，就存在因果关系',
          truth: '同时发生只是相关性，不能证明因果性。需要满足所有三个标准。',
          realExample:
            '公鸡打鸣和太阳升起同时发生，但公鸡打鸣不是太阳升起的原因。',
        },
        {
          misconception: '统计显著性等于因果关系',
          truth: '统计显著性只是相关性的一种表现，仍需排除混淆因素。',
          realExample:
            '巧克力消费量和诺贝尔奖获得数量显著相关，但不存在因果关系，真正的原因是国家富裕程度。',
        },
      ],
      realWorldExamples: [
        {
          scenario:
            '研究发现，喝咖啡的人心脏病发病率较低。是否可以得出"喝咖啡预防心脏病"的结论？',
          application:
            '应用三个标准：1)时间先后：喝咖啡在心脏病发作之前，满足；2)相关性：数据显示关联，满足；3)排他性：需要排除混淆因素，如喝咖啡的人可能更富裕、更注重健康、运动更多等。',
          outcome: '结论：不能仅凭相关性得出因果结论，需要控制混淆因素的随机对照试验。',
        },
        {
          scenario:
            '某公司发现，接受过培训的员工业绩更好。是否应该大规模推广培训？',
          application:
            '检查：1)时间先后：培训在业绩提升之前，满足；2)相关性：数据显示关联，满足；3)排他性：是否是因为本身更优秀的员工更愿意参加培训？(自我选择偏差)',
          outcome: '结论：需要随机分配培训机会，或者控制员工初始能力，才能确认因果关系。',
        },
      ],
      visualizationGuide: {
        type: 'decision-tree',
        description: '因果关系判定决策树：从三个标准依次检验',
        structure: {
          root: '是否存在因果关系？',
          branch1: '时间先后性：原因在结果之前？是→继续，否→非因果',
          branch2: '相关性：数据显示关联？是→继续，否→非因果',
          branch3: '排他性：排除混淆因素？是→因果关系，否→仅为相关性',
        },
      },
    },
  ],
};

/**
 * Valid models content for testing
 */
const validModelsContent: ModelsContent = {
  intro:
    '本章介绍因果分析的核心思维模型。这些模型提供了系统化的分析框架，帮助我们识别真正的因果关系，避免常见的推理错误。',
  models: [
    {
      modelId: 'fishbone-analysis',
      name: '鱼骨图分析法',
      purpose: '系统化地识别问题的所有可能原因，并分类整理',
      description:
        '鱼骨图(Ishikawa Diagram)是一种可视化工具，用于识别和组织问题的潜在原因。它由日本质量管理专家石川馨发明，因形状类似鱼骨而得名。该方法通过将问题(鱼头)和可能的原因(鱼骨)系统地展示出来，帮助团队全面分析问题，避免遗漏关键因素。鱼骨图特别适用于复杂问题的根因分析，它能够将众多因素分类整理，使分析更加清晰有序。',
      coreLogic: {
        principle:
          '复杂问题往往由多个因素共同导致，系统化分类能避免遗漏关键原因',
        whenWorks: '问题复杂、涉及多个领域、需要团队协作时',
        whenFails: '问题过于简单、时间紧迫、缺乏数据验证时',
      },
      structure: {
        type: 'hierarchy',
        components: [
          '问题(鱼头)',
          '主要类别(主骨)',
          '次要原因(支骨)',
          '根本原因(细骨)',
        ],
        relationships:
          '问题由主要类别导致，每个主要类别包含多个次要原因，次要原因追溯到根本原因',
      },
      steps: [
        {
          stepNumber: 1,
          title: '明确问题并绘制鱼头',
          description:
            '首先，需要清晰地定义要分析的问题，并将其写在鱼骨图的右侧(鱼头位置)。问题描述必须具体、可测量、有明确的时间范围。例如，不要写"销售不好"，而应该写"2024年Q1销售额比去年同期下降15%"。问题定义的质量直接影响后续分析的有效性。在这个阶段，要与团队成员确认对问题的理解是否一致，避免因理解偏差导致分析方向错误。同时，要收集问题相关的基本数据，如问题发生的时间、地点、影响范围等，这些信息将在后续分析中提供重要线索。',
          keyThinkingPoints: [
            '问题描述是否具体可测量？',
            '时间范围是否明确？',
            '团队成员对问题的理解是否一致？',
            '是否收集了问题的基本数据？',
          ],
          commonPitfalls: [
            {
              mistake: '问题描述过于模糊，如"用户体验不好"',
              example: '错误："用户不满意" 正确："用户投诉率从5%上升到12%(3个月内)"',
              correction: '使用具体的数据和指标来定义问题',
            },
            {
              mistake: '问题定义过于宽泛，涵盖多个不同问题',
              example: '错误："公司运营有问题" 正确："客户留存率下降20%"',
              correction: '将大问题拆解为多个具体的子问题，分别分析',
            },
          ],
          practicalExample:
            '某电商平台发现"移动端支付成功率从95%下降到82%(过去2周)"，这是一个清晰、可测量的问题定义。',
          tips: '使用5W1H方法(What, When, Where, Who, Why, How)来完善问题描述',
          nextStepRationale: '明确问题后，需要建立分析框架来系统地寻找原因',
        },
        {
          stepNumber: 2,
          title: '确定主要类别(主骨)',
          description:
            '根据问题的性质，确定4-6个主要原因类别，并绘制为从鱼头延伸出的主骨。常用的分类框架包括：制造业常用的4M(人Man、机Machine、料Material、法Method)或6M(增加环境Environment、测量Measurement)；服务业常用的4P(人员People、流程Process、政策Policy、场所Place)；IT行业常用的5P(人员、流程、平台Platform、产品Product、性能Performance)。选择合适的分类框架能够确保分析的全面性和系统性。每个主要类别都应该是相互独立、完全穷尽的，即MECE原则(Mutually Exclusive, Collectively Exhaustive)。在这个阶段，团队需要根据业务特点选择或定制分类框架，确保能够涵盖所有可能的原因类型。',
          keyThinkingPoints: [
            '选择的分类框架是否适合当前问题的领域？',
            '类别之间是否相互独立、没有重叠？',
            '所有类别是否能够完全覆盖所有可能的原因？',
            '是否需要根据业务特点定制分类框架？',
          ],
          commonPitfalls: [
            {
              mistake: '类别之间存在重叠，导致原因分类混乱',
              example: '同时使用"技术问题"和"系统故障"作为类别(实际是重叠的)',
              correction: '确保类别之间相互独立，采用MECE原则',
            },
            {
              mistake: '类别过多或过少，影响分析效率',
              example: '设置10个类别导致分析过于复杂，或只设2个类别导致分析过于粗糙',
              correction: '通常4-6个类别最合适，根据问题复杂度调整',
            },
          ],
          practicalExample:
            '针对"支付成功率下降"问题，采用5P框架：平台(服务器、网络)、产品(支付流程、界面)、人员(开发、运维)、流程(测试、部署)、性能(响应时间、并发处理)',
          tips: '先使用标准框架，再根据实际情况调整和定制',
          nextStepRationale: '确定类别后，需要在每个类别下识别具体的原因',
        },
        {
          stepNumber: 3,
          title: '头脑风暴识别次要原因',
          description:
            '在每个主要类别下，通过头脑风暴的方式识别所有可能的次要原因，并将其绘制为从主骨延伸出的支骨。头脑风暴阶段遵循"量大于质"的原则，鼓励团队成员自由发言，不要在这个阶段批判或评估想法。记录所有提出的原因，即使看起来不太相关或不太可能。使用便利贴或白板，让每个人都能看到已经提出的想法，这有助于激发新的思路。典型的头脑风暴时间为15-30分钟，确保每个类别都有足够的讨论。在这个过程中，主持人要鼓励深入思考，可以通过"为什么"连续追问来挖掘更深层的原因。记录时要使用简洁的关键词，避免长句子，以便后续整理。',
          keyThinkingPoints: [
            '是否鼓励了自由发言，没有过早批判？',
            '每个类别下是否都识别了足够多的可能原因？',
            '是否通过连续追问挖掘了深层原因？',
            '团队成员是否都积极参与了讨论？',
          ],
          commonPitfalls: [
            {
              mistake: '过早评判和否定想法，限制了创造性思维',
              example: '有人提出"可能是数据库问题"，立即被反驳"数据库没问题"',
              correction: '头脑风暴阶段不评判，记录所有想法，后续再筛选',
            },
            {
              mistake: '某些团队成员主导讨论，其他人没有充分参与',
              example: '技术负责人滔滔不绝，其他成员保持沉默',
              correction: '使用轮流发言或便利贴方式，确保每个人都能贡献想法',
            },
          ],
          practicalExample:
            '在"平台"类别下识别出：服务器CPU使用率高、数据库连接超时、CDN缓存失效、负载均衡配置错误、第三方支付接口延迟等',
          tips: '使用"5个为什么"技巧深入挖掘，从表面原因追溯到根本原因',
          nextStepRationale: '识别原因后，需要验证哪些是真正的根本原因',
        },
      ],
      visualization: {
        type: 'diagram',
        description: '鱼骨图示意：问题在右侧，主要类别呈对称分布',
        legend: '鱼头=问题，主骨=主要类别，支骨=次要原因，细骨=根本原因',
        stepByStepDrawing: [
          '1. 在纸张或白板右侧绘制一个方框，写入问题描述',
          '2. 从方框向左绘制一条水平主线(鱼的脊椎)',
          '3. 在主线上下对称绘制4-6条斜线(主骨)，每条标注一个主要类别',
          '4. 在每条主骨上绘制支骨，标注次要原因',
          '5. 在支骨上继续绘制细骨，标注更深层的原因',
        ],
      },
      whenToUse:
        '适用于复杂问题的根因分析、质量管理、流程改进、团队协作分析等场景',
      limitations: '需要团队协作，单人使用效果有限；需要后续数据验证，不能仅凭推测',
      fullApplicationExample: {
        scenario:
          '某SaaS公司发现"客户流失率从每月3%上升到8%"，影响收入增长。需要找出真正原因并制定改进措施。团队包括产品、销售、客服、技术负责人。',
        stepByStepApplication: [
          {
            step: 1,
            action: '定义问题',
            thinking:
              '确认问题为"过去3个月客户流失率从3%上升到8%"，收集数据发现主要是中小企业客户流失',
            output: '问题：中小企业客户流失率过去3个月从3%上升到8%',
          },
          {
            step: 2,
            action: '确定主要类别',
            thinking: '采用4P框架：产品(Product)、价格(Price)、流程(Process)、人员(People)',
            output: '4个主要类别：产品功能、定价策略、服务流程、客户成功团队',
          },
          {
            step: 3,
            action: '头脑风暴原因',
            thinking:
              '团队讨论30分钟，每个类别下识别5-8个可能原因，使用便利贴记录',
            output:
              '总共识别出26个可能原因，分布在4个类别下',
          },
        ],
        outcome:
          '通过鱼骨图分析，团队识别出3个关键根因：1)新版本UI改动较大，中小企业员工培训成本高；2)竞争对手推出低价套餐；3)客户成功团队响应时间从4小时延长到24小时。制定针对性改进措施后，流失率在2个月内降回4%。',
      },
    },
  ],
};

/**
 * Valid demonstrations content for testing
 */
const validDemonstrationsContent: DemonstrationsContent = {
  intro:
    '本章通过真实案例演示如何应用因果分析的核心概念和思维模型。每个案例都会明确标注使用的理论，帮助你建立理论与实践的联系。',
  demonstrations: [
    {
      demoId: 'coffee-health-study',
      title: '咖啡与健康研究案例分析',
      category: '学术研究',
      learningObjective:
        '学习如何在复杂的观察性研究中识别混淆因素，避免将相关性误认为因果性',
      theoreticalFoundation: {
        conceptsUsed: ['因果关系的三个判定标准 (核心概念1.1)'],
        modelsUsed: ['鱼骨图分析法 (思维模型2.1)'],
      },
      scenario: {
        background:
          '2023年，一项大规模流行病学研究发现，每天喝2-3杯咖啡的人，心脏病发病率比不喝咖啡的人低20%。该研究追踪了10万名参与者长达15年，数据显示统计显著性达到p<0.001。研究发表后，媒体纷纷报道"咖啡可以预防心脏病"，咖啡销量随之大增。然而，多位医学专家对此提出质疑，认为研究结论可能存在问题。',
        keyData: [
          '样本量：10万人，追踪15年',
          '相关性：喝咖啡组心脏病发病率低20%',
          '统计显著性：p<0.001',
          '研究类型：观察性研究(非随机对照试验)',
        ],
        problemStatement: '能否得出"喝咖啡预防心脏病"的因果结论？',
      },
      stepByStepAnalysis: [
        {
          stepNumber: 1,
          action: '应用因果关系的第一个标准：时间先后性',
          conceptApplied: '因果关系的三个判定标准 - 时间先后性 (核心概念1.1)',
          modelApplied: undefined,
          thinkingProcess:
            '首先检查时间顺序：研究是追踪性的，记录了参与者的咖啡饮用习惯(基线时间点)，然后追踪15年观察心脏病发病情况(结果时间点)。可以确认喝咖啡的行为发生在心脏病发作之前，满足时间先后性。这一点没有问题，因为研究设计本身就是前瞻性的，排除了逆因果的可能(不是因为得了心脏病所以不喝咖啡)。',
          criticalThinkingPoint:
            '时间先后性是最基本的条件，但仅满足这一点还不足以证明因果关系。需要继续检验其他标准。',
          toolOutput: {
            时间先后性: '满足 ✓',
            理由: '咖啡饮用(基线)在心脏病发作(15年追踪)之前',
          },
          nextStepRationale: '时间顺序正确后，需要确认两者之间是否真的存在关联',
        },
        {
          stepNumber: 2,
          action: '应用因果关系的第二个标准：相关性',
          conceptApplied: '因果关系的三个判定标准 - 相关性 (核心概念1.1)',
          modelApplied: undefined,
          thinkingProcess:
            '研究数据显示，喝咖啡组的心脏病发病率确实比不喝咖啡组低20%，且统计显著性达到p<0.001(远低于常用的0.05阈值)。这意味着这种关联极不可能是随机偶然产生的，具有统计学意义。从数据角度看，咖啡饮用和心脏病发病率之间确实存在负相关关系(即喝咖啡多的人发病率更低)。这满足了相关性标准。然而，统计显著性只能说明关联的强度和可靠性，不能直接证明因果关系。',
          criticalThinkingPoint:
            '**重要警示**：相关性不等于因果性！统计显著性只是证明关联存在，不是证明因果关系。这是最常见的逻辑错误。',
          toolOutput: {
            相关性: '满足 ✓',
            相关强度: '心脏病发病率降低20%',
            统计显著性: 'p<0.001(高度显著)',
          },
          nextStepRationale:
            '虽然存在相关性，但这可能是由第三个因素导致的，需要排除混淆因素',
        },
        {
          stepNumber: 3,
          action: '应用因果关系的第三个标准：排除混淆因素',
          conceptApplied: '因果关系的三个判定标准 - 排他性 (核心概念1.1)',
          modelApplied: '鱼骨图分析法 (思维模型2.1)',
          thinkingProcess:
            '这是关键的一步。需要思考：是否存在第三个因素同时影响了"喝咖啡"和"心脏病发病率"？使用鱼骨图系统地识别可能的混淆因素：1)经济因素：喝咖啡的人可能更富裕，能负担更好的医疗保健；2)生活方式：喝咖啡的人可能更注重健康，有更好的饮食和运动习惯；3)职业因素：喝咖啡的人可能从事脑力劳动，体力负担较轻；4)教育因素：教育程度更高的人更可能喝咖啡，也更了解健康知识。这些因素都可能同时导致"更多喝咖啡"和"更低心脏病发病率"，即使咖啡本身没有预防作用。',
          criticalThinkingPoint:
            '观察性研究无法像随机对照试验那样通过随机分组排除混淆因素。即使研究者尝试统计调整，仍可能遗漏未测量的混淆因素。',
          toolOutput: {
            排他性: '不满足 ✗',
            识别的混淆因素: [
              '经济水平(富裕程度)',
              '生活方式(饮食、运动)',
              '职业类型(体力vs脑力)',
              '教育程度',
            ],
            结论: '无法排除这些因素的影响，不能确认因果关系',
          },
          nextStepRationale: '发现无法排除混淆因素后，需要给出最终结论和建议',
        },
      ],
      keyInsights: [
        {
          insight: '统计显著性不等于因果关系',
          explanation:
            '即使p值很小，也只能说明关联的可靠性，不能证明因果性。需要排除混淆因素。',
          generalPrinciple: '在评估任何研究结论时，都要区分"相关性"和"因果性"',
          applicableScenarios:
            '适用于所有观察性研究、市场调研、用户行为分析等场景',
        },
        {
          insight: '观察性研究的局限性',
          explanation:
            '观察性研究无法像随机对照试验那样通过随机分组排除混淆因素，只能提供关联证据，不能证明因果。',
          generalPrinciple: '重大决策需要基于随机对照试验，而非仅凭观察性研究',
          applicableScenarios: '医学研究、政策评估、商业决策等需要确认因果的场景',
        },
        {
          insight: '系统化分析的重要性',
          explanation:
            '使用鱼骨图等工具能够系统地识别混淆因素，避免遗漏关键因素。',
          generalPrinciple: '复杂问题需要使用结构化工具进行分析，避免依赖直觉',
          applicableScenarios: '所有涉及多因素的复杂决策场景',
        },
      ],
      commonMistakesInThisCase: [
        {
          mistake: '看到统计显著性就直接得出因果结论',
          consequence: '误导决策，可能导致无效甚至有害的干预措施',
          correction:
            '始终应用因果关系的三个标准，特别是排除混淆因素这一步不能省略',
        },
        {
          mistake: '忽视研究类型的局限性',
          consequence: '高估观察性研究的证据强度，做出不当推断',
          correction: '了解不同研究设计的局限性，观察性研究只能提供假设，需要RCT验证',
        },
      ],
      transferableSkills: [
        '应用因果关系三个标准的能力',
        '识别混淆因素的系统化思维',
        '批判性阅读科学研究报告的能力',
        '区分相关性和因果性的警觉性',
      ],
      practiceGuidance:
        '尝试分析其他观察性研究，练习识别混淆因素。建议从日常新闻中的健康建议开始。',
    },
  ],
};

/**
 * Invalid concepts content (too short)
 */
const invalidConceptsContent: ConceptsContent = {
  intro: '简短引言', // Too short (< 200 chars)
  concepts: [
    {
      conceptId: 'test',
      name: '测试概念',
      coreIdea: '短', // Too short (< 50 chars)
      definition: '很短的定义', // Too short (< 100 chars)
      whyImportant: '重要',
      criticalThinkingFramework: {
        step1: '步骤1',
        step2: '步骤2',
        step3: '步骤3',
      },
      keyPoints: ['点1'],
      commonMisconceptions: [
        // Only 1, need ≥2
        {
          misconception: '误区',
          truth: '真相',
          realExample: '例子',
        },
      ],
      realWorldExamples: [
        // Only 1, need ≥2
        {
          scenario: '场景',
          application: '应用',
          outcome: '结果',
        },
      ],
      visualizationGuide: {
        type: 'flowchart',
        description: '描述',
        structure: {},
      },
    },
  ],
};

/**
 * Invalid models content (step description too short)
 */
const invalidModelsContent: ModelsContent = {
  intro: '这是一个符合长度要求的引言，介绍思维模型的重要性和应用场景。',
  models: [
    {
      modelId: 'test-model',
      name: '测试模型',
      purpose: '这是一个符合长度要求的目的描述，说明模型的用途',
      description: '这是一个符合长度要求的描述，详细说明模型的背景、原理和应用。' + '。'.repeat(50),
      coreLogic: {
        principle: '核心原理',
        whenWorks: '有效场景',
        whenFails: '失效场景',
      },
      structure: {
        type: 'linear',
        components: ['组件1', '组件2'],
        relationships: '关系说明',
      },
      steps: [
        {
          stepNumber: 1,
          title: '步骤1',
          description: '这个描述太短了', // **CRITICAL ERROR**: < 300 chars
          keyThinkingPoints: ['点1', '点2', '点3'],
          commonPitfalls: [
            { mistake: '错误1', example: '例子', correction: '纠正' },
            { mistake: '错误2', example: '例子', correction: '纠正' },
          ],
          practicalExample: '这是一个符合长度要求的实际应用示例，说明如何在真实场景中使用这个步骤。',
          tips: '提示',
        },
      ],
      visualization: {
        type: 'flowchart',
        description: '可视化描述',
        legend: '图例',
        stepByStepDrawing: ['步骤1', '步骤2'],
      },
      whenToUse: '这是一个符合长度要求的适用场景说明，描述在什么情况下应该使用这个模型。',
      limitations: '这是一个符合长度要求的局限性说明。',
      fullApplicationExample: {
        scenario: '这是一个符合长度要求的场景描述。' + '详细内容。'.repeat(20),
        stepByStepApplication: [
          {
            step: 1,
            action: '行动',
            thinking: '思考',
            output: '输出',
          },
        ],
        outcome: '这是一个符合长度要求的结果描述。' + '详细内容。'.repeat(10),
      },
    },
  ],
};

// ==================== Tests ====================

console.log('='.repeat(60));
console.log('Theory Content V3 Validator - Test Suite');
console.log('='.repeat(60));

// Test 1: Valid content should pass
console.log('\n[Test 1] Valid content validation');
console.log('-'.repeat(60));
const result1 = validateTheoryContent(
  validConceptsContent,
  validModelsContent,
  validDemonstrationsContent
);
console.log('✓ Validation Result:', result1.isValid ? 'PASS' : 'FAIL');
console.log('✓ Score:', result1.score);
console.log('✓ Errors:', result1.errors.length);
console.log('✓ Warnings:', result1.warnings.length);
if (result1.metrics) {
  console.log('✓ Quality Metrics:');
  console.log('  - Concepts Score:', result1.metrics.conceptsScore);
  console.log('  - Models Score:', result1.metrics.modelsScore);
  console.log('  - Demonstrations Score:', result1.metrics.demonstrationsScore);
  console.log('  - Total Words:', result1.metrics.totalWords);
  console.log('  - Structure Score:', result1.metrics.structureScore);
  console.log('  - Overall Quality Score:', result1.metrics.overallQualityScore);
}

// Test 2: Invalid concepts should fail
console.log('\n[Test 2] Invalid concepts validation');
console.log('-'.repeat(60));
const result2 = validateTheoryContent(
  invalidConceptsContent,
  validModelsContent,
  validDemonstrationsContent
);
console.log('✓ Validation Result:', result2.isValid ? 'PASS (unexpected!)' : 'FAIL (expected)');
console.log('✓ Score:', result2.score);
console.log('✓ Errors:', result2.errors.length);
console.log('✓ Error Messages:');
result2.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));

// Test 3: Invalid models (step description too short) should fail
console.log('\n[Test 3] Invalid models validation (step description too short)');
console.log('-'.repeat(60));
const result3 = validateTheoryContent(
  validConceptsContent,
  invalidModelsContent,
  validDemonstrationsContent
);
console.log('✓ Validation Result:', result3.isValid ? 'PASS (unexpected!)' : 'FAIL (expected)');
console.log('✓ Score:', result3.score);
console.log('✓ Errors:', result3.errors.length);
console.log('✓ Error Messages:');
result3.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));

// Test 4: Check critical requirements
console.log('\n[Test 4] Critical Requirements Validation');
console.log('-'.repeat(60));
const criticalChecks = {
  '步骤描述≥300字': result3.errors.some(err => err.includes('**要求≥300字**')),
  '理论关联标注': result2.errors.some(err => err.includes('theoreticalFoundation')),
  '概念应用标注': result2.errors.some(err => err.includes('conceptApplied')),
};
console.log('Critical Requirements Detection:');
Object.entries(criticalChecks).forEach(([check, detected]) => {
  console.log(`  ${detected ? '✓' : '✗'} ${check}: ${detected ? 'Detected' : 'Not Detected'}`);
});

console.log('\n' + '='.repeat(60));
console.log('Test Suite Completed');
console.log('='.repeat(60));
console.log('\nSummary:');
console.log(`- Test 1 (Valid Content): ${result1.isValid ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`- Test 2 (Invalid Concepts): ${!result2.isValid ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`- Test 3 (Invalid Models): ${!result3.isValid ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`- Test 4 (Critical Checks): ${Object.values(criticalChecks).every(v => v) ? 'PASS ✓' : 'FAIL ✗'}`);
