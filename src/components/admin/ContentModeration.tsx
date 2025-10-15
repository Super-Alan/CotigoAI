'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, Search, Eye, CheckCircle, XCircle, Trash2, AlertTriangle, User, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface ModerationItem {
  id: string
  content: string
  contentType: 'message' | 'topic' | 'comment'
  status: 'pending' | 'approved' | 'rejected'
  reportReason?: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  conversation?: {
    id: string
    title: string
  }
  createdAt: string
  updatedAt: string
}

interface ModerationResponse {
  items: ModerationItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function ContentModeration() {
  const [items, setItems] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // 筛选状态
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  })

  // 审核对话框状态
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [moderationReason, setModerationReason] = useState('')

  useEffect(() => {
    fetchModerationItems()
  }, [pagination.page, filters])

  const fetchModerationItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/admin/moderation?${params}`)
      if (!response.ok) throw new Error('Failed to fetch moderation items')
      
      const data: ModerationResponse = await response.json()
      setItems(data.items)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching moderation items:', error)
      toast.error('获取审核内容失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModerationAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!selectedItem) return

    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: selectedItem.id,
          action,
          reason: moderationReason
        }),
      })

      if (!response.ok) throw new Error('Failed to moderate content')

      const actionText = {
        approve: '批准',
        reject: '拒绝',
        delete: '删除'
      }[action]

      toast.success(`内容${actionText}成功`)
      setIsDialogOpen(false)
      setSelectedItem(null)
      setModerationReason('')
      fetchModerationItems()
    } catch (error) {
      console.error('Error moderating content:', error)
      toast.error('审核操作失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '待审核', variant: 'destructive' as const, icon: AlertTriangle },
      approved: { label: '已批准', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: '已拒绝', variant: 'secondary' as const, icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'topic':
        return <Shield className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">内容审核</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          内容审核
        </h2>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索内容、用户..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="审核状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="内容类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                <SelectItem value="message">消息</SelectItem>
                <SelectItem value="topic">话题</SelectItem>
                <SelectItem value="comment">评论</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 审核列表 */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getContentTypeIcon(item.contentType)}
                    <span className="font-medium">{item.contentType === 'message' ? '消息' : '话题'}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{item.user.name || item.user.email}</span>
                    <span>•</span>
                    <span>{format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                </div>
                <Dialog open={isDialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (open) setSelectedItem(item)
                  else setSelectedItem(null)
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      审核
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>内容审核</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>内容详情</Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>用户信息</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="font-medium">{item.user.name || '未知用户'}</p>
                            <p className="text-sm text-gray-600">{item.user.email}</p>
                          </div>
                        </div>
                        
                        {item.conversation && (
                          <div>
                            <Label>对话信息</Label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <p className="font-medium">{item.conversation.title}</p>
                              <p className="text-sm text-gray-600">ID: {item.conversation.id}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {item.reportReason && (
                        <div>
                          <Label>举报原因</Label>
                          <div className="mt-2 p-3 bg-red-50 rounded-md">
                            <p className="text-red-800">{item.reportReason}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="reason">审核备注</Label>
                        <Textarea
                          id="reason"
                          value={moderationReason}
                          onChange={(e) => setModerationReason(e.target.value)}
                          placeholder="请输入审核备注（可选）"
                          className="mt-2"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleModerationAction('approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          批准
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleModerationAction('reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          拒绝
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleModerationAction('delete')}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{truncateContent(item.content)}</p>
                </div>
                
                {item.reportReason && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      举报原因: {item.reportReason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
          >
            上一页
          </Button>
          <span className="flex items-center px-4">
            第 {pagination.page} 页，共 {pagination.pages} 页
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
          >
            下一页
          </Button>
        </div>
      )}

      {items.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            暂无需要审核的内容
          </CardContent>
        </Card>
      )}
    </div>
  )
}