'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BookOpen,
  Brain,
  Lightbulb,
  Star,
  Loader2,
  Play,
  Pause
} from 'lucide-react'
import { toast } from 'sonner'

export default function DailyTheoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const conceptId = params.id as string

  const [loading, setLoading] = useState(true)
  const [theory, setTheory] = useState<any>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [sectionsViewed, setSectionsViewed] = useState<Set<string>>(new Set())
  const [currentTab, setCurrentTab] = useState('概念')
  const [userRating, setUserRating] = useState<number>(0)

  useEffect(() => {
    if (conceptId) {
      fetchTheoryDetail()
    }
  }, [conceptId])

  // 追踪时间
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeSpent(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // 追踪查看的章节
  useEffect(() => {
    const sectionMap: Record<string, string> = {
      '概念': 'concepts',
      '模型': 'models',
      '演示': 'demonstrations'
    }

    const section = sectionMap[currentTab]
    if (section) {
      setSectionsViewed(prev => new Set([...prev, section]))
    }
  }, [currentTab])

  const fetchTheoryDetail = async () => {
    try {
      setLoading(true)

      // 获取概念内容详情
      const res = await fetch(`/api/daily-theory/concept/${conceptId}`)
      if (!res.ok) throw new Error('获取内容失败')

      const result = await res.json()
      if (result.success) {
        setTheory(result.data)
      }
    } catch (error) {
      console.error('获取概念内容失败:', error)
      toast.error('获取内容失败')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!session?.user) {
      toast.error('请先登录')
      return
    }

    try {
      setIsCompleting(true)

      const res = await fetch('/api/daily-theory/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpent,
          sectionsViewed: Array.from(sectionsViewed),
          userRating: userRating > 0 ? userRating : null,
          comprehensionScore: 80 // 默认80分，可以后续优化为让用户自评
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '标记完成失败')
      }

      const result = await res.json()
      toast.success(result.data.message || '学习完成！🎉')

      // 延迟跳转
      setTimeout(() => {
        router.push('/learn')
      }, 1500)
    } catch (error: any) {
      console.error('标记完成失败:', error)
      toast.error(error.message || '标记完成失败')
    } finally {
      setIsCompleting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderContent = (content: any) => {
    if (!content) return null

    // 如果是 JSON 对象，尝试渲染结构化内容
    if (typeof content === 'object' && content.sections) {
      return (
        <div className="space-y-4">
          {content.sections.map((section: any, index: number) => (
            <div key={index} className="prose prose-sm max-w-none">
              {section.type === 'text' && <p className="text-gray-700 leading-relaxed">{section.content}</p>}
              {section.type === 'heading' && <h3 className="font-bold text-lg text-gray-900">{section.content}</h3>}
              {section.type === 'list' && (
                <ul className="list-disc list-inside space-y-2">
                  {section.items.map((item: string, i: number) => (
                    <li key={i} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              )}
              {section.type === 'code' && (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{section.content}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      )
    }

    // 如果是字符串，直接显示
    if (typeof content === 'string') {
      return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    }

    // 降级：显示 JSON
    return (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {JSON.stringify(content, null, 2)}
      </pre>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!theory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">内容不存在</p>
          <Link href="/learn">
            <Button variant="outline">返回学习中心</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">返回</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <Button
                onClick={handleComplete}
                disabled={isCompleting || sectionsViewed.size === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 min-h-[44px] text-sm sm:text-base"
                size="sm"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">标记中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                    完成学习
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Title Card - Flat Design */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                {/* Render icon properly - emoji or default BookOpen */}
                {theory.thinkingType.icon && /^[\u{1F000}-\u{1FFFF}]$/u.test(theory.thinkingType.icon) ? (
                  <span className="text-2xl sm:text-3xl">{theory.thinkingType.icon}</span>
                ) : (
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                )}
                <Badge variant="outline" className="text-[10px] sm:text-xs">{theory.thinkingType.name}</Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs">Level {theory.level}</Badge>
                <Badge className={`text-[10px] sm:text-xs ${
                  theory.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  theory.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {theory.difficulty === 'beginner' ? '初级' :
                   theory.difficulty === 'intermediate' ? '中级' : '高级'}
                </Badge>
              </div>
              <CardTitle className="text-lg sm:text-2xl font-semibold">{theory.title}</CardTitle>
              {theory.subtitle && (
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{theory.subtitle}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{theory.description}</p>

              {/* Learning Objectives */}
              {theory.learningObjectives && theory.learningObjectives.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
                  <div className="font-semibold text-sm sm:text-base text-purple-900 mb-2 sm:mb-3">📋 学习目标</div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {theory.learningObjectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs - Flat Mobile Design */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3 h-auto bg-gray-100">
                  <TabsTrigger value="概念" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">核心</span>概念
                  </TabsTrigger>
                  <TabsTrigger value="模型" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    思维模型
                  </TabsTrigger>
                  <TabsTrigger value="演示" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    实例演示
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="概念" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {theory.conceptsIntro && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{theory.conceptsIntro}</p>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    {renderContent(theory.conceptsContent)}
                  </div>
                </TabsContent>

                <TabsContent value="模型" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {theory.modelsIntro && (
                    <div className="bg-green-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{theory.modelsIntro}</p>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    {renderContent(theory.modelsContent)}
                  </div>
                </TabsContent>

                <TabsContent value="演示" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  {theory.demonstrationsIntro && (
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{theory.demonstrationsIntro}</p>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    {renderContent(theory.demonstrationsContent)}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Rating Card - Flat Design */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold">评价这个概念</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Star
                      className={`h-7 w-7 sm:h-8 sm:w-8 transition-all ${
                        star <= userRating
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
