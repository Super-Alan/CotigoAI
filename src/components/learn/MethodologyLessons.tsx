'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Search, 
  Filter, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Play,
  RotateCcw,
  Award,
  Target,
  Lightbulb,
  Users,
  BarChart3,
  Microscope,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface InteractiveTask {
  id: string
  title: string
  description: string
  type: 'quiz' | 'scenario' | 'analysis'
  questions: Question[]
}

interface MethodologyLesson {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // 分钟
  description: string
  learningObjectives: string[]
  content: {
    section: string
    content: string
    examples: string[]
  }[]
  interactiveTask: InteractiveTask
  keyTakeaways: string[]
  tags: string[]
}

const lessonsData: MethodologyLesson[] = [
  {
    id: 'sampling-inference',
    title: '样本与外推',
    category: 'statistics',
    difficulty: 'beginner',
    duration: 15,
    description: '学习如何从样本数据中得出可靠的结论，理解样本代表性和外推的局限性。',
    learningObjectives: [
      '理解样本与总体的关系',
      '识别样本偏差的类型',
      '评估外推结论的可靠性',
      '掌握改善样本质量的方法'
    ],
    content: [
      {
        section: '样本的重要性',
        content: '在现实世界中，我们很少能够观察到完整的总体，因此需要通过样本来推断总体特征。样本的质量直接影响结论的可靠性。',
        examples: [
          '民意调查：通过调查1000人来推断全国民意',
          '药物试验：通过临床试验参与者来评估药物效果',
          '市场研究：通过消费者样本来预测产品销量'
        ]
      },
      {
        section: '常见的样本偏差',
        content: '样本偏差是指样本不能准确代表目标总体的情况，这会导致错误的推论。',
        examples: [
          '选择偏差：只调查愿意参与的人群',
          '生存偏差：只观察到"成功"的案例',
          '确认偏差：倾向于收集支持预期结果的数据'
        ]
      },
      {
        section: '提高样本质量的方法',
        content: '通过科学的抽样方法和适当的样本规模，可以提高样本的代表性。',
        examples: [
          '随机抽样：确保每个个体都有相等的被选中概率',
          '分层抽样：按照重要特征将总体分层后抽样',
          '增加样本规模：减少随机误差的影响'
        ]
      }
    ],
    interactiveTask: {
      id: 'sampling-quiz',
      title: '样本分析挑战',
      description: '测试你对样本和外推的理解',
      type: 'quiz',
      questions: [
        {
          id: 'q1',
          question: '一项关于大学生睡眠习惯的研究只调查了图书馆里的学生。这个样本可能存在什么问题？',
          options: [
            '样本规模太小',
            '存在选择偏差，图书馆里的学生可能更勤奋',
            '调查时间不合适',
            '问题设计有误'
          ],
          correctAnswer: 1,
          explanation: '在图书馆的学生可能比一般学生更勤奋，睡眠习惯也可能不同，因此这个样本不能代表所有大学生。'
        },
        {
          id: 'q2',
          question: '某公司想了解员工满意度，通过邮件发送调查问卷。只有30%的员工回复了问卷，且满意度很高。这个结果可靠吗？',
          options: [
            '可靠，因为满意度很高',
            '不可靠，因为回复率太低',
            '可靠，因为样本足够大',
            '不可靠，因为调查方式不当'
          ],
          correctAnswer: 1,
          explanation: '低回复率可能导致回复偏差，不满意的员工可能更不愿意回复问卷，因此结果可能过于乐观。'
        },
        {
          id: 'q3',
          question: '要研究一个城市居民的平均收入，最好的抽样方法是？',
          options: [
            '在商业区随机调查',
            '通过电话随机调查',
            '在各个社区按比例随机抽样',
            '调查政府工作人员'
          ],
          correctAnswer: 2,
          explanation: '按社区比例抽样可以确保不同收入水平的居民都被包含在样本中，提高代表性。'
        }
      ]
    },
    keyTakeaways: [
      '样本质量比样本数量更重要',
      '识别和避免各种类型的样本偏差',
      '外推结论时要考虑样本的局限性',
      '使用科学的抽样方法提高可靠性'
    ],
    tags: ['统计学', '数据分析', '研究方法']
  },
  {
    id: 'experiment-control',
    title: '实验与对照',
    category: 'research',
    difficulty: 'intermediate',
    duration: 20,
    description: '掌握实验设计的基本原理，理解对照组的重要性和因果推断的条件。',
    learningObjectives: [
      '理解实验设计的基本要素',
      '掌握对照组的设置原理',
      '识别混淆变量的影响',
      '评估因果关系的证据强度'
    ],
    content: [
      {
        section: '实验设计的核心要素',
        content: '良好的实验设计需要包含对照组、随机分组和控制变量，这样才能得出可靠的因果结论。',
        examples: [
          '药物试验：实验组服用新药，对照组服用安慰剂',
          '教学方法研究：实验组使用新方法，对照组使用传统方法',
          'A/B测试：用户随机分为两组，体验不同的产品版本'
        ]
      },
      {
        section: '对照组的类型和作用',
        content: '对照组帮助我们排除其他因素的影响，确保观察到的效果确实来自于我们测试的变量。',
        examples: [
          '空白对照：不接受任何处理的组别',
          '安慰剂对照：接受无效处理的组别',
          '积极对照：接受已知有效处理的组别'
        ]
      },
      {
        section: '混淆变量的识别与控制',
        content: '混淆变量是可能影响结果但不是我们关注的主要变量，需要通过设计来控制。',
        examples: [
          '年龄、性别等人口统计学变量',
          '环境因素如温度、时间等',
          '参与者的期望和态度'
        ]
      }
    ],
    interactiveTask: {
      id: 'experiment-design',
      title: '实验设计挑战',
      description: '设计一个科学的实验来验证假设',
      type: 'scenario',
      questions: [
        {
          id: 'q1',
          question: '某公司想测试新的员工培训方法是否能提高工作效率。以下哪种实验设计最合理？',
          options: [
            '让所有新员工都接受新培训，然后测量效率',
            '随机选择一半新员工接受新培训，另一半接受传统培训',
            '让表现好的员工接受新培训',
            '让员工自己选择接受哪种培训'
          ],
          correctAnswer: 1,
          explanation: '随机分组可以确保两组员工在其他方面相似，这样观察到的效率差异更可能来自培训方法的不同。'
        },
        {
          id: 'q2',
          question: '在测试新药效果的实验中，为什么要使用双盲设计？',
          options: [
            '节省成本',
            '加快实验进度',
            '防止患者和医生的期望影响结果',
            '减少副作用'
          ],
          correctAnswer: 2,
          explanation: '双盲设计确保患者和医生都不知道谁接受了真药，这样可以排除心理因素对结果的影响。'
        },
        {
          id: 'q3',
          question: '某研究发现，喝咖啡的人心脏病发病率较低。这能说明咖啡预防心脏病吗？',
          options: [
            '能，因为数据显示了相关性',
            '不能，这只是观察性研究，不能证明因果关系',
            '能，因为样本量很大',
            '不能，因为咖啡对健康有害'
          ],
          correctAnswer: 1,
          explanation: '观察性研究只能显示相关性，不能证明因果关系。可能存在其他因素（如生活方式）同时影响咖啡消费和心脏健康。'
        }
      ]
    },
    keyTakeaways: [
      '随机对照实验是证明因果关系的金标准',
      '对照组帮助排除其他因素的影响',
      '混淆变量需要通过设计来控制',
      '观察性研究只能显示相关性，不能证明因果关系'
    ],
    tags: ['实验设计', '因果推断', '科学方法']
  },
  {
    id: 'statistics-causation',
    title: '统计与因果',
    category: 'analysis',
    difficulty: 'advanced',
    duration: 25,
    description: '深入理解统计显著性与实际意义的区别，掌握因果推断的高级方法。',
    learningObjectives: [
      '区分统计显著性和实际意义',
      '理解p值的正确解释',
      '掌握效应量的概念',
      '学习因果推断的现代方法'
    ],
    content: [
      {
        section: '统计显著性 vs 实际意义',
        content: '统计显著性只表示结果不太可能由随机因素造成，但不代表结果在实际中有重要意义。',
        examples: [
          '大样本研究中微小的差异可能统计显著但无实际意义',
          '新药降低血压2mmHg，统计显著但临床意义有限',
          '教学方法提高考试成绩0.5分，统计显著但教育意义不大'
        ]
      },
      {
        section: 'p值的误解与正确理解',
        content: 'p值经常被误解，它不是假设为真的概率，而是在零假设为真的条件下观察到当前结果的概率。',
        examples: [
          '错误理解：p=0.05意味着假设有5%的概率为真',
          '正确理解：如果假设为真，有5%的概率观察到这样的结果',
          'p值不能告诉我们效应的大小或重要性'
        ]
      },
      {
        section: '因果推断的现代方法',
        content: '除了随机实验，还有其他方法可以帮助我们从观察数据中推断因果关系。',
        examples: [
          '工具变量：利用外生变量来识别因果效应',
          '断点回归：利用政策断点来识别因果效应',
          '差分差分：比较处理组和对照组在处理前后的变化'
        ]
      }
    ],
    interactiveTask: {
      id: 'statistics-analysis',
      title: '统计推断挑战',
      description: '测试你对统计推断和因果关系的理解',
      type: 'analysis',
      questions: [
        {
          id: 'q1',
          question: '一项研究发现，新的减肥药物平均减重0.5公斤，p<0.001。这个结果如何解释？',
          options: [
            '药物非常有效，因为p值很小',
            '药物效果显著，值得推广',
            '虽然统计显著，但实际效果很小',
            '结果不可信，因为减重太少'
          ],
          correctAnswer: 2,
          explanation: '虽然p值很小表示结果统计显著，但0.5公斤的减重在实际中意义有限，可能不值得药物的成本和副作用。'
        },
        {
          id: 'q2',
          question: '某研究发现教育年限与收入正相关，r=0.6，p<0.001。这说明什么？',
          options: [
            '教育直接导致收入增加',
            '教育与收入有强相关关系，但不能确定因果关系',
            '收入增加导致教育年限增加',
            '教育对收入没有影响'
          ],
          correctAnswer: 1,
          explanation: '相关关系不等于因果关系。可能存在其他因素（如家庭背景、能力）同时影响教育和收入。'
        },
        {
          id: 'q3',
          question: '在评估一个政策效果时，为什么简单的前后比较可能不够？',
          options: [
            '因为数据可能不准确',
            '因为可能存在其他同时发生的变化',
            '因为政策效果需要更长时间显现',
            '因为样本量可能不够大'
          ],
          correctAnswer: 1,
          explanation: '简单的前后比较无法排除其他同时发生的因素的影响，需要使用对照组或其他方法来识别政策的真实效果。'
        }
      ]
    },
    keyTakeaways: [
      '统计显著性不等于实际重要性',
      'p值不是假设为真的概率',
      '效应量比p值更重要',
      '因果推断需要谨慎的研究设计'
    ],
    tags: ['统计推断', '多维归因与利弊权衡', '研究方法']
  },
  {
    id: 'ethics-risk',
    title: '伦理审视与风险边界',
    category: 'ethics',
    difficulty: 'advanced',
    duration: 30,
    description: '学习如何在研究和决策中进行伦理考量，识别和管理各种风险。',
    learningObjectives: [
      '掌握研究伦理的基本原则',
      '学会识别伦理风险',
      '理解风险评估的方法',
      '掌握伦理决策的框架'
    ],
    content: [
      {
        section: '研究伦理的基本原则',
        content: '研究伦理基于尊重人格、有益性和公正性三个基本原则，指导我们进行负责任的研究。',
        examples: [
          '知情同意：参与者必须了解研究内容并自愿参与',
          '风险最小化：研究风险应该最小化，收益应该最大化',
          '公平选择：研究参与者的选择应该公平，不能歧视特定群体'
        ]
      },
      {
        section: '伦理风险的识别',
        content: '研究和决策可能带来各种伦理风险，需要提前识别和评估。',
        examples: [
          '隐私风险：个人信息可能被泄露或滥用',
          '心理风险：研究可能对参与者造成心理伤害',
          '社会风险：研究结果可能加剧社会不平等'
        ]
      },
      {
        section: '风险管理策略',
        content: '通过适当的策略可以降低或管理伦理风险。',
        examples: [
          '数据匿名化：保护参与者隐私',
          '建立监督机制：定期审查研究进展',
          '制定应急预案：准备应对意外情况'
        ]
      }
    ],
    interactiveTask: {
      id: 'ethics-scenarios',
      title: '伦理决策挑战',
      description: '在复杂情境中做出伦理决策',
      type: 'scenario',
      questions: [
        {
          id: 'q1',
          question: '某AI公司想使用用户数据训练模型，但获得每个用户同意成本很高。最合理的做法是？',
          options: [
            '直接使用数据，因为用户已经同意了服务条款',
            '使用匿名化数据，并在隐私政策中说明',
            '只使用明确同意的用户数据',
            '购买第三方数据来避免伦理问题'
          ],
          correctAnswer: 2,
          explanation: '尊重用户自主权要求获得明确同意，特别是对于可能影响用户的AI模型训练。'
        },
        {
          id: 'q2',
          question: '某医学研究可能找到治疗罕见疾病的方法，但需要对儿童进行有风险的实验。如何平衡？',
          options: [
            '禁止对儿童进行任何有风险的实验',
            '只要家长同意就可以进行',
            '严格评估风险收益比，确保潜在收益远大于风险',
            '先在成人身上试验，即使效果可能不同'
          ],
          correctAnswer: 2,
          explanation: '需要仔细权衡风险和收益，确保研究设计最小化风险，并且潜在收益足够大。'
        },
        {
          id: 'q3',
          question: '某社会科学研究发现某族群在某项能力上的差异，但结果可能被误用来支持歧视。应该怎么办？',
          options: [
            '不发表研究结果',
            '发表结果但不提及族群差异',
            '发表完整结果，但详细说明局限性和误用风险',
            '只在学术圈内分享结果'
          ],
          correctAnswer: 2,
          explanation: '科学诚实要求发表真实结果，但需要负责任地解释结果，防止误用和歧视。'
        }
      ]
    },
    keyTakeaways: [
      '伦理考量应该贯穿研究和决策的全过程',
      '需要平衡不同的伦理原则和利益相关者',
      '风险管理是伦理责任的重要组成部分',
      '透明度和问责制是伦理实践的基础'
    ],
    tags: ['研究伦理', '风险管理', '道德决策']
  }
]

const categories = [
  { id: 'all', label: '全部课程', count: lessonsData.length },
  { id: 'statistics', label: '统计方法', count: lessonsData.filter(l => l.category === 'statistics').length },
  { id: 'research', label: '研究设计', count: lessonsData.filter(l => l.category === 'research').length },
  { id: 'analysis', label: '数据分析', count: lessonsData.filter(l => l.category === 'analysis').length },
  { id: 'ethics', label: '研究伦理', count: lessonsData.filter(l => l.category === 'ethics').length }
]

const difficulties = [
  { id: 'all', label: '全部难度', count: lessonsData.length },
  { id: 'beginner', label: '初级', count: lessonsData.filter(l => l.difficulty === 'beginner').length },
  { id: 'intermediate', label: '中级', count: lessonsData.filter(l => l.difficulty === 'intermediate').length },
  { id: 'advanced', label: '高级', count: lessonsData.filter(l => l.difficulty === 'advanced').length }
]

export default function MethodologyLessons() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedLesson, setSelectedLesson] = useState<MethodologyLesson | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [showTask, setShowTask] = useState(false)
  const [taskAnswers, setTaskAnswers] = useState<{[key: string]: number}>({})
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const filteredLessons = lessonsData.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty
    
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
      case 'statistics': return <BarChart3 className="h-5 w-5" />
      case 'research': return <Microscope className="h-5 w-5" />
      case 'analysis': return <Target className="h-5 w-5" />
      case 'ethics': return <Shield className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const handleTaskSubmit = () => {
    if (!selectedLesson) return
    
    let correctCount = 0
    selectedLesson.interactiveTask.questions.forEach(question => {
      if (taskAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    
    setScore(correctCount)
    setTaskCompleted(true)
  }

  const resetTask = () => {
    setTaskAnswers({})
    setTaskCompleted(false)
    setScore(0)
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedLesson(null)
              setCurrentSection(0)
              setShowTask(false)
              resetTask()
            }}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回课程列表
          </Button>

          {!showTask ? (
            // 课程内容
            <div className="space-y-6">
              {/* 课程标题 */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedLesson.title}
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600 mb-4">
                        {selectedLesson.description}
                      </CardDescription>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
                          {getDifficultyLabel(selectedLesson.difficulty)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedLesson.duration} 分钟
                        </Badge>
                        <div className="flex gap-1">
                          {selectedLesson.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-purple-600">
                      {getCategoryIcon(selectedLesson.category)}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 学习目标 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    学习目标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedLesson.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 课程内容 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    课程内容
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {selectedLesson.content.map((section, index) => (
                      <div key={index} className="border-l-4 border-purple-200 pl-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {section.section}
                        </h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {section.content}
                        </p>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2">实例：</h4>
                          <ul className="space-y-1">
                            {section.examples.map((example, exIndex) => (
                              <li key={exIndex} className="text-purple-800 text-sm">
                                • {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 关键要点 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    关键要点
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedLesson.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-600 text-xs font-semibold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 开始交互任务按钮 */}
              <div className="text-center">
                <Button 
                  onClick={() => setShowTask(true)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  开始交互任务
                </Button>
              </div>
            </div>
          ) : (
            // 交互任务
            <div className="space-y-6">
              {/* 任务标题 */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedLesson.interactiveTask.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {selectedLesson.interactiveTask.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {!taskCompleted ? (
                // 问题列表
                <div className="space-y-6">
                  {selectedLesson.interactiveTask.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          问题 {index + 1}: {question.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name={question.id}
                                value={optionIndex}
                                checked={taskAnswers[question.id] === optionIndex}
                                onChange={() => setTaskAnswers({
                                  ...taskAnswers,
                                  [question.id]: optionIndex
                                })}
                                className="text-blue-600"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleTaskSubmit}
                      disabled={Object.keys(taskAnswers).length !== selectedLesson.interactiveTask.questions.length}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      提交答案
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowTask(false)}
                    >
                      返回课程内容
                    </Button>
                  </div>
                </div>
              ) : (
                // 结果展示
                <div className="space-y-6">
                  {/* 得分 */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Award className="h-8 w-8 text-yellow-500" />
                        <CardTitle className="text-2xl">
                          任务完成！
                        </CardTitle>
                      </div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {score} / {selectedLesson.interactiveTask.questions.length}
                      </div>
                      <CardDescription className="text-lg">
                        正确率: {Math.round((score / selectedLesson.interactiveTask.questions.length) * 100)}%
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* 答案解析 */}
                  <div className="space-y-4">
                    {selectedLesson.interactiveTask.questions.map((question, index) => {
                      const userAnswer = taskAnswers[question.id]
                      const isCorrect = userAnswer === question.correctAnswer
                      
                      return (
                        <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              {isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                              )}
                              <div>
                                <CardTitle className="text-lg mb-2">
                                  问题 {index + 1}: {question.question}
                                </CardTitle>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="font-semibold">你的答案: </span>
                                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                      {question.options[userAnswer]}
                                    </span>
                                  </p>
                                  {!isCorrect && (
                                    <p className="text-sm">
                                      <span className="font-semibold">正确答案: </span>
                                      <span className="text-green-600">
                                        {question.options[question.correctAnswer]}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-blue-800">
                                <strong>解析：</strong>{question.explanation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={resetTask}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      重新测试
                    </Button>
                    <Button 
                      onClick={() => setShowTask(false)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      返回课程内容
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            方法论微课
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            通过交互式微课学习研究方法论，掌握科学思维和分析技能
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="搜索课程标题、描述或标签..."
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

        {/* 课程列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
              onClick={() => setSelectedLesson(lesson)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-purple-600">
                      {getCategoryIcon(lesson.category)}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {lesson.title}
                    </CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(lesson.difficulty)}>
                    {getDifficultyLabel(lesson.difficulty)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 line-clamp-3">
                  {lesson.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {lesson.duration} 分钟
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    {lesson.interactiveTask.questions.length} 个练习
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {lesson.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{lesson.content.length} 个章节</span>
                  <span className="flex items-center gap-1">
                    开始学习 <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              没有找到匹配的课程
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