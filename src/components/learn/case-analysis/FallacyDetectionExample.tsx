'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProblemAnalysisCard from './ProblemAnalysisCard'
import ThinkingFrameworkCard from './ThinkingFrameworkCard'
import MindMapVisualization from './MindMapVisualization'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function FallacyDetectionExample() {
  const exampleData = {
    topic: '人工智能在医疗诊断中的伦理问题',
    context: 'AI诊断系统的准确率已经超过人类医生的平均水平，但同时也带来了责任归属、隐私保护、算法偏见等伦理挑战。如何在享受AI技术带来的效率提升的同时，确保医疗决策的伦理性和患者权益？',
    difficulty: 'advanced',
    tags: ['人工智能', '医疗伦理', '隐私保护', '责任归属'],
    keyQuestions: [
      '当AI诊断出错时，责任应该归谁？',
      '如何平衡技术效率与患者自主权？',
      '算法透明度与商业机密如何权衡？',
      '如何防止AI加剧医疗不平等？'
    ],
    learningObjectives: [
      '识别技术应用中的伦理问题',
      '学会应用伦理学原则',
      '发展负责任的技术思维',
      '掌握常见逻辑谬误的识别方法'
    ]
  }

  const thinkingFramework = {
    coreChallenge: '平衡技术效益与伦理风险，识别论证中的逻辑谬误和偏见',
    commonPitfalls: [
      '技术决定论谬误 - 认为技术发展必然是好的，不可阻挡',
      '诉诸后果谬误 - 仅因结果好就认为手段正当',
      '虚假二分法 - "要么接受AI要么落后"的极端选择',
      '诉诸权威 - "专家说AI没问题"就不再质疑',
      '滑坡谬误 - 夸大AI可能带来的负面后果链'
    ],
    excellentIndicators: [
      '识别并命名论证中的逻辑谬误',
      '应用伦理学原则（自主、善行、公正、不伤害）',
      '考虑多方利益相关者的视角',
      '提出平衡技术与伦理的具体方案',
      '承认复杂性，避免极端化结论'
    ],
    thinkingSteps: [
      {
        step: 1,
        title: '识别论证结构',
        description: '找出主张、前提和推理过程',
        keyPoints: [
          '主张：AI医疗诊断应该/不应该广泛应用',
          '前提：AI准确率高/存在伦理风险',
          '推理：从前提如何推导到结论？'
        ]
      },
      {
        step: 2,
        title: '检测常见谬误',
        description: '系统性地筛查各类逻辑谬误',
        keyPoints: [
          '形式谬误：三段论结构是否有效？',
          '非形式谬误：是否诉诸情感、权威、人身攻击？',
          '因果谬误：是否混淆相关性与因果性？',
          '统计谬误：样本是否有代表性？'
        ]
      },
      {
        step: 3,
        title: '应用伦理原则',
        description: '用生命伦理学四原则评估',
        keyPoints: [
          '自主原则：患者知情同意权是否得到尊重？',
          '善行原则：AI是否真正造福患者？',
          '不伤害原则：是否有风险管控机制？',
          '公正原则：技术是否加剧医疗不平等？'
        ]
      },
      {
        step: 4,
        title: '考察利益相关方',
        description: '多角度审视伦理冲突',
        keyPoints: [
          '患者：隐私、自主权、治疗效果',
          '医生：专业判断、法律责任',
          '医院：成本效益、声誉风险',
          '社会：公共卫生、资源分配'
        ]
      },
      {
        step: 5,
        title: '提出伦理框架',
        description: '设计平衡各方利益的机制',
        keyPoints: [
          '透明度要求：算法可解释性',
          '问责机制：明确责任主体',
          '监管框架：独立伦理审查',
          '补偿机制：错误诊断的救济途径'
        ]
      }
    ]
  }

  const mindMapData: any = {
    id: 'root',
    label: 'AI医疗伦理分析',
    level: 0,
    children: [
      {
        id: 'fallacies',
        label: '常见谬误',
        level: 1,
        children: [
          { id: 'f1', label: '技术决定论', level: 2 },
          { id: 'f2', label: '虚假二分法', level: 2 },
          { id: 'f3', label: '诉诸权威', level: 2 }
        ]
      },
      {
        id: 'principles',
        label: '伦理原则',
        level: 1,
        children: [
          { id: 'p1', label: '自主原则', level: 2 },
          { id: 'p2', label: '善行原则', level: 2 },
          { id: 'p3', label: '不伤害原则', level: 2 },
          { id: 'p4', label: '公正原则', level: 2 }
        ]
      },
      {
        id: 'stakeholders',
        label: '利益相关方',
        level: 1,
        children: [
          { id: 's1', label: '患者权益', level: 2 },
          { id: 's2', label: '医生责任', level: 2 },
          { id: 's3', label: '社会公平', level: 2 }
        ]
      },
      {
        id: 'solutions',
        label: '解决方案',
        level: 1,
        children: [
          { id: 'sol1', label: '算法透明化', level: 2 },
          { id: 'sol2', label: '伦理审查制度', level: 2 },
          { id: 'sol3', label: '人机协作模式', level: 2 }
        ]
      }
    ]
  }

  const fallacyExamples = [
    {
      name: '技术决定论',
      description: '认为技术进步必然是好的，不可阻挡',
      example: '"AI是未来趋势，我们必须接受，没有选择"',
      why_wrong: '忽视了技术应用需要伦理引导，人类有权选择如何使用技术',
      correct: '应该问：如何设计AI系统以符合伦理标准？'
    },
    {
      name: '虚假二分法',
      description: '将复杂问题简化为非此即彼的选择',
      example: '"要么拥抱AI医疗，要么被时代淘汰"',
      why_wrong: '忽视了有条件接受、渐进式改革等中间路径',
      correct: '可以在保障伦理的前提下逐步应用AI'
    },
    {
      name: '诉诸后果',
      description: '仅因结果好就认为手段正当',
      example: '"只要能提高诊断准确率，隐私问题可以让步"',
      why_wrong: '结果不能为不正当手段辩护（目的不能证明手段）',
      correct: '需要同时保障效果和过程的伦理性'
    },
    {
      name: '诉诸权威',
      description: '因为权威说了就认为正确',
      example: '"顶尖AI专家都说没问题，所以肯定安全"',
      why_wrong: '权威也可能有偏见或利益冲突，需要独立评估',
      correct: '审查专家论证的逻辑和证据，而非盲从'
    },
    {
      name: '滑坡谬误',
      description: '夸大连锁反应，制造恐慌',
      example: '"一旦允许AI诊断，最终医生会全部失业，人类沦为机器奴隶"',
      why_wrong: '未经论证地假设必然发生极端后果',
      correct: '理性评估风险，设计防范机制'
    }
  ]

  const goodExample = `
**谬误识别与伦理分析：**

这个问题常见的论证中包含多个逻辑谬误，需要逐一识别并纠正。

**常见谬误类型：**

1. **技术决定论谬误**
   论述："AI是医疗的未来，我们别无选择只能接受"
   问题：将技术发展视为不可抗力，忽视人类的主动选择权
   纠正：技术是工具，如何使用应由伦理原则引导

2. **虚假二分法**
   论述："要么接受AI医疗，要么停滞不前"
   问题：忽视了有条件接受、渐进改革等中间路径
   纠正：可以在严格伦理框架下逐步应用AI

3. **诉诸后果谬误**
   论述："只要能提高诊断准确率，隐私问题可以容忍"
   问题：结果不能为不正当手段辩护
   纠正：需同时保障效果和过程的伦理性

**应用伦理原则分析：**

- **自主原则**：患者有权知道是AI还是医生诊断，并选择是否接受
- **善行原则**：AI应真正造福患者，而非仅追求效率
- **不伤害原则**：建立错误补偿机制和风险预警系统
- **公正原则**：确保贫富地区都能平等获得技术

**责任归属方案：**
采用"分层责任模型"：
- AI开发商：算法缺陷责任
- 医疗机构：选用和监管责任
- 医生：最终决策责任
- 监管机构：事前审查和事后问责

结论：在严格伦理框架下发展AI医疗，而非盲目拥抱或全面拒绝。
  `

  const poorExample = `
AI医疗肯定有问题！如果AI误诊了怎么办？到时候没人负责，患者死了白死！而且AI会让医生失业，最终人类会被机器控制。专家都是拿了科技公司的钱，当然说好话。我坚决反对AI医疗！
  `

  return (
    <div className="space-y-8">
      <ProblemAnalysisCard {...exampleData} />

      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="framework">思维框架</TabsTrigger>
          <TabsTrigger value="fallacies">谬误图鉴</TabsTrigger>
          <TabsTrigger value="examples">示例对比</TabsTrigger>
          <TabsTrigger value="practice">检测训练</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          <ThinkingFrameworkCard {...thinkingFramework} />

          <MindMapVisualization
            title="谬误检测思维导图"
            rootNode={mindMapData}
          />
        </TabsContent>

        <TabsContent value="fallacies" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50">
            <h3 className="text-xl font-bold mb-6">常见逻辑谬误图鉴</h3>
            <div className="space-y-4">
              {fallacyExamples.map((fallacy, index) => (
                <Card key={index} className="p-5 bg-white border-2 hover:border-red-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{fallacy.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{fallacy.description}</p>

                      <div className="space-y-3">
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <div className="text-xs font-semibold text-red-800 mb-1">❌ 错误示例：</div>
                          <div className="text-sm text-gray-700 italic">"{fallacy.example}"</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs font-semibold text-gray-800 mb-1">🔍 为什么错？</div>
                          <div className="text-sm text-gray-700">{fallacy.why_wrong}</div>
                        </div>

                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <div className="text-xs font-semibold text-green-800 mb-1">✅ 正确思路：</div>
                          <div className="text-sm text-gray-700">{fallacy.correct}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">优秀回答示例</h3>
            </div>
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg">
              <div className="whitespace-pre-line text-gray-700">{goodExample}</div>
            </div>
            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
              <div className="font-semibold text-green-800 mb-2">✅ 优点：</div>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 系统性识别并命名各类谬误</li>
                <li>• 应用生命伦理学四原则</li>
                <li>• 提出具体的责任归属方案</li>
                <li>• 避免极端化结论</li>
                <li>• 平衡技术效益与伦理风险</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">需要改进的回答</h3>
            </div>
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg">
              <div className="whitespace-pre-line text-gray-700">{poorExample}</div>
            </div>
            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
              <div className="font-semibold text-red-800 mb-2">❌ 包含的谬误：</div>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>滑坡谬误：</strong>"AI误诊→没人负责→机器控制人类"</li>
                <li>• <strong>人身攻击：</strong>攻击专家的动机而非论证</li>
                <li>• <strong>诉诸恐惧：</strong>用恐怖场景代替理性分析</li>
                <li>• <strong>极端化：</strong>"坚决反对"不考虑中间方案</li>
                <li>• <strong>以偏概全：</strong>个别风险推广到全盘否定</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="text-xl font-bold mb-6">谬误检测训练方法</h3>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📋 系统化检测清单</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">论证的前提是否清晰？</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">推理过程是否逻辑严密？</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">是否存在诉诸情感而非理性？</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">是否存在人身攻击或诉诸权威？</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">是否有虚假二分法或滑坡推理？</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm">证据是否充分且可靠？</span>
                  </label>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 日常训练建议</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>每日一辩：</strong>分析一篇新闻评论，标记其中的谬误</li>
                  <li>• <strong>谬误日记：</strong>记录自己和他人的思维谬误</li>
                  <li>• <strong>角色扮演：</strong>故意使用谬误论证，然后自我纠正</li>
                  <li>• <strong>同伴互评：</strong>交换论证文本，互相识别谬误</li>
                  <li>• <strong>案例库积累：</strong>收集经典谬误案例作为参照</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
                <div className="font-semibold text-yellow-900 mb-2">💡 进阶技巧</div>
                <p className="text-sm text-gray-700">
                  高手不仅能识别谬误，还能理解<strong>为什么</strong>人们会陷入这些谬误。
                  思考：什么心理机制导致了这个谬误？如何帮助他人意识到？
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
