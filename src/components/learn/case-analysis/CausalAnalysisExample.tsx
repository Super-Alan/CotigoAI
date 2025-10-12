'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProblemAnalysisCard from './ProblemAnalysisCard'
import ThinkingFrameworkCard from './ThinkingFrameworkCard'
import CausalChainDiagram from './CausalChainDiagram'
import MindMapVisualization from './MindMapVisualization'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react'

export default function CausalAnalysisExample() {
  // 示例数据：社交媒体对青少年心理健康的影响
  const exampleData = {
    topic: '社交媒体对青少年心理健康的影响',
    context: '随着社交媒体的普及，越来越多的研究关注其对青少年心理健康的影响。许多家长和教育者担心社交媒体使用可能导致焦虑、抑郁等心理问题，但也有研究指出社交媒体可以提供社会支持和归属感。',
    difficulty: 'intermediate',
    tags: ['心理健康', '社交媒体', '青少年', '因果关系'],
    keyQuestions: [
      '社交媒体使用与心理健康问题之间是相关关系还是因果关系？',
      '如何区分社交媒体是原因、结果，还是与其他因素共同作用？',
      '个体差异如何影响社交媒体的效应？'
    ],
    learningObjectives: [
      '理解相关性与因果性的区别',
      '识别影响心理健康的多重因素',
      '发展批判性评估研究的能力',
      '学会控制混淆变量的方法'
    ]
  }

  // 思维框架
  const thinkingFramework = {
    coreChallenge: '如何区分相关性和因果性，避免将共同发生的现象误判为因果关系',
    commonPitfalls: [
      '混淆相关性与因果性 - 仅因为两个变量同时发生就认为存在因果关系',
      '忽略第三变量 - 未考虑可能同时影响两个变量的外部因素',
      '过度简化复杂现象 - 将多因素问题归结为单一原因',
      '忽视反向因果 - 未考虑效应也可能是原因的可能性',
      '忽略个体差异 - 假设所有人受影响的方式相同'
    ],
    excellentIndicators: [
      '明确区分相关性和因果性，并说明判断依据',
      '考虑多重因素和潜在的混淆变量',
      '引用实证研究支持观点',
      '承认现象的复杂性和不确定性',
      '提出可验证的假设和研究设计'
    ],
    thinkingSteps: [
      {
        step: 1,
        title: '识别相关性',
        description: '首先观察和记录变量之间的关联模式',
        keyPoints: [
          '收集数据：社交媒体使用时长、心理健康指标',
          '计算相关系数：量化变量间的关联强度',
          '注意：相关不等于因果'
        ]
      },
      {
        step: 2,
        title: '寻找潜在混淆因素',
        description: '识别可能同时影响两个变量的第三方因素',
        keyPoints: [
          '家庭环境：父母关系、家庭支持',
          '学业压力：考试焦虑、学习负担',
          '人格特质：内向性格、神经质倾向',
          '同伴关系：线下社交质量'
        ]
      },
      {
        step: 3,
        title: '确立时间顺序',
        description: '确认原因必须在结果之前发生',
        keyPoints: [
          '纵向研究：跟踪同一群体随时间的变化',
          '基线测量：在社交媒体使用前测量心理健康',
          '排除反向因果：心理问题是否导致更多社交媒体使用'
        ]
      },
      {
        step: 4,
        title: '寻找机制解释',
        description: '建立从原因到结果的逻辑链条',
        keyPoints: [
          '社会比较：频繁比较导致自尊下降',
          '睡眠剥夺：夜间使用影响睡眠质量',
          '网络欺凌：负面互动增加焦虑',
          'FOMO效应：害怕错过引发焦虑情绪'
        ]
      },
      {
        step: 5,
        title: '验证因果关系',
        description: '通过实验或准实验设计验证假设',
        keyPoints: [
          '随机对照实验：随机分配使用量',
          '自然实验：利用政策变化等外生事件',
          '剂量反应关系：使用量与效应成比例',
          '一致性检验：多项研究得出相同结论'
        ]
      }
    ]
  }

  // 因果链图示例
  const causalChain = {
    nodes: [
      {
        id: 'social_media_use',
        label: '社交媒体使用',
        type: 'cause' as const,
        description: '每日使用时长、使用频率、使用目的'
      },
      {
        id: 'social_comparison',
        label: '社会比较',
        type: 'mediator' as const,
        description: '与他人比较外貌、成就、生活方式'
      },
      {
        id: 'self_esteem',
        label: '自尊降低',
        type: 'mediator' as const,
        description: '对自我价值感的负面评价'
      },
      {
        id: 'mental_health',
        label: '心理健康问题',
        type: 'effect' as const,
        description: '焦虑、抑郁、孤独感'
      }
    ],
    links: [
      { from: 'social_media_use', to: 'social_comparison', strength: 'strong' as const, label: '引发比较' },
      { from: 'social_comparison', to: 'self_esteem', strength: 'moderate' as const, label: '影响自我认知' },
      { from: 'self_esteem', to: 'mental_health', strength: 'strong' as const, label: '导致心理问题' }
    ]
  }

  // 思维导图数据
  const mindMapData: any = {
    id: 'root',
    label: '社交媒体与心理健康',
    level: 0,
    children: [
      {
        id: 'correlation',
        label: '观察到的相关性',
        level: 1,
        children: [
          { id: 'cor1', label: '使用时长与焦虑正相关', level: 2 },
          { id: 'cor2', label: '频繁使用与抑郁相关', level: 2 }
        ]
      },
      {
        id: 'confounds',
        label: '潜在混淆因素',
        level: 1,
        children: [
          { id: 'conf1', label: '家庭环境', level: 2 },
          { id: 'conf2', label: '学业压力', level: 2 },
          { id: 'conf3', label: '人格特质', level: 2 }
        ]
      },
      {
        id: 'mechanisms',
        label: '可能的因果机制',
        level: 1,
        children: [
          { id: 'mech1', label: '社会比较 → 自尊下降', level: 2 },
          { id: 'mech2', label: '睡眠剥夺 → 情绪问题', level: 2 },
          { id: 'mech3', label: '网络欺凌 → 焦虑抑郁', level: 2 }
        ]
      },
      {
        id: 'evidence',
        label: '证据需求',
        level: 1,
        children: [
          { id: 'ev1', label: '纵向研究', level: 2 },
          { id: 'ev2', label: '实验验证', level: 2 },
          { id: 'ev3', label: '剂量反应关系', level: 2 }
        ]
      }
    ]
  }

  // 好的回答示例
  const goodExample = `
**分析思路：**

这个问题需要谨慎区分相关性和因果性。现有研究确实发现社交媒体使用与青少年心理健康问题之间存在正相关，但这并不直接证明因果关系。

**潜在混淆因素：**
1. **反向因果**：可能是心理健康较差的青少年更倾向于使用社交媒体寻求安慰
2. **第三变量**：家庭环境、学业压力可能同时影响社交媒体使用和心理健康
3. **个体差异**：人格特质（如神经质）可能使某些人更容易受社交媒体负面影响

**因果机制假设：**
- 社会比较：频繁接触他人"完美"生活导致自我价值感下降
- 睡眠剥夺：夜间使用影响睡眠质量，进而影响心理健康
- FOMO效应：害怕错过（Fear of Missing Out）引发焦虑

**需要的证据：**
1. 纵向研究证明时间顺序
2. 实验研究控制混淆变量
3. 机制研究揭示中介过程

**结论：**
当前证据表明存在相关性，但因果关系尚未完全确立。需要更多高质量研究来验证具体的因果机制。
  `

  // 需要改进的回答示例
  const poorExample = `
社交媒体肯定会导致青少年抑郁和焦虑。我身边很多朋友都因为刷社交媒体而感到焦虑，这就是证据。年轻人应该完全禁止使用社交媒体。
  `

  const poorExampleIssues = [
    '混淆相关性与因果性：仅凭观察就断定因果关系',
    '过度简化：忽略个体差异和其他可能因素',
    '缺乏证据支持：个人经验不能代表普遍规律',
    '极端化结论：提出不切实际的建议',
    '忽视复杂性：未考虑社交媒体的积极作用'
  ]

  return (
    <div className="space-y-8">
      {/* 问题分析 */}
      <ProblemAnalysisCard {...exampleData} />

      {/* 主要内容标签页 */}
      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="framework">思维框架</TabsTrigger>
          <TabsTrigger value="visual">可视化分析</TabsTrigger>
          <TabsTrigger value="examples">示例对比</TabsTrigger>
          <TabsTrigger value="practice">练习建议</TabsTrigger>
        </TabsList>

        {/* 思维框架 */}
        <TabsContent value="framework" className="space-y-6">
          <ThinkingFrameworkCard {...thinkingFramework} />
        </TabsContent>

        {/* 可视化分析 */}
        <TabsContent value="visual" className="space-y-6">
          {/* 因果链图 */}
          <CausalChainDiagram
            nodes={causalChain.nodes}
            links={causalChain.links}
            title="可能的因果机制路径"
          />

          {/* 思维导图 */}
          <MindMapVisualization
            title="多维归因与利弊权衡思维导图"
            rootNode={mindMapData}
          />

          {/* 补充说明 */}
          <Card className="p-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">💡 如何使用可视化工具？</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>因果链图</strong>：帮助你理解从原因到结果的完整路径，识别中介变量和调节变量。</p>
              <p><strong>思维导图</strong>：帮助你系统性地组织思考维度，确保不遗漏重要因素。</p>
              <p><strong>使用建议</strong>：先用思维导图进行发散思考，再用因果链图聚焦关键机制。</p>
            </div>
          </Card>
        </TabsContent>

        {/* 示例对比 */}
        <TabsContent value="examples" className="space-y-6">
          {/* 优秀示例 */}
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">优秀回答示例</h3>
              <Badge className="bg-green-600">推荐学习</Badge>
            </div>
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg">
              <div className="whitespace-pre-line text-gray-700">{goodExample}</div>
            </div>
            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
              <div className="font-semibold text-green-800 mb-2">✅ 优点分析：</div>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 明确区分相关性和因果性</li>
                <li>• 考虑了多个潜在混淆因素</li>
                <li>• 提出了可验证的因果机制假设</li>
                <li>• 承认证据的局限性</li>
                <li>• 结论谨慎且有科学依据</li>
              </ul>
            </div>
          </Card>

          {/* 需要改进的示例 */}
          <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">需要改进的回答</h3>
              <Badge variant="destructive">避免此类错误</Badge>
            </div>
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg">
              <div className="whitespace-pre-line text-gray-700">{poorExample}</div>
            </div>
            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
              <div className="font-semibold text-red-800 mb-2">❌ 主要问题：</div>
              <ul className="space-y-1 text-sm text-gray-700">
                {poorExampleIssues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* 练习建议 */}
        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-900">如何练习多维归因与利弊权衡思维？</h3>
            </div>

            <div className="space-y-6">
              {/* 练习步骤 */}
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📝 练习步骤</h4>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div className="flex-1">
                      <strong>选择日常现象：</strong>找一个你感兴趣的相关性现象（如"运动与健康"、"教育与收入"）
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div className="flex-1">
                      <strong>列出混淆因素：</strong>至少找出3个可能的第三变量
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div className="flex-1">
                      <strong>绘制因果链：</strong>画出从原因到结果的可能路径
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <div className="flex-1">
                      <strong>设计验证方法：</strong>想想如何用实验或研究验证你的假设
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    <div className="flex-1">
                      <strong>批判性反思：</strong>检查自己的推理中是否存在常见陷阱
                    </div>
                  </li>
                </ol>
              </div>

              {/* 推荐资源 */}
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📚 延伸学习资源</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>书籍推荐：</strong>《赤裸裸的统计学》- 理解相关性与因果性</li>
                  <li>• <strong>在线课程：</strong>Coursera "因果推断导论"</li>
                  <li>• <strong>练习平台：</strong>在对话页面使用该主题进行苏格拉底式练习</li>
                  <li>• <strong>实践建议：</strong>每周分析一篇新闻报道中的因果声称</li>
                </ul>
              </div>

              {/* 常见错误提醒 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
                <h4 className="font-semibold text-yellow-900 mb-3">⚠️ 常见错误提醒</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• 看到相关性就急于下因果结论</li>
                  <li>• 忽略时间顺序（原因必须在结果之前）</li>
                  <li>• 过度简化复杂现象</li>
                  <li>• 忽视个体差异和情境因素</li>
                  <li>• 依赖个人经验而非系统证据</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
