'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Scale,
  Users
} from 'lucide-react'
import MindMapVisualization from './MindMapVisualization'
import { getQuestionsByDimension } from '@/data/hku-critical-thinking-questions'
import { PREMISE_CHALLENGE_PROMPT } from '@/lib/prompts/critical-thinking-prompts'

export default function PremiseChallengeExampleNew() {
  const questions = getQuestionsByDimension('premise_challenge')
  const selectedQuestion = questions[0] // 使用第一道题作为主要案例

  // 专业分析答案
  const professionalAnalysis = {
    overview: `这是一个典型的教育决策问题，核心在于识别并挑战"大学排名=教育质量=就业前景"这一线性假设。问题的复杂性在于它涉及多个隐含前提、价值判断和个体差异因素。`,

    hiddenPremises: [
      {
        premise: '大学排名准确反映教育质量',
        challenge: 'QS排名侧重学术研究和国际化，对教学质量和学生体验的权重较低。对于艺术设计专业，专业排名和业界声誉可能更重要。',
        validity: '部分成立'
      },
      {
        premise: '高排名大学适合所有学生',
        challenge: '忽略了学生个体差异、专业匹配度、学习风格等因素。名校的竞争压力可能不适合所有学生。',
        validity: '弱'
      },
      {
        premise: '就业前景主要取决于大学排名',
        challenge: '对创意产业而言，作品集质量、实习经验、行业人脉可能比学校排名更重要。',
        validity: '在某些行业成立，在创意产业较弱'
      },
      {
        premise: '教育投资应该"不惜代价"',
        challenge: '忽略了机会成本、家庭财务压力、学生心理负担。过高的经济压力可能影响学习体验和家庭关系。',
        validity: '不合理'
      }
    ],

    reframedPerspectives: [
      {
        title: '从"最好的大学"到"最适合的大学"',
        description: '考虑学生兴趣（创意设计）、专业排名（150名大学设计专业著名）、学习风格、经济承受力等多维度因素。',
        icon: Target
      },
      {
        title: '从"短期投资"到"长期发展"',
        description: '评估4年大学经历的整体价值，而非仅关注入学时的排名。包括学习体验、人际网络、心理健康、职业准备等。',
        icon: TrendingUp
      },
      {
        title: '从"单一指标"到"多元评估"',
        description: '构建包含专业实力、师资配置、设施资源、业界联系、校友网络、地理位置等的综合评估框架。',
        icon: Scale
      },
      {
        title: '从"家长决策"到"共同探索"',
        description: '将决策过程视为家庭对话和学生自我认识的机会，培养学生的决策能力和自主性。',
        icon: Users
      }
    ],

    quantitativeAnalysis: {
      shortTermCosts: [
        { item: '学费差异', amount: '15万港币/年 × 4年 = 60万港币' },
        { item: '生活成本', amount: '排名50大学通常位于高消费城市，额外20万港币' },
        { item: '机会成本', amount: '15万港币可用于作品集开发、海外游学、设备投资' }
      ],
      longTermBenefits: [
        { item: '150名大学', benefit: '专业声誉强，业界认可度高，就业率85%' },
        { item: '50名大学', benefit: '综合排名优势，学术资源丰富，就业率82%（设计专业）' }
      ],
      riskFactors: [
        { risk: '经济压力', impact: '家庭年收入50万，学费35万占比70%，可能影响生活质量和学生心理' },
        { risk: '专业不匹配', impact: '综合性大学设计专业可能不如专业院校' },
        { risk: '竞争压力', impact: '名校竞争激烈，可能影响创作自由和心理健康' }
      ]
    },

    recommendations: [
      {
        principle: '专业优先原则',
        action: '优先选择设计专业排名高、业界认可的学校，而非综合排名'
      },
      {
        principle: '经济可持续性',
        action: '确保教育投资不会对家庭造成过度负担，保留应急资金'
      },
      {
        principle: '学生中心',
        action: '让学生参与决策，访问校园，与在校生交流，做出informed choice'
      },
      {
        principle: '多元路径',
        action: '考虑"150名大学本科 + 50名大学研究生"的渐进路径'
      }
    ]
  }

  // 思维导图数据
  const mindmapData = {
    central: '大学选择的前提挑战',
    branches: [
      {
        topic: '隐含前提识别',
        color: 'blue',
        subtopics: [
          '排名=质量假设',
          '质量=就业假设',
          '名校适合所有人',
          '不惜代价值得'
        ]
      },
      {
        topic: '前提质疑',
        color: 'red',
        subtopics: [
          '排名指标的局限性',
          '专业差异性',
          '个体匹配度',
          '经济承受力'
        ]
      },
      {
        topic: '重新框定',
        color: 'green',
        subtopics: [
          '最适合>最好',
          '长期>短期',
          '多元>单一',
          '共同探索>家长决策'
        ]
      },
      {
        topic: '综合决策',
        color: 'purple',
        subtopics: [
          '专业实力评估',
          '成本效益分析',
          '风险评估',
          '多元路径规划'
        ]
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* 问题卡片 */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-xl">
                  {selectedQuestion.title}
                </CardTitle>
                <Badge variant="outline" className="ml-2">
                  HKU面试题
                </Badge>
                <Badge variant="secondary">中等难度</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedQuestion.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 案例情境</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
                {selectedQuestion.scenario}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">🎯 关键思考问题</h4>
              <ul className="space-y-2">
                {selectedQuestion.keyQuestions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-600 font-semibold">{index + 1}.</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>真实世界背景：</strong>{selectedQuestion.realWorldContext}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* 分析标签页 */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">深度分析</TabsTrigger>
          <TabsTrigger value="premises">前提识别</TabsTrigger>
          <TabsTrigger value="reframe">重新框定</TabsTrigger>
          <TabsTrigger value="mindmap">思维导图</TabsTrigger>
          <TabsTrigger value="recommendations">行动建议</TabsTrigger>
        </TabsList>

        {/* 深度分析 */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                问题概述与核心挑战
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {professionalAnalysis.overview}
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 核心挑战</h4>
                <p className="text-blue-800 text-sm">
                  {PREMISE_CHALLENGE_PROMPT.systemPrompt.split('\n')[1]}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 量化分析框架</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-sm mb-2 text-red-600">短期成本</h5>
                    <ul className="space-y-2 text-sm">
                      {professionalAnalysis.quantitativeAnalysis.shortTermCosts.map((cost, index) => (
                        <li key={index}>
                          <strong>{cost.item}:</strong> {cost.amount}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold text-sm mb-2 text-green-600">长期收益对比</h5>
                    <ul className="space-y-2 text-sm">
                      {professionalAnalysis.quantitativeAnalysis.longTermBenefits.map((benefit, index) => (
                        <li key={index}>
                          <strong>{benefit.item}:</strong> {benefit.benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  风险因素评估
                </h4>
                <div className="space-y-2">
                  {professionalAnalysis.quantitativeAnalysis.riskFactors.map((factor, index) => (
                    <div key={index} className="bg-orange-50 border-l-4 border-orange-400 p-3">
                      <div className="font-semibold text-sm text-orange-900">{factor.risk}</div>
                      <div className="text-sm text-orange-800 mt-1">{factor.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 前提识别 */}
        <TabsContent value="premises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>隐含前提的识别与质疑</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalAnalysis.hiddenPremises.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-purple-900">
                        前提 {index + 1}: {item.premise}
                      </h4>
                      <Badge
                        variant={
                          item.validity === '不合理' ? 'destructive' :
                          item.validity === '弱' ? 'secondary' :
                          item.validity === '部分成立' ? 'outline' : 'default'
                        }
                      >
                        {item.validity}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-3 rounded mt-2">
                      <p className="text-sm text-gray-700">
                        <strong>质疑：</strong>{item.challenge}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>关键洞察：</strong>
                  识别隐含前提是批判性思维的核心技能。很多看似合理的决策，其实建立在未经检验的假设之上。
                  通过系统性地识别和质疑这些前提，我们可以做出更加明智的决策。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 重新框定 */}
        <TabsContent value="reframe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>重新框定问题的四个视角</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professionalAnalysis.reframedPerspectives.map((perspective, index) => {
                  const Icon = perspective.icon
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-2">
                            {perspective.title}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {perspective.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  重新框定的价值
                </h4>
                <p className="text-sm text-green-800">
                  通过重新框定问题，我们从一个二元对立的困境（"要名校还是要省钱"）转变为一个多维度的优化问题
                  （"如何在多个目标之间找到最佳平衡"）。这不仅打开了更多可能性，也使决策更加理性和全面。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 思维导图 */}
        <TabsContent value="mindmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>前提挑战思维导图</CardTitle>
            </CardHeader>
            <CardContent>
              <MindMapVisualization
                title="前提挑战思维导图"
                rootNode={{
                  id: 'root',
                  label: mindmapData.central,
                  level: 0,
                  children: mindmapData.branches.map((branch, idx) => ({
                    id: `branch-${idx}`,
                    label: branch.topic,
                    level: 1,
                    color: `bg-${branch.color}-400 text-white`,
                    children: branch.subtopics.map((subtopic: string, subIdx: number) => ({
                      id: `subtopic-${idx}-${subIdx}`,
                      label: subtopic,
                      level: 2
                    }))
                  }))
                }}
              />

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {mindmapData.branches.map((branch, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-${branch.color}-100 flex items-center justify-center`}>
                      <span className={`text-${branch.color}-600 font-bold`}>{index + 1}</span>
                    </div>
                    <div className="font-semibold text-sm">{branch.topic}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {branch.subtopics.length} 个要点
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 行动建议 */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                具体行动建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-green-900 mb-1">
                      {index + 1}. {rec.principle}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {rec.action}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-semibold mb-3">🎓 批判性思维技能清单</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {[
                    '✓ 识别隐含前提的能力',
                    '✓ 质疑常规假设的勇气',
                    '✓ 重新框定问题的创造力',
                    '✓ 多维度评估的系统性',
                    '✓ 量化分析的工具使用',
                    '✓ 平衡多方利益的智慧',
                    '✓ 基于证据的理性决策',
                    '✓ 开放心态与持续反思'
                  ].map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 第二道练习题预览 */}
          {questions[1] && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  延伸练习：{questions[1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  {questions[1].scenario.substring(0, 200)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {questions[1].tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
