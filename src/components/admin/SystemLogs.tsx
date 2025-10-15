'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  TableRow 
} from '@/components/ui/table'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'

interface SystemLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: string
  action: string
  userId?: string
  userEmail?: string
  details: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

interface LogsResponse {
  logs: SystemLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    category: 'all',
    timeRange: '24h'
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/admin/logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      
      const data: LogsResponse = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('获取系统日志失败')
    } finally {
      setLoading(false)
    }
  }

  const refreshLogs = async () => {
    setRefreshing(true)
    await fetchLogs()
    setRefreshing(false)
    toast.success('日志已刷新')
  }

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const response = await fetch(`/api/admin/logs/export?${params}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('日志导出成功')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败')
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getLevelBadge = (level: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      error: 'destructive',
      success: 'default'
    } as const

    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800'
    }

    return (
      <Badge variant={variants[level as keyof typeof variants]} className={colors[level as keyof typeof colors]}>
        {level.toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: zhCN 
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">系统日志</h2>
          <p className="text-gray-600">查看和管理系统操作日志</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLogs} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline" onClick={() => exportLogs('csv')}>
            <Download className="h-4 w-4 mr-2" />
            导出CSV
          </Button>
          <Button variant="outline" onClick={() => exportLogs('json')}>
            <Download className="h-4 w-4 mr-2" />
            导出JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索日志内容..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="日志级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value="info">信息</SelectItem>
                <SelectItem value="warning">警告</SelectItem>
                <SelectItem value="error">错误</SelectItem>
                <SelectItem value="success">成功</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="日志分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="auth">认证</SelectItem>
                <SelectItem value="user">用户管理</SelectItem>
                <SelectItem value="conversation">对话管理</SelectItem>
                <SelectItem value="system">系统操作</SelectItem>
                <SelectItem value="api">API调用</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">最近1小时</SelectItem>
                <SelectItem value="24h">最近24小时</SelectItem>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="30d">最近30天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>系统日志</span>
            <span className="text-sm font-normal text-gray-500">
              共 {pagination.total} 条记录
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">没有找到符合条件的日志</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">级别</TableHead>
                    <TableHead className="w-32">时间</TableHead>
                    <TableHead className="w-24">分类</TableHead>
                    <TableHead className="w-32">操作</TableHead>
                    <TableHead className="w-40">用户</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.action}</span>
                      </TableCell>
                      <TableCell>
                        {log.userEmail ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{log.userEmail}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">系统</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm truncate" title={log.details}>
                            {log.details}
                          </p>
                          {log.ipAddress && (
                            <p className="text-xs text-gray-500 mt-1">
                              IP: {log.ipAddress}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm">
                    第 {pagination.page} 页，共 {pagination.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}