'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProblemAnalysisCard from './ProblemAnalysisCard'
import ThinkingFrameworkCard from './ThinkingFrameworkCard'
import MindMapVisualization from './MindMapVisualization'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Scale, TrendingUp } from 'lucide-react'

export default function PremiseChallengeExample() {
  const exampleData = {
    topic: '气候变化的经济成本与环保政策的权衡',
    context: '各国政府在制定环保政策时需要平衡经济发展与环境保护。一方面，环保政策可能增加企业成本，影响短期经济增长；另一方面，不作为将导致长期巨大的气候损失。如何在这两者之间做出明智的权衡？',
    difficulty: 'advanced',
    tags: ['气候变化', '经济政策', '环境保护', '成本效益'],
    keyQuestions: [
      '环保政策的经济成本如何量化？',
      '气候变化的长期损失如何评估？',
      '短期成本与长期收益如何平衡？',
      '不同利益相关方的诉求如何协调？'
    ],
    learningObjectives: [
      '理解环境政策的经济学原理',
      '学会权衡短期成本与长期收益',
      '发展政策分析思维',
      '掌握前提假设的识别与质疑方法'
    ]
  }

  const thinkingFramework = {
    coreChallenge: '如何量化长期环境效益与短期经济成本，挑战"经济发展必然与环保对立"的隐含前提',
    commonPitfalls: [
      '只考虑短期成本，忽视长期收益 - 近视偏差',
      '假设技术不变 - 忽略绿色创新的可能性',
      '忽略外部性 - 未将环境成本内化到经济账本',
      '零和思维 - 认为经济与环保不可兼得',
      '忽视分配问题 - 未考虑政策对不同群体的差异化影响'
    ],
    excellentIndicators: [
      '识别并质疑"经济vs环保"二元对立的隐含前提',
      '采用长期视角，考虑代际公平',
      '进行量化分析，使用贴现率等工具',
      '考虑技术进步和创新的潜力',
      '平衡多方利益，提出可行方案'
    ],
    thinkingSteps: [
      {
        step: 1,
        title: '识别隐含前提',
        description: '找出论证中未明说但至关重要的假设',
        keyPoints: [
          '前提1："经济增长"与"环境保护"必然对立',
          '前提2：短期GDP增长比长期可持续更重要',
          '前提3：技术水平保持不变',
          '前提4：市场能自发解决环境问题'
        ]
      },
      {
        step: 2,
        title: '质疑前提的合理性',
        description: '批判性地审视这些前提是否站得住脚',
        keyPoints: [
          '绿色经济可以创造新就业（可再生能源行业）',
          '不作为的成本可能更高（极端气候事件损失）',
          '技术进步可降低减排成本（太阳能成本下降90%）',
          '市场失灵需要政府干预（碳定价机制）'
        ]
      },
      {
        step: 3,
        title: '重新框定问题',
        description: '从对立转向协同，寻找双赢方案',
        keyPoints: [
          '从"要么经济要么环保"转向"如何实现绿色增长"',
          '从"成本负担"转向"投资机遇"',
          '从"当代vs后代"转向"代际公平与可持续"',
          '从"全球问题"转向"本地行动与全球治理"'
        ]
      },
      {
        step: 4,
        title: '量化分析与比较',
        description: '用数据和模型支持论证',
        keyPoints: [
          '成本效益分析：计算净现值（NPV）',
          '社会贴现率选择：反映代际伦理立场',
          '情景分析：基准、2°C、1.5°C情景对比',
          '敏感性分析：测试关键参数变化的影响'
        ]
      },
      {
        step: 5,
        title: '综合多方视角',
        description: '考虑不同利益相关方的诉求',
        keyPoints: [
          '发达国家：历史责任vs技术优势',
          '发展中国家：发展权vs气候脆弱性',
          '企业：合规成本vs市场机遇',
          '公民：生活成本vs环境质量'
        ]
      }
    ]
  }

  const mindMapData: any = {
    id: 'root',
    label: '环保政策权衡分析',
    level: 0,
    children: [
      {
        id: 'premises',
        label: '隐含前提识别',
        level: 1,
        children: [
          { id: 'p1', label: '经济vs环保对立？', level: 2 },
          { id: 'p2', label: '短期优先？', level: 2 },
          { id: 'p3', label: '技术固定？', level: 2 }
        ]
      },
      {
        id: 'costs',
        label: '短期成本',
        level: 1,
        children: [
          { id: 'c1', label: '企业转型成本', level: 2 },
          { id: 'c2', label: '能源价格上涨', level: 2 },
          { id: 'c3', label: '部分行业失业', level: 2 }
        ]
      },
      {
        id: 'benefits',
        label: '长期收益',
        level: 1,
        children: [
          { id: 'b1', label: '避免气候灾难损失', level: 2 },
          { id: 'b2', label: '健康收益（减少污染）', level: 2 },
          { id: 'b3', label: '绿色产业新机遇', level: 2 }
        ]
      },
      {
        id: 'reframe',
        label: '重新框定',
        level: 1,
        children: [
          { id: 'r1', label: '绿色增长模式', level: 2 },
          { id: 'r2', label: '技术创新驱动', level: 2 },
          { id: 'r3', label: '公正转型机制', level: 2 }
        ]
      }
    ]
  }

  const goodExample = `
**前提识别与挑战：**

这个问题的讨论往往基于一个隐含前提：经济发展与环境保护是零和博弈。但这个前提值得深入质疑。

**质疑核心前提：**

1. **"经济vs环保"的二元对立假设**
   - 反例：可再生能源行业创造数百万就业岗位
   - 数据：2020年全球绿色经济产值超4万亿美元
   - 结论：绿色经济本身就是经济增长新引擎

2. **"短期成本必然大于长期收益"的假设**
   - 反思：不作为的成本如何？
   - 数据：世界银行估计，气候变化可能使1.3亿人陷入贫困（2030年）
   - 结论：及早行动的成本远低于后期补救

3. **"技术水平固定"的假设**
   - 反例：太阳能成本10年下降90%
   - 趋势：学习曲线效应使绿色技术持续降价
   - 结论：等待技术成熟 vs 主动投资推动创新

**重新框定问题：**
不是"要不要环保"，而是"如何实现公正、高效的绿色转型"：
- 碳税收入用于补贴受影响群体
- 绿色基建创造高质量就业
- 国际技术合作降低全球转型成本

**量化分析（简化版）：**
- 情景A（激进减排）：短期成本2%GDP，长期避免损失10%GDP
- 情景B（温和减排）：短期成本1%GDP，长期避免损失5%GDP
- 情景C（不作为）：短期成本0，长期损失15%GDP +不可逆生态崩溃

结论：考虑长期与代际公平，激进减排的净现值最高。
  `

  const poorExample = `
环保政策会拖累经济，企业成本上升，产品涨价，老百姓负担重。现在经济本来就不好，再搞环保雪上加霜。发达国家已经发展起来了，现在让发展中国家减排不公平。我们应该优先发展经济，等富裕了再谈环保。
  `

  return (
    <div className="space-y-8">
      <ProblemAnalysisCard {...exampleData} />

      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="framework">思维框架</TabsTrigger>
          <TabsTrigger value="visual">可视化分析</TabsTrigger>
          <TabsTrigger value="examples">示例对比</TabsTrigger>
          <TabsTrigger value="tools">分析工具</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          <ThinkingFrameworkCard {...thinkingFramework} />
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <MindMapVisualization
            title="前提挑战思维导图"
            rootNode={mindMapData}
          />

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">成本-收益天平</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg border-2 border-red-300">
                <h4 className="font-semibold text-red-800 mb-3">短期成本</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 企业转型投资：技术升级、设备更新</li>
                  <li>• 能源价格：碳税导致化石能源价格上升</li>
                  <li>• 就业调整：传统行业岗位减少</li>
                  <li>• 政策成本：监管、核查、执行</li>
                </ul>
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-red-600">≈1-2% GDP</div>
                  <div className="text-xs text-gray-600">年度成本（初期）</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-green-800 mb-3">长期收益</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 避免气候灾难：减少极端天气损失</li>
                  <li>• 健康改善：空气质量提升降低医疗支出</li>
                  <li>• 绿色产业：新能源、电动车等新增就业</li>
                  <li>• 能源安全：减少对进口化石能源依赖</li>
                </ul>
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">≈5-10% GDP</div>
                  <div className="text-xs text-gray-600">避免的损失（至2050）</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-center space-x-4 text-lg font-semibold">
                <span className="text-red-600">短期阵痛</span>
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-green-600">长期繁荣</span>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                关键在于如何设计公正转型机制，让受益者补偿受损者
              </p>
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
                <li>• 明确识别并质疑隐含前提</li>
                <li>• 用数据和案例支持论证</li>
                <li>• 重新框定问题，超越二元对立</li>
                <li>• 考虑长期视角和代际公平</li>
                <li>• 提出建设性解决方案</li>
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
              <div className="font-semibold text-red-800 mb-2">❌ 问题：</div>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 接受"经济vs环保"对立前提，未加质疑</li>
                <li>• 只考虑短期成本，忽视长期收益</li>
                <li>• 缺乏数据支持，主要靠直觉判断</li>
                <li>• 忽视绿色经济的创新潜力</li>
                <li>• 提出"等富裕了再环保"的危险逻辑</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold mb-6">前提挑战分析工具箱</h3>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🔍 识别隐含前提的方法</h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li><strong>1. 问"为什么"：</strong>论证为什么成立？依赖哪些未明说的假设？</li>
                  <li><strong>2. 寻找跳跃：</strong>从前提到结论是否有逻辑跳跃？</li>
                  <li><strong>3. 反例测试：</strong>能否找到反例推翻这个前提？</li>
                  <li><strong>4. 价值观审查：</strong>背后隐含了什么价值判断？</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">⚖️ 成本效益分析框架</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <strong>步骤1：</strong>列出所有成本和收益（包括非货币化的）
                  </div>
                  <div>
                    <strong>步骤2：</strong>货币化量化（用影子价格等方法）
                  </div>
                  <div>
                    <strong>步骤3：</strong>选择贴现率（反映代际伦理立场）
                    <div className="ml-4 mt-1 text-gray-600">
                      • 高贴现率（5-7%）：重视当代福利<br/>
                      • 低贴现率（1-3%）：重视代际公平
                    </div>
                  </div>
                  <div>
                    <strong>步骤4：</strong>计算净现值（NPV）并进行敏感性分析
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 练习建议</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 找3篇关于政策争论的新闻，列出其隐含前提</li>
                  <li>• 选择一个有争议的政策，绘制成本-收益天平图</li>
                  <li>• 练习用不同贴现率计算同一政策的NPV</li>
                  <li>• 尝试重新框定一个二元对立的问题</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
