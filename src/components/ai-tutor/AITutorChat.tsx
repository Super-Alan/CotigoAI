'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Brain,
  Send,
  Lightbulb,
  RotateCcw,
  GitBranch,
  CheckCircle,
  BookOpen,
  Target,
  Sparkles,
  Loader2,
  ChevronLeft,
  Settings,
  BarChart3,
  Bookmark,
  Menu
} from 'lucide-react'
import MessageRenderer from './MessageRenderer'
import VoiceInput from '@/components/voice/VoiceInput'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

interface QuickAction {
  id: string
  icon: React.ElementType
  label: string
  description: string
  color: string
}

interface AITutorChatProps {
  conversationId?: string
  initialQuestion: {
    id?: string
    content: string
    tags?: string[]
    category?: string
  }
  onToggleSidebar?: () => void
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'hint', icon: Lightbulb, label: '给我提示', description: '获取思考方向', color: 'text-yellow-600' },
  { id: 'reframe', icon: RotateCcw, label: '换个角度', description: '重新框定问题', color: 'text-blue-600' },
  { id: 'mindmap', icon: GitBranch, label: '思维导图', description: '可视化思路', color: 'text-purple-600' },
  { id: 'validate', icon: CheckCircle, label: '检查思路', description: '评估推理过程', color: 'text-green-600' },
  { id: 'resources', icon: BookOpen, label: '相关知识', description: '学习资源推荐', color: 'text-indigo-600' },
  { id: 'summary', icon: Target, label: '总结要点', description: '梳理关键内容', color: 'text-pink-600' }
]

const CATEGORY_COLORS = {
  critical_thinking: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  interview: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  social_issue: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-800', border: 'border-green-200' }
}

export default function AITutorChat({ conversationId, initialQuestion, onToggleSidebar }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [activeMetadata, setActiveMetadata] = useState<any>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // 监听 conversationId 变化，重新加载对话
  useEffect(() => {
    const loadConversation = async () => {
      // 如果正在加载中，不重新加载（避免打断流式响应）
      if (isLoading) return

      // 如果conversationId与当前状态相同，不需要重新加载
      // 但是如果两者都是undefined且messages为空，说明是初次加载，需要处理initialQuestion
      if (conversationId === currentConversationId && messages.length > 0) return

      if (conversationId) {
        // 加载已有对话
        try {
          const response = await fetch(`/api/conversations/${conversationId}/messages`)
          const data = await response.json()

          if (data.success && data.data) {
            const loadedMessages = data.data.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              metadata: msg.metadata
            }))
            setMessages(loadedMessages)
            setCurrentConversationId(conversationId)
          }
        } catch (error) {
          console.error('加载对话失败:', error)
        }
      } else {
        // conversationId 变为 undefined，表示要开启新对话
        setCurrentConversationId(undefined)
        if (initialQuestion.content && initialQuestion.content !== '欢迎来到 AI 批判性思维导师！我会通过苏格拉底式提问来引导你深度思考。你想探讨什么问题？') {
          // 如果有具体问题（非默认欢迎语），自动发送给AI
          const userMessage = {
            role: 'user' as const,
            content: initialQuestion.content,
            timestamp: new Date(),
            metadata: {
              type: 'question_card',
              category: initialQuestion.category,
              tags: initialQuestion.tags
            }
          }
          setMessages([userMessage])
          // 自动调用AI响应
          sendMessageToAI([userMessage])
        } else if (initialQuestion.content) {
          // 默认欢迎语作为system消息显示
          setMessages([
            {
              role: 'system',
              content: initialQuestion.content,
              timestamp: new Date(),
              metadata: {
                type: 'welcome_message'
              }
            }
          ])
        }
      }
    }

    loadConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  /**
   * 向AI发送消息（可复用的核心逻辑）
   */
  const sendMessageToAI = async (messagesToSend: Message[]) => {
    setIsLoading(true)

    try {
      // 如果没有对话ID，先创建对话
      let convId = currentConversationId
      let newConversationCreated = false

      if (!convId) {
        const firstUserMessage = messagesToSend.find(m => m.role === 'user')
        const createResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: firstUserMessage?.content.substring(0, 50) || '新对话',
            topic: initialQuestion.content
          })
        })

        const createData = await createResponse.json()
        if (createData.success) {
          convId = createData.id
          setCurrentConversationId(convId)
          newConversationCreated = true
        }
      }

      // 获取最后一条用户消息
      const userMessage = messagesToSend[messagesToSend.length - 1]

      // 发送消息到对话API（自动保存到数据库并返回AI响应）
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')

          // 保留最后一个不完整的行
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim()
                if (!jsonStr) continue

                const data = JSON.parse(jsonStr)

                if (data.type === 'chunk' && data.content) {
                  assistantContent += data.content
                  setStreamingMessage(assistantContent)
                }

                if (data.type === 'done') {
                  // 流结束，添加完整消息
                  setMessages(prev => [
                    ...prev,
                    {
                      role: 'assistant',
                      content: assistantContent,
                      timestamp: new Date()
                    }
                  ])
                  setStreamingMessage('')
                  setIsLoading(false)

                  // 流式响应完成后再更新URL（避免打断流式传输）
                  if (newConversationCreated && convId) {
                    router.replace(`/chat?conversationId=${convId}`, { scroll: false })
                  }
                }
              } catch (e) {
                console.error('解析流式数据错误:', e, '原始数据:', line)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后重试。',
          timestamp: new Date()
        }
      ])
      setIsLoading(false)
      setStreamingMessage('')
    }
  }

  /**
   * 发送消息
   */
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setShowQuickActions(false)

    // 使用统一的发送逻辑
    await sendMessageToAI([...messages, userMessage])
    setShowQuickActions(true)
  }

  /**
   * 处理语音输入 - 自动填入输入框
   */
  const handleVoiceTextConfirmed = (text: string) => {
    // 直接填入输入框，不自动发送
    setInputValue(text)
    // 聚焦输入框，方便用户编辑
    textareaRef.current?.focus()
  }

  /**
   * 处理快捷操作
   */
  const handleQuickAction = async (actionId: string) => {
    if (isLoading) return

    const action = QUICK_ACTIONS.find(a => a.id === actionId)
    if (!action) return

    // 显示用户触发了快捷操作
    const systemMessage: Message = {
      role: 'system',
      content: `💡 正在${action.label}...`,
      timestamp: new Date(),
      metadata: { type: 'action_indicator' }
    }

    setMessages(prev => [...prev, systemMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: initialQuestion.id,
          questionContent: initialQuestion.content,
          userMessage: inputValue || messages[messages.length - 1]?.content || '',
          conversationHistory: messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
          requestedAction: actionId
        })
      })

      const data = await response.json()

      if (data.success) {
        // 移除加载指示器
        setMessages(prev => prev.slice(0, -1))

        // 提取结果内容 - 处理字符串或对象
        const resultContent = typeof data.result === 'string'
          ? data.result
          : data.result?.raw || JSON.stringify(data.result)

        // 添加快捷操作结果
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: resultContent,
            timestamp: new Date(),
            metadata: { type: 'quick_action_result', action: actionId }
          }
        ])
      } else {
        // 处理错误情况
        setMessages(prev => prev.slice(0, -1))
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `抱歉，快捷操作失败：${data.message || '未知错误'}`,
            timestamp: new Date(),
            metadata: { type: 'error' }
          }
        ])
      }
    } catch (error) {
      console.error('快捷操作失败:', error)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const categoryStyle = CATEGORY_COLORS[initialQuestion.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.critical_thinking

  return (
    <div className="h-full flex flex-col">
      {/* Top Header Bar */}
      <div className="border-b border-gray-200 bg-white px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger Menu (Mobile) + Title Info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Hamburger Menu Button - Only on Mobile */}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="lg:hidden h-10 w-10 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            )}

            {/* Logo and Title */}
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-md flex-shrink-0">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">AI 批判性思维导师</h1>
              <p className="hidden sm:block text-xs text-gray-500">苏格拉底式引导 · 深度思考训练</p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-gray-100">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-gray-100 hidden sm:flex">
              <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-gray-100">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === 'system' && message.metadata?.type === 'question_card' ? (
                // 问题卡片
                <Card className={`${categoryStyle.bg} border-2 ${categoryStyle.border} shadow-md`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                        <span className="font-semibold text-gray-900">今日探讨问题</span>
                      </div>
                      {initialQuestion.category && (
                        <Badge className={categoryStyle.badge}>
                          {initialQuestion.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                      {message.content}
                    </p>
                    {initialQuestion.tags && initialQuestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {initialQuestion.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : message.role === 'system' && message.metadata?.type === 'action_indicator' ? (
                // 操作指示器
                <div className="flex justify-center">
                  <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{message.content}</span>
                  </div>
                </div>
              ) : message.role === 'user' ? (
                // 用户消息
                <div className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="flex items-center justify-end space-x-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-md shadow-md">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // AI 导师消息
                <div className="flex justify-start">
                  <div className={message.metadata?.action === 'mindmap' || message.metadata?.action === 'resources' ? 'max-w-[90%]' : 'max-w-[80%]'}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">AI 导师</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm hover:shadow-md transition-shadow">
                      <MessageRenderer content={message.content} metadata={message.metadata} />
                      {message.metadata?.type === 'quick_action_result' && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            来自快捷操作：{QUICK_ACTIONS.find(a => a.id === message.metadata.action)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* 流式输入中的消息 */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">AI 导师</span>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              </div>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-0.5 h-5 bg-blue-600 ml-1 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Toolbar */}
      <div className="border-t border-gray-200 bg-white">
        {/* Quick Actions Toolbar */}
        {showQuickActions && !isLoading && messages.length > 1 && (
          <div className="border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto">
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium mr-1 sm:mr-2 flex-shrink-0">快捷操作:</span>
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction(action.id)}
                  className="flex-shrink-0 h-7 sm:h-8 px-2 sm:px-3 rounded-lg hover:bg-gray-100 text-[10px] sm:text-xs font-medium"
                  title={action.description}
                >
                  <action.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 ${action.color}`} />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="px-3 sm:px-8 py-3 sm:py-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的想法..."
                  className="min-h-[50px] sm:min-h-[60px] max-h-[200px] resize-none text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-14 bg-white shadow-sm hover:shadow-md transition-shadow"
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex space-x-1">
                  <VoiceInput
                    onTextConfirmed={handleVoiceTextConfirmed}
                    disabled={isLoading}
                    className="h-8 w-8 sm:h-8 sm:w-8"
                    placeholder="语音输入"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="h-[50px] sm:h-[60px] px-4 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all font-medium text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                    <span className="hidden sm:inline">发送</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-4 text-center">
              AI 导师会引导你思考，但不会直接给出答案 · 保持好奇心和批判性思维
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
