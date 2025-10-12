'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Search,
  ArrowRight,
  Target,
  Lightbulb,
  Eye,
  HelpCircle,
  RotateCcw,
  Link2,
  BookOpen,
  Play,
  Zap,
  BarChart3,
  CheckCircle,
  Clock,
  Award,
  Users,
  TrendingUp,
  ArrowLeft,
  Star,
  Sparkles,
  FileText
} from 'lucide-react'

// 导入实例分析组件
import CausalAnalysisExample from './case-analysis/CausalAnalysisExample'
import PremiseChallengeExampleNew from './case-analysis/PremiseChallengeExampleNew'
import FallacyDetectionExample from './case-analysis/FallacyDetectionExample'
import IterativeReflectionExample from './case-analysis/IterativeReflectionExample'
import ConnectionTransferExample from './case-analysis/ConnectionTransferExample'

interface ThinkingType {
  id: string
  name: string
  description: string
  icon: string
  learningContent: {
    framework?: {
      title: string
      steps: string[]
    }
    methods?: Array<{
      name: string
      description: string
      application: string
    }>
    examples?: Array<{
      scenario: string
      analysis: string
      outcome: string
    }>
  }
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

const thinkingTypeIcons = {
  causal_analysis: Search,
  premise_challenge: HelpCircle,
  fallacy_detection: Eye,
  iterative_reflection: RotateCcw,
  connection_transfer: Link2
}

const thinkingTypeColors = {
  causal_analysis: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'bg-blue-600',
    hover: 'hover:from-blue-100 hover:to-blue-150'
  },
  premise_challenge: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
    accent: 'bg-green-600',
    hover: 'hover:from-green-100 hover:to-green-150'
  },
  fallacy_detection: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
    accent: 'bg-red-600',
    hover: 'hover:from-red-100 hover:to-red-150'
  },
  iterative_reflection: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
    accent: 'bg-purple-600',
    hover: 'hover:from-purple-100 hover:to-purple-150'
  },
  connection_transfer: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'bg-orange-600',
    hover: 'hover:from-orange-100 hover:to-orange-150'
  }
}

export default function DimensionsCenter() {
  const [thinkingTypes, setThinkingTypes] = useState<ThinkingType[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)

  useEffect(() => {
    fetchThinkingTypes()
    fetchUserProgress()
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
        if (data.success && data.data.progress) {
          setUserProgress(data.data.progress)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressForType = (typeId: string) => {
    return userProgress.find(p => p.thinkingTypeId === typeId)
  }

  const getProgressPercentage = (progress: UserProgress | undefined) => {
    if (!progress || progress.totalQuestions === 0) return 0
    return Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
  }

  const selectedType = selectedDimension ? thinkingTypes.find(t => t.id === selectedDimension) : null

  if (selectedType) {
    const IconComponent = thinkingTypeIcons[selectedType.id as keyof typeof thinkingTypeIcons] || Brain
    const colors = thinkingTypeColors[selectedType.id as keyof typeof thinkingTypeColors] || thinkingTypeColors.causal_analysis
    const progress = getProgressForType(selectedType.id)
    const progressPercentage = getProgressPercentage(progress)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedDimension(null)}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回维度中心
            </Button>
          </div>

          {/* Dimension Header */}
          <div className={`${colors.bg} ${colors.border} ${colors.hover} rounded-2xl p-8 mb-8 border-2`}>
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <IconComponent className={`h-12 w-12 ${colors.icon}`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {selectedType.name}
                </h1>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {selectedType.description}
                </p>
                
                {/* Progress and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {progress && (
                    <>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{progressPercentage}%</div>
                        <div className="text-sm text-gray-600">完成进度</div>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{progress.correctAnswers}</div>
                        <div className="text-sm text-gray-600">已完成题目</div>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{progress.averageScore.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">平均分数</div>
                      </div>
                    </>
                  )}
                  {!progress && (
                    <div className="md:col-span-3 bg-white bg-opacity-70 rounded-lg p-4 text-center">
                      <div className="text-lg font-semibold text-gray-900 mb-1">开始你的学习之旅</div>
                      <div className="text-sm text-gray-600">还没有练习记录，立即开始学习吧！</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/learn/thinking-types/${selectedType.id}`}>
                    <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
                      <Play className="mr-2 h-5 w-5" />
                      {progress ? '继续学习' : '开始学习'}
                    </Button>
                  </Link>
                  <Link href={`/learn/thinking-types/${selectedType.id}/practice`}>
                    <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
                      <Zap className="mr-2 h-5 w-5" />
                      智能练习
                    </Button>
                  </Link>
                  <Link href={`/learn/thinking-types/${selectedType.id}/progress`}>
                    <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      查看进度
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Content Tabs */}
          <Tabs defaultValue="framework" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="framework" className="data-[state=active]:bg-blue-50">
                学习框架
              </TabsTrigger>
              <TabsTrigger value="methods" className="data-[state=active]:bg-blue-50">
                核心方法
              </TabsTrigger>
              <TabsTrigger value="case-analysis" className="data-[state=active]:bg-blue-50">
                <FileText className="h-4 w-4 mr-2" />
                实例分析
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-blue-50">
                实践案例
              </TabsTrigger>
            </TabsList>

            {/* Framework Tab */}
            <TabsContent value="framework" className="space-y-6">
              {selectedType.learningContent.framework && (
                <Card className="bg-white shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <Target className="mr-3 h-6 w-6 text-blue-600" />
                      {selectedType.learningContent.framework.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedType.learningContent.framework.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Methods Tab */}
            <TabsContent value="methods" className="space-y-6">
              {selectedType.learningContent.methods && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedType.learningContent.methods.map((method, index) => (
                    <Card key={index} className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                          <Lightbulb className="mr-3 h-5 w-5 text-yellow-600" />
                          {method.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">{method.description}</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm font-semibold text-blue-800 mb-1">适用场景</div>
                          <div className="text-sm text-blue-700">{method.application}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Case Analysis Tab - 实例分析 */}
            <TabsContent value="case-analysis" className="space-y-6">
              {selectedType.id === 'causal_analysis' && <CausalAnalysisExample />}
              {selectedType.id === 'premise_challenge' && <PremiseChallengeExampleNew />}
              {selectedType.id === 'fallacy_detection' && <FallacyDetectionExample />}
              {selectedType.id === 'iterative_reflection' && <IterativeReflectionExample />}
              {selectedType.id === 'connection_transfer' && <ConnectionTransferExample />}
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-6">
              {selectedType.learningContent.examples && (
                <div className="space-y-6">
                  {selectedType.learningContent.examples.map((example, index) => (
                    <Card key={index} className="bg-white shadow-lg border-2">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                          <Star className="mr-3 h-5 w-5 text-purple-600" />
                          案例 {index + 1}: {example.scenario}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-semibold text-gray-800 mb-2">分析过程</div>
                          <p className="text-gray-700 leading-relaxed">{example.analysis}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="font-semibold text-green-800 mb-2">预期结果</div>
                          <p className="text-green-700 leading-relaxed">{example.outcome}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border mb-6">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">五大核心思维维度</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            思维维度
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              学习中心
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            深入了解每个思维维度的核心理念、学习框架和实践方法，
            <br className="hidden sm:block" />
            系统化提升批判性思维的各个方面
          </p>
        </div>

        {/* Back to Learning Center */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="outline" className="hover:bg-gray-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回学习中心
            </Button>
          </Link>
        </div>

        {/* Dimensions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="animate-pulse h-64">
                <CardHeader>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {thinkingTypes.map((type) => {
              const IconComponent = thinkingTypeIcons[type.id as keyof typeof thinkingTypeIcons] || Brain
              const colors = thinkingTypeColors[type.id as keyof typeof thinkingTypeColors] || thinkingTypeColors.causal_analysis
              const progress = getProgressForType(type.id)
              const progressPercentage = getProgressPercentage(progress)

              return (
                <Card 
                  key={type.id} 
                  className={`${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 cursor-pointer overflow-hidden`}
                  onClick={() => setSelectedDimension(type.id)}
                >
                  {/* Progress indicator */}
                  {progress && (
                    <div className="h-2 bg-gray-200">
                      <div 
                        className={`h-full ${colors.accent} transition-all duration-500`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-white rounded-xl shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow">
                          <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 mb-3">
                            {type.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {progress && (
                              <Badge className={`${colors.badge} font-semibold`}>
                                {progressPercentage}% 完成
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-white bg-opacity-70">
                              核心维度
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <CardDescription className="text-gray-700 leading-relaxed text-base">
                      {type.description}
                    </CardDescription>
                    
                    {/* Learning Content Preview */}
                    <div className="bg-white bg-opacity-60 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div className="flex flex-col items-center">
                          <Target className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="font-medium">学习框架</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Lightbulb className="h-5 w-5 text-yellow-600 mb-1" />
                          <span className="font-medium">核心方法</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Star className="h-5 w-5 text-purple-600 mb-1" />
                          <span className="font-medium">实践案例</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    {progress && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                          <div className="font-bold text-gray-900">{progress.correctAnswers}</div>
                          <div className="text-gray-600">已完成</div>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                          <div className="font-bold text-gray-900">{progress.averageScore.toFixed(1)}</div>
                          <div className="text-gray-600">平均分</div>
                        </div>
                        <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                          <div className="font-bold text-gray-900">
                            {progress.lastPracticeAt ? '最近' : '未开始'}
                          </div>
                          <div className="text-gray-600">练习</div>
                        </div>
                      </div>
                    )}

                    {/* Click hint */}
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                        点击查看详细内容
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">学习统计概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{thinkingTypes.length}</div>
              <div className="text-sm text-gray-600">思维维度</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {userProgress.reduce((sum, p) => sum + p.correctAnswers, 0)}
              </div>
              <div className="text-sm text-gray-600">已完成练习</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {userProgress.length > 0 
                  ? Math.round(userProgress.reduce((sum, p) => sum + p.averageScore, 0) / userProgress.length * 10) / 10
                  : 0
                }
              </div>
              <div className="text-sm text-gray-600">平均分数</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {userProgress.length > 0 
                  ? Math.round(userProgress.reduce((sum, p) => sum + getProgressPercentage(p), 0) / userProgress.length)
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-600">整体进度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}