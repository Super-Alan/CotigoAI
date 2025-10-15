'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Settings, Plus, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react'

interface SystemSetting {
  id: string
  key: string
  value: string
  category: string
  isSecret: boolean
  createdAt: string
  updatedAt: string
}

interface GroupedSettings {
  [category: string]: SystemSetting[]
}

export function SystemSettings() {
  const [settings, setSettings] = useState<GroupedSettings>({})
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // 表单状态
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: '',
    isSecret: false
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data.settings)
      setCategories(data.categories)
      
      if (data.categories.length > 0 && !activeCategory) {
        setActiveCategory(data.categories[0])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('获取系统设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSetting 
        ? `/api/admin/settings/${editingSetting.key}`
        : '/api/admin/settings'
      
      const method = editingSetting ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save setting')

      toast.success(editingSetting ? '设置更新成功' : '设置创建成功')
      setIsDialogOpen(false)
      resetForm()
      fetchSettings()
    } catch (error) {
      console.error('Error saving setting:', error)
      toast.error('保存设置失败')
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('确定要删除这个设置吗？')) return

    try {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete setting')

      toast.success('设置删除成功')
      fetchSettings()
    } catch (error) {
      console.error('Error deleting setting:', error)
      toast.error('删除设置失败')
    }
  }

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting)
    setFormData({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      isSecret: setting.isSecret
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      category: activeCategory || '',
      isSecret: false
    })
    setEditingSetting(null)
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'ai': 'AI 设置',
      'platform': '平台配置',
      'security': '安全设置',
      'notification': '通知设置',
      'analytics': '分析设置',
      'content': '内容设置'
    }
    return categoryNames[category] || category
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">系统设置</h2>
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
          <Settings className="h-6 w-6" />
          系统设置
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              添加设置
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? '编辑设置' : '添加设置'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">设置键</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="例如: openai_api_key"
                  disabled={!!editingSetting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">分类</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="例如: ai, platform, security"
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">设置值</Label>
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="输入设置值"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSecret"
                  checked={formData.isSecret}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSecret: checked })}
                />
                <Label htmlFor="isSecret">敏感信息（隐藏显示）</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length > 0 ? (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {getCategoryDisplayName(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {settings[category]?.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{setting.key}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{setting.category}</Badge>
                          {setting.isSecret && (
                            <Badge variant="destructive">敏感</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {setting.isSecret && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(setting.key)}
                          >
                            {showSecrets[setting.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setting.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <code className="text-sm">
                          {setting.isSecret && !showSecrets[setting.key] 
                            ? '***' 
                            : setting.value
                          }
                        </code>
                      </div>
                      <div className="text-xs text-gray-500">
                        更新时间: {new Date(setting.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!settings[category] || settings[category].length === 0) && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    该分类下暂无设置项
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            暂无系统设置，点击"添加设置"开始配置
          </CardContent>
        </Card>
      )}
    </div>
  )
}