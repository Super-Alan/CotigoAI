'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProblemAnalysisCard from './ProblemAnalysisCard'
import ThinkingFrameworkCard from './ThinkingFrameworkCard'
import MindMapVisualization from './MindMapVisualization'
import { Card } from '@/components/ui/card'
import { RotateCcw, TrendingUp } from 'lucide-react'

export default function IterativeReflectionExample() {
  const exampleData = {
    topic: '如何提升批判性思维能力本身？',
    context: '批判性思维不是一蹴而就的技能，而是需要通过不断反思、调整、再实践的迭代过程来提升。如何建立自我反思的机制，从每次思考中学习和成长？',
    difficulty: 'intermediate',
    tags: ['元认知', '自我反思', '持续改进', '学习方法'],
    keyQuestions: [
      '如何评估自己的思维过程质量？',
      '从失败的推理中学到了什么？',
      '如何建立系统化的反思习惯？',
      '思维盲点如何通过反思发现？'
    ],
    learningObjectives: [
      '发展元认知能力（对思维的思维）',
      '建立迭代改进的思维习惯',
      '学会从错误中提取有价值的教训',
      '形成自我校正的思维模式'
    ]
  }

  const thinkingFramework = {
    coreChallenge: '如何跳出当前思维框架，从更高层次反思和改进自己的思考过程',
    commonPitfalls: [
      '自我确认偏差 - 只寻找支持自己的证据',
      '后见之明偏差 - 事后觉得结果本可预测',
      '防御性思维 - 拒绝承认错误',
      '表面反思 - 只反思结论而非思维过程',
      '缺乏行动 - 反思后不改变行为'
    ],
    excellentIndicators: [
      '主动识别自己的思维盲点',
      '记录和分析思维过程',
      '从失败中提取具体教训',
      '制定可操作的改进计划',
      '跟踪改进效果并持续调整'
    ],
    thinkingSteps: [
      {
        step: 1,
        title: '描述思维过程',
        description: '详细记录你是如何思考和得出结论的',
        keyPoints: [
          '使用的信息来源有哪些？',
          '采用了什么推理方法？',
          '做了哪些假设？',
          '考虑了哪些替代方案？'
        ]
      },
      {
        step: 2,
        title: '识别思维模式',
        description: '发现自己的思维习惯和倾向',
        keyPoints: [
          '我倾向于使用哪种思维方式？',
          '哪些类型的问题我处理得好/不好？',
          '我的思维盲点在哪里？',
          '什么情况下我会犯错？'
        ]
      },
      {
        step: 3,
        title: '评估思维质量',
        description: '批判性地审视思维过程的优劣',
        keyPoints: [
          '推理是否严密？',
          '证据是否充分？',
          '是否考虑了反面观点？',
          '结论是否过度自信？'
        ]
      },
      {
        step: 4,
        title: '提取具体教训',
        description: '从成功和失败中学习',
        keyPoints: [
          '这次做对/做错了什么？',
          '根本原因是什么？',
          '下次如何避免同样错误？',
          '哪些方法值得保留？'
        ]
      },
      {
        step: 5,
        title: '制定改进计划',
        description: '将反思转化为具体行动',
        keyPoints: [
          '设定具体的改进目标',
          '选择1-2个优先改进点',
          '设计练习方案',
          '建立反馈机制'
        ]
      },
      {
        step: 6,
        title: '跟踪与迭代',
        description: '持续监测进步并调整策略',
        keyPoints: [
          '定期回顾改进计划',
          '对比改进前后的表现',
          '根据反馈调整方法',
          '庆祝进步，保持动力'
        ]
      }
    ]
  }

  const mindMapData: any = {
    id: 'root',
    label: '迭代反思循环',
    level: 0,
    children: [
      {
        id: 'experience',
        label: '经历/实践',
        level: 1,
        children: [
          { id: 'e1', label: '解决实际问题', level: 2 },
          { id: 'e2', label: '得出结论', level: 2 }
        ]
      },
      {
        id: 'reflect',
        label: '反思',
        level: 1,
        children: [
          { id: 'r1', label: '描述思维过程', level: 2 },
          { id: 'r2', label: '评估质量', level: 2 },
          { id: 'r3', label: '识别模式', level: 2 }
        ]
      },
      {
        id: 'learn',
        label: '学习',
        level: 1,
        children: [
          { id: 'l1', label: '提取教训', level: 2 },
          { id: 'l2', label: '发现盲点', level: 2 },
          { id: 'l3', label: '形成洞察', level: 2 }
        ]
      },
      {
        id: 'improve',
        label: '改进',
        level: 1,
        children: [
          { id: 'i1', label: '制定计划', level: 2 },
          { id: 'i2', label: '调整策略', level: 2 },
          { id: 'i3', label: '应用到新情境', level: 2 }
        ]
      }
    ]
  }

  const reflectionTemplate = `
  ## 思维反思日志模板

  **日期：** ___________

  ### 1. 情境描述
  - 问题/任务是什么？
  - 涉及哪些领域？

  ### 2. 思维过程记录
  - 我的初步想法是什么？
  - 我收集了哪些信息？
  - 我使用了什么推理方法？
  - 我做了哪些假设？

  ### 3. 结果与评估
  - 我的结论是什么？
  - 实际结果如何？
  - 哪里做得好？
  - 哪里需要改进？

  ### 4. 反思与洞察
  - 我的思维盲点在哪里？
  - 犯了哪些思维谬误？
  - 忽略了什么重要因素？
  - 有什么意外发现？

  ### 5. 改进计划
  - 下次遇到类似问题时要注意什么？
  - 需要学习哪些新知识/技能？
  - 如何练习？
  `

  return (
    <div className="space-y-8">
      <ProblemAnalysisCard {...exampleData} />

      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="framework">思维框架</TabsTrigger>
          <TabsTrigger value="cycle">反思循环</TabsTrigger>
          <TabsTrigger value="template">反思模板</TabsTrigger>
          <TabsTrigger value="practice">实践指南</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          <ThinkingFrameworkCard {...thinkingFramework} />
        </TabsContent>

        <TabsContent value="cycle" className="space-y-6">
          <MindMapVisualization
            title="迭代反思循环（Kolb学习圈）"
            rootNode={mindMapData}
          />

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center space-x-3 mb-6">
              <RotateCcw className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold">迭代反思的四个阶段</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg">
                <div className="font-semibold text-blue-900 mb-3">1️⃣ 具体经验</div>
                <p className="text-sm text-gray-700 mb-3">
                  实际参与问题解决或决策制定，获得第一手经验。
                </p>
                <div className="text-xs text-gray-600">
                  关键：不要急于下结论，先完整经历过程
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="font-semibold text-green-900 mb-3">2️⃣ 反思观察</div>
                <p className="text-sm text-gray-700 mb-3">
                  从多个角度回顾经验，识别思维模式和决策过程。
                </p>
                <div className="text-xs text-gray-600">
                  关键：客观描述，避免自我辩护
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="font-semibold text-purple-900 mb-3">3️⃣ 抽象概念化</div>
                <p className="text-sm text-gray-700 mb-3">
                  提取普遍规律，形成新的理解和理论框架。
                </p>
                <div className="text-xs text-gray-600">
                  关键：从个案到一般，寻找模式
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="font-semibold text-orange-900 mb-3">4️⃣ 主动实验</div>
                <p className="text-sm text-gray-700 mb-3">
                  在新情境中测试改进后的方法，再次进入循环。
                </p>
                <div className="text-xs text-gray-600">
                  关键：勇于尝试，接受失败
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
              <p className="text-sm text-gray-700">
                <strong>螺旋式上升：</strong>每一轮循环都应该带来新的洞察，
                使下一轮的起点更高。关键是<strong>持续迭代</strong>而非一次性反思。
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <Card className="p-6 bg-white">
            <h3 className="text-xl font-bold mb-4">思维反思日志模板</h3>
            <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-700">{reflectionTemplate}</pre>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">📝 使用建议</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>定期填写：</strong>建议每周至少反思1-2次重要的思考过程</li>
                <li>• <strong>诚实记录：</strong>不要美化或隐藏失败，错误是最好的学习素材</li>
                <li>• <strong>具体化：</strong>避免"我需要更仔细"这种笼统表述，要具体到可操作层面</li>
                <li>• <strong>跟踪进步：</strong>定期回顾过去的日志，看看自己是否在进步</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="text-xl font-bold mb-6">迭代反思实践指南</h3>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 21天反思习惯养成计划</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-24 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                      第1-7天
                    </div>
                    <div className="flex-1 text-sm text-gray-700">
                      <strong>记录阶段：</strong>每天晚上花10分钟记录一次思维过程，不评判，只描述
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-24 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded">
                      第8-14天
                    </div>
                    <div className="flex-1 text-sm text-gray-700">
                      <strong>分析阶段：</strong>开始识别自己的思维模式和常见错误
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-24 bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded">
                      第15-21天
                    </div>
                    <div className="flex-1 text-sm text-gray-700">
                      <strong>改进阶段：</strong>选择1-2个优先改进点，有意识地练习新方法
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🔄 常见反思触发点</h4>
                <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <li>✓ 做出重要决策后</li>
                  <li>✓ 犯错或失败时</li>
                  <li>✓ 获得意外成功时</li>
                  <li>✓ 与他人观点冲突时</li>
                  <li>✓ 学习新概念后</li>
                  <li>✓ 每周/每月定期回顾</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
                <h4 className="font-semibold text-yellow-900 mb-3">⚠️ 避免反思的常见陷阱</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>过度自责：</strong>反思不是自我批判，而是客观分析</li>
                  <li>• <strong>表面化：</strong>"我错了"不是反思，"为什么错、如何改"才是</li>
                  <li>• <strong>只反思不行动：</strong>洞察必须转化为具体改变</li>
                  <li>• <strong>完美主义：</strong>期待立即彻底改变会导致挫败感</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📚 进阶学习资源</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>书籍：</strong>《思考，快与慢》（丹尼尔·卡尼曼）</li>
                  <li>• <strong>方法：</strong>AAR（After Action Review）军事反思法</li>
                  <li>• <strong>工具：</strong>成长型思维模式（Carol Dweck）</li>
                  <li>• <strong>社群：</strong>加入批判性思维学习小组，互相反馈</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
