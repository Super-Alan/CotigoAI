'use client'

import { useState, useEffect, useRef } from 'react'
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
  Mic
} from 'lucide-react'
import MessageRenderer from './MessageRenderer'

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
  initialQuestion: {
    id?: string
    content: string
    tags?: string[]
    category?: string
  }
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

export default function AITutorChat({ initialQuestion }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [activeMetadata, setActiveMetadata] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // 初始化：显示问题
  useEffect(() => {
    if (initialQuestion.content) {
      // 添加系统消息（问题卡片）
      setMessages([
        {
          role: 'system',
          content: initialQuestion.content,
          timestamp: new Date(),
          metadata: {
            type: 'question_card',
            category: initialQuestion.category,
            tags: initialQuestion.tags
          }
        }
      ])
    }
  }, [initialQuestion])

  // 自动聚焦输入框
  useEffect(() => {
    textareaRef.current?.focus()
  }, [messages])

  /**
   * 发送消息
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowQuickActions(false)

    try {
      // 调用 AI 导师 API
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: initialQuestion.id,
          questionContent: initialQuestion.content,
          userMessage: userMessage.content,
          conversationHistory: messages
            .filter(m => m.role !== 'system' || m.metadata?.type !== 'question_card')
            .map(m => ({ role: m.role, content: m.content })),
          tags: initialQuestion.tags,
          thinkingDimension: initialQuestion.category
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))

              if (data.content) {
                assistantContent += data.content
                setStreamingMessage(assistantContent)
              }

              if (data.done) {
                // 流结束，添加完整消息
                setMessages(prev => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date(),
                    metadata: data.metadata
                  }
                ])
                setStreamingMessage('')
                setActiveMetadata(data.metadata)
                setIsLoading(false)
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

    setShowQuickActions(true)
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
    <div className="max-w-5xl mx-auto">
      <Card className="h-[calc(100vh-180px)] flex flex-col shadow-2xl border-2">
        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI 批判性思维导师</CardTitle>
                  <p className="text-sm text-gray-600">苏格拉底式引导 · 深度思考训练</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Metadata Display */}
          {activeMetadata && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">
                <Target className="h-3 w-3 mr-1" />
                {activeMetadata.teachingPhase}
              </Badge>
              <Badge variant="outline">
                <Brain className="h-3 w-3 mr-1" />
                {activeMetadata.guidanceLevel}级引导
              </Badge>
              {activeMetadata.questionAnalysis && (
                <Badge variant="outline">
                  难度: {(activeMetadata.questionAnalysis.difficulty * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <div className="max-w-[80%]">
                    <div className="flex items-center justify-end space-x-2 mb-1">
                      <span className="text-sm text-gray-600">你</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // AI 导师消息
                <div className="flex justify-start">
                  <div className={message.metadata?.action === 'mindmap' || message.metadata?.action === 'resources' ? 'max-w-[95%]' : 'max-w-[85%]'}>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">AI 导师</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white border-2 border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                      <MessageRenderer content={message.content} metadata={message.metadata} />
                      {message.metadata?.type === 'quick_action_result' && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs text-gray-500">
                            💡 来自快捷操作：{QUICK_ACTIONS.find(a => a.id === message.metadata.action)?.label}
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
              <div className="max-w-[85%]">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">AI 导师</span>
                  <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                </div>
                <div className="bg-white border-2 border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="inline-block w-1 h-4 bg-blue-600 ml-1 animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t bg-gray-50 p-4">
          {/* Quick Actions */}
          {showQuickActions && !isLoading && (
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.id)}
                  className="bg-white hover:bg-gray-50"
                  title={action.description}
                >
                  <action.icon className={`h-4 w-4 mr-1.5 ${action.color}`} />
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的想法... (Enter 发送, Shift+Enter 换行)"
                className="min-h-[60px] max-h-[200px] resize-none pr-24 text-base"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Mic className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-[60px] px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  发送
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            AI 导师会引导你思考，但不会直接给出答案 · 保持好奇心和批判性思维
          </p>
        </div>
      </Card>
    </div>
  )
}
