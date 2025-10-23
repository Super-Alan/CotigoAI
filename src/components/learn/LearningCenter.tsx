'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import AIQuestionChatbox from './AIQuestionChatbox'
import TheorySystemContainerV2 from './thinking-types/TheorySystemContainerV2'
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
  Rocket,
  GraduationCap
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
  questionsCompleted: number
  progressPercentage: number
  averageScore: number
  lastUpdated: Date
  lastPracticeAt?: Date | null
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
              return current.progressPercentage < min.progressPercentage ? current : min
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
    if (!progress) return 0
    return progress.progressPercentage
  }

  const filteredThinkingTypes = thinkingTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProgress = userProgress.length > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + getProgressPercentage(p), 0) / userProgress.length)
    : 0

  const totalQuestions = userProgress.reduce((sum, p) => sum + p.questionsCompleted, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section - Mobile Optimized */}
        <div className="relative mb-6 sm:mb-10">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-2xl sm:rounded-3xl -z-10" />

          <div className="text-center py-6 sm:py-8 px-4">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border mb-4 sm:mb-5 animate-fade-in">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">五维批判性思维学习平台</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI 驱动
              </span>
              智能学习中心
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              基于五大核心思维维度的智能化学习体系，通过AI导师的个性化指导和每日精选问题，系统提升批判性思维能力
            </p>

            {/* Primary CTA - Mobile Optimized with larger touch targets */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center px-2 sm:px-0">
              <Link href="/chat" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[50px] sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  AI 导师对话
                </Button>
              </Link>
              <Link href="/learn/daily" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[50px] sm:h-12 border-2 hover:bg-white px-6 sm:px-8 text-sm sm:text-base font-semibold">
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  开始今日练习
                </Button>
              </Link>

            </div>
          </div>
        </div>

        {/* Enhanced Search Bar - Navigate to search page */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-10 px-2 sm:px-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                window.location.href = `/learn/search?q=${encodeURIComponent(searchQuery.trim())}`
              }
            }}
            className="relative group"
          >
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 sm:h-6 sm:w-6 z-10 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索理论知识、学习内容、思维方法..."
              className="pl-12 sm:pl-16 pr-32 h-20 sm:h-24 text-base sm:text-lg rounded-2xl sm:rounded-3xl border-2 border-gray-200 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all bg-white"
            />
            <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <Button
                type="submit"
                size="sm"
                className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                搜索
              </Button>
            </div>
          </form>
        </div>

        {/* Unified Container - Consistent Width */}
        <div className="mb-6 sm:mb-10 max-w-7xl mx-auto">
          {/* Section: AI 每日一问 */}
          <div className="mb-6 sm:mb-8">
            <AIQuestionChatbox />
          </div>

          {/* Section: 快速入口 */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
              快速入口
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <Card className={`${action.bg} ${action.border} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group active:scale-95 h-full`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                          <action.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${action.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base text-gray-900">{action.title}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{action.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Core Thinking Dimensions - Mobile Optimized */}
        <div className="mb-8 sm:mb-12 md:mb-16 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                五大核心思维维度
              </h2>
              <p className="text-sm sm:text-base text-gray-600">系统化培养批判性思维的核心能力</p>
            </div>
            <Link href="/learn/dimensions" className="sm:flex-shrink-0">
              <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 min-h-[44px]">
                查看全部维度
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(5)].map((_, index) => (
                <Card key={index} className="animate-pulse h-72 sm:h-80">
                  <CardHeader>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-28 sm:h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                              <div className="text-lg font-bold text-gray-900">{progress.questionsCompleted}</div>
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

                      {/* Action Buttons - Mobile Optimized */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <Link href={`/learn/critical-thinking/${type.id}`} className="block">
                          <Button className={`w-full group min-h-[48px] sm:h-12 text-sm sm:text-base font-semibold ${isRecommended ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                            {progress ? '继续学习' : '开始学习'}
                            {isRecommended ? (
                              <Rocket className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            ) : (
                              <Play className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Button>
                        </Link>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/learn/critical-thinking/${type.id}/practice`}>
                            <Button variant="outline" className="w-full min-h-[42px] sm:h-10 text-xs sm:text-sm bg-white hover:bg-gray-50">
                              <Zap className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              智能练习
                            </Button>
                          </Link>
                          <Link href="/learn/critical-thinking/progress">
                            <Button variant="outline" className="w-full min-h-[42px] sm:h-10 text-xs sm:text-sm bg-white hover:bg-gray-50">
                              <BarChart3 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

        {/* Theory System - Collapsible per dimension */}
        <div className="mb-8 sm:mb-12 md:mb-16 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                批判性思维理论体系
              </h2>
              <p className="text-sm sm:text-base text-gray-600">系统化学习五大维度的理论基础 - 5个Level × 4类内容</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredThinkingTypes.map((type) => (
              <TheorySystemContainerV2
                key={`theory-${type.id}`}
                thinkingTypeId={type.id}
                thinkingTypeName={type.name}
                initialExpanded={false}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              💡 <strong>学习建议</strong>：理论体系按照由浅入深的5个Level设计，建议从Level 1开始逐步学习。每个Level包含核心概念、思维模型和实例演示三个章节。
            </p>
          </div>
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            开始你的批判性思维之旅
          </h2>
          <p className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 opacity-90">
            通过科学的方法和AI的帮助，系统提升思维能力
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <Link href="/learn/daily" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-h-[50px] bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Flame className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                开始每日练习
              </Button>
            </Link>
            <Link href="/learn/path" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[50px] bg-white text-blue-600 hover:bg-gray-100 font-semibold border-white">
                <Compass className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                制定学习计划
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}