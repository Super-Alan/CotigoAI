'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Search,
  ArrowRight,
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Eye,
  HelpCircle,
  RotateCcw,
  Link2,
  BookOpen,
  BarChart3,
  Star,
  Clock,
  Award,
  Play,
  ChevronRight,
  Zap,
  Trophy,
  Calendar,
  Activity,
  Sparkles,
  Map,
  Compass,
  Flame,
  CheckCircle,
  Timer,
  Rocket
} from 'lucide-react'

interface ThinkingType {
  id: string
  name: string
  description: string
  icon: string
  learningContent: any
  createdAt: Date
  updatedAt: Date
}

interface UserProgress {
  thinkingTypeId: string
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  lastPracticeAt: Date | null
}

interface DailyStreak {
  currentStreak: number
  longestStreak: number
  lastPracticeDate: Date | null
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
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'bg-blue-600',
    glow: 'shadow-blue-200'
  },
  premise_challenge: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
    accent: 'bg-green-600',
    glow: 'shadow-green-200'
  },
  fallacy_detection: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-150',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
    accent: 'bg-red-600',
    glow: 'shadow-red-200'
  },
  iterative_reflection: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
    accent: 'bg-purple-600',
    glow: 'shadow-purple-200'
  },
  connection_transfer: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'bg-orange-600',
    glow: 'shadow-orange-200'
  }
}

const quickActions = [
  {
    id: 'daily-practice',
    title: '每日练习',
    description: '智能推荐今日练习',
    icon: Flame,
    href: '/learn/daily',
    color: 'text-red-600',
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    glow: 'hover:shadow-red-200'
  },
  {
    id: 'learning-path',
    title: '学习路径',
    description: '个性化学习计划',
    icon: Map,
    href: '/learn/path',
    color: 'text-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    glow: 'hover:shadow-blue-200'
  },
  {
    id: 'progress-dashboard',
    title: '进度仪表板',
    description: '可视化学习数据',
    icon: BarChart3,
    href: '/learn/dashboard',
    color: 'text-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-200',
    glow: 'hover:shadow-purple-200'
  },
  {
    id: 'ai-tutor',
    title: 'AI 导师',
    description: '智能学习助手',
    icon: Sparkles,
    href: '/chat',
    color: 'text-green-600',
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    glow: 'hover:shadow-green-200'
  }
]

const legacyModules = [
  {
    id: 'fallacies',
    title: '逻辑谬误库',
    description: '识别和应对各种逻辑谬误',
    icon: Brain,
    href: '/learn/fallacies',
    count: 25,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    id: 'templates',
    title: '论证模板',
    description: '掌握经典论证结构',
    icon: BookOpen,
    href: '/learn/templates',
    count: 12,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'methodology',
    title: '方法论课程',
    description: '系统学习思维方法',
    icon: Target,
    href: '/learn/methodology',
    count: 16,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    id: 'topics',
    title: '话题包',
    description: '复杂议题多角度分析',
    icon: Lightbulb,
    href: '/learn/topics',
    count: 8,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  }
]

export default function LearningCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [thinkingTypes, setThinkingTypes] = useState<ThinkingType[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [dailyStreak, setDailyStreak] = useState<DailyStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedType, setRecommendedType] = useState<string | null>(null)

  useEffect(() => {
    fetchThinkingTypes()
    fetchUserProgress()
    fetchDailyStreak()
  }, [])

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
        if (data.success && Array.isArray(data.data.progress)) {
          const progressArr: UserProgress[] = data.data.progress
          setUserProgress(progressArr)
          // 智能推荐：找到进度最低的维度（空数组容错）
          if (progressArr.length > 0) {
            const lowestProgress = progressArr.reduce((min: UserProgress, current: UserProgress) => {
              const currentPercentage = current.totalQuestions > 0 ? (current.correctAnswers / current.totalQuestions) * 100 : 0
              const minPercentage = min.totalQuestions > 0 ? (min.correctAnswers / min.totalQuestions) * 100 : 0
              return currentPercentage < minPercentage ? current : min
            })
            setRecommendedType(lowestProgress.thinkingTypeId)
          } else {
            // 没有进度数据时，推荐第一个思维维度（若已加载）
            if (thinkingTypes.length > 0) {
              setRecommendedType(thinkingTypes[0].id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyStreak = async () => {
    try {
      const response = await fetch('/api/daily-streak')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDailyStreak(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily streak:', error)
    }
  }

  const getProgressForType = (typeId: string) => {
    return userProgress.find(p => p.thinkingTypeId === typeId)
  }

  const getProgressPercentage = (progress: UserProgress | undefined) => {
    if (!progress || progress.totalQuestions === 0) return 0
    return Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
  }

  const filteredThinkingTypes = thinkingTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + getProgressPercentage(p), 0) / userProgress.length)
    : 0

  const totalQuestions = userProgress.reduce((sum, p) => sum + p.correctAnswers, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border mb-6">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">五维批判性思维学习平台</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            智能化
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              思维训练中心
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
            基于五大核心思维维度的AI驱动学习体系，通过个性化路径和智能练习，
            <br className="hidden sm:block" />
            系统提升批判性思维能力，培养理性分析和独立思考的习惯
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            {/* Overall Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{totalProgress}%</div>
              <div className="text-sm text-gray-600">整体进度</div>
            </div>

            {/* Daily Streak */}
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {dailyStreak?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-600">连续天数</div>
            </div>

            {/* Total Questions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{totalQuestions}</div>
              <div className="text-sm text-gray-600">已完成题目</div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-8 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="搜索思维维度或学习内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">快速入口</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <Card className={`${action.bg} ${action.border} transition-all duration-300 hover:shadow-lg ${action.glow} hover:scale-105 group cursor-pointer`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <action.icon className={`h-7 w-7 ${action.color}`} />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Core Thinking Dimensions */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                五大核心思维维度
              </h2>
              <p className="text-gray-600">系统化培养批判性思维的核心能力</p>
            </div>
            <Link href="/learn/dimensions">
              <Button variant="outline" className="hidden sm:flex items-center hover:bg-blue-50 hover:border-blue-300">
                查看全部维度
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="animate-pulse h-80">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThinkingTypes.map((type) => {
                const IconComponent = thinkingTypeIcons[type.id as keyof typeof thinkingTypeIcons] || Brain
                const colors = thinkingTypeColors[type.id as keyof typeof thinkingTypeColors] || thinkingTypeColors.causal_analysis
                const progress = getProgressForType(type.id)
                const progressPercentage = getProgressPercentage(progress)
                const isRecommended = recommendedType === type.id

                return (
                  <Card key={type.id} className={`${colors.bg} transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 overflow-hidden relative ${isRecommended ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Sparkles className="h-3 w-3 mr-1" />
                          推荐
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-4 relative">
                      {/* Progress indicator */}
                      {progress && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                          <div 
                            className={`h-full ${colors.accent} transition-all duration-500`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 bg-white rounded-xl shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow ${colors.glow}`}>
                            <IconComponent className={`h-7 w-7 ${colors.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 mb-2">
                              {type.name}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              {progress && (
                                <Badge className={`${colors.badge} font-semibold`}>
                                  {progressPercentage}% 完成
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs bg-white bg-opacity-70 text-gray-700">
                                核心维度
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-4">
                      <CardDescription className="text-gray-700 leading-relaxed text-base">
                        {type.description}
                      </CardDescription>
                      
                      {/* Progress Details */}
                      {progress && (
                        <div className="bg-white bg-opacity-60 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-900">{progress.correctAnswers}</div>
                              <div className="text-xs text-gray-600">已完成</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{progress.averageScore.toFixed(1)}</div>
                              <div className="text-xs text-gray-600">平均分</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {progress.lastPracticeAt ? '最近' : '未开始'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {progress.lastPracticeAt 
                                  ? new Date(progress.lastPracticeAt).toLocaleDateString()
                                  : '练习'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Link href={`/learn/critical-thinking/${type.id}`} className="block">
                          <Button className={`w-full group h-12 text-base font-semibold ${isRecommended ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                            {progress ? '继续学习' : '开始学习'}
                            {isRecommended ? (
                              <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            ) : (
                              <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Button>
                        </Link>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/learn/critical-thinking/${type.id}/practice`}>
                            <Button variant="outline" className="w-full h-10 text-sm bg-white hover:bg-gray-50">
                              <Zap className="mr-2 h-4 w-4" />
                              智能练习
                            </Button>
                          </Link>
                          <Link href={`/learn/critical-thinking/${type.id}/progress`}>
                            <Button variant="outline" className="w-full h-10 text-sm bg-white hover:bg-gray-50">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              查看进度
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Legacy Learning Modules */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                经典学习模块
              </h2>
              <p className="text-gray-600">传统学习资源，与五维思维体系互补</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {legacyModules.map((module) => (
              <Link key={module.id} href={module.href}>
                <Card className={`${module.bg} border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-pointer`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <module.icon className={`h-6 w-6 ${module.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {module.count} 项
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700">
                      <span>立即学习</span>
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            开始你的批判性思维之旅
          </h2>
          <p className="text-lg mb-6 opacity-90">
            通过科学的方法和AI的帮助，系统提升思维能力
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/learn/daily">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Flame className="mr-2 h-5 w-5" />
                开始每日练习
              </Button>
            </Link>
            <Link href="/learn/path">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Compass className="mr-2 h-5 w-5" />
                制定学习计划
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}