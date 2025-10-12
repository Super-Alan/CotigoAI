'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Target,
  RefreshCw,
  BookOpen
} from 'lucide-react'
import { CriticalThinkingQuestion, PracticeEvaluation } from '@/types'
import CaseAnalysisDisplay from './CaseAnalysisDisplay'
import ConceptActivationCard from './ConceptActivationCard'
import { CaseAnalysisResult } from '@/lib/prompts/case-analysis-prompts'
import { LearningContent } from '@/lib/knowledge/learning-content-data'

interface PracticeSessionProps {
  thinkingTypeId: string
}

interface ThinkingType {
  id: string
  name: string
  description: string
  icon: string
  learningContent: LearningContent | null
}

const thinkingTypeNames = {
  causal_analysis: '多维归因与利弊权衡',
  premise_challenge: '前提质疑与方法批判',
  fallacy_detection: '谬误检测',
  iterative_reflection: '迭代反思',
  connection_transfer: '知识迁移',
  // 兼容旧类型
  analytical: '分析性思维',
  creative: '创造性思维',
  practical: '实用性思维',
  caring: '关怀性思维',
  systematic: '系统性思维'
}

export default function PracticeSession({ thinkingTypeId }: PracticeSessionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState<CriticalThinkingQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [currentStep, setCurrentStep] = useState(0) // 0: question, 1: guiding questions, 2: answer, 3: evaluation
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysisResult | null>(null)
  const [loadingCaseAnalysis, setLoadingCaseAnalysis] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('theory') // theory | case-analysis | practice
  const [thinkingType, setThinkingType] = useState<ThinkingType | null>(null)
  const [loadingThinkingType, setLoadingThinkingType] = useState(true)

  const typeName = thinkingTypeNames[thinkingTypeId as keyof typeof thinkingTypeNames] || '批判性思维'

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadThinkingType()
    loadQuestion()
  }, [thinkingTypeId, session, status, router])

  const loadThinkingType = async () => {
    try {
      setLoadingThinkingType(true)
      const response = await fetch(`/api/thinking-types/${thinkingTypeId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setThinkingType(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load thinking type:', error)
    } finally {
      setLoadingThinkingType(false)
    }
  }

  const loadQuestion = async () => {
    if (!session) return

    try {
      setLoading(true)

      // 首先尝试从数据库获取现有题目
      const response = await fetch(`/api/thinking-types/${thinkingTypeId}/questions?limit=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.questions.length > 0) {
          const question = data.data.questions[0]
          setCurrentQuestion(question)
          setStartTime(new Date())
          setCurrentStep(0)
          setUserAnswer('')
          setEvaluation(null)

          // 加载案例分析（如果存在）
          if (question.caseAnalysis) {
            setCaseAnalysis(question.caseAnalysis as CaseAnalysisResult)
          } else {
            // 如果没有案例分析，尝试生成
            loadCaseAnalysis(question.id)
          }
          return
        }
      }

      // 如果没有现有题目，则调用AI生成新题目
      const generateResponse = await fetch(`/api/thinking-types/${thinkingTypeId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          difficulty: 'intermediate' // 默认中等难度
        })
      })

      if (generateResponse.ok) {
        const generateData = await generateResponse.json()
        if (generateData.success && generateData.data.question) {
          const question = generateData.data.question
          setCurrentQuestion(question)
          setStartTime(new Date())
          setCurrentStep(0)
          setUserAnswer('')
          setEvaluation(null)

          // 加载案例分析
          if (question.id) {
            loadCaseAnalysis(question.id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load question:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCaseAnalysis = async (questionId: string) => {
    try {
      setLoadingCaseAnalysis(true)

      const response = await fetch(`/api/analysis/generate-case?questionId=${questionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.caseAnalysis) {
          setCaseAnalysis(data.data.caseAnalysis as CaseAnalysisResult)
        }
      }
    } catch (error) {
      console.error('Failed to load case analysis:', error)
    } finally {
      setLoadingCaseAnalysis(false)
    }
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return

    try {
      setSubmitting(true)
      const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0

      const response = await fetch('/api/critical-thinking/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: userAnswer.trim(),
          thinkingTypeId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvaluation(data.data.evaluation)
          setCurrentStep(3)
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const nextQuestion = () => {
    loadQuestion()
  }

  const handleProceedToCaseStudy = () => {
    setActiveTab('case-analysis')
  }

  const handleSkipToPractice = () => {
    setActiveTab('practice')
    setCurrentStep(1) // Skip to guiding questions step
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">正在加载练习题目...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">暂无练习题目</h2>
          <p className="text-gray-600 mb-4">该思维类型的练习题目正在准备中</p>
          <Link href={`/learn/critical-thinking/${thinkingTypeId}`}>
            <Button>返回学习页面</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/learn/critical-thinking/${thinkingTypeId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回{typeName}学习
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {typeName}练习
            </h1>
            <Badge variant="outline" className="text-sm">
              {currentQuestion.difficulty === 'beginner' ? '初级' : 
               currentQuestion.difficulty === 'intermediate' ? '中级' : '高级'}
            </Badge>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mb-6">
            {['题目理解', '引导思考', '回答问题', '获得反馈'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="theory">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      理论学习
                    </TabsTrigger>
                    <TabsTrigger value="case-analysis">
                      <BookOpen className="h-4 w-4 mr-2" />
                      实例分析
                    </TabsTrigger>
                    <TabsTrigger value="practice">
                      <Target className="h-4 w-4 mr-2" />
                      核心技能
                    </TabsTrigger>
                  </TabsList>

                  {/* 理论学习 Tab */}
                  <TabsContent value="theory" className="mt-6">
                    {loadingThinkingType ? (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">正在加载学习内容...</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : thinkingType?.learningContent ? (
                      <ConceptActivationCard
                        thinkingTypeName={typeName}
                        learningContent={thinkingType.learningContent}
                        onProceedToCaseStudy={handleProceedToCaseStudy}
                        onSkipToPractice={handleSkipToPractice}
                      />
                    ) : (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              学习内容暂未配置
                            </h3>
                            <p className="text-gray-600">
                              该思维维度的学习内容正在准备中
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* 实例分析 Tab */}
                  <TabsContent value="case-analysis" className="mt-6">
                    {loadingCaseAnalysis ? (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">AI正在生成专业的案例分析...</p>
                            <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟时间</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : caseAnalysis ? (
                      <CaseAnalysisDisplay caseAnalysis={caseAnalysis} />
                    ) : (
                      <Card>
                        <CardContent className="py-12">
                          <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">案例分析暂未生成</h3>
                            <p className="text-gray-600 mb-4">点击下方按钮生成专业的案例分析</p>
                            <Button
                              onClick={() => currentQuestion?.id && loadCaseAnalysis(currentQuestion.id)}
                              disabled={!currentQuestion?.id}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              生成案例分析
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* 核心技能 Tab */}
                  <TabsContent value="practice" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          练习题目
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {(currentQuestion as any).question}
                          </p>
                          {currentQuestion.context && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                              <h4 className="font-medium text-blue-900 mb-2">背景信息：</h4>
                              <p className="text-blue-800">{currentQuestion.context}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Guiding Questions */}
                    {currentStep >= 1 && currentQuestion.guidingQuestions && currentQuestion.guidingQuestions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2" />
                            引导问题
                          </CardTitle>
                          <CardDescription>
                            这些问题可以帮助你更好地思考和分析
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {currentQuestion.guidingQuestions
                              .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                              .map((gq: any, index: number) => (
                              <div key={gq.id} className="border-l-4 border-green-500 pl-4 py-2">
                                <div className="flex items-start space-x-2">
                                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 mb-1">{gq.question}</p>
                                    <p className="text-sm text-gray-600">{gq.purpose}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Answer Input */}
                    {currentStep >= 2 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            你的回答
                          </CardTitle>
                          <CardDescription>
                            请结合引导问题，详细阐述你的思考过程和结论
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="请在这里输入你的回答..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="min-h-[200px] mb-4"
                            disabled={currentStep >= 3}
                          />
                          {currentStep === 2 && (
                            <div className="flex justify-end">
                              <Button
                                onClick={submitAnswer}
                                disabled={!userAnswer.trim() || submitting}
                                className="px-6"
                              >
                                {submitting ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    评估中...
                                  </>
                                ) : (
                                  <>
                                    提交回答
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Evaluation Results */}
                    {currentStep >= 3 && evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    AI 评估反馈
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {evaluation.score}/10
                      </div>
                      <div className="text-sm text-gray-600">综合得分</div>
                    </div>

                    {/* Detailed Scores - 暂时隐藏，因为当前评估结构不包含详细分数 */}
                    {/* 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(evaluation.scores || {}).map(([key, score]) => {
                        const labels = {
                          depth: '思维深度',
                          logic: '逻辑性',
                          critical: '批判性',
                          completeness: '完整性',
                          innovation: '创新性'
                        }
                        return (
                          <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {labels[key as keyof typeof labels]}
                              </span>
                              <span className="text-sm font-bold text-gray-900">{score as number}/10</span>
                            </div>
                            <Progress value={(score as number) * 10} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                    */}

                    {/* Feedback */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h4 className="font-medium text-blue-900 mb-2">详细反馈：</h4>
                      <p className="text-blue-800 leading-relaxed">{evaluation.feedback}</p>
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          优点
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-800 flex items-start">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          改进建议
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-yellow-800 flex items-start">
                              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Next Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button onClick={nextQuestion} className="flex-1">
                        下一题练习
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Link href={`/learn/critical-thinking/${thinkingTypeId}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          返回学习
                        </Button>
                      </Link>
                    </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">练习进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentStep < 1 && (
                    <Button 
                      onClick={() => setCurrentStep(1)} 
                      className="w-full"
                      disabled={currentStep >= 1}
                    >
                      查看引导问题
                    </Button>
                  )}
                  {currentStep < 2 && currentStep >= 1 && (
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      className="w-full"
                    >
                      开始回答
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            {startTime && currentStep < 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    用时统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor((Date.now() - startTime.getTime()) / 60000)}:
                      {String(Math.floor(((Date.now() - startTime.getTime()) % 60000) / 1000)).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">分:秒</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">练习提示</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>仔细阅读题目，理解问题的核心</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>利用引导问题帮助你深入思考</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>回答要有逻辑性和条理性</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>不要害怕表达自己的观点</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}