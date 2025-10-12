'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock,
  Brain,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'analysis' | 'matching'
  content: {
    question: string
    context?: string
    stimulus?: string
  }
  options?: string[]
  orderIndex: number
  difficulty: number
  tags: string[]
}

interface PracticeSession {
  sessionId: string
  sessionType: string
  difficulty: string
  estimatedTime: number
  learningObjectives: string[]
  questions: Question[]
  nextSteps: string
}

interface UserAnswer {
  questionId: string
  answer: string
  timeSpent: number
  confidence: number
}

export default function DailyPracticeSession() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [confidence, setConfidence] = useState(3)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // 从URL参数获取练习类型和难度
  const sessionType = searchParams.get('type') || 'fallacies'
  const difficulty = searchParams.get('difficulty') || 'intermediate'

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    generatePracticeSession()
  }, [session, status, router, sessionType, difficulty])

  const generatePracticeSession = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-practice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType,
          difficulty,
          preferredTopics: []
        }),
      })

      if (!response.ok) {
        throw new Error('生成练习失败')
      }

      const data = await response.json()
      setPracticeSession(data)
      setUserAnswers(new Array(data.questions.length).fill(null).map(() => ({
        questionId: '',
        answer: '',
        timeSpent: 0,
        confidence: 3
      })))
      setIsTimerRunning(true)
      setQuestionStartTime(Date.now())
    } catch (error) {
      console.error('生成练习失败:', error)
      toast.error('生成练习失败，请重试')
      router.push('/learn/daily')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const handleConfidenceChange = (value: string) => {
    setConfidence(parseInt(value))
  }

  const saveCurrentAnswer = useCallback(() => {
    if (!practiceSession) return

    const currentQuestion = practiceSession.questions[currentQuestionIndex]
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timeSpent: questionTime,
      confidence
    }
    setUserAnswers(newAnswers)
  }, [practiceSession, currentQuestionIndex, currentAnswer, confidence, questionStartTime, userAnswers])

  const goToNextQuestion = () => {
    if (!practiceSession) return

    saveCurrentAnswer()

    if (currentQuestionIndex < practiceSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setCurrentAnswer('')
      setConfidence(3)
      setQuestionStartTime(Date.now())
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentAnswer()
      setCurrentQuestionIndex(prev => prev - 1)
      
      // 恢复之前的答案
      const prevAnswer = userAnswers[currentQuestionIndex - 1]
      if (prevAnswer) {
        setCurrentAnswer(prevAnswer.answer)
        setConfidence(prevAnswer.confidence)
      }
      setQuestionStartTime(Date.now())
    }
  }

  const submitPractice = async () => {
    if (!practiceSession) return

    // 保存当前题目的答案
    saveCurrentAnswer()

    // 检查是否所有题目都已回答
    const finalAnswers = [...userAnswers]
    const currentQuestion = practiceSession.questions[currentQuestionIndex]
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)
    
    finalAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timeSpent: questionTime,
      confidence
    }

    const unansweredQuestions = finalAnswers.filter(answer => !answer.answer.trim())
    if (unansweredQuestions.length > 0) {
      toast.error('请完成所有题目后再提交')
      return
    }

    try {
      setSubmitting(true)
      setIsTimerRunning(false)

      const response = await fetch('/api/daily-practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: practiceSession.sessionId,
          answers: finalAnswers
        }),
      })

      if (!response.ok) {
        throw new Error('提交答案失败')
      }

      const result = await response.json()
      
      // 跳转到反馈页面
      router.push(`/learn/daily/feedback?sessionId=${practiceSession.sessionId}`)
    } catch (error) {
      console.error('提交答案失败:', error)
      toast.error('提交答案失败，请重试')
      setIsTimerRunning(true)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const resetTimer = () => {
    setTimeSpent(0)
    setQuestionStartTime(Date.now())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI正在为您生成个性化练习题目...</p>
        </div>
      </div>
    )
  }

  if (!practiceSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">生成练习失败</p>
          <Button onClick={() => router.push('/learn/daily')}>返回主页</Button>
        </div>
      </div>
    )
  }

  const currentQuestion = practiceSession.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / practiceSession.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/learn/daily')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="font-mono text-sm">{formatTime(timeSpent)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTimer}
                className="p-1 h-6 w-6"
              >
                {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetTimer}
                className="p-1 h-6 w-6"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              题目 {currentQuestionIndex + 1} / {practiceSession.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% 完成
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>批判性思维练习</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  难度: {currentQuestion.difficulty}/5
                </Badge>
                {currentQuestion.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Content */}
            <div className="space-y-4">
              {currentQuestion.content.context && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900 mb-2">背景信息</h4>
                  <p className="text-blue-800">{currentQuestion.content.context}</p>
                </div>
              )}
              
              {currentQuestion.content.stimulus && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">材料</h4>
                  <p className="text-gray-800 leading-relaxed">{currentQuestion.content.stimulus}</p>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600" />
                  题目
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed">
                  {currentQuestion.content.question}
                </p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">您的答案</h4>
              
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === 'true_false' && (
                <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer">正确</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer">错误</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === 'analysis' && (
                <Textarea
                  placeholder="请详细分析您的观点和理由..."
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-[120px]"
                />
              )}

              {/* Confidence Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  答题信心度 ({confidence}/5)
                </Label>
                <RadioGroup 
                  value={confidence.toString()} 
                  onValueChange={handleConfidenceChange}
                  className="flex space-x-4"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center space-x-1">
                      <RadioGroupItem value={level.toString()} id={`confidence-${level}`} />
                      <Label htmlFor={`confidence-${level}`} className="text-sm cursor-pointer">
                        {level}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>上一题</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              仔细思考，相信自己的判断
            </span>
          </div>

          {currentQuestionIndex === practiceSession.questions.length - 1 ? (
            <Button
              onClick={submitPractice}
              disabled={!currentAnswer.trim() || submitting}
              className="flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>提交答案</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={!currentAnswer.trim()}
              className="flex items-center space-x-2"
            >
              <span>下一题</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Learning Objectives */}
        {practiceSession.learningObjectives.length > 0 && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 text-sm">本次练习目标</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {practiceSession.learningObjectives.map((objective, index) => (
                  <li key={index} className="text-green-700 text-sm flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {objective}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}