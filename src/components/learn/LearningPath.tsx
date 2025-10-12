'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target,
  Lightbulb,
  TrendingUp,
  Eye,
  HelpCircle,
  RotateCcw,
  Link2,
  Search,
  BookOpen,
  Users,
  Star,
  Timer,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  Zap,
  Award,
  Map,
  Compass,
  Route,
  Flag,
  ChevronRight,
  AlertCircle,
  Rocket,
  Calendar,
  Activity,
  BarChart3,
  Flame
} from 'lucide-react'

interface ThinkingType {
  id: string
  name: string
  description: string
  icon: string
}

interface UserProgress {
  thinkingTypeId: string
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  lastPracticeAt: Date | null
}

interface LearningPathStep {
  id: string
  title: string
  description: string
  type: 'assessment' | 'learning' | 'practice' | 'review'
  thinkingTypeId?: string
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
  locked: boolean
  prerequisites?: string[]
}

interface PersonalizedRecommendation {
  type: 'weakness' | 'strength' | 'next_step' | 'review'
  title: string
  description: string
  action: string
  href: string
  priority: 'high' | 'medium' | 'low'
  thinkingTypeId?: string
}

const thinkingTypeIcons = {
  causal_analysis: Search,
  premise_challenge: HelpCircle,
  fallacy_detection: Eye,
  iterative_reflection: RotateCcw,
  connection_transfer: Link2
}

const thinkingTypeColors = {
  causal_analysis: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    accent: 'bg-blue-600'
  },
  premise_challenge: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    accent: 'bg-green-600'
  },
  fallacy_detection: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    accent: 'bg-red-600'
  },
  iterative_reflection: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    accent: 'bg-purple-600'
  },
  connection_transfer: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    accent: 'bg-orange-600'
  }
}

const stepTypeIcons = {
  assessment: Target,
  learning: BookOpen,
  practice: Zap,
  review: RotateCcw
}

const stepTypeColors = {
  assessment: 'bg-blue-50 border-blue-200 text-blue-600',
  learning: 'bg-green-50 border-green-200 text-green-600',
  practice: 'bg-orange-50 border-orange-200 text-orange-600',
  review: 'bg-purple-50 border-purple-200 text-purple-600'
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export default function LearningPath() {
  const [thinkingTypes, setThinkingTypes] = useState<ThinkingType[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchThinkingTypes(),
        fetchUserProgress(),
        generateLearningPath(),
        generateRecommendations()
      ])
    } catch (error) {
      console.error('Failed to fetch learning path data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchThinkingTypes = async () => {
    try {
      const response = await fetch('/api/thinking-types')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setThinkingTypes(data.data.types)
        }
      }
    } catch (error) {
      console.error('Failed to fetch thinking types:', error)
    }
  }

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/critical-thinking/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.progress) {
          setUserProgress(data.data.progress)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    }
  }

  const generateLearningPath = async () => {
    // Mock learning path generation based on user progress
    const mockPath: LearningPathStep[] = [
      {
        id: 'initial-assessment',
        title: '初始能力评估',
        description: '全面评估你的批判性思维基础能力',
        type: 'assessment',
        estimatedTime: 20,
        difficulty: 'beginner',
        completed: true,
        locked: false
      },
      {
        id: 'causal-analysis-intro',
        title: '多维归因与利弊权衡入门',
        description: '学习多维度归因和权衡分析的基础方法',
        type: 'learning',
        thinkingTypeId: 'causal_analysis',
        estimatedTime: 30,
        difficulty: 'beginner',
        completed: true,
        locked: false,
        prerequisites: ['initial-assessment']
      },
      {
        id: 'causal-analysis-practice',
        title: '多维归因与利弊权衡练习',
        description: '通过实际案例练习多维归因与利弊权衡技能',
        type: 'practice',
        thinkingTypeId: 'causal_analysis',
        estimatedTime: 25,
        difficulty: 'beginner',
        completed: false,
        locked: false,
        prerequisites: ['causal-analysis-intro']
      },
      {
        id: 'premise-challenge-intro',
        title: '前提质疑学习',
        description: '掌握前提质疑和方法批判的核心技巧',
        type: 'learning',
        thinkingTypeId: 'premise_challenge',
        estimatedTime: 35,
        difficulty: 'intermediate',
        completed: false,
        locked: false,
        prerequisites: ['causal-analysis-practice']
      },
      {
        id: 'fallacy-detection-basics',
        title: '谬误识别基础',
        description: '学习识别常见逻辑谬误和证据评估',
        type: 'learning',
        thinkingTypeId: 'fallacy_detection',
        estimatedTime: 40,
        difficulty: 'intermediate',
        completed: false,
        locked: true,
        prerequisites: ['premise-challenge-intro']
      },
      {
        id: 'integrated-practice',
        title: '综合思维练习',
        description: '整合多个思维维度的综合性练习',
        type: 'practice',
        estimatedTime: 45,
        difficulty: 'advanced',
        completed: false,
        locked: true,
        prerequisites: ['fallacy-detection-basics']
      }
    ]
    setLearningPath(mockPath)
  }

  const generateRecommendations = async () => {
    // Mock AI-generated recommendations
    const mockRecommendations: PersonalizedRecommendation[] = [
      {
        type: 'weakness',
        title: '加强前提质疑能力',
        description: '你在前提质疑方面的表现有待提升，建议重点练习',
        action: '开始专项练习',
        href: '/learn/thinking-types/premise_challenge/practice',
        priority: 'high',
        thinkingTypeId: 'premise_challenge'
      },
      {
        type: 'next_step',
        title: '学习谬误识别',
        description: '基于你的当前进度，建议开始学习谬误识别技能',
        action: '开始学习',
        href: '/learn/thinking-types/fallacy_detection',
        priority: 'medium',
        thinkingTypeId: 'fallacy_detection'
      },
      {
        type: 'strength',
        title: '多维归因与利弊权衡表现优秀',
        description: '你在多维归因与利弊权衡方面表现出色，可以尝试更高难度的挑战',
        action: '挑战高级练习',
        href: '/learn/thinking-types/causal_analysis/practice?difficulty=advanced',
        priority: 'low',
        thinkingTypeId: 'causal_analysis'
      },
      {
        type: 'review',
        title: '复习迭代反思',
        description: '距离上次练习已有一段时间，建议复习巩固',
        action: '开始复习',
        href: '/learn/thinking-types/iterative_reflection',
        priority: 'medium',
        thinkingTypeId: 'iterative_reflection'
      }
    ]
    setRecommendations(mockRecommendations)
  }

  const getProgressPercentage = (progress: UserProgress) => {
    if (progress.totalQuestions === 0) return 0
    return Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
  }

  const getOverallProgress = () => {
    const completedSteps = learningPath.filter(step => step.completed).length
    return Math.round((completedSteps / learningPath.length) * 100)
  }

  const getNextStep = () => {
    return learningPath.find(step => !step.completed && !step.locked)
  }

  const filteredPath = selectedDifficulty === 'all' 
    ? learningPath 
    : learningPath.filter(step => step.difficulty === selectedDifficulty)

  const priorityRecommendations = recommendations.filter(r => r.priority === 'high')
  const otherRecommendations = recommendations.filter(r => r.priority !== 'high')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                个性化学习路径
              </h1>
              <p className="text-gray-600 text-lg">
                基于AI分析的定制化批判性思维学习计划
              </p>
            </div>
            <Link href="/learn">
              <Button variant="outline" className="hidden sm:flex">
                返回学习中心
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">学习路径进度</p>
                  <p className="text-3xl font-bold text-gray-900">{getOverallProgress()}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {learningPath.filter(s => s.completed).length}/{learningPath.length} 步骤完成
                  </p>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Route className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">预计完成时间</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(learningPath.filter(s => !s.completed).reduce((sum, s) => sum + s.estimatedTime, 0) / 60)}h
                  </p>
                  <p className="text-sm text-gray-600 mt-1">剩余学习时间</p>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <Timer className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">个性化推荐</p>
                  <p className="text-3xl font-bold text-gray-900">{priorityRecommendations.length}</p>
                  <p className="text-sm text-gray-600 mt-1">高优先级建议</p>
                </div>
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Path Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Map className="h-5 w-5 mr-2 text-blue-600" />
                      学习路径规划
                    </CardTitle>
                    <CardDescription>
                      按照科学顺序安排的学习步骤
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                    >
                      <option value="all">全部难度</option>
                      <option value="beginner">初级</option>
                      <option value="intermediate">中级</option>
                      <option value="advanced">高级</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredPath.map((step, index) => {
                  const StepIcon = stepTypeIcons[step.type]
                  const nextStep = getNextStep()
                  const isNext = nextStep?.id === step.id
                  const thinkingType = step.thinkingTypeId ? thinkingTypes.find(t => t.id === step.thinkingTypeId) : null
                  const ThinkingIcon = step.thinkingTypeId ? thinkingTypeIcons[step.thinkingTypeId as keyof typeof thinkingTypeIcons] : null
                  const colors = step.thinkingTypeId ? thinkingTypeColors[step.thinkingTypeId as keyof typeof thinkingTypeColors] : null

                  return (
                    <div key={step.id} className={`relative ${index < filteredPath.length - 1 ? 'pb-8' : ''}`}>
                      {/* Connection Line */}
                      {index < filteredPath.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      
                      <div className={`
                        flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300
                        ${step.completed 
                          ? 'bg-green-50 border-green-200' 
                          : step.locked 
                            ? 'bg-gray-50 border-gray-200 opacity-60' 
                            : isNext
                              ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}>
                        {/* Step Icon */}
                        <div className={`
                          p-3 rounded-xl flex-shrink-0
                          ${step.completed 
                            ? 'bg-green-600 text-white' 
                            : step.locked 
                              ? 'bg-gray-300 text-gray-500'
                              : isNext
                                ? 'bg-yellow-600 text-white'
                                : stepTypeColors[step.type]
                          }
                        `}>
                          {step.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : step.locked ? (
                            <Clock className="h-6 w-6" />
                          ) : (
                            <StepIcon className="h-6 w-6" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1 flex items-center">
                                {step.title}
                                {isNext && (
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                    <Rocket className="h-3 w-3 mr-1" />
                                    下一步
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                              
                              <div className="flex items-center space-x-3 text-xs">
                                <Badge className={difficultyColors[step.difficulty]}>
                                  {step.difficulty === 'beginner' ? '初级' : 
                                   step.difficulty === 'intermediate' ? '中级' : '高级'}
                                </Badge>
                                <span className="text-gray-500 flex items-center">
                                  <Timer className="h-3 w-3 mr-1" />
                                  {step.estimatedTime} 分钟
                                </span>
                                {thinkingType && ThinkingIcon && colors && (
                                  <span className={`flex items-center ${colors.text}`}>
                                    <ThinkingIcon className="h-3 w-3 mr-1" />
                                    {thinkingType.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="ml-4">
                              {step.completed ? (
                                <Button variant="outline" size="sm" className="text-green-600 border-green-300">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  已完成
                                </Button>
                              ) : step.locked ? (
                                <Button variant="outline" size="sm" disabled>
                                  <Clock className="h-4 w-4 mr-1" />
                                  未解锁
                                </Button>
                              ) : (
                                <Link href={step.thinkingTypeId ? `/learn/thinking-types/${step.thinkingTypeId}` : '/practice'}>
                                  <Button size="sm" className={isNext ? 'bg-yellow-600 hover:bg-yellow-700' : ''}>
                                    <Play className="h-4 w-4 mr-1" />
                                    {step.type === 'assessment' ? '开始评估' :
                                     step.type === 'learning' ? '开始学习' :
                                     step.type === 'practice' ? '开始练习' : '开始复习'}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            {/* High Priority Recommendations */}
            {priorityRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    重点建议
                  </CardTitle>
                  <CardDescription>
                    基于你的学习情况的重要建议
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priorityRecommendations.map((rec, index) => {
                    const colors = rec.thinkingTypeId ? thinkingTypeColors[rec.thinkingTypeId as keyof typeof thinkingTypeColors] : null
                    const ThinkingIcon = rec.thinkingTypeId ? thinkingTypeIcons[rec.thinkingTypeId as keyof typeof thinkingTypeIcons] : null

                    return (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          {ThinkingIcon && colors && (
                            <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                              <ThinkingIcon className={`h-4 w-4 ${colors.text}`} />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                            <Link href={rec.href}>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                {rec.action}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Other Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  个性化建议
                </CardTitle>
                <CardDescription>
                  为你量身定制的学习建议
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {otherRecommendations.map((rec, index) => {
                  const colors = rec.thinkingTypeId ? thinkingTypeColors[rec.thinkingTypeId as keyof typeof thinkingTypeColors] : null
                  const ThinkingIcon = rec.thinkingTypeId ? thinkingTypeIcons[rec.thinkingTypeId as keyof typeof thinkingTypeIcons] : null

                  return (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        {ThinkingIcon && colors && (
                          <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                            <ThinkingIcon className={`h-4 w-4 ${colors.text}`} />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          <Link href={rec.href}>
                            <Button variant="outline" size="sm">
                              {rec.action}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  快速行动
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/practice">
                  <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                    <Flame className="h-4 w-4 mr-2" />
                    开始每日练习
                  </Button>
                </Link>
                <Link href="/learn/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    查看学习数据
                  </Button>
                </Link>
                <Link href="/learn/dimensions">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    探索思维维度
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}