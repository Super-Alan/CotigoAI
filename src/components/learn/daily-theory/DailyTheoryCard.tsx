'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  RefreshCw,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'

interface DailyTheoryCardProps {
  className?: string
}

interface TheoryData {
  theory: {
    id: string
    title: string
    subtitle?: string
    description: string
    level: number
    difficulty: string
    estimatedTime: number
    learningObjectives: string[]
    thinkingType: {
      id: string
      name: string
      icon: string
      description: string
    }
  }
  progress: {
    startedAt: string | null
    completedAt: string | null
    timeSpent: number
    sectionsViewed: string[]
    isBookmarked: boolean
    userRating: number | null
  }
  isNew: boolean
}

interface StatusData {
  todayCompleted: boolean
  currentStreak: number
}

export function DailyTheoryCard({ className }: DailyTheoryCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [theoryData, setTheoryData] = useState<TheoryData | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 并行请求今日概念和学习状态
      const [theoryRes, statusRes] = await Promise.all([
        fetch('/api/daily-theory/today'),
        fetch('/api/daily-theory/status')
      ])

      if (!theoryRes.ok || !statusRes.ok) {
        throw new Error('获取数据失败')
      }

      const theoryResult = await theoryRes.json()
      const statusResult = await statusRes.json()

      if (theoryResult.success) {
        setTheoryData(theoryResult.data)
      }

      if (statusResult.success) {
        setStatusData(statusResult.data)
      }
    } catch (error) {
      console.error('获取每日概念失败:', error)
      toast.error('获取每日概念失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast.success('已刷新')
  }

  const handleStartLearning = () => {
    if (theoryData?.theory) {
      console.log('开始学习，跳转到:', `/learn/daily-theory/${theoryData.theory.id}`)
      // 跳转到概念详情页
      router.push(`/learn/daily-theory/${theoryData.theory.id}`)
    } else {
      console.error('没有理论数据，无法跳转')
      toast.error('数据加载中，请稍后再试')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyText = (difficulty: string) => {
    const texts: Record<string, string> = {
      'beginner': '初级',
      'intermediate': '中级',
      'advanced': '高级'
    }
    return texts[difficulty] || difficulty
  }

  if (loading) {
    return (
      <Card className={`border-2 border-purple-200 ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    )
  }

  if (!theoryData || !statusData) {
    return (
      <Card className={`border-2 border-gray-200 ${className}`}>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">暂无可学习的概念</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { theory, progress } = theoryData
  const isCompleted = !!progress.completedAt

  return (
    <Card
      className={`border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif' }}
    >
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                📚 每日概念
              </Badge>
              {statusData.currentStreak > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Flame className="h-3 w-3 text-orange-500" />
                  连续 {statusData.currentStreak} 天
                </Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-600 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>
            <CardTitle className="text-base sm:text-xl">
              {isCompleted ? '今日学习已完成！' : '今日概念'}
            </CardTitle>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-500">预计学习时间</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600 flex items-center gap-1">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              {theory.estimatedTime} 分钟
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 sm:space-y-3 pt-0">
        {/* 概念卡片 - Compact Mobile Version */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
            {/* Render icon properly - emoji or default BookOpen */}
            {theory.thinkingType.icon && /^[\u{1F000}-\u{1FFFF}]$/u.test(theory.thinkingType.icon) ? (
              <span className="text-lg sm:text-2xl">{theory.thinkingType.icon}</span>
            ) : (
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            )}
            <Badge variant="outline" className="text-[10px] sm:text-xs">{theory.thinkingType.name}</Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">Level {theory.level}</Badge>
            <Badge className={`${getDifficultyColor(theory.difficulty)} text-[10px] sm:text-xs`}>
              {getDifficultyText(theory.difficulty)}
            </Badge>
            {theoryData.isNew && (
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-[10px] sm:text-xs">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                新推荐
              </Badge>
            )}
          </div>

          <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{theory.title}</h3>
          {theory.subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{theory.subtitle}</p>
          )}
          <p className="text-xs sm:text-base text-gray-700 mb-2 sm:mb-3 line-clamp-2">{theory.description}</p>

          {/* 学习目标 - 移动端显示较少 */}
          {theory.learningObjectives && theory.learningObjectives.length > 0 && (
            <div className="space-y-1 sm:space-y-2">
              <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📋 学习目标：</div>
              {/* 移动端显示前2个，桌面端显示前3个 */}
              {theory.learningObjectives.slice(0, 2).map((objective, index) => (
                <div key={index} className="flex items-start gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">{objective}</span>
                </div>
              ))}
              {/* 桌面端显示第3个目标 */}
              {theory.learningObjectives.length > 2 && (
                <div className="hidden sm:flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{theory.learningObjectives[2]}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 行动按钮 - Compact Mobile */}
        <div className="flex gap-2 sm:gap-3">
          {!isCompleted ? (
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[44px]"
              size="default"
              onClick={handleStartLearning}
            >
              <Play className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{progress.startedAt ? '继续学习' : '开始学习'}</span>
            </Button>
          ) : (
            <Button
              className="flex-1 min-h-[44px]"
              variant="outline"
              size="default"
              onClick={handleStartLearning}
            >
              <BookOpen className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">回顾内容</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={handleRefresh}
            disabled={refreshing}
            className="min-h-[44px] min-w-[44px]"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
