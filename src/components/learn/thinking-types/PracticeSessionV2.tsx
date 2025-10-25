'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  BookOpen,
  Play,
  ChevronDown,
  ChevronUp,
  Lock,
  GraduationCap,
  FileText
} from 'lucide-react'
import { CriticalThinkingQuestion, PracticeEvaluation } from '@/types'
import ReflectionSummary from './ReflectionSummary'
import { LevelSelector, type LevelInfo } from './LevelSelector'
import { NextLevelGuidance } from './NextLevelGuidance'
import LearningContentViewer from './LearningContentViewer'
import { CaseAnalysisResult } from '@/lib/prompts/case-analysis-prompts'
import { checkLevelUnlock, type UnlockResult } from '@/lib/unlock-system'

interface PracticeSessionProps {
  thinkingTypeId: string
}

// 5步线性流程（移除案例学习步骤）
type FlowStep =
  | 'problem'       // Step 1: 题目呈现
  | 'guided'        // Step 2: 引导思考
  | 'answer'        // Step 3: 完整作答
  | 'feedback'      // Step 4: 评估反馈
  | 'reflection'    // Step 5: 反思总结

const STEP_CONFIG = {
  problem: { index: 0, title: '题目呈现', icon: MessageSquare },
  guided: { index: 1, title: '引导思考', icon: Lightbulb },
  answer: { index: 2, title: '完整作答', icon: Target },
  feedback: { index: 3, title: '评估反馈', icon: CheckCircle },
  reflection: { index: 4, title: '反思总结', icon: Lightbulb }
}

const thinkingTypeNames = {
  causal_analysis: '多维归因与利弊权衡',
  premise_challenge: '前提质疑与方法批判',
  fallacy_detection: '谬误检测',
  iterative_reflection: '迭代反思',
  connection_transfer: '知识迁移'
}

// Level configuration - 扩展到5个Level
const LEVEL_CONFIGS = [
  {
    level: 1,
    name: '基础入门',
    description: '识别与理解 - 掌握基本概念和识别方法',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    requirements: ['理解基本概念', '识别简单案例'],
    unlockCriteria: { minQuestions: 0, minAccuracy: 0 }
  },
  {
    level: 2,
    name: '初步应用',
    description: '简单分析 - 能够进行基础分析和简单应用',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    requirements: ['基础分析能力', '简单场景应用'],
    unlockCriteria: { minQuestions: 10, minAccuracy: 80 }
  },
  {
    level: 3,
    name: '深入分析',
    description: '复杂推理 - 能够进行深入分析和复杂推理',
    icon: Lightbulb,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    requirements: ['深度分析', '复杂案例处理'],
    unlockCriteria: { minQuestions: 8, minAccuracy: 75 }
  },
  {
    level: 4,
    name: '综合运用',
    description: '跨域整合 - 能够综合运用多种思维工具',
    icon: CheckCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    requirements: ['综合分析', '跨领域应用'],
    unlockCriteria: { minQuestions: 6, minAccuracy: 70 }
  },
  {
    level: 5,
    name: '专家创新',
    description: '创新应用 - 能够创新性地应用和拓展思维方法',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    requirements: ['创新思考', '方法拓展', '理论建构'],
    unlockCriteria: { minQuestions: 5, minAccuracy: 65 }
  }
]

export default function PracticeSessionV2({ thinkingTypeId }: PracticeSessionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Ref to track if question has been loaded for current level
  // This prevents reloading when user switches tabs/windows
  const questionLoadedRef = useRef<{ [key: number]: boolean }>({})

  // Core state
  const [currentQuestion, setCurrentQuestion] = useState<CriticalThinkingQuestion | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<CriticalThinkingQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionStats, setQuestionStats] = useState<{ total: number; completed: number; completionRate: number }>({
    total: 0,
    completed: 0,
    completionRate: 0
  })
  const [flowStep, setFlowStep] = useState<FlowStep>('problem')
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Level management state
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const [levels, setLevels] = useState<LevelInfo[]>([])
  const [unlockProgress, setUnlockProgress] = useState<UnlockResult | null>(null)
  const [justUnlockedLevel, setJustUnlockedLevel] = useState<number | undefined>(undefined)

  // Tab and learning content state
  const [activeTab, setActiveTab] = useState('practice')
  const [learningContents, setLearningContents] = useState<any[]>([])
  const [loadingContents, setLoadingContents] = useState(false)

  // Step-specific state
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysisResult | null>(null)
  const [loadingCaseAnalysis, setLoadingCaseAnalysis] = useState(false)
  const [intelligentGuided, setIntelligentGuided] = useState<any>(null)
  const [loadingGuidedQuestions, setLoadingGuidedQuestions] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reflection, setReflection] = useState<any>(null)

  // Mobile UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const typeName = thinkingTypeNames[thinkingTypeId as keyof typeof thinkingTypeNames] || '批判性思维'
  const currentLevelConfig = LEVEL_CONFIGS.find(config => config.level === currentLevel) || LEVEL_CONFIGS[0]

  // Level progress loading
  const loadLevelProgress = async () => {
    if (!session) return

    try {
      const response = await fetch(`/api/critical-thinking/progress`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.progress) {
          const progress = data.data.progress.find((p: any) => p.thinkingTypeId === thinkingTypeId)

          if (progress) {
            const levelsData: LevelInfo[] = [
              {
                level: 1,
                unlocked: progress.level1Unlocked ?? true,
                progress: progress.level1Progress ?? 0,
                questionsCompleted: progress.questionsCompleted ?? 0,
                currentLevel: progress.currentLevel === 1
              },
              {
                level: 2,
                unlocked: progress.level2Unlocked ?? false,
                progress: progress.level2Progress ?? 0,
                questionsCompleted: 0,
                currentLevel: progress.currentLevel === 2
              },
              {
                level: 3,
                unlocked: progress.level3Unlocked ?? false,
                progress: progress.level3Progress ?? 0,
                questionsCompleted: 0,
                currentLevel: progress.currentLevel === 3
              },
              {
                level: 4,
                unlocked: progress.level4Unlocked ?? false,
                progress: progress.level4Progress ?? 0,
                questionsCompleted: 0,
                currentLevel: progress.currentLevel === 4
              },
              {
                level: 5,
                unlocked: progress.level5Unlocked ?? false,
                progress: progress.level5Progress ?? 0,
                questionsCompleted: 0,
                currentLevel: progress.currentLevel === 5
              }
            ]

            setLevels(levelsData)
            setCurrentLevel(progress.currentLevel ?? 1)
          } else {
            // No progress - set defaults
            const defaultLevels: LevelInfo[] = [
              { level: 1, unlocked: true, progress: 0, questionsCompleted: 0, currentLevel: true },
              { level: 2, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
              { level: 3, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
              { level: 4, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
              { level: 5, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false }
            ]
            setLevels(defaultLevels)
            setCurrentLevel(1)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load level progress:', error)
      // Set defaults on error
      const defaultLevels: LevelInfo[] = [
        { level: 1, unlocked: true, progress: 0, questionsCompleted: 0, currentLevel: true },
        { level: 2, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
        { level: 3, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
        { level: 4, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false },
        { level: 5, unlocked: false, progress: 0, questionsCompleted: 0, currentLevel: false }
      ]
      setLevels(defaultLevels)
      setCurrentLevel(1)
    }
  }

  // Learning content loading
  const loadLearningContents = async () => {
    if (!session) return

    try {
      setLoadingContents(true)
      const response = await fetch(
        `/api/critical-thinking/learning-content?thinkingTypeId=${thinkingTypeId}&level=${currentLevel}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.contents) {
          setLearningContents(data.data.contents)
        }
      }
    } catch (error) {
      console.error('Failed to load learning contents:', error)
    } finally {
      setLoadingContents(false)
    }
  }

  // Level management functions
  const isLevelUnlocked = (level: number) => {
    const levelData = levels.find(l => l.level === level)
    return levelData?.unlocked ?? (level === 1)
  }

  const canAdvanceToLevel = (level: number) => {
    return isLevelUnlocked(level)
  }

  const handleLevelChange = (newLevel: number) => {
    if (isLevelUnlocked(newLevel)) {
      // 清除新level的加载标记，允许重新加载题目
      questionLoadedRef.current[newLevel] = false
      setCurrentLevel(newLevel)
      setShowLevelSelector(false)
      // Reload question and learning contents for new level
      loadQuestion()
      loadLearningContents()
    }
  }

  // From localStorage 恢复状态
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedState = localStorage.getItem(`practice-session-${thinkingTypeId}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)

        // 检查保存的状态是否在5分钟内（避免恢复过期的状态）
        const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp < 5 * 60 * 1000)

        if (isRecent) {
          console.log('🔄 恢复练习状态:', parsed)
          if (parsed.flowStep) setFlowStep(parsed.flowStep)
          if (parsed.userAnswer) setUserAnswer(parsed.userAnswer)
          if (parsed.intelligentGuided) setIntelligentGuided(parsed.intelligentGuided)
          if (parsed.evaluation) setEvaluation(parsed.evaluation)
          if (parsed.reflection) setReflection(parsed.reflection)
          if (parsed.caseAnalysis) setCaseAnalysis(parsed.caseAnalysis)
          if (parsed.currentLevel) setCurrentLevel(parsed.currentLevel)
          if (parsed.currentQuestion) setCurrentQuestion(parsed.currentQuestion)
        } else {
          console.log('⏰ 练习状态已过期，清除缓存')
          localStorage.removeItem(`practice-session-${thinkingTypeId}`)
        }
      } catch (e) {
        console.error('Failed to restore session state:', e)
      }
    }
  }, [thinkingTypeId])

  // 保存状态到 localStorage（自动保存，防止切换窗口丢失）
  useEffect(() => {
    if (typeof window === 'undefined' || !currentQuestion) return

    const stateToSave = {
      flowStep,
      userAnswer,
      intelligentGuided,
      evaluation,
      reflection,
      caseAnalysis,
      currentLevel,
      currentQuestion,
      timestamp: Date.now()
    }

    console.log('💾 自动保存练习状态')
    localStorage.setItem(`practice-session-${thinkingTypeId}`, JSON.stringify(stateToSave))
  }, [flowStep, userAnswer, intelligentGuided, evaluation, reflection, caseAnalysis, currentLevel, currentQuestion, thinkingTypeId])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadLevelProgress()
  }, [thinkingTypeId, session, status, router])

  useEffect(() => {
    if (session && levels.length > 0) {
      // 检查当前level是否已经加载过题目
      // 如果已加载且有题目，且用户还在答题中（未完成反思），则不重新加载
      // 这样可以防止切换标签页时丢失进度
      const alreadyLoaded = questionLoadedRef.current[currentLevel]
      const isInProgress = currentQuestion && flowStep !== 'reflection'

      if (!alreadyLoaded || !isInProgress) {
        console.log('🔥 useEffect triggered: loading question and content for level', currentLevel,
                    'alreadyLoaded:', alreadyLoaded, 'isInProgress:', isInProgress)
        loadQuestion()
        loadLearningContents()
        questionLoadedRef.current[currentLevel] = true
      } else {
        console.log('⏭️ useEffect skipped: question in progress for level', currentLevel, 'flowStep:', flowStep)
      }
    } else {
      console.log('⏸️ useEffect skipped: session=', !!session, ', levels.length=', levels.length)
    }
  }, [currentLevel, session, levels.length])

  const loadQuestion = async (resetIndex = true) => {
    if (!session) return

    try {
      setLoading(true)

      // 只在重置索引时清除状态
      if (resetIndex) {
        setFlowStep('problem')
        setUserAnswer('')
        setEvaluation(null)
        setReflection(null)
        setCaseAnalysis(null)
        setIntelligentGuided(null)
        setJustUnlockedLevel(undefined)
        setCurrentQuestionIndex(0)

        // 清除localStorage中的旧状态
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`practice-session-${thinkingTypeId}`)
        }
      }

      // 使用Level-filtered API获取所有未完成的题目
      const response = await fetch(
        `/api/critical-thinking/questions/by-level?thinkingTypeId=${thinkingTypeId}&level=${currentLevel}&limit=50`
      )

      console.log('🔍 API Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 API Response Data:', data)
        console.log('🔍 Questions Count:', data.data?.questions?.length)

        if (data.success && data.data && data.data.questions && data.data.questions.length > 0) {
          const questions = data.data.questions
          setAvailableQuestions(questions)

          // 保存统计信息
          if (data.data.stats) {
            setQuestionStats(data.data.stats)
          }

          // 设置当前题目为第一题或指定索引
          const question = questions[resetIndex ? 0 : currentQuestionIndex]
          console.log('✅ Found question:', question.topic)
          setCurrentQuestion(question)
          setStartTime(new Date())

          // 不再自动加载案例分析，因为我们移除了案例学习步骤
          // 如果需要案例分析，用户可以在练习过程中查看
          if (question.caseAnalysis) {
            setCaseAnalysis(question.caseAnalysis as CaseAnalysisResult)
          }

          console.log('✅ Question loaded successfully, exiting function')
          return
        } else {
          console.log('⚠️ No questions found in response or invalid data structure')
        }
      } else {
        console.log('❌ API Response not OK, status:', response.status)
      }

      // 如果该Level没有题目，生成新题目
      const generateResponse = await fetch(`/api/thinking-types/${thinkingTypeId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: currentLevel,
          difficulty: currentLevel <= 2 ? 'beginner' : currentLevel <= 4 ? 'intermediate' : 'advanced'
        })
      })

      if (generateResponse.ok) {
        const generateData = await generateResponse.json()
        if (generateData.success && generateData.data.question) {
          const question = generateData.data.question
          setAvailableQuestions([question])
          setCurrentQuestion(question)
          setCurrentQuestionIndex(0)
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
          level: currentLevel // difficulty removed, using level parameter
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
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

      // 评估答案
      const response = await fetch('/api/critical-thinking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: userAnswer.trim(),
          thinkingTypeId,
          level: currentLevel
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const evaluation = data.data.evaluation
          setEvaluation(evaluation)

          // 更新Level进度并检查解锁
          const progressResponse = await fetch('/api/critical-thinking/progress/update-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              thinkingTypeId,
              level: currentLevel,
              score: evaluation.score, // 已经是百分制 (0-100)
              questionId: currentQuestion.id,
              timeSpent
            })
          })

          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            if (progressData.success) {
              const { unlockProgress: newUnlockProgress, updatedProgress } = progressData.data

              // 检查是否解锁了新Level
              if (newUnlockProgress?.canUnlock && currentLevel < 5) {
                const nextLevel = currentLevel + 1
                if (updatedProgress[`level${nextLevel}Unlocked`]) {
                  setJustUnlockedLevel(nextLevel)
                }
              }

              setUnlockProgress(newUnlockProgress)

              // 重新加载Level进度
              await loadLevelProgress()
            }
          }

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
          level: currentLevel, // 添加级别参数
          answers: userAnswer,
          score: evaluation?.score || 0,
          aiFeedback: evaluation?.feedback || '',
          evaluationDetails: evaluation || null,
          reflection: reflectionData,
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

      // Progress data is returned in result.data.progress
      // TODO: Display progress updates to user if needed
    } catch (error) {
      console.error('保存会话网络错误:', error)
      alert('网络错误，请检查连接后重试')
      return
    }

    // ✅ 不再自动加载下一题，让用户在NextLevelGuidance中选择
    // 移除：loadQuestion()
  }

  const proceedToNextStep = (nextStep: FlowStep) => {
    setFlowStep(nextStep)
  }

  // 开始新的练习题目
  const startNewQuestion = () => {
    // 重置所有状态
    setFlowStep('problem')
    setUserAnswer('')
    setEvaluation(null)
    setReflection(null)
    setCaseAnalysis(null)
    setIntelligentGuided(null)
    setJustUnlockedLevel(undefined)
    setStartTime(new Date())

    // 清除当前level的加载标记，允许重新加载
    questionLoadedRef.current[currentLevel] = false

    // 加载新题目
    loadQuestion()
  }

  // 切换到上一题
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)

      // 重置状态
      setFlowStep('problem')
      setUserAnswer('')
      setEvaluation(null)
      setReflection(null)
      setCaseAnalysis(null)
      setIntelligentGuided(null)

      // 设置题目
      const question = availableQuestions[newIndex]
      setCurrentQuestion(question)
      setStartTime(new Date())

      if (question.caseAnalysis) {
        setCaseAnalysis(question.caseAnalysis as CaseAnalysisResult)
      }
    }
  }

  // 切换到下一题
  const goToNextQuestion = () => {
    if (currentQuestionIndex < availableQuestions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)

      // 重置状态
      setFlowStep('problem')
      setUserAnswer('')
      setEvaluation(null)
      setReflection(null)
      setCaseAnalysis(null)
      setIntelligentGuided(null)

      // 设置题目
      const question = availableQuestions[newIndex]
      setCurrentQuestion(question)
      setStartTime(new Date())

      if (question.caseAnalysis) {
        setCaseAnalysis(question.caseAnalysis as CaseAnalysisResult)
      }
    }
  }

  const handleStepClick = (stepKey: string) => {
    const step = stepKey as FlowStep
    const stepConfig = STEP_CONFIG[step]

    // 检查是否可以跳转到该步骤
    const currentIndex = STEP_CONFIG[flowStep].index
    const targetIndex = stepConfig.index

    if (targetIndex <= currentIndex + 1) {
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
          <p className="text-gray-600">正在加载Level {currentLevel}练习题目...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Level {currentLevel} 暂无练习题目</h2>
          <p className="text-gray-600 mb-4">该级别的练习题目正在准备中</p>
          <div className="space-y-2">
            <Button onClick={() => setShowLevelSelector(true)} variant="outline">
              选择其他级别
            </Button>
            <Link href={`/learn/critical-thinking/${thinkingTypeId}`}>
              <Button>返回学习页面</Button>
            </Link>
          </div>
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
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                Level {currentQuestion.level}
              </Badge>
            </div>
          </div>

          {/* Level Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">当前级别</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLevelSelector(!showLevelSelector)}
              >
                切换级别
                {showLevelSelector ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            {/* Current Level Display */}
            <Card className={`${currentLevelConfig.borderColor} border-2 ${currentLevelConfig.bgColor}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full ${currentLevelConfig.bgColor} border-2 ${currentLevelConfig.borderColor} flex items-center justify-center`}>
                    <currentLevelConfig.icon className={`h-6 w-6 ${currentLevelConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${currentLevelConfig.color}`}>
                      Level {currentLevel}: {currentLevelConfig.name}
                    </h4>
                    <p className="text-sm text-gray-600">{currentLevelConfig.description}</p>
                  </div>
                  {/* TODO: Display user progress when data is loaded */}
                </div>
              </CardContent>
            </Card>

            {/* Level Selector Dropdown */}
            {showLevelSelector && (
              <Card className="mt-3 border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LEVEL_CONFIGS.map((levelConfig) => {
                      const isUnlocked = isLevelUnlocked(levelConfig.level)
                      const canAdvance = canAdvanceToLevel(levelConfig.level)
                      const isCurrent = levelConfig.level === currentLevel

                      return (
                        <button
                          key={levelConfig.level}
                          onClick={() => handleLevelChange(levelConfig.level)}
                          disabled={!isUnlocked}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isCurrent
                              ? `${levelConfig.borderColor} ${levelConfig.bgColor}`
                              : isUnlocked
                                ? 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isUnlocked ? levelConfig.bgColor : 'bg-gray-200'
                            }`}>
                              {isUnlocked ? (
                                (() => {
                                  const IconComponent = levelConfig.icon;
                                  return <IconComponent className={`h-4 w-4 ${levelConfig.color}`} />;
                                })()
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className={`font-semibold ${isUnlocked ? levelConfig.color : 'text-gray-400'}`}>
                              Level {levelConfig.level}
                            </span>
                          </div>
                          <div className={`text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {levelConfig.name}
                          </div>
                          {!isUnlocked && (
                            <div className="text-xs text-gray-400 mt-1">
                              需要: {levelConfig.unlockCriteria.minQuestions}题 @ {levelConfig.unlockCriteria.minAccuracy}%准确率
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 理论学习提示 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>💡 Level {currentLevel} 学习建议：</strong>
                  {currentLevelConfig.requirements.join('、')}。如需理论基础，请先
                  <Link
                    href={`/learn/critical-thinking/${thinkingTypeId}`}
                    className="underline font-medium hover:text-blue-700 mx-1"
                  >
                    返回学习页面
                  </Link>
                  查看"理论学习"标签页。
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps - Desktop only */}
          <div className="hidden md:flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
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

        {/* 3-Tab Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="theory" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">📚 理论学习</span>
              <span className="sm:hidden">理论</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">💡 实例分析</span>
              <span className="sm:hidden">实例</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">🎯 核心技能</span>
              <span className="sm:hidden">练习</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: 理论学习 */}
          <TabsContent value="theory">
            {loadingContents ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">正在加载Level {currentLevel}理论内容...</p>
              </div>
            ) : (
              <LearningContentViewer
                thinkingTypeId={thinkingTypeId}
                level={currentLevel}
                contents={learningContents.filter(c =>
                  c.contentType === 'concepts' || c.contentType === 'frameworks'
                )}
              />
            )}
          </TabsContent>

          {/* Tab 2: 实例分析 */}
          <TabsContent value="examples">
            <div className="space-y-6">
              {loadingContents ? (
                <div className="py-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">正在加载实例内容...</p>
                </div>
              ) : learningContents.filter(c => c.contentType === 'examples' || c.contentType === 'practice_guide').length > 0 ? (
                <LearningContentViewer
                  thinkingTypeId={thinkingTypeId}
                  level={currentLevel}
                  contents={learningContents.filter(c =>
                    c.contentType === 'examples' || c.contentType === 'practice_guide'
                  )}
                />
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Level {currentLevel} 的实例分析正在准备中</p>
                  <p className="text-sm text-gray-500 mt-2">包含典型案例和实践指南，敬请期待</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: 核心技能练习 */}
          <TabsContent value="practice">
            {/* Mobile: Bottom padding for sticky navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 md:pb-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
            {/* Step 1: 题目呈现 */}
            {flowStep === 'problem' && (
              <div className="space-y-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="flex items-center text-xl">
                        <MessageSquare className="h-6 w-6 mr-2 text-purple-600" />
                        Step 1: Level {currentLevel} 练习题目
                      </CardTitle>
                      {/* 题目导航 */}
                      {availableQuestions.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="h-8"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-600 min-w-[60px] text-center">
                            {currentQuestionIndex + 1} / {availableQuestions.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextQuestion}
                            disabled={currentQuestionIndex === availableQuestions.length - 1}
                            className="h-8"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={`${currentLevelConfig.bgColor} ${currentLevelConfig.color} border-0`}>
                        {currentLevelConfig.name}
                      </Badge>
                      {/* 进度统计 */}
                      {questionStats.total > 0 && (
                        <Badge variant="secondary">
                          已完成 {questionStats.completed}/{questionStats.total} 题 ({questionStats.completionRate}%)
                        </Badge>
                      )}
                      {currentQuestion.tags && (
                        <div className="flex flex-wrap gap-2">
                          {(currentQuestion.tags as string[]).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-800 text-base md:text-lg leading-relaxed md:leading-loose mb-4 p-2">
                        {currentQuestion.content}
                      </p>
                      {currentQuestion.context && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <h4 className="font-medium text-blue-900 mb-2">背景信息：</h4>
                          <p className="text-blue-800 leading-relaxed">{currentQuestion.context}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => proceedToNextStep('guided')} size="lg" className="w-full md:w-auto min-h-11 text-base">
                    开始Level {currentLevel}思考
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: 智能引导思考 */}
            {flowStep === 'guided' && (
              <div className="space-y-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <Lightbulb className="h-6 w-6 mr-2 text-green-600" />
                          Step 2: 智能引导思考
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

                <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0">
                  <Button variant="outline" onClick={() => proceedToNextStep('problem')} className="min-h-11 text-base order-2 md:order-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回题目
                  </Button>
                  <Button onClick={() => proceedToNextStep('answer')} size="lg" className="bg-green-600 hover:bg-green-700 min-h-11 text-base order-1 md:order-2">
                    完成引导思考，开始作答
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: 完整作答 */}
            {flowStep === 'answer' && (
              <div className="space-y-6">
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Target className="h-6 w-6 mr-2 text-orange-600" />
                      Step 3: 你的回答
                    </CardTitle>
                    <CardDescription>
                      请结合引导问题，详细阐述你的思考过程和结论
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 题目回顾 */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3">题目回顾：</h4>
                      <div className="space-y-3">
                        <p className="text-gray-800 text-base leading-relaxed">
                          {currentQuestion.content}
                        </p>
                        {currentQuestion.context && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <h5 className="font-medium text-blue-900 text-sm mb-1">背景信息：</h5>
                            <p className="text-blue-800 text-sm leading-relaxed">{currentQuestion.context}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Textarea
                      placeholder="请在这里输入你的完整回答...&#10;&#10;建议：&#10;1. 结构清晰，分点论述&#10;2. 结合引导问题的思考&#10;3. 说明理由和依据"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[200px] md:min-h-[250px] text-base leading-relaxed p-4"
                    />
                    <p className="text-sm text-gray-500 text-right">{userAnswer.length} 字</p>
                  </CardContent>
                </Card>

                <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0">
                  <Button variant="outline" onClick={() => proceedToNextStep('guided')} className="min-h-11 text-base order-2 md:order-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回引导问题
                  </Button>
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || submitting}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 min-h-11 text-base order-1 md:order-2"
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

            {/* Step 4: 评估反馈 */}
            {flowStep === 'feedback' && evaluation && (
              <div className="space-y-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                      Step 4: AI 评估反馈
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Overall Score - 百分制 */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-5xl font-bold text-blue-600 mb-2">
                          {evaluation.score}
                          <span className="text-2xl text-gray-500">/100</span>
                        </div>
                        <div className="text-base text-gray-600">综合得分</div>
                      </div>

                      {/* Dimension Scores - 各维度评分（加权百分制） */}
                      {evaluation.scores && (
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                          <h4 className="font-semibold text-gray-900 mb-4 text-center">各维度评分（总分=各维度之和）</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{evaluation.scores.critical}</div>
                              <div className="text-xs text-gray-500 mt-1">批判性</div>
                              <div className="text-[10px] text-gray-400">满分25</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{evaluation.scores.logic}</div>
                              <div className="text-xs text-gray-500 mt-1">逻辑性</div>
                              <div className="text-[10px] text-gray-400">满分25</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{evaluation.scores.depth}</div>
                              <div className="text-xs text-gray-500 mt-1">思维深度</div>
                              <div className="text-[10px] text-gray-400">满分20</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{evaluation.scores.completeness}</div>
                              <div className="text-xs text-gray-500 mt-1">完整性</div>
                              <div className="text-[10px] text-gray-400">满分20</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-pink-600">{evaluation.scores.innovation}</div>
                              <div className="text-xs text-gray-500 mt-1">创新性</div>
                              <div className="text-[10px] text-gray-400">满分10</div>
                            </div>
                          </div>
                          <div className="mt-3 text-center text-xs text-gray-500">
                            {evaluation.scores.critical} + {evaluation.scores.logic} + {evaluation.scores.depth} + {evaluation.scores.completeness} + {evaluation.scores.innovation} = {evaluation.score}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-medium text-blue-900 mb-2">详细反馈：</h4>
                        <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">{evaluation.feedback}</p>
                      </div>

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            优点
                          </h4>
                          <p className="text-sm text-green-800 whitespace-pre-wrap">{evaluation.strengths}</p>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2" />
                            改进建议
                          </h4>
                          <p className="text-sm text-yellow-800 whitespace-pre-wrap">{evaluation.improvements}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => proceedToNextStep('reflection')} size="lg" className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto min-h-11 text-base">
                    继续：反思总结
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: 反思总结 & 进阶提示 */}
            {flowStep === 'reflection' && (
              <div className="space-y-6">
                {/* 反思总结 */}
                {!reflection && evaluation && (
                  <ReflectionSummary
                    evaluation={evaluation}
                    level={currentLevel}
                    onComplete={(notes, plan) => handleReflectionComplete({ learned: notes, nextSteps: plan })}
                    onSkip={() => handleReflectionComplete({ learned: '', nextSteps: '' })}
                  />
                )}

                {/* 进阶提示 - 反思完成后显示 */}
                {reflection && (() => {
                  const currentLevelInfo = levels.find(l => l.level === currentLevel);
                  const levelProgressData = currentLevelInfo ? {
                    level: currentLevel,
                    questionsCompleted: currentLevelInfo.questionsCompleted,
                    averageScore: currentLevelInfo.averageScore ?? 0,
                    progress: currentLevelInfo.progress
                  } : {
                    level: currentLevel,
                    questionsCompleted: 0,
                    averageScore: 0,
                    progress: 0
                  };

                  // Transform UnlockResult to unlockStatus format
                  const unlockStatus = unlockProgress ? {
                    unlocked: unlockProgress.canUnlock,
                    level: currentLevel + 1,
                    message: unlockProgress.message,
                    questionsCompleted: unlockProgress.progress.questionsCompleted,
                    questionsRequired: unlockProgress.progress.questionsRequired,
                    averageScore: unlockProgress.progress.averageScore,
                    requiredScore: unlockProgress.progress.requiredScore
                  } : undefined;

                  return (
                    <NextLevelGuidance
                      currentLevel={currentLevel}
                      levelProgress={levelProgressData}
                      unlockStatus={unlockStatus}
                      onNextQuestion={startNewQuestion}
                      onViewNextLevel={() => {
                        if (justUnlockedLevel) {
                          setCurrentLevel(justUnlockedLevel);
                          startNewQuestion();
                        }
                      }}
                    />
                  );
                })()}
              </div>
            )}
          </div>

          {/* Sidebar - Desktop sticky, Mobile bottom sheet */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
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

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 py-3">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {currentStepConfig.index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">{currentStepConfig.title}</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <ChevronDown className="h-5 w-5 text-gray-600" /> : <ChevronUp className="h-5 w-5 text-gray-600" />}
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {currentStepConfig.index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevStep = Object.entries(STEP_CONFIG).find(([, config]) => config.index === currentStepConfig.index - 1)?.[0] as FlowStep
                    if (prevStep) proceedToNextStep(prevStep)
                  }}
                  className="flex-1 min-h-11"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  上一步
                </Button>
              )}
              {currentStepConfig.index < Object.keys(STEP_CONFIG).length - 1 && (
                <Button
                  onClick={() => {
                    const nextStep = Object.entries(STEP_CONFIG).find(([, config]) => config.index === currentStepConfig.index + 1)?.[0] as FlowStep
                    if (nextStep) proceedToNextStep(nextStep)
                  }}
                  className="flex-1 min-h-11 bg-blue-600 hover:bg-blue-700"
                >
                  下一步
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Expandable sidebar content for mobile */}
          {sidebarOpen && (
            <div className="border-t border-gray-200 bg-gray-50 max-h-[60vh] overflow-y-auto">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* Timer */}
                {startTime && flowStep !== 'reflection' && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                      <h4 className="font-medium text-gray-900">用时统计</h4>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor((Date.now() - startTime.getTime()) / 60000)}:
                        {String(Math.floor(((Date.now() - startTime.getTime()) % 60000) / 1000)).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">分:秒</div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">学习提示</h4>
                  <div className="space-y-3 text-sm text-gray-600">
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
                          <span>认真阅读AI反馈，理解自己的不足</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>思考如何改进自己的思维方式</span>
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
                </div>
              </div>
            </div>
          )}
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}