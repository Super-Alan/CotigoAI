'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Bot, 
  Clock, 
  Mail, 
  Database, 
  FileText, 
  Users, 
  MessageSquare,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface AutomationRule {
  id: string
  name: string
  description: string
  type: 'scheduled' | 'triggered' | 'conditional'
  status: 'active' | 'inactive' | 'error'
  trigger: {
    type: string
    condition: string
    value: any
  }
  actions: Array<{
    type: string
    config: any
  }>
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    days?: string[]
  }
  lastRun?: string
  nextRun?: string
  runCount: number
  successRate: number
}

interface AutomationTask {
  id: string
  ruleId: string
  ruleName: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  startTime: string
  endTime?: string
  duration?: number
  result?: string
  error?: string
}

export function AutomationTools() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [tasks, setTasks] = useState<AutomationTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)

  useEffect(() => {
    fetchAutomationData()
  }, [])

  const fetchAutomationData = async () => {
    try {
      const [rulesResponse, tasksResponse] = await Promise.all([
        fetch('/api/admin/automation/rules'),
        fetch('/api/admin/automation/tasks')
      ])

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json()
        setRules(rulesData.rules)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
      }
    } catch (error) {
      console.error('Error fetching automation data:', error)
      toast.error('获取自动化数据失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (ruleId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })

      if (response.ok) {
        setRules(prev => prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, status: active ? 'active' : 'inactive' }
            : rule
        ))
        toast.success(active ? '规则已启用' : '规则已禁用')
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
      toast.error('操作失败')
    }
  }

  const runRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}/run`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('规则执行已启动')
        fetchAutomationData() // Refresh data
      }
    } catch (error) {
      console.error('Error running rule:', error)
      toast.error('执行失败')
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('确定要删除这个自动化规则吗？')) return

    try {
      const response = await fetch(`/api/admin/automation/rules/${ruleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRules(prev => prev.filter(rule => rule.id !== ruleId))
        toast.success('规则已删除')
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast.error('删除失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600'
      case 'inactive':
      case 'pending':
        return 'text-gray-600'
      case 'error':
      case 'failed':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      case 'inactive':
      case 'pending':
        return <Badge variant="secondary">{status}</Badge>
      case 'error':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'scheduled':
        return <Clock className="h-5 w-5" />
      case 'triggered':
        return <Zap className="h-5 w-5" />
      case 'conditional':
        return <Activity className="h-5 w-5" />
      default:
        return <Bot className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">自动化工具</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <h2 className="text-2xl font-bold">自动化工具</h2>
          <p className="text-gray-600">管理自动化规则和任务执行</p>
        </div>
        <Button onClick={() => setShowCreateRule(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建规则
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总规则数</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃规则</p>
                <p className="text-2xl font-bold">
                  {rules.filter(rule => rule.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日执行</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(task => 
                    new Date(task.startTime).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">成功率</p>
                <p className="text-2xl font-bold">
                  {rules.length > 0 
                    ? Math.round(rules.reduce((acc, rule) => acc + rule.successRate, 0) / rules.length)
                    : 0}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">自动化规则</TabsTrigger>
          <TabsTrigger value="tasks">执行历史</TabsTrigger>
          <TabsTrigger value="templates">规则模板</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getRuleIcon(rule.type)}
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(rule.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">类型</p>
                      <p className="font-medium capitalize">{rule.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">执行次数</p>
                      <p className="font-medium">{rule.runCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">成功率</p>
                      <p className="font-medium">{rule.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">下次执行</p>
                      <p className="font-medium text-xs">
                        {rule.nextRun 
                          ? formatDistanceToNow(new Date(rule.nextRun), { addSuffix: true, locale: zhCN })
                          : '手动触发'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.status === 'active'}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                      <span className="text-sm">启用</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => runRule(rule.id)}
                        disabled={rule.status !== 'active'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>执行历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无执行记录</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'failed' ? 'bg-red-500' :
                          task.status === 'running' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{task.ruleName}</p>
                          <p className="text-sm text-gray-600">
                            开始时间: {new Date(task.startTime).toLocaleString('zh-CN')}
                          </p>
                          {task.duration && (
                            <p className="text-xs text-gray-500">
                              耗时: {task.duration}ms
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(task.status)}
                        {task.error && (
                          <p className="text-xs text-red-600 mt-1">{task.error}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template cards */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">用户欢迎邮件</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  新用户注册后自动发送欢迎邮件
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">数据库备份</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  定时备份数据库并上传到云存储
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">报告生成</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  定期生成系统使用报告并发送给管理员
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">用户清理</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  清理长期未活跃的用户账户
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">内容审核</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  自动检测和标记不当内容
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">性能监控</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  监控系统性能并在异常时发送警报
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  使用模板
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}