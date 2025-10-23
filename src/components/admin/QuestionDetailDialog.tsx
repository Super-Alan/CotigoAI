'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import {
  MarkdownEditor,
  ThinkingFrameworkEditor,
  GuidingQuestionsEditor,
  CaseAnalysisEditor,
  ScaffoldingEditor
} from './content-editors'

interface QuestionData {
  id?: string
  thinkingTypeId: string
  topic: string
  context: string
  question: string
  level: number
  tags: string[]
  thinkingFramework: any
  guidingQuestions: any[]
  learningObjectives?: string[]
  scaffolding?: any
  caseAnalysis?: any
  expectedOutcomes?: string[]
  assessmentCriteria?: any
}

interface QuestionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: QuestionData
  thinkingTypes: Array<{ id: string; name: string; icon: string }>
  onSave: (data: QuestionData) => Promise<void>
}

export function QuestionDetailDialog({
  open,
  onOpenChange,
  question,
  thinkingTypes,
  onSave
}: QuestionDetailDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<QuestionData>(
    question || {
      thinkingTypeId: '',
      topic: '',
      context: '',
      question: '',
      level: 1,
      tags: [],
      thinkingFramework: {},
      guidingQuestions: [],
      learningObjectives: [],
      scaffolding: null,
      caseAnalysis: null,
      expectedOutcomes: [],
      assessmentCriteria: null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {question?.id ? '编辑题目' : '创建题目'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="content">内容编辑</TabsTrigger>
              <TabsTrigger value="framework">思维框架</TabsTrigger>
              <TabsTrigger value="guidance">引导问题</TabsTrigger>
              <TabsTrigger value="advanced">高级配置</TabsTrigger>
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
                        Level {level} - {
                          level === 1 ? '基础入门' :
                          level === 2 ? '初步应用' :
                          level === 3 ? '深入分析' :
                          level === 4 ? '综合运用' :
                          '专家创新'
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>题目标题 *</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="输入题目标题..."
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
                  placeholder="例如：逻辑思维, 案例分析, 高级"
                />
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <MarkdownEditor
                label="题目背景 (Context) *"
                value={formData.context}
                onChange={(value) => setFormData({ ...formData, context: value })}
                placeholder="描述题目的背景情况..."
                height={250}
                required
              />

              <MarkdownEditor
                label="问题描述 (Question)"
                value={formData.question}
                onChange={(value) => setFormData({ ...formData, question: value })}
                placeholder="具体的问题描述..."
                height={200}
              />
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

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-4">
              <CaseAnalysisEditor
                value={formData.caseAnalysis || {}}
                onChange={(value) => setFormData({ ...formData, caseAnalysis: value })}
                label="案例分析"
              />

              {formData.level <= 3 && (
                <ScaffoldingEditor
                  value={formData.scaffolding || {}}
                  onChange={(value) => setFormData({ ...formData, scaffolding: value })}
                  label={`思维脚手架 (Level ${formData.level} 推荐)`}
                />
              )}

              <div>
                <Label>学习目标（每行一个）</Label>
                <Input
                  value={(formData.learningObjectives || []).join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    learningObjectives: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="学习目标..."
                />
              </div>

              <div>
                <Label>期望成果（每行一个）</Label>
                <Input
                  value={(formData.expectedOutcomes || []).join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedOutcomes: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="期望的学习成果..."
                />
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
