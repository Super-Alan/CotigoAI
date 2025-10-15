'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bell, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Settings
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    totalConversations: number
    totalMessages: number
    systemHealth: number
    responseTime: number
  }
  trends: Array<{
    time: string
    users: number
    conversations: number
    messages: number
  }>
  alerts: Array<{
    id: string
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    timestamp: string
    read: boolean
  }>
  systemMetrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
  }
  recentActivity: Array<{
    id: string
    action: string
    user: string
    timestamp: string
    type: 'user' | 'system' | 'admin'
  }>
}

export function EnhancedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [unreadAlerts, setUnreadAlerts] = useState(0)

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true)
      
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      const dashboardData = await response.json()
      setData(dashboardData)
      
      // Count unread alerts
      const unread = dashboardData.alerts.filter((alert: any) => !alert.read).length
      setUnreadAlerts(unread)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('获取仪表板数据失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAlertAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/admin/alerts/${alertId}/read`, { method: 'POST' })
      
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          alerts: prev.alerts.map(alert => 
            alert.id === alertId ? { ...alert, read: true } : alert
          )
        }
      })
      
      setUnreadAlerts(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600'
    if (health >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500'
    if (usage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">仪表板</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">实时仪表板</h2>
          <p className="text-gray-600">系统概览和实时监控</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
            {autoRefresh ? '自动刷新' : '手动刷新'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          {unreadAlerts > 0 && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              通知
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadAlerts}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold">{data.stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  实时更新
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold">{data.stats.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  在线率: {((data.stats.activeUsers / data.stats.totalUsers) * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总对话数</p>
                <p className="text-2xl font-bold">{data.stats.totalConversations.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  消息: {data.stats.totalMessages.toLocaleString()}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">系统健康度</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.stats.systemHealth)}`}>
                  {data.stats.systemHealth}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  响应时间: {data.stats.responseTime}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>实时趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="用户"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="对话"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>系统指标</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU使用率</span>
                <span>{data.systemMetrics.cpuUsage}%</span>
              </div>
              <Progress 
                value={data.systemMetrics.cpuUsage} 
                className={`h-2 ${getUsageColor(data.systemMetrics.cpuUsage)}`}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>内存使用率</span>
                <span>{data.systemMetrics.memoryUsage}%</span>
              </div>
              <Progress 
                value={data.systemMetrics.memoryUsage} 
                className={`h-2 ${getUsageColor(data.systemMetrics.memoryUsage)}`}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>磁盘使用率</span>
                <span>{data.systemMetrics.diskUsage}%</span>
              </div>
              <Progress 
                value={data.systemMetrics.diskUsage} 
                className={`h-2 ${getUsageColor(data.systemMetrics.diskUsage)}`}
              />
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>网络延迟</span>
                <span className="font-medium">{data.systemMetrics.networkLatency}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>系统警报</span>
              {unreadAlerts > 0 && (
                <Badge variant="destructive">{unreadAlerts} 未读</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无警报</p>
              ) : (
                data.alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      alert.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                    }`}
                    onClick={() => !alert.read && markAlertAsRead(alert.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs ${alert.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: zhCN })}
                        </p>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'admin' ? 'bg-red-500' :
                    activity.type === 'system' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: zhCN })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}