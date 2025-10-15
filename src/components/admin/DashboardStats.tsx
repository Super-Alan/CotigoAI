'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalConversations: number
  avgSessionTime: number
  userGrowth: number
  conversationGrowth: number
  sessionGrowth: number
  activeGrowth: number
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  loading = false 
}: {
  title: string
  value: string | number
  change: number
  icon: any
  loading?: boolean
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = change >= 0
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs 上月</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsConfig = [
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      change: stats?.userGrowth || 0,
      icon: Users
    },
    {
      title: '活跃用户',
      value: stats?.activeUsers || 0,
      change: stats?.activeGrowth || 0,
      icon: TrendingUp
    },
    {
      title: '对话总数',
      value: stats?.totalConversations || 0,
      change: stats?.conversationGrowth || 0,
      icon: MessageSquare
    },
    {
      title: '平均会话时长',
      value: stats ? `${Math.round(stats.avgSessionTime)}分钟` : '0分钟',
      change: stats?.sessionGrowth || 0,
      icon: Clock
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          loading={loading}
        />
      ))}
    </div>
  )
}