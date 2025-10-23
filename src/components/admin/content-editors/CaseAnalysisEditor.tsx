'use client'

import { JsonFieldEditor } from './JsonFieldEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CaseAnalysis {
  title?: string
  background?: string
  corePoints?: string[]
  framework?: {
    dimension: string
    analysis: string
  }[]
  perspectives?: {
    angle: string
    reasoning: string
    evidence?: string[]
  }[]
  reflections?: string[]
  insights?: string[]
}

interface CaseAnalysisEditorProps {
  value: CaseAnalysis
  onChange: (value: CaseAnalysis) => void
  label?: string
  required?: boolean
}

export function CaseAnalysisEditor({
  value,
  onChange,
  label = '案例分析',
  required = false
}: CaseAnalysisEditorProps) {
  const renderFormView = (ca: CaseAnalysis, onFormChange: (value: CaseAnalysis) => void) => {
    // Core Points Management
    const addCorePoint = () => {
      const newPoints = [...(ca.corePoints || []), '']
      onFormChange({ ...ca, corePoints: newPoints })
    }

    const updateCorePoint = (index: number, value: string) => {
      const newPoints = [...(ca.corePoints || [])]
      newPoints[index] = value
      onFormChange({ ...ca, corePoints: newPoints })
    }

    const removeCorePoint = (index: number) => {
      const newPoints = (ca.corePoints || []).filter((_, i) => i !== index)
      onFormChange({ ...ca, corePoints: newPoints })
    }

    // Framework Management
    const addFramework = () => {
      const newFramework = [...(ca.framework || []), { dimension: '', analysis: '' }]
      onFormChange({ ...ca, framework: newFramework })
    }

    const updateFramework = (index: number, field: string, value: string) => {
      const newFramework = [...(ca.framework || [])]
      newFramework[index] = { ...newFramework[index], [field]: value }
      onFormChange({ ...ca, framework: newFramework })
    }

    const removeFramework = (index: number) => {
      const newFramework = (ca.framework || []).filter((_, i) => i !== index)
      onFormChange({ ...ca, framework: newFramework })
    }

    // Perspectives Management
    const addPerspective = () => {
      const newPerspectives = [...(ca.perspectives || []), { angle: '', reasoning: '', evidence: [] }]
      onFormChange({ ...ca, perspectives: newPerspectives })
    }

    const updatePerspective = (index: number, field: string, value: any) => {
      const newPerspectives = [...(ca.perspectives || [])]
      newPerspectives[index] = { ...newPerspectives[index], [field]: value }
      onFormChange({ ...ca, perspectives: newPerspectives })
    }

    const removePerspective = (index: number) => {
      const newPerspectives = (ca.perspectives || []).filter((_, i) => i !== index)
      onFormChange({ ...ca, perspectives: newPerspectives })
    }

    // Reflections Management
    const addReflection = () => {
      const newReflections = [...(ca.reflections || []), '']
      onFormChange({ ...ca, reflections: newReflections })
    }

    const updateReflection = (index: number, value: string) => {
      const newReflections = [...(ca.reflections || [])]
      newReflections[index] = value
      onFormChange({ ...ca, reflections: newReflections })
    }

    const removeReflection = (index: number) => {
      const newReflections = (ca.reflections || []).filter((_, i) => i !== index)
      onFormChange({ ...ca, reflections: newReflections })
    }

    // Insights Management
    const addInsight = () => {
      const newInsights = [...(ca.insights || []), '']
      onFormChange({ ...ca, insights: newInsights })
    }

    const updateInsight = (index: number, value: string) => {
      const newInsights = [...(ca.insights || [])]
      newInsights[index] = value
      onFormChange({ ...ca, insights: newInsights })
    }

    const removeInsight = (index: number) => {
      const newInsights = (ca.insights || []).filter((_, i) => i !== index)
      onFormChange({ ...ca, insights: newInsights })
    }

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <Label>案例标题</Label>
            <Input
              value={ca.title || ''}
              onChange={(e) => onFormChange({ ...ca, title: e.target.value })}
              placeholder="例如：社交媒体言论自由的边界"
            />
          </div>

          <div>
            <Label>案例背景</Label>
            <Textarea
              value={ca.background || ''}
              onChange={(e) => onFormChange({ ...ca, background: e.target.value })}
              placeholder="描述案例的背景情况..."
              rows={4}
            />
          </div>
        </div>

        {/* Core Points */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>核心要点</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCorePoint}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加要点
            </Button>
          </div>

          <div className="space-y-2">
            {(ca.corePoints || []).map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Textarea
                    value={point}
                    onChange={(e) => updateCorePoint(index, e.target.value)}
                    placeholder="输入核心要点..."
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCorePoint(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Framework */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>分析框架</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFramework}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加维度
            </Button>
          </div>

          <div className="space-y-3">
            {(ca.framework || []).map((fw, index) => (
              <div key={index} className="border rounded-lg p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">维度 {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFramework(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div>
                  <Label className="text-sm">维度名称</Label>
                  <Input
                    value={fw.dimension}
                    onChange={(e) => updateFramework(index, 'dimension', e.target.value)}
                    placeholder="例如：道德维度、法律维度"
                  />
                </div>

                <div>
                  <Label className="text-sm">分析内容</Label>
                  <Textarea
                    value={fw.analysis}
                    onChange={(e) => updateFramework(index, 'analysis', e.target.value)}
                    placeholder="从这个维度进行分析..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-dimensional Perspectives */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>多维度思考</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPerspective}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加视角
            </Button>
          </div>

          <div className="space-y-3">
            {(ca.perspectives || []).map((perspective, index) => (
              <div key={index} className="border rounded-lg p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">视角 {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerspective(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div>
                  <Label className="text-sm">视角/角度</Label>
                  <Input
                    value={perspective.angle}
                    onChange={(e) => updatePerspective(index, 'angle', e.target.value)}
                    placeholder="例如：用户隐私角度、平台责任角度"
                  />
                </div>

                <div>
                  <Label className="text-sm">推理过程</Label>
                  <Textarea
                    value={perspective.reasoning}
                    onChange={(e) => updatePerspective(index, 'reasoning', e.target.value)}
                    placeholder="从这个视角的推理分析..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm">支持证据（逗号分隔，可选）</Label>
                  <Textarea
                    value={(perspective.evidence || []).join(', ')}
                    onChange={(e) => updatePerspective(
                      index,
                      'evidence',
                      e.target.value.split(',').map(ev => ev.trim()).filter(Boolean)
                    )}
                    placeholder="支持这个视角的证据..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reflections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>反思与启示</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReflection}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加反思
            </Button>
          </div>

          <div className="space-y-2">
            {(ca.reflections || []).map((reflection, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  value={reflection}
                  onChange={(e) => updateReflection(index, e.target.value)}
                  placeholder="输入反思内容..."
                  rows={2}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReflection(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>关键洞察</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInsight}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加洞察
            </Button>
          </div>

          <div className="space-y-2">
            {(ca.insights || []).map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <Input
                  value={insight}
                  onChange={(e) => updateInsight(index, e.target.value)}
                  placeholder="输入关键洞察..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInsight(index)}
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

  const renderPreview = (ca: CaseAnalysis) => {
    return (
      <div className="space-y-6 prose prose-sm max-w-none">
        {ca.title && (
          <div>
            <h3 className="text-lg font-bold text-gray-900">{ca.title}</h3>
          </div>
        )}

        {ca.background && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">📖 案例背景</h4>
            <p className="text-gray-600 leading-relaxed">{ca.background}</p>
          </div>
        )}

        {ca.corePoints && ca.corePoints.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🎯 核心要点</h4>
            <ul className="list-disc list-inside space-y-1">
              {ca.corePoints.map((point, index) => (
                <li key={index} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </div>
        )}

        {ca.framework && ca.framework.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🔍 分析框架</h4>
            <div className="space-y-3">
              {ca.framework.map((fw, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">{fw.dimension}</h5>
                  <p className="text-sm text-gray-700">{fw.analysis}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ca.perspectives && ca.perspectives.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🌟 多维度思考</h4>
            <div className="space-y-3">
              {ca.perspectives.map((p, index) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-purple-900 mb-1">{p.angle}</h5>
                  <p className="text-sm text-gray-700 mb-2">{p.reasoning}</p>
                  {p.evidence && p.evidence.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600">支持证据:</p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {p.evidence.map((ev, evIdx) => (
                          <li key={evIdx}>• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {ca.reflections && ca.reflections.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">💡 反思与启示</h4>
            <ul className="space-y-2">
              {ca.reflections.map((reflection, index) => (
                <li key={index} className="text-gray-700 bg-yellow-50 p-2 rounded">{reflection}</li>
              ))}
            </ul>
          </div>
        )}

        {ca.insights && ca.insights.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">✨ 关键洞察</h4>
            <ul className="list-disc list-inside space-y-1">
              {ca.insights.map((insight, index) => (
                <li key={index} className="text-green-700 font-medium">{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {!ca.title && !ca.background && <p className="text-gray-500">暂无案例分析内容</p>}
      </div>
    )
  }

  return (
    <JsonFieldEditor
      value={value}
      onChange={onChange}
      label={label}
      required={required}
      height={600}
      renderFormView={renderFormView}
      renderPreview={renderPreview}
    />
  )
}
