'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import { MarkdownEditor, ThinkingFrameworkEditor, GuidingQuestionsEditor } from './content-editors'

interface TopicData {
  id?: string
  topic: string
  category: string
  context: string
  referenceUniversity: string
  dimension: string
  difficulty: string
  tags: string[]
  thinkingFramework: any
  guidingQuestions: any[]
  expectedOutcomes: string[]
  isPublic: boolean
}

interface TopicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: TopicData
  onSave: (data: TopicData) => Promise<void>
}

const CATEGORIES = ['policy', 'technology', 'social', 'ethics', 'science', 'philosophy']
const DIMENSIONS = ['causal_analysis', 'premise_challenge', 'fallacy_detection', 'iterative_reflection', 'connection_transfer']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export function TopicDialog({
  open,
  onOpenChange,
  topic,
  onSave
}: TopicDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<TopicData>(
    topic || {
      topic: '',
      category: 'policy',
      context: '',
      referenceUniversity: '',
      dimension: 'causal_analysis',
      difficulty: 'beginner',
      tags: [],
      thinkingFramework: {},
      guidingQuestions: [],
      expectedOutcomes: [],
      isPublic: false
    }
  )

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      'causal_analysis': '因果分析',
      'premise_challenge': '前提质疑',
      'fallacy_detection': '谬误检测',
      'iterative_reflection': '迭代反思',
      'connection_transfer': '知识迁移'
    }
    return labels[dimension] || dimension
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {topic?.id ? '编辑话题' : '创建话题'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="content">内容编辑</TabsTrigger>
              <TabsTrigger value="framework">思维框架</TabsTrigger>
              <TabsTrigger value="guidance">引导问题</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label>话题标题 *</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="输入话题标题..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>分类 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>难度 *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map(diff => (
                        <SelectItem key={diff} value={diff}>
                          {diff === 'beginner' ? '初级' : diff === 'intermediate' ? '中级' : '高级'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>思维维度 *</Label>
                <Select
                  value={formData.dimension}
                  onValueChange={(value) => setFormData({ ...formData, dimension: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSIONS.map(dim => (
                      <SelectItem key={dim} value={dim}>
                        {getDimensionLabel(dim)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>参考大学</Label>
                <Input
                  value={formData.referenceUniversity}
                  onChange={(e) => setFormData({ ...formData, referenceUniversity: e.target.value })}
                  placeholder="例如：香港大学"
                />
              </div>

              <div>
                <Label>标签（逗号分隔）</Label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="例如：社会问题, 伦理, 政策"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  公开话题（其他用户可见）
                </Label>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <MarkdownEditor
                label="话题背景 (Context) *"
                value={formData.context}
                onChange={(value) => setFormData({ ...formData, context: value })}
                placeholder="描述话题的背景情况..."
                height={300}
                required
              />

              <div>
                <Label>期望成果（每行一个）</Label>
                <Input
                  value={(formData.expectedOutcomes || []).join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedOutcomes: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="学习此话题后的期望成果..."
                />
              </div>
            </TabsContent>

            {/* Framework Tab */}
            <TabsContent value="framework" className="mt-4">
              <ThinkingFrameworkEditor
                value={formData.thinkingFramework}
                onChange={(value) => setFormData({ ...formData, thinkingFramework: value })}
                label="思维框架"
              />
            </TabsContent>

            {/* Guidance Tab */}
            <TabsContent value="guidance" className="mt-4">
              <GuidingQuestionsEditor
                value={formData.guidingQuestions}
                onChange={(value) => setFormData({ ...formData, guidingQuestions: value })}
                label="引导问题"
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
