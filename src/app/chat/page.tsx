'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import AITutorChat from '@/components/ai-tutor/AITutorChat'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [initialQuestion, setInitialQuestion] = useState<{
    id?: string
    content: string
    tags?: string[]
    category?: string
  } | null>(null)

  useEffect(() => {
    // 从 URL 参数获取初始问题
    const questionParam = searchParams.get('question')
    const categoryParam = searchParams.get('category')
    const tagsParam = searchParams.get('tags')

    if (questionParam) {
      setInitialQuestion({
        content: questionParam,
        category: categoryParam || undefined,
        tags: tagsParam ? tagsParam.split(',') : undefined
      })
    } else {
      // 如果没有问题，设置一个默认的欢迎问题
      setInitialQuestion({
        content: '欢迎来到 AI 批判性思维导师！我会通过苏格拉底式提问来引导你深度思考。你想探讨什么问题？'
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {initialQuestion && (
          <AITutorChat initialQuestion={initialQuestion} />
        )}
      </div>
    </div>
  )
}
