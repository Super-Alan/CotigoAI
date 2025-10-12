'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Target,
  Trophy,
  Flame,
  Clock,
  Brain,
  TrendingUp,
  Star,
  Play,
  Settings,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Lightbulb,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface DailyStatus {
  todayCompleted: boolean
  currentStreak: number
  totalSessions: number
  weeklyCompletion: number
  userLevel: string
  achievements: number
}

interface Achievement {
  id: string
  title: string
  description: string
  type: string
  progress: number
  unlocked: boolean
}

// 5大核心思维维度练习类型（与学习中心保持一致）
const practiceTypes = [
  {
    id: 'causal_analysis',
    title: '多维归因与利弊权衡',
    description: '区分相关性与因果性，识别混淆因素，建立可靠的因果推理',
    icon: BarChart3,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    difficulty: 'intermediate',
    thinkingType: 'causal_analysis'
  },
  {
    id: 'premise_challenge',
    title: '前提质疑与方法批判',
    description: '识别论证中的隐含前提，质疑其合理性，并重新框定问题',
    icon: Lightbulb,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600',
    difficulty: 'intermediate',
    thinkingType: 'premise_challenge'
  },
  {
    id: 'fallacy_detection',
    title: '谬误检测',
    description: '识别常见逻辑谬误，理解其危害，并学会避免这些思维陷阱',
    icon: Target,
    color: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconColor: 'text-red-600',
    difficulty: 'beginner',
    thinkingType: 'fallacy_detection'
  },
  {
    id: 'iterative_reflection',
    title: '迭代反思',
    description: '培养元认知能力，识别思维模式，并持续改进思维质量',
    icon: Users,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    difficulty: 'intermediate',
    thinkingType: 'iterative_reflection'
  },
  {
    id: 'connection_transfer',
    title: '知识迁移',
    description: '识别深层结构相似性，实现知识和技能的跨领域迁移',
    icon: Settings,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconColor: 'text-orange-600',
    difficulty: 'advanced',
    thinkingType: 'connection_transfer'
  },
  {
    id: 'mixed',
    title: '综合思维练习',
    description: '混合多种思维维度的综合训练',
    icon: Zap,
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    iconColor: 'text-gray-600',
    difficulty: 'advanced',
    thinkingType: 'mixed'
  }
]

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

const difficultyLabels = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级'
}

export default function DailyPracticeMain() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchDailyStatus()
  }, [session, status, router])

  const fetchDailyStatus = async () => {
    try {
      const response = await fetch('/api/daily-practice/status')
      if (!response.ok) throw new Error('获取状态失败')
      
      const data = await response.json()
      setDailyStatus(data)
    } catch (error) {
      console.error('获取每日状态失败:', error)
      toast.error('获取练习状态失败')
    } finally {
      setLoading(false)
    }
  }

  const startPractice = (sessionType: string, difficulty: string = 'intermediate') => {
    // Check if it's a thinking type practice
    const practiceType = practiceTypes.find(type => type.id === sessionType)
    if (practiceType && practiceType.thinkingType && practiceType.thinkingType !== 'mixed') {
      // Redirect to critical thinking practice
      router.push(`/learn/critical-thinking/${practiceType.thinkingType}/practice`)
    } else {
      // Use existing daily practice system
      router.push(`/learn/daily/practice?type=${sessionType}&difficulty=${difficulty}`)
    }
  }

  const quickStart = () => {
    // 根据用户水平推荐练习类型（基于5大思维维度）
    let recommendedType = 'fallacy_detection'
    let recommendedDifficulty = 'beginner'

    if (dailyStatus) {
      if (dailyStatus.totalSessions > 20) {
        recommendedType = 'mixed'
        recommendedDifficulty = 'advanced'
      } else if (dailyStatus.totalSessions > 10) {
        recommendedType = 'connection_transfer'
        recommendedDifficulty = 'advanced'
      } else if (dailyStatus.totalSessions > 5) {
        recommendedType = 'causal_analysis'
        recommendedDifficulty = 'intermediate'
      } else if (dailyStatus.totalSessions > 2) {
        recommendedType = 'premise_challenge'
        recommendedDifficulty = 'intermediate'
      }
    }

    startPractice(recommendedType, recommendedDifficulty)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!dailyStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">获取练习状态失败</p>
          <Button onClick={fetchDailyStatus} className="mt-4">重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/learn" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回批判性思维学习
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            每日练习打卡
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            每天10分钟，通过AI个性化题目提升批判性思维能力
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className={`h-6 w-6 ${dailyStatus.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dailyStatus.currentStreak}</div>
              <div className="text-sm text-gray-600">连续天数</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dailyStatus.totalSessions}</div>
              <div className="text-sm text-gray-600">总练习次数</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dailyStatus.weeklyCompletion}%</div>
              <div className="text-sm text-gray-600">本周完成率</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dailyStatus.achievements}</div>
              <div className="text-sm text-gray-600">获得成就</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>今日状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStatus.todayCompleted ? (
              <div className="flex items-center space-x-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <div className="font-semibold">今日练习已完成！</div>
                  <div className="text-sm text-gray-600">继续保持良好的学习习惯</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">今日练习待完成</div>
                    <div className="text-sm text-gray-600">预计用时：8-12分钟</div>
                  </div>
                  <Button onClick={quickStart} className="group">
                    快速开始
                    <Play className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Practice Types */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">选择练习类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <Card key={type.id} className={`${type.color} transition-all duration-300 hover:shadow-lg cursor-pointer`}
                      onClick={() => startPractice(type.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <IconComponent className={`h-5 w-5 ${type.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {type.title}
                        </CardTitle>
                        <Badge 
                          className={`text-xs mt-1 ${difficultyColors[type.difficulty as keyof typeof difficultyColors]}`}
                        >
                          {difficultyLabels[type.difficulty as keyof typeof difficultyLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-700 mb-3">
                      {type.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        8-12分钟
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/learn/daily/progress')}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">学习进度</h3>
              <p className="text-sm text-gray-600">查看详细的学习数据和能力评估</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/learn/daily/settings')}>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">练习设置</h3>
              <p className="text-sm text-gray-600">个性化定制练习内容和难度</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/learn')}>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">学习中心</h3>
              <p className="text-sm text-gray-600">返回主学习中心探索更多内容</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}