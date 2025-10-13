'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import AITutorChat from '@/components/ai-tutor/AITutorChat'
import ConversationSidebar from '@/components/chat/ConversationSidebar'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [initialQuestion, setInitialQuestion] = useState<{
    id?: string
    content: string
    tags?: string[]
    category?: string
  } | null>(null)

  useEffect(() => {
    // 从 URL 参数获取初始问题和对话ID
    const questionParam = searchParams.get('question')
    const categoryParam = searchParams.get('category')
    const tagsParam = searchParams.get('tags')
    const conversationIdParam = searchParams.get('conversationId')

    // 更新 conversationId 状态（包括 undefined 的情况）
    setCurrentConversationId(conversationIdParam || undefined)

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

  // 处理对话选择
  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId)
    router.push(`/chat?conversationId=${conversationId}`)
  }

  // 处理新建对话
  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden bg-white">
          {initialQuestion && (
            <AITutorChat
              conversationId={currentConversationId}
              initialQuestion={initialQuestion}
            />
          )}
        </div>
      </div>
    </div>
  )
}
