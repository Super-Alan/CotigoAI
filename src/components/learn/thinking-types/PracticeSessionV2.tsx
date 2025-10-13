'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  BookOpen,
  Play
} from 'lucide-react'
import { CriticalThinkingQuestion, PracticeEvaluation } from '@/types'
import CaseAnalysisDisplay from './CaseAnalysisDisplay'
import ReflectionSummary from './ReflectionSummary'
import { CaseAnalysisResult } from '@/lib/prompts/case-analysis-prompts'

interface PracticeSessionProps {
  thinkingTypeId: string
}

// 6步线性流程（已移除概念学习步骤）
type FlowStep =
  | 'case'          // Step 1: 案例学习
  | 'problem'       // Step 2: 题目呈现
  | 'guided'        // Step 3: 引导思考
  | 'answer'        // Step 4: 完整作答
  | 'feedback'      // Step 5: 评估反馈
  | 'reflection'    // Step 6: 反思总结

const STEP_CONFIG = {
  case: { index: 0, title: '案例学习', icon: BookOpen },
  problem: { index: 1, title: '题目呈现', icon: MessageSquare },
  guided: { index: 2, title: '引导思考', icon: Lightbulb },
  answer: { index: 3, title: '完整作答', icon: Target },
  feedback: { index: 4, title: '评估反馈', icon: CheckCircle },
  reflection: { index: 5, title: '反思总结', icon: Lightbulb }
}

const thinkingTypeNames = {
  causal_analysis: '多维归因与利弊权衡',
  premise_challenge: '前提质疑与方法批判',
  fallacy_detection: '谬误检测',
  iterative_reflection: '迭代反思',
  connection_transfer: '知识迁移'
}

export default function PracticeSessionV2({ thinkingTypeId }: PracticeSessionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Core state
  const [currentQuestion, setCurrentQuestion] = useState<CriticalThinkingQuestion | null>(null)
  const [flowStep, setFlowStep] = useState<FlowStep>('case')
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Step-specific state
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysisResult | null>(null)
  const [loadingCaseAnalysis, setLoadingCaseAnalysis] = useState(false)
  const [intelligentGuided, setIntelligentGuided] = useState<any>(null)
  const [loadingGuidedQuestions, setLoadingGuidedQuestions] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reflection, setReflection] = useState<any>(null)

  const typeName = thinkingTypeNames[thinkingTypeId as keyof typeof thinkingTypeNames] || '批判性思维'

  // 从 localStorage 恢复状态
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedState = localStorage.getItem(`practice-session-${thinkingTypeId}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.flowStep) setFlowStep(parsed.flowStep)
        if (parsed.userAnswer) setUserAnswer(parsed.userAnswer)
        if (parsed.intelligentGuided) setIntelligentGuided(parsed.intelligentGuided)
        if (parsed.evaluation) setEvaluation(parsed.evaluation)
        if (parsed.reflection) setReflection(parsed.reflection)
        if (parsed.caseAnalysis) setCaseAnalysis(parsed.caseAnalysis)
      } catch (e) {
        console.error('Failed to restore session state:', e)
      }
    }
  }, [thinkingTypeId])

  // 保存状态到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !currentQuestion) return

    const stateToSave = {
      flowStep,
      userAnswer,
      intelligentGuided,
      evaluation,
      reflection,
      caseAnalysis,
      timestamp: Date.now()
    }
    localStorage.setItem(`practice-session-${thinkingTypeId}`, JSON.stringify(stateToSave))
  }, [flowStep, userAnswer, intelligentGuided, evaluation, reflection, caseAnalysis, thinkingTypeId, currentQuestion])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadQuestion()
  }, [thinkingTypeId, session, status, router])

  const loadQuestion = async () => {
    if (!session) return

    try {
      setLoading(true)
      setFlowStep('case')
      setUserAnswer('')
      setEvaluation(null)
      setReflection(null)
      setCaseAnalysis(null)
      setIntelligentGuided(null)

      // 清除localStorage中的旧状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`practice-session-${thinkingTypeId}`)
      }

      // 尝试从数据库获取现有题目
      const response = await fetch(`/api/thinking-types/${thinkingTypeId}/questions?limit=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.questions.length > 0) {
          const question = data.data.questions[0]
          setCurrentQuestion(question)
          setStartTime(new Date())

          // 加载案例分析
          if (question.caseAnalysis) {
            setCaseAnalysis(question.caseAnalysis as CaseAnalysisResult)
          } else {
            loadCaseAnalysis(question.id)
          }
          return
        }
      }

      // 如果没有现有题目，生成新题目
      const generateResponse = await fetch(`/api/thinking-types/${thinkingTypeId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'intermediate' })
      })

      if (generateResponse.ok) {
        const generateData = await generateResponse.json()
        if (generateData.success && generateData.data.question) {
          const question = generateData.data.question
          setCurrentQuestion(question)
          setStartTime(new Date())

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

  const loadIntelligentGuidedQuestions = async () => {
    if (!currentQuestion) return

    try {
      setLoadingGuidedQuestions(true)
      const response = await fetch('/api/critical-thinking/guided-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id, // 🔥 新增：传递题目ID用于缓存查询
          thinkingType: thinkingTypeId,
          questionTopic: currentQuestion.topic,
          questionContext: currentQuestion.context,
          difficulty: currentQuestion.difficulty
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 保存引导问题数据和缓存状态
          setIntelligentGuided({
            ...data.data,
            cached: data.cached,
            message: data.message
          })
        }
      }
    } catch (error) {
      console.error('Failed to load intelligent guided questions:', error)
    } finally {
      setLoadingGuidedQuestions(false)
    }
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return

    try {
      setSubmitting(true)
      const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0

      const response = await fetch('/api/critical-thinking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          setFlowStep('feedback')
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReflectionComplete = async (reflectionData: any) => {
    setReflection(reflectionData)

    // 保存到数据库
    try {
      const timeSpent = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0

      const response = await fetch('/api/critical-thinking/practice-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion?.id,
          thinkingTypeId,
          answers: userAnswer, // 用户完整答案
          score: evaluation?.score || 0,
          aiFeedback: evaluation?.feedback || '',
          evaluationDetails: evaluation || null,
          reflection: reflectionData, // 反思数据
          timeSpent
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('保存会话失败:', error)
        alert(error.error || '保存失败，请重试')
        return
      }

      const result = await response.json()
      console.log('会话保存成功:', result)
    } catch (error) {
      console.error('保存会话网络错误:', error)
      alert('网络错误，请检查连接后重试')
      return
    }

    // 加载下一题
    loadQuestion()
  }

  const proceedToNextStep = (nextStep: FlowStep) => {
    setFlowStep(nextStep)
  }

  const handleStepClick = (stepKey: string) => {
    const step = stepKey as FlowStep
    const stepConfig = STEP_CONFIG[step]

    // 检查是否可以跳转到该步骤
    // 规则：只能跳转到已完成的步骤或当前步骤的下一步
    const currentIndex = STEP_CONFIG[flowStep].index
    const targetIndex = stepConfig.index

    // 允许跳转到：
    // 1. 已完成的步骤（targetIndex < currentIndex）
    // 2. 当前步骤（targetIndex === currentIndex）
    // 3. 下一步（targetIndex === currentIndex + 1）
    if (targetIndex <= currentIndex + 1) {
      // 如果跳转到"引导思考"步骤，且还没有加载引导问题，则加载
      if (step === 'guided' && !intelligentGuided && !loadingGuidedQuestions) {
        loadIntelligentGuidedQuestions()
      }

      setFlowStep(step)
    }
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

  const currentStepConfig = STEP_CONFIG[flowStep]

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

          {/* 理论学习提示 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>💡 学习建议：</strong>
                  如果你还不熟悉【{typeName}】的核心概念和方法，建议先
                  <Link
                    href={`/learn/critical-thinking/${thinkingTypeId}`}
                    className="underline font-medium hover:text-blue-700 mx-1"
                  >
                    返回学习页面
                  </Link>
                  查看"理论学习"标签页，掌握基础知识后再进行练习效果更佳。
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {Object.entries(STEP_CONFIG).map(([key, config], idx) => {
              const isActive = key === flowStep
              const isCompleted = config.index < currentStepConfig.index
              const isClickable = config.index <= currentStepConfig.index + 1
              const StepIcon = config.icon

              return (
                <div key={key} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => handleStepClick(key)}
                    disabled={!isClickable}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : isCompleted
                          ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100 cursor-pointer'
                          : isClickable
                            ? 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 cursor-pointer'
                            : 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : config.index + 1}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {config.title}
                    </span>
                  </button>
                  {idx < Object.keys(STEP_CONFIG).length - 1 && (
                    <div className={`w-8 h-1 mx-1 ${
                      isCompleted ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: 案例学习 */}
            {flowStep === 'case' && (
              <div className="space-y-6">
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                      Step 1: 案例学习
                    </CardTitle>
                    <CardDescription>
                      通过真实案例理解【{typeName}】在实际场景中的应用
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingCaseAnalysis ? (
                      <div className="py-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">AI正在生成专业的案例分析...</p>
                      </div>
                    ) : caseAnalysis ? (
                      <CaseAnalysisDisplay caseAnalysis={caseAnalysis} />
                    ) : (
                      <div className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">案例分析暂未生成</h3>
                        <Button
                          onClick={() => currentQuestion?.id && loadCaseAnalysis(currentQuestion.id)}
                          disabled={!currentQuestion?.id}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          生成案例分析
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => proceedToNextStep('problem')} size="lg">
                    学习完毕，查看练习题目
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: 题目呈现 */}
            {flowStep === 'problem' && (
              <div className="space-y-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <MessageSquare className="h-6 w-6 mr-2 text-purple-600" />
                      Step 2: 练习题目
                    </CardTitle>
                    {currentQuestion.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(currentQuestion.tags as string[]).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-800 text-lg leading-relaxed mb-4">
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

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => proceedToNextStep('case')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回案例
                  </Button>
                  <Button onClick={() => proceedToNextStep('guided')} size="lg">
                    开始思考
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: 智能引导思考 */}
            {flowStep === 'guided' && (
              <div className="space-y-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <Lightbulb className="h-6 w-6 mr-2 text-green-600" />
                          Step 3: 智能引导思考
                        </CardTitle>
                        <CardDescription className="mt-2">
                          AI为这道题目量身定制的引导问题，帮助你建立思维框架
                        </CardDescription>
                      </div>
                      {!intelligentGuided && !loadingGuidedQuestions && (
                        <Button
                          onClick={loadIntelligentGuidedQuestions}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          生成智能引导
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingGuidedQuestions ? (
                      <div className="py-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                        <p className="text-gray-600">AI正在为这道题生成个性化引导问题...</p>
                        <p className="text-sm text-gray-500 mt-2">这可能需要10-15秒</p>
                      </div>
                    ) : intelligentGuided ? (
                      <div className="space-y-6">
                        {/* 思维路径说明 */}
                        {intelligentGuided.thinkingPath && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                              <Target className="h-4 w-4 mr-2" />
                              思维路径
                            </h4>
                            <p className="text-sm text-green-800">{intelligentGuided.thinkingPath}</p>
                          </div>
                        )}

                        {/* 智能引导问题列表 */}
                        <div className="space-y-4">
                          {intelligentGuided.questions?.map((gq: any, index: number) => (
                            <div key={index} className="border-l-4 border-green-500 bg-white shadow-sm hover:shadow-md transition-shadow pl-4 py-4 rounded-r-lg">
                              <div className="flex items-start space-x-3">
                                <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-sm">
                                  {index + 1}
                                </span>
                                <div className="flex-1 space-y-3">
                                  <p className="font-semibold text-gray-900 text-base leading-relaxed">{gq.question}</p>

                                  <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded flex-shrink-0">目的</span>
                                      <p className="text-sm text-gray-700">{gq.purpose}</p>
                                    </div>

                                    {gq.thinkingDirection && (
                                      <div className="flex items-start space-x-2">
                                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded flex-shrink-0">方向</span>
                                        <p className="text-sm text-gray-600 italic">{gq.thinkingDirection}</p>
                                      </div>
                                    )}

                                    {gq.keywords && gq.keywords.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {gq.keywords.map((keyword: string, kidx: number) => (
                                          <Badge key={kidx} variant="outline" className="text-xs bg-gray-50">
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 期望洞察 */}
                        {intelligentGuided.expectedInsights && intelligentGuided.expectedInsights.length > 0 && (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                              <Lightbulb className="h-4 w-4 mr-2" />
                              期望收获
                            </h4>
                            <ul className="space-y-2">
                              {intelligentGuided.expectedInsights.map((insight: string, idx: number) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm text-amber-800">
                                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 缓存状态提示 */}
                        <div className="text-xs text-center mt-4">
                          {intelligentGuided.cached ? (
                            <div className="flex items-center justify-center space-x-2 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>已使用缓存的引导问题（即时加载）</span>
                            </div>
                          ) : intelligentGuided.fallback ? (
                            <div className="text-gray-500">
                              💡 当前使用默认引导问题，仍能有效帮助你思考
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2 text-blue-600">
                              <RefreshCw className="h-3 w-3" />
                              <span>AI生成新的引导问题（已保存供下次使用）</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : currentQuestion.guidingQuestions && currentQuestion.guidingQuestions.length > 0 ? (
                      /* 降级方案：显示数据库中的静态引导问题 */
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800">
                            💡 点击右上角"生成智能引导"可获取针对此题的个性化引导问题
                          </p>
                        </div>
                        {currentQuestion.guidingQuestions
                          .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                          .map((gq: any, index: number) => (
                          <div key={gq.id} className="border-l-4 border-gray-400 bg-gray-50 pl-4 py-3 rounded-r-lg">
                            <div className="flex items-start space-x-3">
                              <span className="w-7 h-7 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-2 text-base">{gq.question}</p>
                                <p className="text-sm text-gray-600 italic">目的：{gq.purpose}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无引导问题</h3>
                        <p className="text-sm text-gray-500 mb-4">点击下方按钮生成智能引导</p>
                        <Button onClick={loadIntelligentGuidedQuestions}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          生成智能引导问题
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => proceedToNextStep('problem')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回题目
                  </Button>
                  <Button onClick={() => proceedToNextStep('answer')} size="lg" className="bg-green-600 hover:bg-green-700">
                    完成引导思考，开始作答
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: 完整作答 */}
            {flowStep === 'answer' && (
              <div className="space-y-6">
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Target className="h-6 w-6 mr-2 text-orange-600" />
                      Step 4: 你的回答
                    </CardTitle>
                    <CardDescription>
                      请结合引导问题，详细阐述你的思考过程和结论
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 题目回顾 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">题目回顾：</h4>
                      <p className="text-gray-800">{(currentQuestion as any).question}</p>
                    </div>

                    <Textarea
                      placeholder="请在这里输入你的完整回答...&#10;&#10;建议：&#10;1. 结构清晰，分点论述&#10;2. 结合引导问题的思考&#10;3. 说明理由和依据"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[250px] text-base"
                    />
                    <p className="text-sm text-gray-500 text-right">{userAnswer.length} 字</p>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => proceedToNextStep('guided')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回引导问题
                  </Button>
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || submitting}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
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
              </div>
            )}

            {/* Step 5: 评估反馈 */}
            {flowStep === 'feedback' && evaluation && (
              <div className="space-y-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                      Step 5: AI 评估反馈
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Overall Score */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {evaluation.score}/10
                        </div>
                        <div className="text-base text-gray-600">综合得分</div>
                      </div>

                      {/* Feedback */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-medium text-blue-900 mb-2">详细反馈：</h4>
                        <p className="text-blue-800 leading-relaxed">{evaluation.feedback}</p>
                      </div>

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            优点
                          </h4>
                          <ul className="space-y-2">
                            {evaluation.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-green-800 flex items-start">
                                <span className="w-2 h-2 bg-green-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2" />
                            改进建议
                          </h4>
                          <ul className="space-y-2">
                            {evaluation.improvements.map((improvement, index) => (
                              <li key={index} className="text-sm text-yellow-800 flex items-start">
                                <span className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => proceedToNextStep('reflection')} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    继续：反思总结
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: 反思总结 */}
            {flowStep === 'reflection' && (
              <ReflectionSummary
                thinkingTypeName={typeName}
                onComplete={handleReflectionComplete}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            {startTime && flowStep !== 'reflection' && (
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
                <CardTitle className="text-lg">学习提示</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  {flowStep === 'case' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>仔细阅读案例，理解核心概念的实际应用</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>思考案例中的关键要点和方法论</span>
                      </div>
                    </>
                  )}
                  {flowStep === 'problem' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>仔细阅读题目，理解问题的核心</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>注意背景信息中的关键细节</span>
                      </div>
                    </>
                  )}
                  {flowStep === 'guided' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>逐个思考引导问题，不要跳过</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>每个问题都有其设计目的，帮助你深入思考</span>
                      </div>
                    </>
                  )}
                  {flowStep === 'answer' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>结合引导问题的思考形成完整答案</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>回答要有逻辑性和条理性</span>
                      </div>
                    </>
                  )}
                  {flowStep === 'feedback' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>认真阅读AI反馈，理解优缺点</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>对比改进建议，思考如何提升</span>
                      </div>
                    </>
                  )}
                  {flowStep === 'reflection' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>反思是深度学习的关键环节</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>认真填写，将经验抽象为认知模式</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
