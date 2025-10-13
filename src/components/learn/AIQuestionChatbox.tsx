'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Sparkles, RefreshCw, ArrowRight, Lightbulb, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DailyQuestion {
  id: string
  question: string
  category: string
  subcategory: string | null
  difficulty: string
  tags: string[]
  thinkingTypes: string[]
  context: string | null
}

const categoryConfig = {
  critical_thinking: {
    name: '批判性思维',
    icon: Lightbulb,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800'
  },
  interview: {
    name: '升学面试',
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800'
  },
  social_issue: {
    name: '社会热点',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800'
  }
}

const difficultyConfig = {
  beginner: { name: '初级', color: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  intermediate: { name: '中级', color: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  advanced: { name: '高级', color: 'text-red-700', badge: 'bg-red-100 text-red-700' }
}

export default function AIQuestionChatbox() {
  const [question, setQuestion] = useState<DailyQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDailyQuestion()
  }, [])

  const fetchDailyQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-questions?limit=1')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.questions.length > 0) {
          setQuestion(data.data.questions[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily question:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDailyQuestion()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!question) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
            AI 每日一问
          </CardTitle>
          <CardDescription>暂无可用问题</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const categoryInfo = categoryConfig[question.category as keyof typeof categoryConfig] || categoryConfig.critical_thinking
  const difficultyInfo = difficultyConfig[question.difficulty as keyof typeof difficultyConfig] || difficultyConfig.intermediate
  const CategoryIcon = categoryInfo.icon

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                AI 每日一问
              </CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-white hover:shadow-sm transition-all h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 text-purple-600 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Category and Difficulty Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge className={`${categoryInfo.badge} flex items-center space-x-1 text-xs`}>
            <CategoryIcon className="h-3 w-3" />
            <span>{categoryInfo.name}</span>
          </Badge>
          <Badge className={`${difficultyInfo.badge} text-xs`}>
            {difficultyInfo.name}
          </Badge>
          {question.subcategory && (
            <Badge variant="outline" className="bg-white text-xs">
              {question.subcategory}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Question Content - Compact */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
          <p className="text-base text-gray-800 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Tags - Compact */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-purple-100"
              >
                #{tag}
              </span>
            ))}
            {question.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-white text-gray-500 text-xs rounded-full border border-purple-100">
                +{question.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Button - Compact */}
        <Link href="/chat">
          <Button className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 group">
            <MessageSquare className="mr-2 h-4 w-4" />
            与 AI 导师探讨
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
