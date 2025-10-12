'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Target,
  Clock,
  Brain,
  Bell,
  Palette,
  Volume2,
  Shield,
  ArrowLeft,
  Save,
  RotateCcw,
  Zap,
  BookOpen,
  Trophy,
  Calendar,
  User,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSettings {
  // 练习偏好
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'adaptive'
  practiceTypes: {
    fallacies: boolean
    arguments: boolean
    methodology: boolean
    topics: boolean
    mixed: boolean
  }
  questionsPerSession: number
  timeLimit: number // 分钟，0表示无限制
  
  // 学习目标
  dailyGoal: number // 每日目标练习次数
  weeklyGoal: number // 每周目标练习次数
  focusAreas: string[] // 重点关注的学习领域
  
  // 通知设置
  notifications: {
    dailyReminder: boolean
    reminderTime: string // HH:MM格式
    streakReminder: boolean
    achievementNotification: boolean
  }
  
  // 界面设置
  theme: 'light' | 'dark' | 'auto'
  soundEffects: boolean
  animations: boolean
  compactMode: boolean
  
  // 隐私设置
  shareProgress: boolean
  anonymousMode: boolean
  dataCollection: boolean
}

const difficultyLabels = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  adaptive: '自适应'
}

const difficultyDescriptions = {
  beginner: '基础概念，简单题目',
  intermediate: '中等难度，综合应用',
  advanced: '复杂场景，深度分析',
  adaptive: '根据表现自动调整'
}

const practiceTypeLabels = {
  fallacies: '逻辑谬误',
  arguments: '论证分析',
  methodology: '方法论',
  topics: '话题讨论',
  mixed: '综合练习'
}

const focusAreaOptions = [
  { id: 'critical-thinking', label: '批判性思维', icon: Brain },
  { id: 'logical-reasoning', label: '逻辑推理', icon: Target },
  { id: 'argument-structure', label: '论证结构', icon: BookOpen },
  { id: 'fallacy-detection', label: '谬误识别', icon: Shield },
  { id: 'debate-skills', label: '辩论技巧', icon: Trophy },
  { id: 'research-methods', label: '研究方法', icon: Lightbulb }
]

export default function DailyPracticeSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [settings, setSettings] = useState<UserSettings>({
    preferredDifficulty: 'adaptive',
    practiceTypes: {
      fallacies: true,
      arguments: true,
      methodology: true,
      topics: true,
      mixed: true
    },
    questionsPerSession: 5,
    timeLimit: 0,
    dailyGoal: 1,
    weeklyGoal: 5,
    focusAreas: ['critical-thinking', 'logical-reasoning'],
    notifications: {
      dailyReminder: true,
      reminderTime: '09:00',
      streakReminder: true,
      achievementNotification: true
    },
    theme: 'auto',
    soundEffects: true,
    animations: true,
    compactMode: false,
    shareProgress: false,
    anonymousMode: false,
    dataCollection: true
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadSettings()
  }, [session, status, router])

  const loadSettings = async () => {
    try {
      // 这里应该从API加载用户设置
      // 暂时使用默认设置
      setLoading(false)
    } catch (error) {
      console.error('加载设置失败:', error)
      toast.error('加载设置失败')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // 这里应该调用API保存设置
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      
      toast.success('设置已保存')
      setHasChanges(false)
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings({
      preferredDifficulty: 'adaptive',
      practiceTypes: {
        fallacies: true,
        arguments: true,
        methodology: true,
        topics: true,
        mixed: true
      },
      questionsPerSession: 5,
      timeLimit: 0,
      dailyGoal: 1,
      weeklyGoal: 5,
      focusAreas: ['critical-thinking', 'logical-reasoning'],
      notifications: {
        dailyReminder: true,
        reminderTime: '09:00',
        streakReminder: true,
        achievementNotification: true
      },
      theme: 'auto',
      soundEffects: true,
      animations: true,
      compactMode: false,
      shareProgress: false,
      anonymousMode: false,
      dataCollection: true
    })
    setHasChanges(true)
    toast.success('设置已重置为默认值')
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const updatePracticeTypes = (type: keyof UserSettings['practiceTypes'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      practiceTypes: {
        ...prev.practiceTypes,
        [type]: enabled
      }
    }))
    setHasChanges(true)
  }

  const updateNotifications = (updates: Partial<UserSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...updates
      }
    }))
    setHasChanges(true)
  }

  const toggleFocusArea = (areaId: string) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(areaId)
        ? prev.focusAreas.filter(id => id !== areaId)
        : [...prev.focusAreas, areaId]
    }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载设置...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/learn/daily')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                练习设置
              </h1>
            </div>
            <p className="text-gray-600">
              个性化您的学习体验，让练习更高效
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges || saving}
              className="min-w-[100px]"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? '保存中...' : '保存设置'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 练习偏好 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>练习偏好</span>
              </CardTitle>
              <CardDescription>
                调整练习难度和内容类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 难度设置 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">练习难度</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(difficultyLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateSettings({ preferredDifficulty: key as any })}
                      className={`p-3 rounded-lg border text-left transition ${
                        settings.preferredDifficulty === key
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {difficultyDescriptions[key as keyof typeof difficultyDescriptions]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 练习类型 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">练习类型</Label>
                <div className="space-y-3">
                  {Object.entries(practiceTypeLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <Switch
                        checked={settings.practiceTypes[key as keyof typeof settings.practiceTypes]}
                        onCheckedChange={(checked) => updatePracticeTypes(key as any, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 题目数量 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  每次练习题目数量: {settings.questionsPerSession}
                </Label>
                <Slider
                  value={[settings.questionsPerSession]}
                  onValueChange={([value]) => updateSettings({ questionsPerSession: value })}
                  min={3}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3题</span>
                  <span>10题</span>
                </div>
              </div>

              {/* 时间限制 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  时间限制: {settings.timeLimit === 0 ? '无限制' : `${settings.timeLimit}分钟`}
                </Label>
                <Slider
                  value={[settings.timeLimit]}
                  onValueChange={([value]) => updateSettings({ timeLimit: value })}
                  min={0}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>无限制</span>
                  <span>30分钟</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 学习目标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span>学习目标</span>
              </CardTitle>
              <CardDescription>
                设定您的学习目标和重点领域
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 每日目标 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  每日练习目标: {settings.dailyGoal}次
                </Label>
                <Slider
                  value={[settings.dailyGoal]}
                  onValueChange={([value]) => updateSettings({ dailyGoal: value })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1次</span>
                  <span>5次</span>
                </div>
              </div>

              {/* 每周目标 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  每周练习目标: {settings.weeklyGoal}次
                </Label>
                <Slider
                  value={[settings.weeklyGoal]}
                  onValueChange={([value]) => updateSettings({ weeklyGoal: value })}
                  min={3}
                  max={21}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3次</span>
                  <span>21次</span>
                </div>
              </div>

              {/* 重点领域 */}
              <div>
                <Label className="text-base font-semibold mb-3 block">重点关注领域</Label>
                <div className="grid grid-cols-2 gap-3">
                  {focusAreaOptions.map((area) => {
                    const IconComponent = area.icon
                    const isSelected = settings.focusAreas.includes(area.id)
                    return (
                      <button
                        key={area.id}
                        onClick={() => toggleFocusArea(area.id)}
                        className={`p-3 rounded-lg border text-left transition ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm font-medium">{area.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <span>通知设置</span>
              </CardTitle>
              <CardDescription>
                管理练习提醒和通知
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">每日练习提醒</div>
                  <div className="text-sm text-gray-600">在设定时间提醒您完成练习</div>
                </div>
                <Switch
                  checked={settings.notifications.dailyReminder}
                  onCheckedChange={(checked) => updateNotifications({ dailyReminder: checked })}
                />
              </div>

              {settings.notifications.dailyReminder && (
                <div className="ml-4 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">提醒时间</Label>
                  <input
                    type="time"
                    value={settings.notifications.reminderTime}
                    onChange={(e) => updateNotifications({ reminderTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">连击提醒</div>
                  <div className="text-sm text-gray-600">连击即将中断时提醒</div>
                </div>
                <Switch
                  checked={settings.notifications.streakReminder}
                  onCheckedChange={(checked) => updateNotifications({ streakReminder: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">成就通知</div>
                  <div className="text-sm text-gray-600">获得新成就时通知</div>
                </div>
                <Switch
                  checked={settings.notifications.achievementNotification}
                  onCheckedChange={(checked) => updateNotifications({ achievementNotification: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 界面设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span>界面设置</span>
              </CardTitle>
              <CardDescription>
                个性化界面外观和交互
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">主题</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: '浅色' },
                    { key: 'dark', label: '深色' },
                    { key: 'auto', label: '自动' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => updateSettings({ theme: key as any })}
                      className={`p-2 rounded-lg border text-sm transition ${
                        settings.theme === key
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">音效</div>
                  <div className="text-sm text-gray-600">答题时播放音效</div>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => updateSettings({ soundEffects: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">动画效果</div>
                  <div className="text-sm text-gray-600">启用界面动画</div>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => updateSettings({ animations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">紧凑模式</div>
                  <div className="text-sm text-gray-600">减少界面间距</div>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 隐私设置 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>隐私设置</span>
            </CardTitle>
            <CardDescription>
              管理您的数据和隐私偏好
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">分享进度</div>
                  <div className="text-sm text-gray-600">允许他人查看您的学习进度</div>
                </div>
                <Switch
                  checked={settings.shareProgress}
                  onCheckedChange={(checked) => updateSettings({ shareProgress: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">匿名模式</div>
                  <div className="text-sm text-gray-600">隐藏个人信息</div>
                </div>
                <Switch
                  checked={settings.anonymousMode}
                  onCheckedChange={(checked) => updateSettings({ anonymousMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">数据收集</div>
                  <div className="text-sm text-gray-600">允许收集使用数据以改进服务</div>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) => updateSettings({ dataCollection: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存提示 */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="text-sm">您有未保存的更改</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}