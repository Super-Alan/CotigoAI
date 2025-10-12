'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Brain,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Star,
  Award,
  BarChart3,
  RefreshCw,
  Home,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface FeedbackData {
  sessionId: string
  score: number
  accuracy: number
  correctCount: number
  totalQuestions: number
  totalTime: number
  averageTime: number
  results: QuestionResult[]
  feedback: {
    summary: string
    improvements: string[]
    encouragement: string
  }
  recommendations: {
    nextPractice: string
    studyMaterials: StudyMaterial[]
    learningPath: string
  }
  achievements: Achievement[]
  streakUpdated: boolean
}

interface QuestionResult {
  questionId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeSpent: number
  explanation: {
    reasoning: string
    keyPoints: string[]
    commonMistakes: string[]
    relatedContent: {
      fallacies?: string[]
      templates?: string[]
      lessons?: string[]
      topics?: string[]
    }
  }
}

interface StudyMaterial {
  type: 'fallacy' | 'template' | 'lesson' | 'topic'
  id: string
  title: string
  reason: string
}

interface Achievement {
  type: 'accuracy' | 'speed' | 'streak' | 'milestone'
  title: string
  description: string
  progress: number
}

const typeLabels = {
  fallacy: '逻辑谬误',
  template: '论证模板',
  lesson: '方法论课程',
  topic: '话题包'
}

const typeColors = {
  fallacy: 'bg-red-50 text-red-700 border-red-200',
  template: 'bg-blue-50 text-blue-700 border-blue-200',
  lesson: 'bg-green-50 text-green-700 border-green-200',
  topic: 'bg-purple-50 text-purple-700 border-purple-200'
}

const achievementIcons = {
  accuracy: Target,
  speed: Clock,
  streak: Trophy,
  milestone: Award
}

export default function DailyPracticeFeedback() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!sessionId) {
      router.push('/learn/daily')
      return
    }

    // 模拟获取反馈数据（实际应该从API获取）
    fetchFeedbackData()
  }, [session, status, router, sessionId])

  const fetchFeedbackData = async () => {
    try {
      // 这里应该调用API获取反馈数据
      // 由于我们在submit API中已经返回了反馈数据，这里模拟一下
      setLoading(false)
      
      // 模拟反馈数据
      const mockFeedback: FeedbackData = {
        sessionId: sessionId!,
        score: 85,
        accuracy: 0.8,
        correctCount: 4,
        totalQuestions: 5,
        totalTime: 480,
        averageTime: 96,
        results: [
          {
            questionId: '1',
            userAnswer: '选项A',
            correctAnswer: '选项A',
            isCorrect: true,
            timeSpent: 90,
            explanation: {
              reasoning: '这是一个典型的稻草人谬误案例。论证者歪曲了对方的观点，然后攻击这个被歪曲的版本。',
              keyPoints: ['稻草人谬误', '观点歪曲', '逻辑错误'],
              commonMistakes: ['容易与其他谬误混淆', '忽略了论证的核心问题'],
              relatedContent: {
                fallacies: ['strawman-fallacy'],
                templates: ['argument-analysis']
              }
            }
          }
        ],
        feedback: {
          summary: '本次练习表现良好，正确率达到80%，在逻辑谬误识别方面有不错的基础。',
          improvements: ['加强对复杂谬误的识别能力', '提高答题速度', '深化对论证结构的理解'],
          encouragement: '继续保持这种学习态度，您的批判性思维能力正在稳步提升！'
        },
        recommendations: {
          nextPractice: 'arguments',
          studyMaterials: [
            {
              type: 'fallacy',
              id: 'strawman-fallacy',
              title: '稻草人谬误详解',
              reason: '基于您在此类题目上的表现，建议深入学习'
            },
            {
              type: 'template',
              id: 'peel-structure',
              title: 'PEEL论证结构',
              reason: '有助于提升论证分析能力'
            }
          ],
          learningPath: '建议下次练习论证结构分析，进一步提升逻辑推理能力'
        },
        achievements: [
          {
            type: 'accuracy',
            title: '准确射手',
            description: '单次练习正确率达到80%',
            progress: 1.0
          }
        ],
        streakUpdated: true
      }
      
      setFeedbackData(mockFeedback)
    } catch (error) {
      console.error('获取反馈数据失败:', error)
      toast.error('获取反馈数据失败')
      router.push('/learn/daily')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-blue-100 text-blue-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI正在分析您的练习表现...</p>
        </div>
      </div>
    )
  }

  if (!feedbackData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">获取反馈数据失败</p>
          <Button onClick={() => router.push('/learn/daily')}>返回主页</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            练习反馈报告
          </h1>
          <p className="text-gray-600">
            AI智能分析您的表现，提供个性化学习建议
          </p>
        </div>

        {/* Score Overview */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(feedbackData.score)}`}>
                {feedbackData.score}
              </div>
              <div className="ml-2 text-2xl text-gray-600">分</div>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(feedbackData.score)}`}>
              {feedbackData.score >= 90 ? '优秀' : 
               feedbackData.score >= 70 ? '良好' : 
               feedbackData.score >= 60 ? '及格' : '需要努力'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {feedbackData.correctCount}/{feedbackData.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">正确题数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(feedbackData.accuracy * 100)}%
                </div>
                <div className="text-sm text-gray-600">正确率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(feedbackData.totalTime)}
                </div>
                <div className="text-sm text-gray-600">总用时</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(feedbackData.averageTime)}
                </div>
                <div className="text-sm text-gray-600">平均用时</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Achievements */}
        {feedbackData.achievements.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <Trophy className="h-5 w-5" />
                <span>新获得成就</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackData.achievements.map((achievement, index) => {
                  const IconComponent = achievementIcons[achievement.type]
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Feedback */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>AI智能分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">整体表现</h4>
              <p className="text-gray-700 leading-relaxed">{feedbackData.feedback.summary}</p>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                改进建议
              </h4>
              <ul className="space-y-2">
                {feedbackData.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Encouragement */}
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-green-800 font-medium">{feedbackData.feedback.encouragement}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>题目详细分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.results.map((result, index) => (
                <div key={result.questionId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">题目 {index + 1}</span>
                      {result.isCorrect ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          正确
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          错误
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(result.timeSpent)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedQuestion(
                        expandedQuestion === result.questionId ? null : result.questionId
                      )}
                    >
                      {expandedQuestion === result.questionId ? '收起' : '详情'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">您的答案：</span>
                      <span className="ml-2 font-medium">{result.userAnswer}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">正确答案：</span>
                      <span className="ml-2 font-medium text-green-600">{result.correctAnswer}</span>
                    </div>
                  </div>

                  {expandedQuestion === result.questionId && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">解题思路</h5>
                        <p className="text-gray-700 leading-relaxed">{result.explanation.reasoning}</p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">关键知识点</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.explanation.keyPoints.map((point, idx) => (
                            <Badge key={idx} variant="secondary">{point}</Badge>
                          ))}
                        </div>
                      </div>

                      {result.explanation.commonMistakes.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">常见错误</h5>
                          <ul className="space-y-1">
                            {result.explanation.commonMistakes.map((mistake, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>学习建议</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">下次练习建议</h4>
              <p className="text-gray-700">{feedbackData.recommendations.learningPath}</p>
            </div>

            {feedbackData.recommendations.studyMaterials.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">推荐学习资源</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbackData.recommendations.studyMaterials.map((material, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${typeColors[material.type]}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{material.title}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {typeLabels[material.type]}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{material.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push(`/learn/daily/practice?type=${feedbackData.recommendations.nextPractice}`)}
            className="h-12 text-base"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            继续练习
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/learn/daily/progress')}
            className="h-12 text-base"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            查看进度
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/learn/daily')}
            className="h-12 text-base"
          >
            <Home className="h-4 w-4 mr-2" />
            返回主页
          </Button>
        </div>
      </div>
    </div>
  )
}