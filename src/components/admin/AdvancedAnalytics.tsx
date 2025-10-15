'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Download,
  Calendar,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalConversations: number
    totalMessages: number
    avgSessionDuration: number
    userGrowthRate: number
    engagementRate: number
    retentionRate: number
  }
  userGrowth: Array<{
    date: string
    newUsers: number
    totalUsers: number
  }>
  conversationTrends: Array<{
    date: string
    conversations: number
    messages: number
  }>
  userActivity: Array<{
    hour: number
    activeUsers: number
  }>
  topicDistribution: Array<{
    topic: string
    count: number
    percentage: number
  }>
  userSegments: Array<{
    segment: string
    count: number
    percentage: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('获取分析数据失败')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/analytics/export?format=${format}&timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${timeRange}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('报告导出成功')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败')
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">高级数据分析</h2>
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
        <h2 className="text-2xl font-bold">高级数据分析</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
              <SelectItem value="1y">最近一年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            导出Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            导出PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data.overview.userGrowthRate.toFixed(1)}%
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
                <p className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  参与率: {data.overview.engagementRate.toFixed(1)}%
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
                <p className="text-2xl font-bold">{data.overview.totalConversations.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  消息数: {data.overview.totalMessages.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">平均会话时长</p>
                <p className="text-2xl font-bold">{Math.round(data.overview.avgSessionDuration)}分钟</p>
                <p className="text-xs text-gray-500 mt-1">
                  留存率: {data.overview.retentionRate.toFixed(1)}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
          <TabsTrigger value="conversations">对话分析</TabsTrigger>
          <TabsTrigger value="behavior">行为分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>用户增长趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="newUsers" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="新用户"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalUsers" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="总用户"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>对话趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.conversationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="conversations" 
                      stroke="#8884d8" 
                      name="对话数"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#82ca9d" 
                      name="消息数"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>用户活跃时段</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activeUsers" fill="#8884d8" name="活跃用户数" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>用户分群</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.userSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) => `${segment} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.userSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>话题分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topicDistribution.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{topic.topic}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{topic.count}</Badge>
                      <span className="text-sm text-gray-500">{topic.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  转化指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>注册转化率</span>
                    <span className="font-bold">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>首次对话率</span>
                    <span className="font-bold">78.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>7日留存率</span>
                    <span className="font-bold">{data.overview.retentionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  参与度指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>日活跃率</span>
                    <span className="font-bold">{data.overview.engagementRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均会话长度</span>
                    <span className="font-bold">{Math.round(data.overview.avgSessionDuration)}分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span>回访率</span>
                    <span className="font-bold">65.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  时间指标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>峰值时段</span>
                    <span className="font-bold">14:00-16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均响应时间</span>
                    <span className="font-bold">2.3秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span>会话完成率</span>
                    <span className="font-bold">89.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}