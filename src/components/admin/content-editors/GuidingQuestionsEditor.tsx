'use client'

import { JsonFieldEditor } from './JsonFieldEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface GuidingQuestion {
  question: string
  purpose?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  stage?: 'clarification' | 'evidence' | 'assumptions' | 'alternatives' | 'general'
  hints?: string[]
}

interface GuidingQuestionsEditorProps {
  value: GuidingQuestion[]
  onChange: (value: GuidingQuestion[]) => void
  label?: string
  required?: boolean
}

export function GuidingQuestionsEditor({
  value,
  onChange,
  label = '引导问题',
  required = false
}: GuidingQuestionsEditorProps) {
  const renderFormView = (questions: GuidingQuestion[], onFormChange: (value: GuidingQuestion[]) => void) => {
    const addQuestion = () => {
      const newQuestions = [
        ...(questions || []),
        { question: '', purpose: '', level: 'beginner' as const, stage: 'general' as const, hints: [] }
      ]
      onFormChange(newQuestions)
    }

    const updateQuestion = (index: number, field: string, newValue: any) => {
      const newQuestions = [...(questions || [])]
      newQuestions[index] = { ...newQuestions[index], [field]: newValue }
      onFormChange(newQuestions)
    }

    const removeQuestion = (index: number) => {
      const newQuestions = (questions || []).filter((_, i) => i !== index)
      onFormChange(newQuestions)
    }

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return
      if (direction === 'down' && index === questions.length - 1) return

      const newQuestions = [...(questions || [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
      onFormChange(newQuestions)
    }

    const getStageLabel = (stage: string) => {
      const labels: Record<string, string> = {
        clarification: '澄清',
        evidence: '证据',
        assumptions: '假设',
        alternatives: '替代',
        general: '通用'
      }
      return labels[stage] || stage
    }

    const getStageColor = (stage: string) => {
      const colors: Record<string, string> = {
        clarification: 'bg-blue-100 text-blue-800',
        evidence: 'bg-green-100 text-green-800',
        assumptions: 'bg-purple-100 text-purple-800',
        alternatives: 'bg-orange-100 text-orange-800',
        general: 'bg-gray-100 text-gray-800'
      }
      return colors[stage] || 'bg-gray-100 text-gray-800'
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            共 {questions?.length || 0} 个引导问题
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加问题
          </Button>
        </div>

        <div className="space-y-3">
          {(questions || []).map((q, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">问题 {index + 1}</Badge>
                  {q.level && (
                    <Badge className={
                      q.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      q.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {q.level === 'beginner' ? '初级' : q.level === 'intermediate' ? '中级' : '高级'}
                    </Badge>
                  )}
                  {q.stage && (
                    <Badge className={getStageColor(q.stage)}>
                      {getStageLabel(q.stage)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === questions.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm">问题内容 *</Label>
                <Textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  placeholder="输入引导问题..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">难度等级</Label>
                  <Select
                    value={q.level || 'beginner'}
                    onValueChange={(value) => updateQuestion(index, 'level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">初级</SelectItem>
                      <SelectItem value="intermediate">中级</SelectItem>
                      <SelectItem value="advanced">高级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">问题阶段</Label>
                  <Select
                    value={q.stage || 'general'}
                    onValueChange={(value) => updateQuestion(index, 'stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clarification">澄清 (Clarification)</SelectItem>
                      <SelectItem value="evidence">证据 (Evidence)</SelectItem>
                      <SelectItem value="assumptions">假设 (Assumptions)</SelectItem>
                      <SelectItem value="alternatives">替代 (Alternatives)</SelectItem>
                      <SelectItem value="general">通用 (General)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm">问题目的（可选）</Label>
                <Textarea
                  value={q.purpose || ''}
                  onChange={(e) => updateQuestion(index, 'purpose', e.target.value)}
                  placeholder="这个问题旨在引导学生思考什么？"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm">提示（可选，逗号分隔）</Label>
                <Input
                  value={(q.hints || []).join(', ')}
                  onChange={(e) => updateQuestion(
                    index,
                    'hints',
                    e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                  )}
                  placeholder="可以给学生的提示..."
                />
              </div>
            </div>
          ))}

          {(!questions || questions.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
              暂无引导问题，点击"添加问题"开始创建
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderPreview = (questions: GuidingQuestion[]) => {
    const getStageLabel = (stage: string) => {
      const labels: Record<string, string> = {
        clarification: '澄清问题',
        evidence: '寻找证据',
        assumptions: '检视假设',
        alternatives: '探索替代',
        general: '通用引导'
      }
      return labels[stage] || stage
    }

    const groupedByStage = (questions || []).reduce((acc, q) => {
      const stage = q.stage || 'general'
      if (!acc[stage]) acc[stage] = []
      acc[stage].push(q)
      return acc
    }, {} as Record<string, GuidingQuestion[]>)

    return (
      <div className="space-y-6">
        {Object.entries(groupedByStage).map(([stage, stageQuestions]) => (
          <div key={stage}>
            <h4 className="font-semibold text-sm mb-3 text-blue-900">
              {getStageLabel(stage)} ({stageQuestions.length})
            </h4>
            <div className="space-y-3">
              {stageQuestions.map((q, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-900 shrink-0">Q{index + 1}:</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{q.question}</p>
                      {q.purpose && (
                        <p className="text-xs text-gray-600 mt-1">
                          💭 目的: {q.purpose}
                        </p>
                      )}
                      {q.hints && q.hints.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">💡 提示:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {q.hints.map((hint, hIdx) => (
                              <li key={hIdx}>• {hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!questions || questions.length === 0) && (
          <p className="text-sm text-gray-500 text-center">暂无引导问题</p>
        )}
      </div>
    )
  }

  return (
    <JsonFieldEditor
      value={value || []}
      onChange={onChange}
      label={label}
      required={required}
      height={500}
      renderFormView={renderFormView}
      renderPreview={renderPreview}
    />
  )
}
