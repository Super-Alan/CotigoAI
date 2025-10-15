'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'

interface UserStatsData {
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  firstConversationDate: string | null
  lastConversationDate: string | null
  mostActiveDay: string
  avgSessionDuration: number
  conversationsByMonth: Array<{
    month: string
    count: number
  }>
  messagesByHour: Array<{
    hour: number
    count: number
  }>
}

interface UserStatsProps {
  userId: string
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return `${hours}小时${remainingMinutes}分钟`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getDayName = (dayIndex: string) => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[parseInt(dayIndex)] || '未知'
}

export function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [userId])

  const fetchUserStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        无法加载用户统计数据
      </div>
    )
  }

  const statCards = [
    {
      title: '总对话数',
      value: stats.totalConversations,
      icon: MessageSquare,
      description: '用户创建的对话总数',
      color: 'text-blue-600'
    },
    {
      title: '总消息数',
      value: stats.totalMessages,
      icon: MessageSquare,
      description: '发送和接收的消息总数',
      color: 'text-green-600'
    },
    {
      title: '平均消息数',
      value: stats.avgMessagesPerConversation,
      icon: BarChart3,
      description: '每个对话的平均消息数',
      color: 'text-purple-600'
    },
    {
      title: '平均会话时长',
      value: formatDuration(stats.avgSessionDuration),
      icon: Clock,
      description: '每次会话的平均持续时间',
      color: 'text-orange-600',
      isString: true
    },
    {
      title: '最活跃日',
      value: getDayName(stats.mostActiveDay),
      icon: Activity,
      description: '用户最常使用的星期',
      color: 'text-red-600',
      isString: true
    },
    {
      title: '使用天数',
      value: stats.firstConversationDate && stats.lastConversationDate 
        ? Math.ceil((new Date(stats.lastConversationDate).getTime() - new Date(stats.firstConversationDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      icon: Calendar,
      description: '从首次使用到最后使用的天数',
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.isString ? stat.value : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Usage Timeline */}
      {stats.firstConversationDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">使用时间线</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium">首次使用</span>
                </div>
                <span className="text-gray-600">
                  {formatDate(stats.firstConversationDate)}
                </span>
              </div>
              
              {stats.lastConversationDate && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">最后使用</span>
                  </div>
                  <span className="text-gray-600">
                    {formatDate(stats.lastConversationDate)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Activity */}
      {stats.conversationsByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">月度活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.conversationsByMonth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (item.count / Math.max(...stats.conversationsByMonth.map(m => m.count))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly Activity */}
      {stats.messagesByHour.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">活动时段分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {stats.messagesByHour.map((item, index) => {
                const maxCount = Math.max(...stats.messagesByHour.map(h => h.count))
                const intensity = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                
                return (
                  <div key={index} className="text-center">
                    <div 
                      className="w-full h-8 bg-blue-100 rounded mb-1 flex items-end justify-center"
                      title={`${item.hour}:00 - ${item.count} 条消息`}
                    >
                      <div 
                        className="w-full bg-blue-600 rounded"
                        style={{ height: `${Math.max(4, intensity)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{item.hour}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              24小时活动分布（消息数量）
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}