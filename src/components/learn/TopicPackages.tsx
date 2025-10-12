'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  Eye,
  MessageSquare,
  BarChart3,
  Users,
  Scale,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Lightbulb,
  Target,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface Perspective {
  id: string
  title: string
  stance: 'support' | 'oppose' | 'neutral'
  arguments: string[]
  evidence: string[]
  stakeholders: string[]
}

interface DialogueRoute {
  id: string
  title: string
  description: string
  steps: {
    step: number
    action: string
    prompt: string
    expectedOutcome: string
  }[]
}

interface VisualizationData {
  type: 'stakeholder-map' | 'argument-tree' | 'impact-matrix'
  title: string
  description: string
  data: any
}

interface TopicPackage {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  context: string
  coreQuestion: string
  perspectives: Perspective[]
  visualizations: VisualizationData[]
  dialogueRoutes: DialogueRoute[]
  keyStakeholders: string[]
  ethicalConsiderations: string[]
  tags: string[]
}

const topicPackagesData: TopicPackage[] = [
  {
    id: 'policy-efficiency-equity',
    title: '政策评估：效率 vs 公平',
    category: 'policy',
    difficulty: 'intermediate',
    description: '探讨公共政策制定中效率与公平的权衡，分析不同利益相关者的观点。',
    context: '在制定公共政策时，政策制定者经常面临效率与公平之间的权衡。提高效率可能会加剧不平等，而追求公平可能会降低整体效率。这种权衡在税收政策、社会保障、教育资源分配等领域尤为突出。',
    coreQuestion: '在公共政策制定中，应该优先考虑效率还是公平？如何在两者之间找到平衡？',
    perspectives: [
      {
        id: 'efficiency-first',
        title: '效率优先论',
        stance: 'support',
        arguments: [
          '提高整体效率能创造更多财富，最终惠及所有人',
          '市场机制是资源配置的最有效方式',
          '过度追求公平会抑制创新和经济增长',
          '效率提升可以为再分配提供更多资源'
        ],
        evidence: [
          '经济学研究显示，市场经济国家的整体生活水平更高',
          '高税收国家的创业率和创新率相对较低',
          '新加坡等效率导向国家实现了快速发展'
        ],
        stakeholders: ['企业家', '投资者', '经济学家', '自由主义者']
      },
      {
        id: 'equity-first',
        title: '公平优先论',
        stance: 'support',
        arguments: [
          '基本公平是社会稳定的基础',
          '机会平等比结果效率更重要',
          '不平等会导致社会分化和冲突',
          '公平的社会环境有利于长期发展'
        ],
        evidence: [
          '北欧国家在公平与发展之间找到了良好平衡',
          '高不平等社会的犯罪率和社会问题更多',
          '教育公平投入的长期回报率很高'
        ],
        stakeholders: ['社会工作者', '教育工作者', '弱势群体', '社会主义者']
      },
      {
        id: 'balanced-approach',
        title: '平衡发展论',
        stance: 'neutral',
        arguments: [
          '效率与公平并非完全对立，可以相互促进',
          '不同领域应采用不同的权衡策略',
          '动态平衡比静态选择更重要',
          '制度设计可以同时促进效率和公平'
        ],
        evidence: [
          '德国的社会市场经济模式兼顾了效率与公平',
          '适度的再分配政策可以提高整体社会效率',
          '教育投资既促进公平又提高效率'
        ],
        stakeholders: ['政策制定者', '学者', '中产阶级', '实用主义者']
      }
    ],
    visualizations: [
      {
        type: 'stakeholder-map',
        title: '利益相关者地图',
        description: '展示不同群体在效率-公平光谱上的立场',
        data: {
          stakeholders: [
            { name: '企业家', position: { efficiency: 90, equity: 30 }, influence: 80 },
            { name: '工会', position: { efficiency: 40, equity: 85 }, influence: 60 },
            { name: '政府', position: { efficiency: 60, equity: 70 }, influence: 95 },
            { name: '学者', position: { efficiency: 55, equity: 65 }, influence: 40 },
            { name: '公众', position: { efficiency: 50, equity: 75 }, influence: 70 }
          ]
        }
      },
      {
        type: 'impact-matrix',
        title: '政策影响矩阵',
        description: '分析不同政策选择对效率和公平的影响',
        data: {
          policies: [
            { name: '累进税制', efficiency: -20, equity: 60, feasibility: 70 },
            { name: '最低工资', efficiency: -30, equity: 40, feasibility: 80 },
            { name: '教育投资', efficiency: 50, equity: 70, feasibility: 60 },
            { name: '减税政策', efficiency: 40, equity: -30, feasibility: 85 }
          ]
        }
      }
    ],
    dialogueRoutes: [
      {
        id: 'policy-debate',
        title: '政策辩论路线',
        description: '引导进行结构化的政策辩论',
        steps: [
          {
            step: 1,
            action: '问题界定',
            prompt: '请明确你要讨论的具体政策问题，并说明为什么这个问题重要。',
            expectedOutcome: '清晰的问题陈述和背景介绍'
          },
          {
            step: 2,
            action: '立场选择',
            prompt: '在效率优先、公平优先、平衡发展三种立场中选择一种，并说明理由。',
            expectedOutcome: '明确的立场表态和初步论证'
          },
          {
            step: 3,
            action: '论据展开',
            prompt: '提供至少3个支持你立场的具体论据，包括理论依据和实证证据。',
            expectedOutcome: '有说服力的论证结构'
          },
          {
            step: 4,
            action: '反驳预期',
            prompt: '预测对方可能的反驳，并准备你的回应策略。',
            expectedOutcome: '完整的论辩准备'
          },
          {
            step: 5,
            action: '妥协方案',
            prompt: '提出一个兼顾不同观点的折中方案。',
            expectedOutcome: '建设性的解决方案'
          }
        ]
      }
    ],
    keyStakeholders: ['政府部门', '企业界', '劳工组织', '学术机构', '公民社会'],
    ethicalConsiderations: [
      '代际公平：当前政策对未来世代的影响',
      '程序正义：政策制定过程的透明度和参与性',
      '分配正义：资源分配的公平性原则',
      '机会平等：确保所有人都有平等的发展机会'
    ],
    tags: ['公共政策', '经济学', '社会公正', '政府治理']
  },
  {
    id: 'tech-privacy-innovation',
    title: '技术伦理：隐私 vs 创新',
    category: 'technology',
    difficulty: 'advanced',
    description: '分析数字时代隐私保护与技术创新之间的张力，探讨平衡之道。',
    context: '在数字化时代，个人隐私保护与技术创新之间存在复杂的张力关系。严格的隐私保护可能会限制数据的使用，从而影响AI、大数据等技术的发展；而过度的技术创新可能会侵犯个人隐私权。这种矛盾在医疗健康、金融科技、社交媒体等领域尤为突出。',
    coreQuestion: '在推动技术创新的同时，如何有效保护个人隐私？两者之间的边界应该如何划定？',
    perspectives: [
      {
        id: 'privacy-first',
        title: '隐私优先论',
        stance: 'support',
        arguments: [
          '隐私是基本人权，不应为技术发展而牺牲',
          '数据滥用的风险远大于创新带来的收益',
          '强有力的隐私保护能促进用户信任，反而有利于长期发展',
          '欧盟GDPR证明了严格隐私保护与创新可以并存'
        ],
        evidence: [
          'Cambridge Analytica事件暴露了数据滥用的严重后果',
          '调查显示80%的用户担心个人数据被滥用',
          '实施GDPR后，欧盟的科技创新并未显著下降'
        ],
        stakeholders: ['隐私倡导者', '消费者权益组织', '法律专家', '欧盟监管机构']
      },
      {
        id: 'innovation-first',
        title: '创新优先论',
        stance: 'support',
        arguments: [
          '技术创新能带来巨大的社会效益',
          '过度的隐私保护会阻碍有益技术的发展',
          '用户可以通过知情同意来平衡隐私与便利',
          '中国和美国的相对宽松政策促进了技术领先'
        ],
        evidence: [
          'AI医疗诊断技术挽救了无数生命',
          '个性化推荐提高了用户体验和商业效率',
          '严格的隐私法规导致一些有益研究无法进行'
        ],
        stakeholders: ['科技公司', '研究机构', '创新者', '部分政府部门']
      },
      {
        id: 'privacy-by-design',
        title: '隐私设计论',
        stance: 'neutral',
        arguments: [
          '隐私保护应该内嵌到技术设计中',
          '技术手段可以实现隐私保护与创新的双赢',
          '差分隐私、联邦学习等技术提供了新的解决方案',
          '透明度和用户控制是关键'
        ],
        evidence: [
          'Apple的差分隐私技术既保护用户又改进产品',
          '联邦学习在医疗领域的成功应用',
          '区块链技术在数据确权方面的潜力'
        ],
        stakeholders: ['技术专家', '产品设计师', '学术研究者', '前瞻性企业']
      }
    ],
    visualizations: [
      {
        type: 'argument-tree',
        title: '论证结构树',
        description: '展示隐私vs创新辩论的论证层次',
        data: {
          root: '隐私 vs 创新',
          branches: [
            {
              argument: '隐私是基本权利',
              support: ['人权宣言', '宪法保护', '社会契约论'],
              counter: ['权利可以限制', '集体利益优先', '技术中性论']
            },
            {
              argument: '创新带来社会效益',
              support: ['医疗进步', '效率提升', '经济增长'],
              counter: ['负面外部性', '分配不均', '技术风险']
            }
          ]
        }
      }
    ],
    dialogueRoutes: [
      {
        id: 'tech-ethics-dialogue',
        title: '技术伦理对话路线',
        description: '引导进行技术伦理的深度对话',
        steps: [
          {
            step: 1,
            action: '场景设定',
            prompt: '描述一个具体的技术应用场景，说明其中涉及的隐私与创新冲突。',
            expectedOutcome: '具体的案例分析'
          },
          {
            step: 2,
            action: '利益分析',
            prompt: '识别所有相关的利益相关者，分析他们的不同诉求。',
            expectedOutcome: '全面的利益相关者地图'
          },
          {
            step: 3,
            action: '价值权衡',
            prompt: '在隐私、创新、安全、效率等价值之间进行权衡排序。',
            expectedOutcome: '明确的价值优先级'
          },
          {
            step: 4,
            action: '技术方案',
            prompt: '探讨是否有技术手段可以缓解或解决这种冲突。',
            expectedOutcome: '创新的解决方案'
          },
          {
            step: 5,
            action: '政策建议',
            prompt: '提出具体的政策或治理建议。',
            expectedOutcome: '可操作的政策框架'
          }
        ]
      }
    ],
    keyStakeholders: ['科技公司', '用户/消费者', '监管机构', '研究机构', '隐私倡导组织'],
    ethicalConsiderations: [
      '知情同意：用户是否真正理解数据使用方式',
      '算法透明：AI决策过程的可解释性',
      '数据最小化：只收集必要的数据',
      '用户控制：用户对自己数据的控制权'
    ],
    tags: ['技术伦理', '数据隐私', '人工智能', '数字治理']
  },
  {
    id: 'social-rights-responsibility',
    title: '社会议题：权利 vs 责任',
    category: 'social',
    difficulty: 'intermediate',
    description: '探讨个人权利与社会责任之间的平衡，分析现代社会的伦理挑战。',
    context: '在现代社会中，个人权利的扩张与社会责任的要求之间经常产生张力。一方面，个人自由和权利是现代文明的基石；另一方面，社会的正常运转需要每个人承担相应的责任。这种张力在疫情防控、环境保护、社会福利等议题上表现得尤为明显。',
    coreQuestion: '个人权利与社会责任的边界应该如何划定？在什么情况下个人应该为了集体利益而限制自己的权利？',
    perspectives: [
      {
        id: 'individual-rights',
        title: '个人权利论',
        stance: 'support',
        arguments: [
          '个人自由是不可侵犯的基本权利',
          '强制性的社会责任可能导致专制',
          '个人最了解自己的利益和需求',
          '多元化的个人选择有利于社会创新'
        ],
        evidence: [
          '历史上集体主义极端化导致的悲剧',
          '个人自由度高的社会通常更加繁荣',
          '强制疫苗接种引发的社会争议'
        ],
        stakeholders: ['自由主义者', '个人权利倡导者', '宗教团体', '少数群体']
      },
      {
        id: 'social-responsibility',
        title: '社会责任论',
        stance: 'support',
        arguments: [
          '个人是社会的一部分，有义务为集体福祉贡献',
          '某些问题只能通过集体行动解决',
          '权利与责任是相互对应的',
          '社会契约要求个人承担相应义务'
        ],
        evidence: [
          '气候变化需要全社会共同努力',
          '疫情防控的成功依赖于集体配合',
          '税收和兵役等社会义务的必要性'
        ],
        stakeholders: ['社区主义者', '环保主义者', '公共卫生专家', '政府官员']
      },
      {
        id: 'contextual-balance',
        title: '情境平衡论',
        stance: 'neutral',
        arguments: [
          '权利与责任的平衡应该根据具体情境调整',
          '紧急情况下可以临时限制某些权利',
          '需要建立民主的决策机制来平衡不同利益',
          '教育和引导比强制更有效'
        ],
        evidence: [
          '战时和平时的不同权利标准',
          '民主国家在危机时期的应对措施',
          '公共教育在提高社会责任感方面的作用'
        ],
        stakeholders: ['政治学者', '法律专家', '社会工作者', '教育工作者']
      }
    ],
    visualizations: [
      {
        type: 'stakeholder-map',
        title: '权利-责任光谱',
        description: '展示不同群体在权利-责任光谱上的分布',
        data: {
          spectrum: [
            { group: '极端个人主义者', position: 10, size: 5 },
            { group: '自由主义者', position: 25, size: 20 },
            { group: '中间派', position: 50, size: 40 },
            { group: '社区主义者', position: 75, size: 25 },
            { group: '集体主义者', position: 90, size: 10 }
          ]
        }
      }
    ],
    dialogueRoutes: [
      {
        id: 'rights-responsibility-dialogue',
        title: '权利责任对话路线',
        description: '引导进行权利与责任的平衡讨论',
        steps: [
          {
            step: 1,
            action: '案例选择',
            prompt: '选择一个具体的社会议题，说明其中涉及的权利与责任冲突。',
            expectedOutcome: '具体的案例分析'
          },
          {
            step: 2,
            action: '权利识别',
            prompt: '列出相关的个人权利，并说明其重要性。',
            expectedOutcome: '权利清单和论证'
          },
          {
            step: 3,
            action: '责任分析',
            prompt: '分析相应的社会责任，说明其必要性。',
            expectedOutcome: '责任框架和理由'
          },
          {
            step: 4,
            action: '冲突解析',
            prompt: '分析权利与责任之间的具体冲突点。',
            expectedOutcome: '冲突的深度分析'
          },
          {
            step: 5,
            action: '平衡方案',
            prompt: '提出平衡权利与责任的具体方案。',
            expectedOutcome: '可行的解决方案'
          }
        ]
      }
    ],
    keyStakeholders: ['个人公民', '社区组织', '政府机构', '法律系统', '教育机构'],
    ethicalConsiderations: [
      '比例原则：限制权利的措施应与目标成比例',
      '程序正义：决策过程应该公开透明',
      '最小伤害：选择对个人权利伤害最小的方案',
      '可逆性：政策应该是可调整和可逆的'
    ],
    tags: ['社会伦理', '个人权利', '公民责任', '社会契约']
  }
]

const categories = [
  { id: 'all', label: '全部话题', count: topicPackagesData.length },
  { id: 'policy', label: '政策分析', count: topicPackagesData.filter(t => t.category === 'policy').length },
  { id: 'technology', label: '技术伦理', count: topicPackagesData.filter(t => t.category === 'technology').length },
  { id: 'social', label: '社会议题', count: topicPackagesData.filter(t => t.category === 'social').length }
]

const difficulties = [
  { id: 'all', label: '全部难度', count: topicPackagesData.length },
  { id: 'beginner', label: '初级', count: topicPackagesData.filter(t => t.difficulty === 'beginner').length },
  { id: 'intermediate', label: '中级', count: topicPackagesData.filter(t => t.difficulty === 'intermediate').length },
  { id: 'advanced', label: '高级', count: topicPackagesData.filter(t => t.difficulty === 'advanced').length }
]

export default function TopicPackages() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState<TopicPackage | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'perspectives' | 'visualization' | 'dialogue'>('overview')
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | null>(null)
  const [dialogueStep, setDialogueStep] = useState(0)
  const [dialogueResponses, setDialogueResponses] = useState<{[key: number]: string}>({})

  const filteredTopics = topicPackagesData.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级'
      case 'intermediate': return '中级'
      case 'advanced': return '高级'
      default: return difficulty
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'policy': return <Scale className="h-5 w-5" />
      case 'technology': return <Zap className="h-5 w-5" />
      case 'social': return <Users className="h-5 w-5" />
      default: return <Globe className="h-5 w-5" />
    }
  }

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'support': return 'bg-green-100 text-green-800'
      case 'oppose': return 'bg-red-100 text-red-800'
      case 'neutral': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStanceLabel = (stance: string) => {
    switch (stance) {
      case 'support': return '支持'
      case 'oppose': return '反对'
      case 'neutral': return '中立'
      default: return stance
    }
  }

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedTopic(null)
              setActiveView('overview')
              setSelectedPerspective(null)
              setDialogueStep(0)
              setDialogueResponses({})
            }}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回话题列表
          </Button>

          {/* 话题标题 */}
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedTopic.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 mb-4">
                    {selectedTopic.description}
                  </CardDescription>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getDifficultyColor(selectedTopic.difficulty)}>
                      {getDifficultyLabel(selectedTopic.difficulty)}
                    </Badge>
                    <div className="flex gap-1">
                      {selectedTopic.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-blue-600">
                  {getCategoryIcon(selectedTopic.category)}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 导航标签 */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeView === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveView('overview')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              概览
            </Button>
            <Button
              variant={activeView === 'perspectives' ? 'default' : 'outline'}
              onClick={() => setActiveView('perspectives')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              多视角陈述
            </Button>
            <Button
              variant={activeView === 'visualization' ? 'default' : 'outline'}
              onClick={() => setActiveView('visualization')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              可视化解构
            </Button>
            <Button
              variant={activeView === 'dialogue' ? 'default' : 'outline'}
              onClick={() => setActiveView('dialogue')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              对话路线
            </Button>
          </div>

          {/* 内容区域 */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* 背景介绍 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    背景介绍
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedTopic.context}
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">核心问题：</h4>
                    <p className="text-blue-800">{selectedTopic.coreQuestion}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 关键利益相关者 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    关键利益相关者
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTopic.keyStakeholders.map((stakeholder, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded-lg text-center">
                        <span className="text-purple-800 font-medium">{stakeholder}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 伦理考量 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    伦理考量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedTopic.ethicalConsiderations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'perspectives' && (
            <div className="space-y-6">
              {selectedPerspective ? (
                // 详细视角展示
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedPerspective(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    返回视角列表
                  </Button>

                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">
                          {selectedPerspective.title}
                        </CardTitle>
                        <Badge className={getStanceColor(selectedPerspective.stance)}>
                          {getStanceLabel(selectedPerspective.stance)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 核心论点 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">核心论点</h3>
                        <ul className="space-y-2">
                          {selectedPerspective.arguments.map((argument, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{argument}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 支持证据 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">支持证据</h3>
                        <ul className="space-y-2">
                          {selectedPerspective.evidence.map((evidence, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Target className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 主要支持者 */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">主要支持者</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPerspective.stakeholders.map((stakeholder, index) => (
                            <Badge key={index} variant="outline">
                              {stakeholder}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // 视角列表
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedTopic.perspectives.map((perspective) => (
                    <Card 
                      key={perspective.id}
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                      onClick={() => setSelectedPerspective(perspective)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg">{perspective.title}</CardTitle>
                          <Badge className={getStanceColor(perspective.stance)}>
                            {getStanceLabel(perspective.stance)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">主要论点</h4>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {perspective.arguments[0]}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">支持者</h4>
                            <div className="flex flex-wrap gap-1">
                              {perspective.stakeholders.slice(0, 2).map((stakeholder, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {stakeholder}
                                </Badge>
                              ))}
                              {perspective.stakeholders.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{perspective.stakeholders.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-right">
                          <span className="text-sm text-blue-600 flex items-center justify-end gap-1">
                            查看详情 <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'visualization' && (
            <div className="space-y-6">
              {selectedTopic.visualizations.map((viz, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      {viz.title}
                    </CardTitle>
                    <CardDescription>{viz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <div className="text-gray-500 mb-4">
                        <BarChart3 className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-gray-600">
                        可视化组件将在此处显示
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        类型: {viz.type}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeView === 'dialogue' && (
            <div className="space-y-6">
              {selectedTopic.dialogueRoutes.map((route, routeIndex) => (
                <Card key={route.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      {route.title}
                    </CardTitle>
                    <CardDescription>{route.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {route.steps.map((step, stepIndex) => (
                        <div 
                          key={step.step}
                          className={`border rounded-lg p-4 ${
                            dialogueStep === stepIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              dialogueStep > stepIndex ? 'bg-green-500 text-white' :
                              dialogueStep === stepIndex ? 'bg-blue-500 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {dialogueStep > stepIndex ? <CheckCircle className="h-4 w-4" /> : step.step}
                            </div>
                            <h4 className="font-semibold text-gray-900">{step.action}</h4>
                          </div>
                          <p className="text-gray-700 mb-3">{step.prompt}</p>
                          {dialogueStep >= stepIndex && (
                            <div className="space-y-2">
                              <textarea
                                placeholder="在此输入你的回应..."
                                value={dialogueResponses[stepIndex] || ''}
                                onChange={(e) => setDialogueResponses({
                                  ...dialogueResponses,
                                  [stepIndex]: e.target.value
                                })}
                                className="w-full p-3 border rounded-lg resize-none"
                                rows={3}
                              />
                              {dialogueStep === stepIndex && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => setDialogueStep(stepIndex + 1)}
                                    disabled={!dialogueResponses[stepIndex]?.trim()}
                                    size="sm"
                                  >
                                    下一步
                                  </Button>
                                  {stepIndex > 0 && (
                                    <Button
                                      variant="outline"
                                      onClick={() => setDialogueStep(stepIndex - 1)}
                                      size="sm"
                                    >
                                      上一步
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-2 text-sm text-gray-500">
                            <strong>期望结果：</strong>{step.expectedOutcome}
                          </div>
                        </div>
                      ))}
                      
                      {dialogueStep === 0 && (
                        <div className="text-center">
                          <Button
                            onClick={() => setDialogueStep(0)}
                            className="flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            开始对话
                          </Button>
                        </div>
                      )}
                      
                      {dialogueStep >= route.steps.length && (
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-900 mb-2">
                            对话完成！
                          </h3>
                          <p className="text-green-700 mb-4">
                            你已经完成了整个对话路线，现在可以回顾你的回应或重新开始。
                          </p>
                          <Button
                            onClick={() => {
                              setDialogueStep(0)
                              setDialogueResponses({})
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            重新开始
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            话题包
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            探索复杂社会议题的多元视角，通过结构化对话培养批判性思维
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="搜索话题标题、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* 分类筛选 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">按分类筛选</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-3 w-3" />
                  {category.label}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* 难度筛选 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">按难度筛选</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty.id}
                  variant={selectedDifficulty === difficulty.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  className="flex items-center gap-2"
                >
                  {difficulty.label}
                  <Badge variant="secondary" className="ml-1">
                    {difficulty.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 话题列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card 
              key={topic.id} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {getCategoryIcon(topic.category)}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {topic.title}
                    </CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(topic.difficulty)}>
                    {getDifficultyLabel(topic.difficulty)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 line-clamp-3">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">核心问题</h4>
                    <p className="text-blue-800 text-sm line-clamp-2">
                      {topic.coreQuestion}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {topic.perspectives.length} 视角
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {topic.dialogueRoutes.length} 对话
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {topic.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <span className="text-sm text-blue-600 flex items-center justify-end gap-1">
                    探索话题 <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              没有找到匹配的话题
            </h3>
            <p className="text-gray-600">
              尝试调整搜索条件或筛选选项
            </p>
          </div>
        )}
      </div>
    </div>
  )
}