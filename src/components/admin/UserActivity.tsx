'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MessageSquare, 
  Clock, 
  Eye,
  ChevronRight,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface UserActivityData {
  recentConversations: Conversation[]
  totalConversations: number
}

interface UserActivityProps {
  userId: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}天前`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}周前`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}个月前`
}

const getActivityLevel = (messageCount: number) => {
  if (messageCount >= 50) return { label: '高活跃', color: 'bg-green-100 text-green-800' }
  if (messageCount >= 20) return { label: '中活跃', color: 'bg-yellow-100 text-yellow-800' }
  if (messageCount >= 5) return { label: '低活跃', color: 'bg-blue-100 text-blue-800' }
  return { label: '初始', color: 'bg-gray-100 text-gray-800' }
}

export function UserActivity({ userId }: UserActivityProps) {
  const [activity, setActivity] = useState<UserActivityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserActivity()
  }, [userId])

  const fetchUserActivity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setActivity({
          recentConversations: data.recentConversations || [],
          totalConversations: data.stats?.totalConversations || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="text-center py-8 text-gray-500">
        无法加载用户活动数据
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">最近活动</h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          总计 {activity.totalConversations} 个对话
        </Badge>
      </div>

      {/* Recent Conversations */}
      {activity.recentConversations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>该用户还没有任何对话记录</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activity.recentConversations.map((conversation) => {
            const activityLevel = getActivityLevel(conversation.messageCount)
            
            return (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversation.title || '未命名对话'}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={activityLevel.color}
                        >
                          {activityLevel.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>创建于 {formatDate(conversation.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>更新于 {formatRelativeTime(conversation.updatedAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{conversation.messageCount} 条消息</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/conversations/${conversation.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Link>
                      </Button>
                      
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* View All Button */}
      {activity.totalConversations > activity.recentConversations.length && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href={`/admin/conversations?userId=${userId}`}>
              查看所有对话 ({activity.totalConversations})
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}