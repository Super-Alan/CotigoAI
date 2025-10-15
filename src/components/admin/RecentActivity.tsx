'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  UserPlus, 
  AlertTriangle, 
  Settings,
  Clock
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Activity {
  id: string
  type: 'conversation' | 'user_registration' | 'system_alert' | 'admin_action'
  title: string
  description: string
  user?: {
    name: string
    email: string
    image?: string
  }
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'conversation':
      return MessageSquare
    case 'user_registration':
      return UserPlus
    case 'system_alert':
      return AlertTriangle
    case 'admin_action':
      return Settings
    default:
      return Clock
  }
}

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'conversation':
      return 'bg-blue-100 text-blue-600'
    case 'user_registration':
      return 'bg-green-100 text-green-600'
    case 'system_alert':
      return 'bg-red-100 text-red-600'
    case 'admin_action':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getSeverityBadge = (severity?: Activity['severity']) => {
  if (!severity) return null
  
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  
  return (
    <Badge variant="secondary" className={colors[severity]}>
      {severity === 'low' ? '低' : severity === 'medium' ? '中' : '高'}
    </Badge>
  )
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
  return `${Math.floor(diffInMinutes / 1440)}天前`
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/activities')
        if (response.ok) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无最近活动
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      {getSeverityBadge(activity.severity)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.user.image} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}