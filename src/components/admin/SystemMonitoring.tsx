'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Zap,
  Globe
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SystemMetrics {
  server: {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    load: number[]
    processes: number
    threads: number
  }
  resources: {
    cpu: {
      usage: number
      cores: number
      temperature: number
      frequency: number
    }
    memory: {
      used: number
      total: number
      available: number
      cached: number
    }
    disk: {
      used: number
      total: number
      available: number
      iops: number
    }
    network: {
      inbound: number
      outbound: number
      latency: number
      connections: number
    }
  }
  database: {
    status: 'connected' | 'disconnected' | 'slow'
    connections: number
    maxConnections: number
    queryTime: number
    slowQueries: number
  }
  services: Array<{
    name: string
    status: 'running' | 'stopped' | 'error'
    port: number
    memory: number
    cpu: number
    uptime: number
  }>
  performance: Array<{
    timestamp: string
    cpu: number
    memory: number
    disk: number
    network: number
  }>
  alerts: Array<{
    id: string
    level: 'info' | 'warning' | 'error' | 'critical'
    service: string
    message: string
    timestamp: string
    resolved: boolean
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMetrics()
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 10000) // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchMetrics = async () => {
    try {
      if (!loading) setRefreshing(true)
      
      const response = await fetch('/api/admin/monitoring')
      if (!response.ok) throw new Error('Failed to fetch monitoring data')
      
      const data = await response.json()
      setMetrics(data)
      
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
      toast.error('获取监控数据失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'connected':
        return 'text-green-600'
      case 'warning':
      case 'slow':
        return 'text-yellow-600'
      case 'critical':
      case 'error':
      case 'stopped':
      case 'disconnected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      case 'warning':
      case 'slow':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
      case 'critical':
      case 'error':
      case 'stopped':
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${minutes}分钟`
    return `${minutes}分钟`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">系统监控</h2>
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
          <h2 className="text-2xl font-bold">系统监控</h2>
          <p className="text-gray-600">实时系统性能和服务状态监控</p>
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
            onClick={fetchMetrics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">服务器状态</p>
                <div className="flex items-center mt-2">
                  {getStatusBadge(metrics.server.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  运行时间: {formatUptime(metrics.server.uptime)}
                </p>
              </div>
              <Server className={`h-8 w-8 ${getStatusColor(metrics.server.status)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU使用率</p>
                <p className="text-2xl font-bold">{metrics.resources.cpu.usage}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.resources.cpu.cores} 核心 @ {metrics.resources.cpu.frequency}GHz
                </p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">内存使用</p>
                <p className="text-2xl font-bold">
                  {((metrics.resources.memory.used / metrics.resources.memory.total) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBytes(metrics.resources.memory.used)} / {formatBytes(metrics.resources.memory.total)}
                </p>
              </div>
              <MemoryStick className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">数据库</p>
                <div className="flex items-center mt-2">
                  {getStatusBadge(metrics.database.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  连接: {metrics.database.connections}/{metrics.database.maxConnections}
                </p>
              </div>
              <Database className={`h-8 w-8 ${getStatusColor(metrics.database.status)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">资源监控</TabsTrigger>
          <TabsTrigger value="services">服务状态</TabsTrigger>
          <TabsTrigger value="performance">性能趋势</TabsTrigger>
          <TabsTrigger value="alerts">告警信息</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory */}
            <Card>
              <CardHeader>
                <CardTitle>CPU & 内存</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU使用率</span>
                    <span>{metrics.resources.cpu.usage}%</span>
                  </div>
                  <Progress value={metrics.resources.cpu.usage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    温度: {metrics.resources.cpu.temperature}°C
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>内存使用率</span>
                    <span>{((metrics.resources.memory.used / metrics.resources.memory.total) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(metrics.resources.memory.used / metrics.resources.memory.total) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    可用: {formatBytes(metrics.resources.memory.available)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disk & Network */}
            <Card>
              <CardHeader>
                <CardTitle>磁盘 & 网络</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>磁盘使用率</span>
                    <span>{((metrics.resources.disk.used / metrics.resources.disk.total) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(metrics.resources.disk.used / metrics.resources.disk.total) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    IOPS: {metrics.resources.disk.iops}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-600">网络入站</p>
                    <p className="text-sm font-medium">{formatBytes(metrics.resources.network.inbound)}/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">网络出站</p>
                    <p className="text-sm font-medium">{formatBytes(metrics.resources.network.outbound)}/s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.services.map((service, index) => (
              <Card key={service.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {getStatusBadge(service.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">端口</p>
                      <p className="font-medium">{service.port}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">运行时间</p>
                      <p className="font-medium">{formatUptime(service.uptime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">内存使用</p>
                      <p className="font-medium">{formatBytes(service.memory)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">CPU使用</p>
                      <p className="font-medium">{service.cpu}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>性能趋势 (最近24小时)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metrics.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#8884d8" 
                    name="CPU (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#82ca9d" 
                    name="内存 (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    stroke="#ffc658" 
                    name="磁盘 (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="network" 
                    stroke="#ff7300" 
                    name="网络 (%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>系统告警</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无告警信息</p>
                ) : (
                  metrics.alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.resolved ? 'bg-gray-50 border-gray-200' : 
                        alert.level === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.level === 'error' ? 'bg-red-50 border-red-200' :
                        alert.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {alert.level === 'critical' || alert.level === 'error' ? (
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          ) : alert.level === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          ) : alert.resolved ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{alert.service}</p>
                              <Badge 
                                variant={
                                  alert.level === 'critical' ? 'destructive' :
                                  alert.level === 'error' ? 'destructive' :
                                  alert.level === 'warning' ? 'secondary' :
                                  'default'
                                }
                              >
                                {alert.level}
                              </Badge>
                              {alert.resolved && (
                                <Badge className="bg-green-100 text-green-800">已解决</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}