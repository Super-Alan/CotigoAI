'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProblemAnalysisCard from './ProblemAnalysisCard'
import ThinkingFrameworkCard from './ThinkingFrameworkCard'
import MindMapVisualization from './MindMapVisualization'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, Lightbulb, Zap } from 'lucide-react'

export default function ConnectionTransferExample() {
  const exampleData = {
    topic: '如何将批判性思维应用到不同领域？',
    context: '批判性思维的真正价值在于跨领域迁移能力。一个在科学领域掌握的思维方法，能否应用到商业决策、人际关系、甚至艺术创作中？如何建立思维技能的"可迁移性"？',
    difficulty: 'advanced',
    tags: ['知识迁移', '跨领域应用', '类比思维', '抽象能力'],
    keyQuestions: [
      '如何识别不同领域问题的共同结构？',
      '什么样的思维原则具有普遍适用性？',
      '跨领域类比需要注意什么陷阱？',
      '如何训练抽象和具体之间的转换能力？'
    ],
    learningObjectives: [
      '发展跨领域问题解决能力',
      '掌握有效类比的方法',
      '提升抽象思维能力',
      '建立知识网络而非孤立知识点'
    ]
  }

  const thinkingFramework = {
    coreChallenge: '超越表面差异，识别深层结构相似性，实现知识和方法的跨领域迁移',
    commonPitfalls: [
      '表面类比 - 仅基于表面相似性而非结构相似性',
      '过度迁移 - 忽略领域特殊性，生搬硬套',
      '领域固化 - 认为每个领域的思维方式完全不同',
      '缺乏抽象 - 无法提取底层原理',
      '忽视边界条件 - 未考虑类比的适用范围'
    ],
    excellentIndicators: [
      '识别问题的抽象结构而非表面形式',
      '建立跨领域的概念映射',
      '明确指出类比的局限性',
      '创造性地应用熟悉领域的解决方案',
      '在多个领域间灵活切换视角'
    ],
    thinkingSteps: [
      {
        step: 1,
        title: '识别源领域的核心原理',
        description: '提取你已经掌握的思维方法的本质',
        keyPoints: [
          '这个方法解决的是什么类型的问题？',
          '核心机制是什么？',
          '成功的关键要素是什么？',
          '有哪些前提条件？'
        ]
      },
      {
        step: 2,
        title: '抽象化问题结构',
        description: '将具体问题转化为抽象框架',
        keyPoints: [
          '去除领域特定的术语',
          '识别变量之间的关系',
          '绘制问题的抽象结构图',
          '寻找功能等价性'
        ]
      },
      {
        step: 3,
        title: '寻找结构相似性',
        description: '在目标领域中找到对应的结构',
        keyPoints: [
          '目标领域的哪个问题有类似结构？',
          '变量和关系如何对应？',
          '约束条件是否相似？',
          '因果链是否可比？'
        ]
      },
      {
        step: 4,
        title: '建立映射关系',
        description: '在两个领域间建立概念对应',
        keyPoints: [
          '列出源领域和目标领域的要素对应表',
          '检查映射的一致性',
          '识别不能映射的部分',
          '调整以适应目标领域特点'
        ]
      },
      {
        step: 5,
        title: '测试与调整',
        description: '在小范围试验类比的有效性',
        keyPoints: [
          '选择简单案例先测试',
          '记录哪里有效、哪里失效',
          '根据反馈调整类比',
          '明确类比的适用边界'
        ]
      },
      {
        step: 6,
        title: '扩展应用',
        description: '将验证过的方法推广到更多情境',
        keyPoints: [
          '逐步增加复杂度',
          '持续监控适用性',
          '建立跨领域知识库',
          '记录成功和失败案例'
        ]
      }
    ]
  }

  const mindMapData: any = {
    id: 'root',
    label: '知识迁移网络',
    level: 0,
    children: [
      {
        id: 'source',
        label: '源领域（熟悉）',
        level: 1,
        children: [
          { id: 's1', label: '科学方法论', level: 2 },
          { id: 's2', label: '数学思维', level: 2 },
          { id: 's3', label: '商业分析', level: 2 }
        ]
      },
      {
        id: 'abstract',
        label: '抽象原理',
        level: 1,
        children: [
          { id: 'a1', label: '多维归因与利弊权衡', level: 2 },
          { id: 'a2', label: '系统思维', level: 2 },
          { id: 'a3', label: '概率推理', level: 2 }
        ]
      },
      {
        id: 'target',
        label: '目标领域（新）',
        level: 1,
        children: [
          { id: 't1', label: '人际关系', level: 2 },
          { id: 't2', label: '艺术创作', level: 2 },
          { id: 't3', label: '自我成长', level: 2 }
        ]
      },
      {
        id: 'bridge',
        label: '迁移桥梁',
        level: 1,
        children: [
          { id: 'b1', label: '类比映射', level: 2 },
          { id: 'b2', label: '结构识别', level: 2 },
          { id: 'b3', label: '创造性应用', level: 2 }
        ]
      }
    ]
  }

  const transferExamples = [
    {
      source: '科学实验方法',
      target: '人际关系改善',
      principle: '控制变量法',
      mapping: {
        hypothesis: '人际假设 → 科学假设',
        variable: '行为改变 → 实验变量',
        control: '保持其他因素不变',
        observation: '关系变化 → 实验结果'
      },
      application: '想改善与朋友的关系？像科学家一样：提出假设（如"主动联系会改善关系"），改变一个变量（增加联系频率），控制其他因素（交流方式保持不变），观察结果并调整。'
    },
    {
      source: '数学归纳法',
      target: '技能学习',
      principle: '从基础到复杂的递进',
      mapping: {
        base_case: '基础技能 → 基础情况',
        induction: '渐进练习 → 递推步骤',
        generalization: '融会贯通 → 一般结论'
      },
      application: '学习复杂技能时，先掌握最简单的版本（基础情况），然后每次增加一点难度（归纳步骤），最终掌握完整技能（一般性结论）。'
    },
    {
      source: '商业SWOT分析',
      target: '个人职业规划',
      principle: '全面评估内外因素',
      mapping: {
        strengths: '个人优势 → 企业优势',
        weaknesses: '待改进领域 → 企业劣势',
        opportunities: '职业机会 → 市场机会',
        threats: '外部挑战 → 竞争威胁'
      },
      application: '用SWOT框架分析自己：我的优势技能是什么？弱点在哪里？行业有哪些新机会？有什么外部威胁？据此制定职业发展策略。'
    }
  ]

  return (
    <div className="space-y-8">
      <ProblemAnalysisCard {...exampleData} />

      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="framework">思维框架</TabsTrigger>
          <TabsTrigger value="examples">迁移示例</TabsTrigger>
          <TabsTrigger value="visual">可视化网络</TabsTrigger>
          <TabsTrigger value="practice">训练方法</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          <ThinkingFrameworkCard {...thinkingFramework} />
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold mb-6">跨领域迁移示例</h3>

            <div className="space-y-6">
              {transferExamples.map((example, index) => (
                <Card key={index} className="p-6 bg-white border-2 hover:border-blue-300 transition-colors">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Link2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className="bg-blue-600">{example.source}</Badge>
                        <span className="text-gray-400">→</span>
                        <Badge className="bg-green-600">{example.target}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>核心原理：</strong>{example.principle}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">源领域概念</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {Object.entries(example.mapping).map(([key, value]) => {
                          const sourceValue = (value as string).split(' → ')[1] || value
                          return (
                            <li key={key} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span>{sourceValue as string}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">目标领域对应</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {Object.entries(example.mapping).map(([key, value]) => {
                          const targetValue = (value as string).split(' → ')[0] || value
                          return (
                            <li key={key} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              <span>{targetValue as string}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-purple-900 mb-1">实际应用</div>
                        <p className="text-sm text-gray-700">{example.application}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <MindMapVisualization
            title="知识迁移网络图"
            rootNode={mindMapData}
          />

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold">迁移能力层级</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className="bg-gray-400">Level 1</Badge>
                  <span className="font-semibold">近迁移</span>
                </div>
                <p className="text-sm text-gray-700">
                  在相似情境中应用相同方法。例如：数学题型的举一反三。
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className="bg-blue-500">Level 2</Badge>
                  <span className="font-semibold">中等迁移</span>
                </div>
                <p className="text-sm text-gray-700">
                  跨子领域应用。例如：将物理学的系统思维用于生物学。
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className="bg-purple-600">Level 3</Badge>
                  <span className="font-semibold">远迁移</span>
                </div>
                <p className="text-sm text-gray-700">
                  跨大领域应用。例如：将科学方法应用到人际关系。
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className="bg-orange-600">Level 4</Badge>
                  <span className="font-semibold">创造性迁移</span>
                </div>
                <p className="text-sm text-gray-700">
                  创新性地重组多个领域的知识。例如：仿生学（生物 + 工程）。
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>目标：</strong>通过刻意练习，逐步从Level 1提升到Level 4，
                最终形成跨领域的思维习惯。
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="text-xl font-bold mb-6">迁移能力训练方法</h3>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 三步迁移练习法</h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li>
                    <strong>步骤1：抽象化</strong> - 选择一个你熟悉领域的概念，用一句话概括其本质（不使用领域术语）
                  </li>
                  <li>
                    <strong>步骤2：寻找类比</strong> - 在至少3个不同领域中寻找结构相似的现象
                  </li>
                  <li>
                    <strong>步骤3：实际应用</strong> - 选择一个类比，设计一个小实验测试其有效性
                  </li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📚 每日迁移挑战</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="font-semibold w-20">周一：</span>
                    <span>找一个数学概念，应用到日常生活</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="font-semibold w-20">周二：</span>
                    <span>用商业思维分析一个非商业问题</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="font-semibold w-20">周三：</span>
                    <span>从自然界找一个现象，类比到社会</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="font-semibold w-20">周四：</span>
                    <span>用科学方法解决人际问题</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="font-semibold w-20">周五：</span>
                    <span>从艺术中学习，应用到技术领域</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🔍 迁移质量检查清单</h4>
                <div className="space-y-2">
                  {[
                    '是否识别了深层结构而非表面相似？',
                    '映射关系是否一致？',
                    '是否考虑了目标领域的特殊性？',
                    '类比的边界和局限性是什么？',
                    '是否可以用简单案例验证？'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
                <div className="font-semibold text-yellow-900 mb-2">💡 高手建议</div>
                <p className="text-sm text-gray-700 mb-2">
                  真正的迁移高手会建立"思维模型库"：
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• 收集各领域的核心思维模型</li>
                  <li>• 识别模型的抽象结构</li>
                  <li>• 记录成功和失败的迁移案例</li>
                  <li>• 定期回顾和更新模型库</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
