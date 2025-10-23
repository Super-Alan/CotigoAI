'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import { ContentBlocksEditor, MarkdownEditor } from './content-editors'

interface LearningContentData {
  id?: string
  thinkingTypeId: string
  level: number
  contentType: 'concepts' | 'frameworks' | 'examples' | 'practice_guide'
  title: string
  description: string
  content: any
  estimatedTime: number
  orderIndex: number
  tags: string[]
  prerequisites: string[]
}

interface LearningContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content?: LearningContentData
  thinkingTypes: Array<{ id: string; name: string; icon: string }>
  onSave: (data: LearningContentData) => Promise<void>
}

export function LearningContentDialog({
  open,
  onOpenChange,
  content,
  thinkingTypes,
  onSave
}: LearningContentDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<LearningContentData>(
    content || {
      thinkingTypeId: '',
      level: 1,
      contentType: 'concepts',
      title: '',
      description: '',
      content: { blocks: [] },
      estimatedTime: 10,
      orderIndex: 1,
      tags: [],
      prerequisites: []
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

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      concepts: '📚 概念知识',
      frameworks: '🔧 思维框架',
      examples: '💡 案例示例',
      practice_guide: '📝 练习指南'
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {content?.id ? '编辑学习内容' : '创建学习内容'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="content">内容编辑</TabsTrigger>
              <TabsTrigger value="metadata">元数据</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label>思维类型 *</Label>
                <Select
                  value={formData.thinkingTypeId}
                  onValueChange={(value) => setFormData({ ...formData, thinkingTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择思维类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {thinkingTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>认知级别 (Level) *</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>内容类型 *</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concepts">{getContentTypeLabel('concepts')}</SelectItem>
                      <SelectItem value="frameworks">{getContentTypeLabel('frameworks')}</SelectItem>
                      <SelectItem value="examples">{getContentTypeLabel('examples')}</SelectItem>
                      <SelectItem value="practice_guide">{getContentTypeLabel('practice_guide')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>标题 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：因果分析的基本概念"
                />
              </div>

              <MarkdownEditor
                label="描述 *"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="详细描述这个学习内容的目标和要点..."
                height={200}
                required
              />
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-4">
              <ContentBlocksEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                label="内容主体"
                required
              />
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>预计学习时间（分钟）</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 10 })}
                  />
                </div>

                <div>
                  <Label>排序索引</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    数字越小越靠前
                  </p>
                </div>
              </div>

              <div>
                <Label>标签（逗号分隔）</Label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="例如：基础概念, 初学者, 必修"
                />
              </div>

              <div>
                <Label>前置内容ID（逗号分隔）</Label>
                <Input
                  value={formData.prerequisites.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    prerequisites: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="例如：clm123abc, clm456def"
                />
                <p className="text-xs text-gray-500 mt-1">
                  学习此内容前需要先完成的其他内容ID
                </p>
              </div>
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
