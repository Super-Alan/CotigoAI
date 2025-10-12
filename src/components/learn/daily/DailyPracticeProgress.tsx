'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy,
  Target,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Brain,
  Star,
  Award,
  BarChart3,
  Activity,
  Zap,
  BookOpen,
  Users,
  ArrowLeft,
  Filter,
  Download,
  Share2,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ProgressData {
  overview: {
    totalSessions: number
    currentStreak: number
    longestStreak: number
    totalCorrect: number
    averageAccuracy: number
    totalTimeSpent: number
    level: number
    experiencePoints: number
    nextLevelXP: number
  }
  weeklyStats: {
    date: string
    completed: boolean
    score: number
    accuracy: number
    timeSpent: number
  }[]
  monthlyTrends: {
    month: string
    sessions: number
    averageScore: number
    averageAccuracy: number
  }[]
  categoryPerformance: {
    category: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
    averageTime: number
    improvement: number
  }[]
  achievements: {
    id: string
    title: string
    description: string
    type: 'accuracy' | 'speed' | 'streak' | 'milestone'
    unlockedAt: string
    progress: number
    isUnlocked: boolean
  }[]
  recentSessions: {
    id: string
    date: string
    type: string
    score: number
    accuracy: number
    timeSpent: number
    questionsCount: number
  }[]
  skillAssessment: {
    logicalFallacies: number
    argumentAnalysis: number
    criticalThinking: number
    methodology: number
    overallRating: number
  }
}

const categoryLabels = {
  fallacies: '逻辑谬误',
  arguments: '论证分析',
  methodology: '方法论',
  topics: '话题讨论',
  mixed: '综合练习'
}

const skillLabels = {
  logicalFallacies: '逻辑谬误识别',
  argumentAnalysis: '论证结构分析',
  criticalThinking: '批判性思维',
  methodology: '方法论应用'
}

const achievementIcons = {
  accuracy: Target,
  speed: Clock,
  streak: Trophy,
  milestone: Award
}

const levelColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-blue-100 text-blue-800',
  4: 'bg-purple-100 text-purple-800',
  5: 'bg-yellow-100 text-yellow-800'
}

export default function DailyPracticeProgress() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchProgressData()
  }, [session, status, router])

  const fetchProgressData = async () => {
    try {
      // 这里应该调用API获取进度数据
      // 模拟进度数据
      const mockProgress: ProgressData = {
        overview: {
          totalSessions: 28,
          currentStreak: 7,
          longestStreak: 12,
          totalCorrect: 156,
          averageAccuracy: 0.78,
          totalTimeSpent: 2340, // 39分钟
          level: 3,
          experiencePoints: 1250,
          nextLevelXP: 1500
        },
        weeklyStats: [
          { date: '2024-12-09', completed: true, score: 85, accuracy: 0.8, timeSpent: 120 },
          { date: '2024-12-10', completed: true, score: 92, accuracy: 0.9, timeSpent: 105 },
          { date: '2024-12-11', completed: true, score: 78, accuracy: 0.7, timeSpent: 135 },
          { date: '2024-12-12', completed: true, score: 88, accuracy: 0.85, timeSpent: 110 },
          { date: '2024-12-13', completed: true, score: 95, accuracy: 0.95, timeSpent: 98 },
          { date: '2024-12-14', completed: true, score: 82, accuracy: 0.75, timeSpent: 125 },
          { date: '2024-12-15', completed: true, score: 90, accuracy: 0.9, timeSpent: 115 }
        ],
        monthlyTrends: [
          { month: '10月', sessions: 8, averageScore: 75, averageAccuracy: 0.72 },
          { month: '11月', sessions: 12, averageScore: 82, averageAccuracy: 0.78 },
          { month: '12月', sessions: 15, averageScore: 87, averageAccuracy: 0.83 }
        ],
        categoryPerformance: [
          { category: 'fallacies', totalQuestions: 45, correctAnswers: 38, accuracy: 0.84, averageTime: 95, improvement: 12 },
          { category: 'arguments', totalQuestions: 32, correctAnswers: 24, accuracy: 0.75, averageTime: 110, improvement: 8 },
          { category: 'methodology', totalQuestions: 28, correctAnswers: 20, accuracy: 0.71, averageTime: 125, improvement: -3 },
          { category: 'topics', totalQuestions: 35, correctAnswers: 28, accuracy: 0.8, averageTime: 105, improvement: 15 }
        ],
        achievements: [
          {
            id: '1',
            title: '初学者',
            description: '完成第一次练习',
            type: 'milestone',
            unlockedAt: '2024-11-15',
            progress: 1.0,
            isUnlocked: true
          },
          {
            id: '2',
            title: '连击高手',
            description: '连续7天完成练习',
            type: 'streak',
            unlockedAt: '2024-12-15',
            progress: 1.0,
            isUnlocked: true
          },
          {
            id: '3',
            title: '准确射手',
            description: '单次练习正确率达到90%',
            type: 'accuracy',
            unlockedAt: '2024-12-10',
            progress: 1.0,
            isUnlocked: true
          },
          {
            id: '4',
            title: '速度之王',
            description: '平均答题时间少于60秒',
            type: 'speed',
            unlockedAt: '',
            progress: 0.7,
            isUnlocked: false
          }
        ],
        recentSessions: [
          { id: '1', date: '2024-12-15', type: 'mixed', score: 90, accuracy: 0.9, timeSpent: 115, questionsCount: 5 },
          { id: '2', date: '2024-12-14', type: 'fallacies', score: 82, accuracy: 0.75, timeSpent: 125, questionsCount: 4 },
          { id: '3', date: '2024-12-13', type: 'arguments', score: 95, accuracy: 0.95, timeSpent: 98, questionsCount: 5 },
          { id: '4', date: '2024-12-12', type: 'methodology', score: 88, accuracy: 0.85, timeSpent: 110, questionsCount: 4 },
          { id: '5', date: '2024-12-11', type: 'topics', score: 78, accuracy: 0.7, timeSpent: 135, questionsCount: 5 }
        ],
        skillAssessment: {
          logicalFallacies: 84,
          argumentAnalysis: 75,
          criticalThinking: 78,
          methodology: 71,
          overallRating: 77
        }
      }
      
      setProgressData(mockProgress)
    } catch (error) {
      console.error('获取进度数据失败:', error)
      toast.error('获取进度数据失败')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getSkillColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLevelBadge = (level: number) => {
    const levelNames = ['', '新手', '学徒', '熟练', '专家', '大师']
    return levelNames[Math.min(level, 5)] || '传奇'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载您的学习进度...</p>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">获取进度数据失败</p>
          <Button onClick={() => router.push('/learn/daily')}>返回主页</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/learn/daily')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                学习进度
              </h1>
            </div>
            <p className="text-gray-600">
              追踪您的学习轨迹，发现进步的足迹
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">当前等级</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-2xl font-bold text-blue-900">Lv.{progressData.overview.level}</p>
                    <Badge className={levelColors[progressData.overview.level as keyof typeof levelColors] || 'bg-purple-100 text-purple-800'}>
                      {getLevelBadge(progressData.overview.level)}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(progressData.overview.experiencePoints / progressData.overview.nextLevelXP) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      {progressData.overview.experiencePoints}/{progressData.overview.nextLevelXP} XP
                    </p>
                  </div>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">当前连击</p>
                  <p className="text-2xl font-bold text-green-900">{progressData.overview.currentStreak}</p>
                  <p className="text-xs text-green-600">最长 {progressData.overview.longestStreak} 天</p>
                </div>
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">平均正确率</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Math.round(progressData.overview.averageAccuracy * 100)}%
                  </p>
                  <p className="text-xs text-purple-600">
                    {progressData.overview.totalCorrect} / {Math.round(progressData.overview.totalCorrect / progressData.overview.averageAccuracy)} 题
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">总学习时长</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatTime(progressData.overview.totalTimeSpent)}
                  </p>
                  <p className="text-xs text-orange-600">{progressData.overview.totalSessions} 次练习</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="performance">表现分析</TabsTrigger>
            <TabsTrigger value="achievements">成就系统</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>本周练习情况</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.weeklyStats.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${day.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="font-medium">{formatDate(day.date)}</span>
                        </div>
                        {day.completed && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{day.score}分</span>
                            <span>{Math.round(day.accuracy * 100)}%</span>
                            <span>{formatTime(day.timeSpent)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>能力评估</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(progressData.skillAssessment).map(([skill, score]) => {
                      if (skill === 'overallRating') return null
                      return (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {skillLabels[skill as keyof typeof skillLabels]}
                            </span>
                            <span className="text-sm font-bold text-gray-900">{score}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getSkillColor(score)}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">综合评分</span>
                        <span className="text-xl font-bold text-blue-600">
                          {progressData.skillAssessment.overallRating}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>分类表现</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.categoryPerformance.map((category) => (
                      <div key={category.category} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {categoryLabels[category.category as keyof typeof categoryLabels]}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {category.improvement > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : category.improvement < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : null}
                            <span className={`text-sm font-medium ${
                              category.improvement > 0 ? 'text-green-600' : 
                              category.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {category.improvement > 0 ? '+' : ''}{category.improvement}%
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">正确率</span>
                            <div className="font-semibold">{Math.round(category.accuracy * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">题目数</span>
                            <div className="font-semibold">{category.totalQuestions}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">平均用时</span>
                            <div className="font-semibold">{formatTime(category.averageTime)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>月度趋势</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.monthlyTrends.map((month) => (
                      <div key={month.month} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-900">{month.month}</h4>
                          <Badge variant="outline">{month.sessions} 次练习</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">平均分数</span>
                            <div className="font-semibold text-blue-600">{month.averageScore}分</div>
                          </div>
                          <div>
                            <span className="text-gray-600">平均正确率</span>
                            <div className="font-semibold text-green-600">
                              {Math.round(month.averageAccuracy * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span>成就系统</span>
                </CardTitle>
                <CardDescription>
                  解锁成就，展示您的学习成果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progressData.achievements.map((achievement) => {
                    const IconComponent = achievementIcons[achievement.type]
                    return (
                      <div 
                        key={achievement.id} 
                        className={`p-4 border rounded-lg ${
                          achievement.isUnlocked 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              achievement.isUnlocked 
                                ? 'bg-yellow-100' 
                                : 'bg-gray-200'
                            }`}>
                              <IconComponent className={`h-5 w-5 ${
                                achievement.isUnlocked 
                                  ? 'text-yellow-600' 
                                  : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${
                                achievement.isUnlocked 
                                  ? 'text-gray-900' 
                                  : 'text-gray-500'
                              }`}>
                                {achievement.title}
                              </h4>
                              <p className={`text-sm ${
                                achievement.isUnlocked 
                                  ? 'text-gray-600' 
                                  : 'text-gray-400'
                              }`}>
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          {achievement.isUnlocked && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        
                        {!achievement.isUnlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">进度</span>
                              <span className="font-medium">{Math.round(achievement.progress * 100)}%</span>
                            </div>
                            <Progress value={achievement.progress * 100} className="h-2" />
                          </div>
                        )}
                        
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            解锁于 {formatDate(achievement.unlockedAt)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>练习历史</span>
                </CardTitle>
                <CardDescription>
                  查看您的所有练习记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          {formatDate(session.date)}
                        </div>
                        <Badge variant="outline">
                          {categoryLabels[session.type as keyof typeof categoryLabels]}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {session.questionsCount} 题
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{session.score}分</div>
                          <div className="text-gray-500">{Math.round(session.accuracy * 100)}%</div>
                        </div>
                        <div className="text-gray-500">
                          {formatTime(session.timeSpent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    查看更多历史记录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button onClick={() => router.push('/learn/daily/practice')}>
            <Zap className="h-4 w-4 mr-2" />
            开始练习
          </Button>
          <Button variant="outline" onClick={() => router.push('/learn/daily/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            练习设置
          </Button>
        </div>
      </div>
    </div>
  )
}