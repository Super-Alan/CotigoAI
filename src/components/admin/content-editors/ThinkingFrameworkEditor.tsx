'use client'

import { JsonFieldEditor } from './JsonFieldEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ThinkingFramework {
  name?: string
  description?: string
  steps?: Array<{
    step: string
    description?: string
    keyQuestions?: string[]
  }>
  keyPrinciples?: string[]
  commonPitfalls?: string[]
}

interface ThinkingFrameworkEditorProps {
  value: ThinkingFramework
  onChange: (value: ThinkingFramework) => void
  label?: string
  required?: boolean
}

export function ThinkingFrameworkEditor({
  value,
  onChange,
  label = '思维框架',
  required = false
}: ThinkingFrameworkEditorProps) {
  const renderFormView = (fw: ThinkingFramework, onFormChange: (value: ThinkingFramework) => void) => {
    const handleStepChange = (index: number, field: string, newValue: any) => {
      const newSteps = [...(fw.steps || [])]
      newSteps[index] = { ...newSteps[index], [field]: newValue }
      onFormChange({ ...fw, steps: newSteps })
    }

    const addStep = () => {
      const newSteps = [...(fw.steps || []), { step: '', description: '', keyQuestions: [] }]
      onFormChange({ ...fw, steps: newSteps })
    }

    const removeStep = (index: number) => {
      const newSteps = (fw.steps || []).filter((_, i) => i !== index)
      onFormChange({ ...fw, steps: newSteps })
    }

    const addKeyPrinciple = () => {
      const newPrinciples = [...(fw.keyPrinciples || []), '']
      onFormChange({ ...fw, keyPrinciples: newPrinciples })
    }

    const updateKeyPrinciple = (index: number, value: string) => {
      const newPrinciples = [...(fw.keyPrinciples || [])]
      newPrinciples[index] = value
      onFormChange({ ...fw, keyPrinciples: newPrinciples })
    }

    const removeKeyPrinciple = (index: number) => {
      const newPrinciples = (fw.keyPrinciples || []).filter((_, i) => i !== index)
      onFormChange({ ...fw, keyPrinciples: newPrinciples })
    }

    const addPitfall = () => {
      const newPitfalls = [...(fw.commonPitfalls || []), '']
      onFormChange({ ...fw, commonPitfalls: newPitfalls })
    }

    const updatePitfall = (index: number, value: string) => {
      const newPitfalls = [...(fw.commonPitfalls || [])]
      newPitfalls[index] = value
      onFormChange({ ...fw, commonPitfalls: newPitfalls })
    }

    const removePitfall = (index: number) => {
      const newPitfalls = (fw.commonPitfalls || []).filter((_, i) => i !== index)
      onFormChange({ ...fw, commonPitfalls: newPitfalls })
    }

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <Label>框架名称</Label>
            <Input
              value={fw.name || ''}
              onChange={(e) => onFormChange({ ...fw, name: e.target.value })}
              placeholder="例如：苏格拉底问答法"
            />
          </div>

          <div>
            <Label>框架描述</Label>
            <Textarea
              value={fw.description || ''}
              onChange={(e) => onFormChange({ ...fw, description: e.target.value })}
              placeholder="描述这个思维框架的核心思想和适用场景..."
              rows={3}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>思考步骤</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStep}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加步骤
            </Button>
          </div>

          <div className="space-y-3">
            {(fw.steps || []).map((step, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">步骤 {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div>
                  <Label className="text-sm">步骤名称</Label>
                  <Input
                    value={step.step}
                    onChange={(e) => handleStepChange(index, 'step', e.target.value)}
                    placeholder="例如：明确问题"
                  />
                </div>

                <div>
                  <Label className="text-sm">步骤说明</Label>
                  <Textarea
                    value={step.description || ''}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    placeholder="描述这个步骤的具体做法..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-sm">关键问题（逗号分隔）</Label>
                  <Input
                    value={(step.keyQuestions || []).join(', ')}
                    onChange={(e) => handleStepChange(
                      index,
                      'keyQuestions',
                      e.target.value.split(',').map(q => q.trim()).filter(Boolean)
                    )}
                    placeholder="这个步骤需要思考哪些问题？"
                  />
                </div>
              </div>
            ))}

            {(!fw.steps || fw.steps.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                暂无步骤，点击"添加步骤"开始创建
              </p>
            )}
          </div>
        </div>

        {/* Key Principles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>核心原则</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKeyPrinciple}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加原则
            </Button>
          </div>

          <div className="space-y-2">
            {(fw.keyPrinciples || []).map((principle, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={principle}
                  onChange={(e) => updateKeyPrinciple(index, e.target.value)}
                  placeholder="输入一条核心原则..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyPrinciple(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Common Pitfalls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>常见陷阱</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPitfall}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加陷阱
            </Button>
          </div>

          <div className="space-y-2">
            {(fw.commonPitfalls || []).map((pitfall, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={pitfall}
                  onChange={(e) => updatePitfall(index, e.target.value)}
                  placeholder="描述一个常见的思维误区..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePitfall(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderPreview = (fw: ThinkingFramework) => {
    return (
      <div className="space-y-4">
        {fw.name && (
          <div>
            <h3 className="font-semibold text-lg">{fw.name}</h3>
            {fw.description && (
              <p className="text-sm text-gray-600 mt-1">{fw.description}</p>
            )}
          </div>
        )}

        {fw.steps && fw.steps.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">思考步骤:</h4>
            <ol className="list-decimal list-inside space-y-2">
              {fw.steps.map((step, index) => (
                <li key={index} className="text-sm">
                  <strong>{step.step}</strong>
                  {step.description && (
                    <p className="ml-6 text-gray-600 mt-1">{step.description}</p>
                  )}
                  {step.keyQuestions && step.keyQuestions.length > 0 && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {step.keyQuestions.map((q, qIdx) => (
                        <li key={qIdx} className="text-gray-600 text-xs">• {q}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {fw.keyPrinciples && fw.keyPrinciples.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">核心原则:</h4>
            <ul className="list-disc list-inside space-y-1">
              {fw.keyPrinciples.map((principle, index) => (
                <li key={index} className="text-sm text-gray-700">{principle}</li>
              ))}
            </ul>
          </div>
        )}

        {fw.commonPitfalls && fw.commonPitfalls.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">常见陷阱:</h4>
            <ul className="list-disc list-inside space-y-1">
              {fw.commonPitfalls.map((pitfall, index) => (
                <li key={index} className="text-sm text-red-600">{pitfall}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <JsonFieldEditor
      value={value}
      onChange={onChange}
      label={label}
      required={required}
      height={400}
      renderFormView={renderFormView}
      renderPreview={renderPreview}
    />
  )
}
