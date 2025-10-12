'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  Zap,
  BookOpen,
  Users,
  Lightbulb,
  Settings
} from 'lucide-react'
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'
import { ProgressResponse, ThinkingTypeProgress, PracticeStats } from '@/types'

export default function ProgressDashboard() {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/critical-thinking/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProgressData(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">正在加载进度数据...</p>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">暂无进度数据</h2>
          <p className="text-gray-600 mb-4">开始练习后即可查看详细的进度分析</p>
          <Link href="/learn/critical-thinking">
            <Button>开始练习</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { overallStats, abilityScores, thinkingTypeProgress } = progressData

  // Prepare radar chart data
  const radarData = abilityScores.map(score => ({
    ability: score.name,
    score: score.score,
    fullMark: 100
  }))

  // Prepare trend data (mock data for demonstration)
  const trendData = [
    { date: '1周前', analytical: 65, creative: 70, practical: 60, caring: 75, systematic: 68 },
    { date: '6天前', analytical: 68, creative: 72, practical: 62, caring: 77, systematic: 70 },
    { date: '5天前', analytical: 70, creative: 74, practical: 65, caring: 78, systematic: 72 },
    { date: '4天前', analytical: 72, creative: 75, practical: 67, caring: 80, systematic: 74 },
    { date: '3天前', analytical: 74, creative: 77, practical: 70, caring: 82, systematic: 76 },
    { date: '2天前', analytical: 76, creative: 78, practical: 72, caring: 83, systematic: 78 },
    { date: '今天', analytical: abilityScores[0]?.score || 0, creative: abilityScores[1]?.score || 0, practical: abilityScores[2]?.score || 0, caring: abilityScores[3]?.score || 0, systematic: abilityScores[4]?.score || 0 }
  ]

  const thinkingTypeNames = {
    analytical: '分析性思维',
    creative: '创造性思维', 
    practical: '实用性思维',
    caring: '关怀性思维',
    systematic: '系统性思维'
  }

  const thinkingTypeIcons = {
    analytical: BarChart3,
    creative: Lightbulb,
    practical: Settings,
    caring: Users,
    systematic: Target
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn/critical-thinking" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回批判性思维训练
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">学习进度分析</h1>
              <p className="text-gray-600">全面了解你的批判性思维能力发展情况</p>
            </div>
            <Button onClick={loadProgressData} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              刷新数据
            </Button>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总体水平</p>
                    <p className="text-2xl font-bold text-blue-600">{overallStats.averageLevel}</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">掌握度</p>
                    <p className="text-2xl font-bold text-green-600">{overallStats.averageMastery}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">练习题数</p>
                    <p className="text-2xl font-bold text-purple-600">{overallStats.totalQuestions}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">学习时长</p>
                    <p className="text-2xl font-bold text-orange-600">{Math.round(overallStats.totalTime / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">能力概览</TabsTrigger>
            <TabsTrigger value="detailed">详细分析</TabsTrigger>
            <TabsTrigger value="trends">进步趋势</TabsTrigger>
            <TabsTrigger value="achievements">成就系统</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>五维能力雷达图</CardTitle>
                  <CardDescription>
                    全面展示你在五个思维维度的能力水平
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="ability" />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={false}
                        />
                        <Radar
                          name="能力得分"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Ability Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>能力得分详情</CardTitle>
                  <CardDescription>
                    各项思维能力的具体得分和等级
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {abilityScores.map((ability, index) => (
                      <div key={ability.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{ability.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={ability.score >= 80 ? 'default' : ability.score >= 60 ? 'secondary' : 'outline'}>
                              {ability.score >= 80 ? '优秀' : ability.score >= 60 ? '良好' : '待提升'}
                            </Badge>
                            <span className="text-sm font-bold text-gray-900">{ability.score}/100</span>
                          </div>
                        </div>
                        <Progress value={ability.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">快速练习</h3>
                  <p className="text-sm text-gray-600 mb-4">开始一轮新的思维训练</p>
                  <Link href="/learn/critical-thinking">
                    <Button size="sm" className="w-full">开始练习</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">学习中心</h3>
                  <p className="text-sm text-gray-600 mb-4">查看理论知识和方法</p>
                  <Link href="/learn">
                    <Button size="sm" variant="outline" className="w-full">进入学习</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">成就系统</h3>
                  <p className="text-sm text-gray-600 mb-4">查看获得的徽章和奖励</p>
                  <Button size="sm" variant="outline" className="w-full">查看成就</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Analysis Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {thinkingTypeProgress.map((progress) => {
                const Icon = thinkingTypeIcons[progress.thinkingTypeId as keyof typeof thinkingTypeIcons]
                const typeName = thinkingTypeNames[progress.thinkingTypeId as keyof typeof thinkingTypeNames]
                
                return (
                  <Card key={progress.thinkingTypeId}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon className="h-5 w-5 mr-2" />
                        {typeName}
                      </CardTitle>
                      <CardDescription>
                        等级 {progress.level} · 掌握度 {progress.masteryPercentage}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Level Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>等级进度</span>
                            <span>{progress.experiencePoints} / {progress.level * 100} XP</span>
                          </div>
                          <Progress value={(progress.experiencePoints / (progress.level * 100)) * 100} />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-bold text-blue-600">{progress.questionsAnswered}</div>
                            <div className="text-gray-600">已练习</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="font-bold text-green-600">{Math.round(progress.averageScore)}%</div>
                            <div className="text-gray-600">平均分</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link href={`/learn/critical-thinking/${progress.thinkingTypeId}`}>
                          <Button className="w-full" size="sm">
                            继续学习
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>能力发展趋势</CardTitle>
                <CardDescription>
                  过去一周各项思维能力的变化情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="analytical" stroke="#3b82f6" name="分析性思维" />
                      <Line type="monotone" dataKey="creative" stroke="#10b981" name="创造性思维" />
                      <Line type="monotone" dataKey="practical" stroke="#f59e0b" name="实用性思维" />
                      <Line type="monotone" dataKey="caring" stroke="#ef4444" name="关怀性思维" />
                      <Line type="monotone" dataKey="systematic" stroke="#8b5cf6" name="系统性思维" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-600 mb-1">+12%</div>
                  <div className="text-sm text-gray-600">本周平均提升</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-600 mb-1">关怀性思维</div>
                  <div className="text-sm text-gray-600">进步最快的能力</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-600 mb-1">7</div>
                  <div className="text-sm text-gray-600">连续练习天数</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mock achievements */}
              {[
                { name: '初学者', description: '完成第一次练习', icon: '🎯', unlocked: true },
                { name: '思维探索者', description: '尝试所有思维类型', icon: '🧭', unlocked: true },
                { name: '坚持不懈', description: '连续练习7天', icon: '🔥', unlocked: true },
                { name: '分析大师', description: '分析性思维达到80分', icon: '📊', unlocked: false },
                { name: '创意天才', description: '创造性思维达到90分', icon: '💡', unlocked: false },
                { name: '完美主义者', description: '所有能力都达到85分以上', icon: '⭐', unlocked: false }
              ].map((achievement, index) => (
                <Card key={index} className={achievement.unlocked ? 'border-yellow-200 bg-yellow-50' : 'opacity-60'}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {achievement.unlocked ? (
                      <Badge className="bg-yellow-600">已获得</Badge>
                    ) : (
                      <Badge variant="outline">未解锁</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}