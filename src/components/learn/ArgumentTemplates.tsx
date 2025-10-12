'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  BookOpen,
  Target,
  Users,
  CheckCircle,
  X
} from 'lucide-react'

interface ArgumentTemplate {
  id: string
  name: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  structure: {
    step: string
    description: string
    example: string
  }[]
  useCase: string[]
  example: {
    title: string
    content: string
    analysis: string
  }
  tips: string[]
  tags: string[]
  practicePrompts?: string[]
}

const templatesData: ArgumentTemplate[] = [
  {
    id: 'peel',
    name: 'PEEL 论证结构',
    category: 'basic',
    difficulty: 'beginner',
    description: 'Point-Evidence-Explain-Link 是一种经典的论证结构，适用于学术写作和日常论证。',
    structure: [
      {
        step: 'Point (观点)',
        description: '明确提出你的主要观点或论点',
        example: '社交媒体对青少年心理健康产生负面影响。'
      },
      {
        step: 'Evidence (证据)',
        description: '提供支持观点的具体证据、数据或事实',
        example: '根据2023年心理健康研究，60%的青少年报告因社交媒体使用而感到焦虑。'
      },
      {
        step: 'Explain (解释)',
        description: '解释证据如何支持你的观点',
        example: '这种焦虑源于社交媒体上的比较文化和网络霸凌现象，导致青少年自尊心下降。'
      },
      {
        step: 'Link (链接)',
        description: '将论点与更大的主题或下一个论点连接',
        example: '因此，我们需要制定相应的政策来保护青少年的数字健康。'
      }
    ],
    useCase: [
      '学术论文写作',
      '演讲和辩论',
      '政策建议书',
      '商业提案',
      '日常说服性对话'
    ],
    example: {
      title: '关于远程工作的论证',
      content: `**观点(Point)**: 远程工作能够显著提高员工的工作效率和生活质量。

**证据(Evidence)**: 斯坦福大学的研究显示，远程工作者的生产力比办公室工作者高出13%，同时员工满意度提升了20%。

**解释(Explain)**: 这种提升源于减少通勤时间、更少的办公室干扰，以及员工能够在最适合自己的环境中工作。远程工作还允许员工更好地平衡工作与生活，减少压力和疲劳。

**链接(Link)**: 基于这些优势，企业应该考虑实施更灵活的远程工作政策，以吸引和留住优秀人才。`,
      analysis: '这个例子展示了PEEL结构的清晰逻辑流程：从明确观点开始，用具体数据支撑，解释因果关系，最后提出行动建议。'
    },
    tips: [
      '确保每个部分都简洁明了',
      '证据要具体、可信、相关',
      '解释部分是关键，要清楚说明证据与观点的关系',
      '链接部分要自然过渡，避免突兀'
    ],
    tags: ['基础结构', '学术写作', '说服技巧']
  },
  {
    id: 'cer',
    name: 'CER 科学论证',
    category: 'scientific',
    difficulty: 'intermediate',
    description: 'Claim-Evidence-Reasoning 是科学论证的标准结构，强调基于证据的推理过程。',
    structure: [
      {
        step: 'Claim (声明)',
        description: '提出可以被证据支持或反驳的明确声明',
        example: '气候变化主要由人类活动引起。'
      },
      {
        step: 'Evidence (证据)',
        description: '提供科学数据、观察结果或实验证据',
        example: '大气中CO2浓度从1950年的315ppm上升到2023年的421ppm，与工业排放数据高度相关。'
      },
      {
        step: 'Reasoning (推理)',
        description: '解释证据如何逻辑性地支持声明',
        example: 'CO2是已知的温室气体，其浓度增加与全球平均气温上升0.8°C的时间线一致，而自然因素无法解释如此快速的变化。'
      }
    ],
    useCase: [
      '科学报告',
      '实验结论',
      '技术分析',
      '医学诊断',
      '环境评估'
    ],
    example: {
      title: '关于可再生能源效率的科学论证',
      content: `**声明(Claim)**: 太阳能发电在成本效益上已经超越传统化石燃料发电。

**证据(Evidence)**: 
- 2023年太阳能发电成本降至每千瓦时0.048美元
- 煤炭发电成本为每千瓦时0.112美元
- 过去十年太阳能成本下降了85%
- 太阳能装机容量年增长率达到22%

**推理(Reasoning)**: 成本数据显示太阳能已具备明显的经济优势。技术进步和规模效应是成本下降的主要驱动因素。同时，太阳能的边际成本接近零，而化石燃料需要持续的燃料成本。考虑到环境外部成本，太阳能的综合优势更加明显。`,
      analysis: 'CER结构在科学论证中的优势在于其严谨性：声明明确可测，证据客观量化，推理逻辑清晰。'
    },
    tips: [
      '声明要具体、可测试',
      '证据要来源可靠、数据准确',
      '推理要符合科学逻辑，避免跳跃',
      '考虑反证和替代解释'
    ],
    tags: ['科学方法', '数据分析', '逻辑推理']
  },
  {
    id: 'stakeholder-matrix',
    name: '利益相关者分析矩阵',
    category: 'analysis',
    difficulty: 'advanced',
    description: '系统性分析不同利益相关者的观点、需求和影响，用于复杂问题的多角度论证。',
    structure: [
      {
        step: '识别利益相关者',
        description: '列出所有受影响或能影响问题的个人、群体或组织',
        example: '教育改革：学生、家长、教师、学校管理者、政府、雇主'
      },
      {
        step: '分析利益和关切',
        description: '确定每个利益相关者的核心利益、担忧和期望',
        example: '学生：学习体验、就业前景；家长：教育质量、成本；教师：工作负担、职业发展'
      },
      {
        step: '评估影响力和重要性',
        description: '评估每个利益相关者的影响力大小和重要程度',
        example: '政府（高影响力、高重要性）、学生（低影响力、高重要性）'
      },
      {
        step: '制定平衡策略',
        description: '基于分析结果制定能够平衡各方利益的解决方案',
        example: '渐进式改革，试点先行，充分沟通，建立反馈机制'
      }
    ],
    useCase: [
      '政策制定',
      '商业决策',
      '项目管理',
      '冲突调解',
      '组织变革'
    ],
    example: {
      title: '城市交通拥堵解决方案的利益相关者分析',
      content: `**利益相关者识别**:
- 通勤者：希望快速便捷出行
- 居民：关注噪音、空气质量
- 商家：需要客流和货运便利
- 政府：平衡经济发展与环境保护
- 公交公司：运营效率和盈利
- 环保组织：减少排放和污染

**利益分析**:
- 通勤者 vs 居民：速度便利 vs 生活质量
- 商家 vs 环保组织：经济利益 vs 环境保护
- 政府：需要平衡所有利益

**影响力评估**:
- 政府：决策权（高影响力、高重要性）
- 通勤者：选票影响（中影响力、高重要性）
- 商家：经济影响（中影响力、中重要性）

**平衡策略**:
1. 发展公共交通，满足通勤需求
2. 设立低排放区，保护居民环境
3. 优化货运时间，兼顾商业需求
4. 征收拥堵费，引导行为改变`,
      analysis: '利益相关者矩阵帮助我们系统性地考虑复杂问题中的多方利益，避免单一视角的局限性。'
    },
    tips: [
      '确保利益相关者识别的完整性',
      '客观分析各方利益，避免偏见',
      '重视高影响力、高重要性的利益相关者',
      '寻找多方共赢的解决方案'
    ],
    tags: ['系统分析', '多角度思维', '决策支持']
  },
  {
    id: 'pros-cons',
    name: '利弊权衡框架',
    category: 'decision',
    difficulty: 'beginner',
    description: '系统性地分析决策或观点的优势和劣势，帮助做出更理性的判断。',
    structure: [
      {
        step: '明确决策问题',
        description: '清楚定义需要分析的决策或观点',
        example: '是否应该实施四天工作制？'
      },
      {
        step: '列出优势(Pros)',
        description: '系统性地列出所有可能的积极影响和好处',
        example: '提高员工满意度、减少疲劳、增加创新时间、降低运营成本'
      },
      {
        step: '列出劣势(Cons)',
        description: '客观地列出所有可能的负面影响和风险',
        example: '可能降低总产出、客户服务时间减少、协调困难、竞争劣势'
      },
      {
        step: '权重评估',
        description: '评估各项利弊的重要性和影响程度',
        example: '员工满意度（高重要性）vs 总产出（中重要性）'
      }
    ],
    useCase: [
      '个人决策',
      '商业策略',
      '政策评估',
      '投资分析',
      '生活选择'
    ],
    example: {
      title: '远程办公政策的利弊分析',
      content: `**决策问题**: 公司是否应该实施永久性远程办公政策？

**优势(Pros)**:
✅ **员工满意度提升** - 更好的工作生活平衡
✅ **成本节约** - 减少办公空间和设施成本
✅ **人才获取** - 不受地理限制，吸引更多优秀人才
✅ **环境友好** - 减少通勤，降低碳排放
✅ **生产力提升** - 减少办公室干扰，专注度更高

**劣势(Cons)**:
❌ **团队协作挑战** - 沟通效率可能下降
❌ **企业文化稀释** - 难以维持团队凝聚力
❌ **管理困难** - 绩效监督和团队管理复杂化
❌ **技术依赖** - 对IT基础设施要求更高
❌ **员工孤立** - 可能导致职业发展和心理健康问题

**权重评估**:
- 高重要性：员工满意度、团队协作、企业文化
- 中重要性：成本节约、管理困难
- 低重要性：环境影响、技术依赖

**结论**: 建议采用混合模式，平衡远程工作的优势和面对面协作的必要性。`,
      analysis: '利弊权衡框架帮助我们全面考虑决策的各个方面，避免只看到一面而忽略另一面的偏见。'
    },
    tips: [
      '尽可能全面地列出利弊',
      '保持客观，不要让个人偏好影响分析',
      '考虑短期和长期影响',
      '量化影响程度，便于比较'
    ],
    tags: ['决策分析', '批判思维', '风险评估']
  },
  {
    id: 'steelman',
    name: '钢人论证技巧',
    category: 'debate',
    difficulty: 'advanced',
    description: '与稻草人相对，钢人技巧要求以最强、最合理的形式呈现对方观点，然后进行反驳。',
    structure: [
      {
        step: '理解对方观点',
        description: '深入理解对方的真实立场和核心论据',
        example: '对方认为：AI发展应该放缓，因为存在就业和安全风险'
      },
      {
        step: '强化对方论证',
        description: '以最强的形式重新表述对方观点，补充最佳论据',
        example: '强化版：AI快速发展确实可能导致大规模失业，历史上技术革命都有过渡期痛苦，且AI安全性仍有未解决的技术难题'
      },
      {
        step: '承认合理之处',
        description: '诚实地承认对方观点中的合理成分',
        example: '承认：AI确实存在就业冲击和安全风险，这些担忧是合理的'
      },
      {
        step: '提出反驳',
        description: '在承认合理性的基础上，提出更有说服力的反驳',
        example: '反驳：但历史表明技术进步长期创造更多就业，且通过适当监管可以管控风险，放缓发展可能让我们失去解决全球性挑战的机会'
      }
    ],
    useCase: [
      '学术辩论',
      '政策讨论',
      '商业谈判',
      '法庭辩护',
      '建设性对话'
    ],
    example: {
      title: '关于基因编辑技术的钢人论证',
      content: `**对方观点**: 基因编辑技术应该被严格限制，因为存在伦理和安全风险。

**钢人强化**: 
基因编辑技术确实面临重大挑战：
- 可能加剧社会不平等（富人获得"基因优势"）
- 存在不可预见的遗传后果，影响后代
- 涉及"设计婴儿"的伦理边界问题
- 技术滥用可能导致生物武器风险
- 当前监管框架尚不完善

**承认合理性**: 
这些担忧都是合理的。基因编辑确实是一项具有深远影响的技术，需要谨慎对待。伦理考量和安全评估必须是首要考虑。

**建设性反驳**:
然而，完全限制可能错失巨大机遇：
- 可以治愈遗传性疾病，减少人类痛苦
- 通过国际合作和透明监管可以管控风险
- 技术本身是中性的，关键在于如何使用
- 延迟发展可能让其他国家获得不当优势
- 可以建立渐进式、可逆的监管框架

**建议**: 采用"谨慎推进"策略，在严格监管下进行有限的治疗性应用，同时建立国际协调机制。`,
      analysis: '钢人技巧展现了高水平的智力诚实和辩论技巧，通过承认对方观点的合理性来增强自己论证的说服力。'
    },
    tips: [
      '真诚地理解对方立场，避免歪曲',
      '寻找对方观点的最强版本',
      '承认合理性时要具体、真诚',
      '反驳要基于更强的论据，而非攻击弱点'
    ],
    tags: ['高级辩论', '建设性对话', '智力诚实']
  }
]

const categories = [
  { id: 'all', label: '全部模板', count: templatesData.length },
  { id: 'basic', label: '基础结构', count: templatesData.filter(t => t.category === 'basic').length },
  { id: 'scientific', label: '科学论证', count: templatesData.filter(t => t.category === 'scientific').length },
  { id: 'analysis', label: '分析框架', count: templatesData.filter(t => t.category === 'analysis').length },
  { id: 'decision', label: '决策工具', count: templatesData.filter(t => t.category === 'decision').length },
  { id: 'debate', label: '辩论技巧', count: templatesData.filter(t => t.category === 'debate').length }
]

const difficulties = [
  { id: 'all', label: '全部难度', count: templatesData.length },
  { id: 'beginner', label: '初级', count: templatesData.filter(t => t.difficulty === 'beginner').length },
  { id: 'intermediate', label: '中级', count: templatesData.filter(t => t.difficulty === 'intermediate').length },
  { id: 'advanced', label: '高级', count: templatesData.filter(t => t.difficulty === 'advanced').length }
]

export default function ArgumentTemplates() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templatesData[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const categories = ['all', ...Array.from(new Set(templatesData.map(t => t.category)))]

  const filteredTemplates = templatesData.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateClick = (template: typeof templatesData[0]) => {
    setSelectedTemplate(template)
    setIsDetailOpen(true)
  }

  const categoryColors = {
    '论证结构': 'bg-blue-50 border-blue-200 text-blue-800',
    '写作模板': 'bg-green-50 border-green-200 text-green-800',
    '分析框架': 'bg-purple-50 border-purple-200 text-purple-800',
    '反驳技巧': 'bg-orange-50 border-orange-200 text-orange-800'
  }

  const difficultyColors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800'
  }

  const difficultyLabels = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            论证结构与写作模板
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            掌握PEEL、CER等经典论证结构，提升逻辑表达和写作能力
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
                  placeholder="搜索模板名称或描述..."
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
                  <SelectItem value="论证结构">论证结构</SelectItem>
                  <SelectItem value="写作模板">写作模板</SelectItem>
                  <SelectItem value="分析框架">分析框架</SelectItem>
                  <SelectItem value="反驳技巧">反驳技巧</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            找到 {filteredTemplates.length} 个相关模板
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] sm:active:scale-100"
              onClick={() => handleTemplateClick(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 leading-tight flex-1 pr-2">
                    {template.name}
                  </CardTitle>
                  <Badge 
                    className={`text-xs flex-shrink-0 ${categoryColors[template.category as keyof typeof categoryColors]}`}
                  >
                    {template.category}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    className={`text-xs ${difficultyColors[template.difficulty as keyof typeof difficultyColors]}`}
                  >
                    {difficultyLabels[template.difficulty as keyof typeof difficultyLabels]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.structure.length} 个步骤
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
                  {template.description}
                </CardDescription>
                
                {/* Quick Preview */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-900">适用场景：</div>
                  <div className="flex flex-wrap gap-1">
                    {template.useCase.slice(0, 2).map((useCase, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {useCase}
                      </span>
                    ))}
                    {template.useCase.length > 2 && (
                      <span className="text-xs text-gray-500">+{template.useCase.length - 2} 更多</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full group h-10 text-sm">
                  <Eye className="mr-2 h-4 w-4" />
                  查看模板
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关模板</h3>
            <p className="text-gray-600">尝试调整搜索关键词或筛选条件</p>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            {selectedTemplate && (
              <>
                {/* Mobile Header */}
                <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between lg:hidden">
                  <h2 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                    {selectedTemplate.name}
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
                        {selectedTemplate.name}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${categoryColors[selectedTemplate.category as keyof typeof categoryColors]}`}>
                          {selectedTemplate.category}
                        </Badge>
                        <Badge className={`${difficultyColors[selectedTemplate.difficulty as keyof typeof difficultyColors]}`}>
                          {difficultyLabels[selectedTemplate.difficulty as keyof typeof difficultyLabels]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="p-4 sm:p-6 pt-0 lg:pt-0">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm">概述</TabsTrigger>
                      <TabsTrigger value="structure" className="text-xs sm:text-sm">结构</TabsTrigger>
                      <TabsTrigger value="example" className="text-xs sm:text-sm">示例</TabsTrigger>
                      <TabsTrigger value="practice" className="text-xs sm:text-sm">练习</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                          模板描述
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                          {selectedTemplate.description}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Target className="h-4 w-4 mr-2 text-green-600" />
                              适用场景
                            </h4>
                            <ul className="space-y-1">
                              {selectedTemplate.useCase.map((useCase, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {useCase}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-purple-600" />
                              核心优势
                            </h4>
                            <ul className="space-y-1">
                              {selectedTemplate.tips.map((tip, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="h-3 w-3 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="structure" className="space-y-4">
                      <div className="space-y-4">
                        {selectedTemplate.structure.map((step, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 sm:p-6">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                  {step.step}
                                </h4>
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="example" className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          实际应用示例
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            {selectedTemplate.example.title}
                          </h4>
                          <div className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-4">
                            {selectedTemplate.example.content}
                          </div>
                          <div className="border-t pt-3">
                            <p className="text-gray-600 text-sm italic">
                              {selectedTemplate.example.analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="practice" className="space-y-4">
                      <div className="bg-yellow-50 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          练习提示
                        </h3>
                        <div className="space-y-3">
                          {selectedTemplate.practicePrompts && selectedTemplate.practicePrompts.length > 0 ? (
                            selectedTemplate.practicePrompts.map((prompt, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                  {prompt}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                                暂无练习提示，请参考结构说明和示例进行练习。
                              </p>
                            </div>
                          )}
                        </div>
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