'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Eye,
  Trash2,
  MessageSquare,
  Clock,
  User,
  Calendar,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Message {
  id: string
  role: string
  content: string
  metadata?: any
  createdAt: string
}

interface ConversationUser {
  id: string
  name: string
  email: string
  createdAt?: string
}

interface Conversation {
  id: string
  title: string
  topic?: string
  createdAt: string
  updatedAt: string
  user?: ConversationUser
  messages: Message[]
  stats: {
    messageCount: number
    userMessages: number
    assistantMessages: number
    duration: number
  }
}

interface ConversationDetail extends Conversation {
  analysis: {
    messageCount: number
    userMessages: number
    assistantMessages: number
    duration: number
    avgResponseTime: number
    topics: string[]
    sentiment: string
  }
}

export function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(userFilter && { userId: userFilter }),
        ...(dateFilter && { startDate: dateFilter })
      })

      const response = await fetch(`/api/admin/conversations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      
      const data = await response.json()
      setConversations(data.conversations)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      toast.error('获取对话记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/conversations/${id}`)
      if (!response.ok) throw new Error('Failed to fetch conversation detail')
      
      const data = await response.json()
      setSelectedConversation(data)
      setIsDetailOpen(true)
    } catch (error) {
      console.error('Failed to fetch conversation detail:', error)
      toast.error('获取对话详情失败')
    }
  }

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('确定要删除这个对话吗？')) return

    try {
      const response = await fetch(`/api/admin/conversations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete conversation')
      
      toast.success('对话删除成功')
      fetchConversations()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      toast.error('对话删除失败')
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [currentPage, searchTerm, userFilter, dateFilter])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes}分钟`
  }

  const getRoleLabel = (role: string) => {
    return role === 'user' ? '用户' : 'AI助手'
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'user' ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">对话历史</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            用户对话记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索对话标题、话题或用户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setUserFilter('')
                setDateFilter('')
                setCurrentPage(1)
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              清除筛选
            </Button>
          </div>

          {/* 对话列表 */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>对话信息</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>消息统计</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-medium truncate">{conversation.title}</div>
                        {conversation.topic && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.topic}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {conversation.user ? (
                        <div className="space-y-1">
                          <div className="font-medium">{conversation.user.name || '未知用户'}</div>
                          <div className="text-sm text-gray-500">{conversation.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">匿名用户</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          总计: {conversation.stats.messageCount} 条
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default" className="text-xs">
                            用户: {conversation.stats.userMessages}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            AI: {conversation.stats.assistantMessages}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDuration(conversation.stats.duration)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {format(new Date(conversation.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchConversationDetail(conversation.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConversation(conversation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 对话详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              对话详情
            </DialogTitle>
            <DialogDescription>
              查看完整的对话记录和分析数据
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-6">
              {/* 对话基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">标题:</span>
                      <div className="font-medium">{selectedConversation.title}</div>
                    </div>
                    {selectedConversation.topic && (
                      <div>
                        <span className="text-sm text-gray-500">话题:</span>
                        <div className="font-medium">{selectedConversation.topic}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500">创建时间:</span>
                      <div className="font-medium">
                        {format(new Date(selectedConversation.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">统计分析</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">总消息数:</span>
                      <span className="font-medium">{selectedConversation.analysis.messageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">用户消息:</span>
                      <span className="font-medium">{selectedConversation.analysis.userMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">AI回复:</span>
                      <span className="font-medium">{selectedConversation.analysis.assistantMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">对话时长:</span>
                      <span className="font-medium">{formatDuration(Math.round(selectedConversation.analysis.duration / 1000 / 60))}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 用户信息 */}
              {selectedConversation.user && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      用户信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">姓名:</span>
                        <div className="font-medium">{selectedConversation.user.name || '未设置'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">邮箱:</span>
                        <div className="font-medium">{selectedConversation.user.email}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">注册时间:</span>
                        <div className="font-medium">
                          {selectedConversation.user.createdAt 
                            ? format(new Date(selectedConversation.user.createdAt), 'yyyy-MM-dd', { locale: zhCN })
                            : '未知'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 消息记录 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">消息记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedConversation.messages.map((message, index) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <Badge variant={getRoleBadgeVariant(message.role)}>
                            {getRoleLabel(message.role)}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-sm text-gray-500">
                            {format(new Date(message.createdAt), 'HH:mm:ss', { locale: zhCN })}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}