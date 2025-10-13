'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  title: string
  topic?: string
  createdAt: string
  updatedAt: string
  messages?: Array<{
    id: string
    role: string
    content: string
    createdAt: string
  }>
}

interface ConversationSidebarProps {
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
}

export default function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 加载对话列表
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (data.success) {
        setConversations(data.data || [])
      }
    } catch (error) {
      console.error('加载对话列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 删除对话
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('确定删除这个对话吗？')) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId))

        // 如果删除的是当前对话，创建新对话
        if (conversationId === currentConversationId) {
          onNewConversation()
        }
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }

  // 生成对话预览
  const getPreviewText = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const firstMessage = conversation.messages[0]
      return firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
    }
    return conversation.topic?.substring(0, 50) || '暂无消息'
  }

  // 截取标题（最多12个字符）
  const getTruncatedTitle = (title: string) => {
    if (title.length > 15) {
      return title.substring(0, 15) + '...'
    }
    return title
  }

  // 过滤对话
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 按日期分组
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = new Date(conv.updatedAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey: string
    if (date.toDateString() === today.toDateString()) {
      groupKey = '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = '昨天'
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = '最近7天'
    } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      groupKey = '最近30天'
    } else {
      groupKey = '更早'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(conv)
    return groups
  }, {} as Record<string, Conversation[]>)

  const groupOrder = ['今天', '昨天', '最近7天', '最近30天', '更早']

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="hover:bg-blue-50 rounded-xl"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewConversation}
          className="hover:bg-blue-50 rounded-xl text-blue-600"
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-base text-gray-900">
              历史对话
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="hover:bg-gray-100 rounded-lg h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* New Conversation Button */}
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 shadow-md hover:shadow-lg transition-all font-medium"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          开启新对话
        </Button>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-sm font-medium">加载中...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="p-4 bg-gray-50 rounded-2xl inline-block mb-3">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? '尝试其他关键词' : '点击上方按钮开启新对话'}
            </p>
          </div>
        ) : (
          <div className="p-3">
            {groupOrder.map(groupKey => {
              const groupConvs = groupedConversations[groupKey]
              if (!groupConvs || groupConvs.length === 0) return null

              return (
                <div key={groupKey} className="mb-4">
                  <div className="px-2 py-2 text-xs font-semibold text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {groupKey}
                  </div>
                  <div className="space-y-1.5">
                    {groupConvs.map(conv => (
                      <div
                        key={conv.id}
                        className={cn(
                          'group relative flex items-start p-3 rounded-xl cursor-pointer transition-all',
                          currentConversationId === conv.id
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                            : 'hover:bg-gray-50 border border-transparent'
                        )}
                        onClick={() => onConversationSelect(conv.id)}
                      >
                        <div className={cn(
                          'p-1.5 rounded-lg mr-2.5 mt-0.5 flex-shrink-0',
                          currentConversationId === conv.id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                        )}>
                          <MessageSquare className={cn(
                            'h-3.5 w-3.5',
                            currentConversationId === conv.id ? 'text-blue-600' : 'text-gray-500'
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className={cn(
                              'text-sm font-semibold pr-2',
                              currentConversationId === conv.id ? 'text-blue-900' : 'text-gray-900'
                            )} title={conv.title}>
                              {getTruncatedTitle(conv.title)}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteConversation(conv.id)
                                  }}
                                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除对话
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1.5 leading-relaxed">
                            {getPreviewText(conv)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{formatTime(conv.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
