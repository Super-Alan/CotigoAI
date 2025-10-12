'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp,
  Calendar,
  Target,
  Award,
  Clock,
  Flame,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  HelpCircle,
  RotateCcw,
  Link2,
  Search,
  BookOpen,
  Users,
  Star,
  Timer,
  Sparkles
} from 'lucide-react'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface ThinkingType {
  id: string
  name: string
  description: string
  icon: string
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

interface WeeklyProgress {
  date: string
  questionsCompleted: number
  averageScore: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date | null
}

const thinkingTypeIcons = {
  causal_analysis: Search,
  premise_challenge: HelpCircle,
  fallacy_detection: Eye,
  iterative_reflection: RotateCcw,
  connection_transfer: Link2
}

const thinkingTypeColors = {
  causal_analysis: '#3B82F6',
  premise_challenge: '#10B981',
  fallacy_detection: '#EF4444',
  iterative_reflection: '#8B5CF6',
  connection_transfer: '#F59E0B'
}

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B']

export default function ProgressDashboard() {
  const [thinkingTypes, setThinkingTypes] = useState<ThinkingType[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [dailyStreak, setDailyStreak] = useState<DailyStreak | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchThinkingTypes(),
        fetchUserProgress(),
        fetchDailyStreak(),
        fetchWeeklyProgress(),
        fetchAchievements()
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const fetchWeeklyProgress = async () => {
    // Mock data for weekly progress
    const mockWeeklyData = [
      { date: '2024-01-15', questionsCompleted: 12, averageScore: 85 },
      { date: '2024-01-16', questionsCompleted: 8, averageScore: 78 },
      { date: '2024-01-17', questionsCompleted: 15, averageScore: 92 },
      { date: '2024-01-18', questionsCompleted: 10, averageScore: 88 },
      { date: '2024-01-19', questionsCompleted: 18, averageScore: 95 },
      { date: '2024-01-20', questionsCompleted: 14, averageScore: 82 },
      { date: '2024-01-21', questionsCompleted: 20, averageScore: 90 }
    ]
    setWeeklyProgress(mockWeeklyData)
  }

  const fetchAchievements = async () => {
    // Mock achievements data
    const mockAchievements = [
      {
        id: 'first_practice',
        name: '初次练习',
        description: '完成第一次思维练习',
        icon: 'star',
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: 'streak_7',
        name: '七日连击',
        description: '连续练习7天',
        icon: 'flame',
        unlockedAt: new Date('2024-01-21')
      },
      {
        id: 'perfect_score',
        name: '完美表现',
        description: '单次练习获得满分',
        icon: 'trophy',
        unlockedAt: new Date('2024-01-19')
      },
      {
        id: 'dimension_master',
        name: '维度大师',
        description: '在某个思维维度达到90%正确率',
        icon: 'brain',
        unlockedAt: null
      }
    ]
    setAchievements(mockAchievements)
  }

  const getProgressPercentage = (progress: UserProgress) => {
    if (progress.totalQuestions === 0) return 0
    return Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
  }

  const getRadarData = () => {
    return thinkingTypes.map(type => {
      const progress = userProgress.find(p => p.thinkingTypeId === type.id)
      return {
        dimension: type.name,
        score: progress ? getProgressPercentage(progress) : 0,
        fullMark: 100
      }
    })
  }

  const getPieData = () => {
    return userProgress.map((progress, index) => {
      const type = thinkingTypes.find(t => t.id === progress.thinkingTypeId)
      return {
        name: type?.name || progress.thinkingTypeId,
        value: progress.correctAnswers,
        color: COLORS[index % COLORS.length]
      }
    })
  }

  const totalQuestions = userProgress.reduce((sum, p) => sum + p.correctAnswers, 0)
  const averageScore = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + p.averageScore, 0) / userProgress.length)
    : 0
  const totalProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + getProgressPercentage(p), 0) / userProgress.length)
    : 0

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const lockedAchievements = achievements.filter(a => !a.unlockedAt)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                学习进度仪表板
              </h1>
              <p className="text-gray-600 text-lg">
                全面了解你的批判性思维能力发展轨迹
              </p>
            </div>
            <Link href="/learn">
              <Button variant="outline" className="hidden sm:flex">
                返回学习中心
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">整体进度</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProgress}%</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+5% 本周</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">平均分数</p>
                  <p className="text-3xl font-bold text-gray-900">{averageScore}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+3 本周</span>
                  </div>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium mb-1">连续天数</p>
                  <p className="text-3xl font-bold text-gray-900">{dailyStreak?.currentStreak || 0}</p>
                  <div className="flex items-center mt-2">
                    <Flame className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">最长 {dailyStreak?.longestStreak || 0} 天</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Flame className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">完成题目</p>
                  <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">总计</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-600 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart - Five Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                五维能力雷达图
              </CardTitle>
              <CardDescription>
                各思维维度的能力水平分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" className="text-sm" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      className="text-xs"
                    />
                    <Radar
                      name="能力水平"
                      dataKey="score"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                每日练习趋势
              </CardTitle>
              <CardDescription>
                最近一周的练习量和平均分数变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                      formatter={(value, name) => [
                        value,
                        name === 'questionsCompleted' ? '完成题目' : '平均分数'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="questionsCompleted" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Progress by Dimension */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Dimension Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  各维度详细进度
                </CardTitle>
                <CardDescription>
                  每个思维维度的具体表现和改进建议
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {thinkingTypes.map((type) => {
                  const progress = userProgress.find(p => p.thinkingTypeId === type.id)
                  const percentage = progress ? getProgressPercentage(progress) : 0
                  const IconComponent = thinkingTypeIcons[type.id as keyof typeof thinkingTypeIcons] || Brain
                  const color = thinkingTypeColors[type.id as keyof typeof thinkingTypeColors] || '#3B82F6'

                  return (
                    <div key={type.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                            <IconComponent className="h-5 w-5" style={{ color }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{type.name}</h4>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{percentage}%</div>
                          {progress && (
                            <div className="text-sm text-gray-600">
                              {progress.correctAnswers}/{progress.totalQuestions} 题
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      {progress && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>平均分: {progress.averageScore.toFixed(1)}</span>
                          <span>
                            最近练习: {progress.lastPracticeAt 
                              ? new Date(progress.lastPracticeAt).toLocaleDateString()
                              : '未开始'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  成就系统
                </CardTitle>
                <CardDescription>
                  已解锁 {unlockedAchievements.length}/{achievements.length} 个成就
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {achievement.unlockedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {lockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-600">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                      <p className="text-xs text-gray-400 mt-1">未解锁</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/practice">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-600 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">继续每日练习</h3>
                <p className="text-sm text-gray-600">保持学习节奏，提升思维能力</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learn/path">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-600 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">个性化学习路径</h3>
                <p className="text-sm text-gray-600">基于进度制定专属学习计划</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/learn/dimensions">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-600 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">探索思维维度</h3>
                <p className="text-sm text-gray-600">深入了解五大核心思维能力</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}