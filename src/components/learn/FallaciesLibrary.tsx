'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Eye, 
  Shield, 
  BookOpen,
  ArrowLeft,
  X
} from 'lucide-react'

interface LogicalFallacy {
  id: string
  name: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  definition: string
  identificationSignals: string[]
  countermeasures: string[]
  examples: {
    title: string
    description: string
    analysis: string
  }[]
  tags: string[]
}

const fallaciesData: LogicalFallacy[] = [
  {
    id: 'ad-hominem',
    name: '人身攻击',
    category: 'personal',
    difficulty: 'beginner',
    definition: '通过攻击论证者的个人特征、背景或动机来反驳其论点，而不是针对论点本身进行反驳。',
    identificationSignals: [
      '将焦点转向论证者的个人特征',
      '使用贬低性的形容词描述对方',
      '质疑对方的动机而非论点',
      '提及与论点无关的个人信息'
    ],
    countermeasures: [
      '将注意力重新聚焦到论点本身',
      '要求对方针对具体论据进行回应',
      '指出人身攻击与论点真实性无关',
      '保持冷静，不被情绪化言论影响'
    ],
    examples: [
      {
        title: '政治辩论中的人身攻击',
        description: '"你不应该相信他关于经济政策的观点，因为他从来没有经营过企业。"',
        analysis: '这里攻击了论证者缺乏商业经验，但没有针对其经济政策观点的具体内容进行反驳。一个人是否经营过企业与其经济政策观点的合理性没有必然联系。'
      },
      {
        title: '学术讨论中的身份攻击',
        description: '"作为一个年轻人，你对这个复杂问题的理解太肤浅了。"',
        analysis: '通过强调年龄来贬低对方观点，而没有具体分析观点本身的问题。年龄与观点的正确性没有直接关系。'
      }
    ],
    tags: ['逻辑谬误', '人身攻击', '辩论技巧']
  },
  {
    id: 'straw-man',
    name: '稻草人谬误',
    category: 'misrepresentation',
    difficulty: 'intermediate',
    definition: '故意歪曲、简化或夸大对方的论点，然后攻击这个被扭曲的版本，而不是对方的真实观点。',
    identificationSignals: [
      '对方的论点被过度简化',
      '出现"你的意思是..."的错误总结',
      '将温和观点描述为极端立场',
      '忽略论点的重要细节和条件'
    ],
    countermeasures: [
      '要求对方准确复述你的观点',
      '明确指出被歪曲的部分',
      '重新阐述你的真实立场',
      '要求针对你的实际观点进行回应'
    ],
    examples: [
      {
        title: '环保政策讨论',
        description: 'A: "我们应该减少塑料袋的使用。" B: "你想让所有人都回到石器时代吗？"',
        analysis: 'B将A关于减少塑料袋使用的具体建议夸大为"回到石器时代"，这是对原观点的严重歪曲。'
      },
      {
        title: '教育改革辩论',
        description: 'A: "学校应该增加体育课时间。" B: "你认为学术成绩不重要吗？"',
        analysis: 'B将增加体育课时间的建议错误地解读为不重视学术成绩，这是对原观点的误读。'
      }
    ],
    tags: ['逻辑谬误', '稻草人', '论点歪曲']
  },
  {
    id: 'slippery-slope',
    name: '滑坡谬误',
    category: 'causation',
    difficulty: 'intermediate',
    definition: '认为一个相对小的第一步必然会导致一系列相关的负面后果，而没有提供充分的证据证明这种因果链的必然性。',
    identificationSignals: [
      '使用"如果...那么..."的连锁推理',
      '缺乏每个步骤之间的因果证据',
      '结果往往是极端或灾难性的',
      '忽略了中间可能的干预因素'
    ],
    countermeasures: [
      '要求提供每个步骤的具体证据',
      '指出可能的干预措施',
      '质疑因果链的必然性',
      '要求证明为什么不会停在中间步骤'
    ],
    examples: [
      {
        title: '游戏时间管理',
        description: '"如果你今天多玩一小时游戏，明天就会玩两小时，最终会沉迷游戏，学业荒废，人生毁掉。"',
        analysis: '这里假设多玩一小时游戏必然导致完全沉迷和人生毁掉，但没有证据表明这种极端后果的必然性，也忽略了自我控制和外部干预的可能性。'
      },
      {
        title: '政策制定讨论',
        description: '"如果政府增加一点税收，就会导致经济衰退，然后是大规模失业，最终社会崩溃。"',
        analysis: '将小幅增税与社会崩溃建立了缺乏证据的因果链，忽略了经济系统的复杂性和调节机制。'
      }
    ],
    tags: ['逻辑谬误', '滑坡', '因果关系']
  },
  {
    id: 'hasty-generalization',
    name: '以偏概全',
    category: 'induction',
    difficulty: 'beginner',
    definition: '基于少数几个案例或不具代表性的样本，就对整个群体或现象做出广泛的结论。',
    identificationSignals: [
      '样本数量明显不足',
      '使用"所有"、"总是"、"从不"等绝对词汇',
      '基于个人经历得出普遍结论',
      '忽略反例的存在'
    ],
    countermeasures: [
      '要求提供更大的样本',
      '寻找反例',
      '质疑样本的代表性',
      '要求统计数据支持'
    ],
    examples: [
      {
        title: '职业刻板印象',
        description: '"我认识的三个程序员都很内向，所以所有程序员都是内向的。"',
        analysis: '基于三个个案就对整个程序员群体做出结论，样本太小且可能不具代表性。实际上程序员群体中既有内向也有外向的人。'
      },
      {
        title: '产品评价',
        description: '"这个品牌的手机我用过两次都坏了，这个品牌的质量肯定很差。"',
        analysis: '仅凭两次个人经历就判断整个品牌的质量，没有考虑到可能的偶然因素或其他用户的不同体验。'
      }
    ],
    tags: ['逻辑谬误', '归纳', '样本偏差']
  },
  {
    id: 'correlation-causation',
    name: '相关不等于因果',
    category: 'causation',
    difficulty: 'intermediate',
    definition: '仅仅因为两个事件或现象存在相关性，就错误地认为其中一个是另一个的原因。',
    identificationSignals: [
      '强调两个现象的同时发生',
      '缺乏因果机制的解释',
      '忽略第三方变量的影响',
      '时间顺序不明确'
    ],
    countermeasures: [
      '寻找可能的第三方变量',
      '要求解释因果机制',
      '考虑反向因果关系',
      '要求控制变量的实验证据'
    ],
    examples: [
      {
        title: '冰淇淋与犯罪率',
        description: '"夏天冰淇淋销量高，犯罪率也高，所以吃冰淇淋导致犯罪。"',
        analysis: '冰淇淋销量与犯罪率的相关性实际上是由第三方变量（高温天气）造成的。高温既促进了冰淇淋销售，也可能影响人们的情绪和行为。'
      },
      {
        title: '教育与收入',
        description: '"受教育程度高的人收入也高，所以教育直接导致高收入。"',
        analysis: '虽然教育与收入存在相关性，但还需要考虑家庭背景、个人能力、社会网络等多种因素的影响，不能简单地认为是直接的因果关系。'
      }
    ],
    tags: ['逻辑谬误', '因果关系', '统计误区']
  },
  {
    id: 'confirmation-bias',
    name: '确认偏误',
    category: 'cognitive',
    difficulty: 'advanced',
    definition: '倾向于寻找、解释和记住那些确认自己已有信念的信息，而忽略或贬低与自己观点相矛盾的证据。',
    identificationSignals: [
      '只引用支持自己观点的资料',
      '对反对证据视而不见',
      '将模糊信息解释为支持自己',
      '记住支持证据，忘记反对证据'
    ],
    countermeasures: [
      '主动寻找反对证据',
      '考虑替代解释',
      '咨询持不同观点的人',
      '使用系统性的信息收集方法'
    ],
    examples: [
      {
        title: '投资决策',
        description: '投资者只关注支持其投资决策的新闻和分析，忽略警告风险的报告。',
        analysis: '这种选择性关注可能导致投资者对风险估计不足，做出不理性的投资决策。应该平衡地考虑正面和负面信息。'
      },
      {
        title: '医疗信息搜索',
        description: '患者在网上搜索症状时，只关注那些确认自己担心的严重疾病的信息。',
        analysis: '这种偏向性搜索可能加剧健康焦虑，应该寻求专业医生的全面评估，而不是选择性地关注某些信息。'
      }
    ],
    tags: ['认知偏误', '信息处理', '决策偏差']
  },
  {
    id: 'availability-heuristic',
    name: '可得性启发',
    category: 'cognitive',
    difficulty: 'advanced',
    definition: '根据信息在记忆中的可得性（容易回想起的程度）来判断事件的概率或重要性，而不是基于实际的统计数据。',
    identificationSignals: [
      '基于最近或印象深刻的事件做判断',
      '高估媒体报道频繁的事件概率',
      '忽略基础概率信息',
      '被生动的个案影响判断'
    ],
    countermeasures: [
      '查找实际的统计数据',
      '考虑媒体报道的偏向性',
      '思考基础概率',
      '避免被单一事件过度影响'
    ],
    examples: [
      {
        title: '飞行安全担忧',
        description: '看到飞机事故新闻后，认为飞行比开车更危险。',
        analysis: '飞机事故因为罕见和严重而被媒体大量报道，容易在记忆中留下深刻印象。但统计数据显示，飞行实际上比开车安全得多。'
      },
      {
        title: '犯罪率估计',
        description: '因为经常看到犯罪新闻，认为犯罪率在上升。',
        analysis: '媒体倾向于报道犯罪事件，因为这些事件能吸引注意力。但实际的犯罪统计数据可能显示犯罪率是下降的。'
      }
    ],
    tags: ['认知偏误', '概率判断', '媒体影响']
  }
]

const categories = [
  { id: 'all', label: '全部', count: fallaciesData.length },
  { id: 'personal', label: '人身攻击类', count: fallaciesData.filter(f => f.category === 'personal').length },
  { id: 'misrepresentation', label: '歪曲论点类', count: fallaciesData.filter(f => f.category === 'misrepresentation').length },
  { id: 'causation', label: '因果关系类', count: fallaciesData.filter(f => f.category === 'causation').length },
  { id: 'induction', label: '归纳推理类', count: fallaciesData.filter(f => f.category === 'induction').length },
  { id: 'cognitive', label: '认知偏误类', count: fallaciesData.filter(f => f.category === 'cognitive').length }
]

const difficulties = [
  { id: 'all', label: '全部难度', count: fallaciesData.length },
  { id: 'beginner', label: '初级', count: fallaciesData.filter(f => f.difficulty === 'beginner').length },
  { id: 'intermediate', label: '中级', count: fallaciesData.filter(f => f.difficulty === 'intermediate').length },
  { id: 'advanced', label: '高级', count: fallaciesData.filter(f => f.difficulty === 'advanced').length }
]

export default function FallaciesLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFallacy, setSelectedFallacy] = useState<typeof fallaciesData[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const categories = ['all', ...Array.from(new Set(fallaciesData.map(f => f.category)))]

  const filteredFallacies = fallaciesData.filter(fallacy => {
    const matchesSearch = fallacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fallacy.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || fallacy.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFallacyClick = (fallacy: typeof fallaciesData[0]) => {
    setSelectedFallacy(fallacy)
    setIsDetailOpen(true)
  }

  const categoryColors = {
    '逻辑谬误': 'bg-red-50 border-red-200 text-red-800',
    '认知偏差': 'bg-blue-50 border-blue-200 text-blue-800',
    '论证错误': 'bg-green-50 border-green-200 text-green-800',
    '统计谬误': 'bg-purple-50 border-purple-200 text-purple-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            逻辑谬误与偏差库
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            学习识别和应对各种逻辑谬误与认知偏差，提升批判性思维能力
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索谬误名称或定义..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 text-base">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="逻辑谬误">逻辑谬误</SelectItem>
                  <SelectItem value="认知偏差">认知偏差</SelectItem>
                  <SelectItem value="论证错误">论证错误</SelectItem>
                  <SelectItem value="统计谬误">统计谬误</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            找到 {filteredFallacies.length} 个相关内容
          </div>
        </div>

        {/* Fallacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredFallacies.map((fallacy) => (
            <Card 
              key={fallacy.id} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] sm:active:scale-100"
              onClick={() => handleFallacyClick(fallacy)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 leading-tight flex-1 pr-2">
                    {fallacy.name}
                  </CardTitle>
                  <Badge 
                    className={`text-xs flex-shrink-0 ${categoryColors[fallacy.category as keyof typeof categoryColors]}`}
                  >
                    {fallacy.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
                  {fallacy.definition}
                </CardDescription>
                
                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 line-clamp-2">{fallacy.identificationSignals[0]}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full group h-10 text-sm">
                  <Eye className="mr-2 h-4 w-4" />
                  查看详情
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFallacies.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关内容</h3>
            <p className="text-gray-600">尝试调整搜索关键词或筛选条件</p>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            {selectedFallacy && (
              <>
                {/* Mobile Header */}
                <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between lg:hidden">
                  <h2 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                    {selectedFallacy.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDetailOpen(false)}
                    className="flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Desktop Header */}
                <DialogHeader className="hidden lg:block p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedFallacy.name}
                      </DialogTitle>
                      <Badge className={`${categoryColors[selectedFallacy.category as keyof typeof categoryColors]}`}>
                        {selectedFallacy.category}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="p-4 sm:p-6 pt-0 lg:pt-0">
                  <Tabs defaultValue="definition" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                      <TabsTrigger value="definition" className="text-xs sm:text-sm">定义</TabsTrigger>
                      <TabsTrigger value="signals" className="text-xs sm:text-sm">识别</TabsTrigger>
                      <TabsTrigger value="countermeasures" className="text-xs sm:text-sm">对策</TabsTrigger>
                      <TabsTrigger value="examples" className="text-xs sm:text-sm">示例</TabsTrigger>
                    </TabsList>

                    <TabsContent value="definition" className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                          定义解析
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {selectedFallacy.definition}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="signals" className="space-y-4">
                      <div className="bg-orange-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                          识别信号
                        </h3>
                        <ul className="space-y-3">
                          {selectedFallacy.identificationSignals.map((signal, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="countermeasures" className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          应对策略
                        </h3>
                        <ul className="space-y-3">
                          {selectedFallacy.countermeasures.map((measure, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{measure}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples" className="space-y-4">
                      <div className="space-y-4">
                        {selectedFallacy.examples.map((example, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 sm:p-6">
                            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                              示例 {index + 1}: {example.title}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1 text-xs sm:text-sm">情况描述：</h5>
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                  {example.description}
                                </p>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1 text-xs sm:text-sm">分析：</h5>
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                  {example.analysis}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}