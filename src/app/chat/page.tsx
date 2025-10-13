'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import AITutorChat from '@/components/ai-tutor/AITutorChat'
import ConversationSidebar from '@/components/chat/ConversationSidebar'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [initialQuestion, setInitialQuestion] = useState<{
    id?: string
    content: string
    tags?: string[]
    category?: string
  } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    setIsSidebarOpen(false) // 选择对话后关闭侧边栏
  }

  // 处理新建对话
  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    router.push('/chat')
    setIsSidebarOpen(false) // 新建对话后关闭侧边栏
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Drawer on mobile, fixed on desktop */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <ConversationSidebar
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden bg-white flex flex-col">
          {initialQuestion && (
            <AITutorChat
              conversationId={currentConversationId}
              initialQuestion={initialQuestion}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
