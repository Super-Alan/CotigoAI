'use client'

import { JsonFieldEditor } from './JsonFieldEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Scaffolding {
  keyPrompt?: string
  visualAid?: string
  thinkingSteps?: string[]
  commonMistakes?: string[]
  helpfulResources?: string[]
}

interface ScaffoldingEditorProps {
  value: Scaffolding
  onChange: (value: Scaffolding) => void
  label?: string
  required?: boolean
}

export function ScaffoldingEditor({
  value,
  onChange,
  label = '思维脚手架',
  required = false
}: ScaffoldingEditorProps) {
  const renderFormView = (scaffolding: Scaffolding, onFormChange: (value: Scaffolding) => void) => {
    return (
      <div className="space-y-4">
        <div>
          <Label>关键提示</Label>
          <Textarea
            value={scaffolding.keyPrompt || ''}
            onChange={(e) => onFormChange({ ...scaffolding, keyPrompt: e.target.value })}
            placeholder="提供给学生的关键提示或思路..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            这是帮助学生开始思考的核心提示
          </p>
        </div>

        <div>
          <Label>可视化辅助</Label>
          <Textarea
            value={scaffolding.visualAid || ''}
            onChange={(e) => onFormChange({ ...scaffolding, visualAid: e.target.value })}
            placeholder="建议的图表、思维导图等可视化工具..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            描述如何用可视化方式辅助思考（如思维导图、表格等）
          </p>
        </div>

        <div>
          <Label>思考步骤（每行一个）</Label>
          <Textarea
            value={(scaffolding.thinkingSteps || []).join('\n')}
            onChange={(e) => onFormChange({
              ...scaffolding,
              thinkingSteps: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="1. 明确问题核心&#10;2. 收集相关信息&#10;3. 分析各种可能性&#10;4. 得出初步结论"
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            分步骤引导学生的思考过程
          </p>
        </div>

        <div>
          <Label>常见错误（每行一个）</Label>
          <Textarea
            value={(scaffolding.commonMistakes || []).join('\n')}
            onChange={(e) => onFormChange({
              ...scaffolding,
              commonMistakes: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="提醒学生避免的常见错误..."
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            列出学生容易犯的典型错误，帮助他们避免
          </p>
        </div>

        <div>
          <Label>有用资源（每行一个）</Label>
          <Textarea
            value={(scaffolding.helpfulResources || []).join('\n')}
            onChange={(e) => onFormChange({
              ...scaffolding,
              helpfulResources: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="相关阅读材料、工具、网站等..."
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            推荐的学习资源链接或参考资料
          </p>
        </div>
      </div>
    )
  }

  const renderPreview = (scaffolding: Scaffolding) => {
    return (
      <div className="space-y-4">
        {scaffolding.keyPrompt && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 关键提示</h4>
            <p className="text-sm text-gray-700">{scaffolding.keyPrompt}</p>
          </div>
        )}

        {scaffolding.visualAid && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-purple-900 mb-2">📊 可视化辅助</h4>
            <p className="text-sm text-gray-700">{scaffolding.visualAid}</p>
          </div>
        )}

        {scaffolding.thinkingSteps && scaffolding.thinkingSteps.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">🪜 思考步骤</h4>
            <ol className="list-decimal list-inside space-y-1">
              {scaffolding.thinkingSteps.map((step, index) => (
                <li key={index} className="text-sm text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {scaffolding.commonMistakes && scaffolding.commonMistakes.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-red-900 mb-2">⚠️ 常见错误</h4>
            <ul className="list-disc list-inside space-y-1">
              {scaffolding.commonMistakes.map((mistake, index) => (
                <li key={index} className="text-sm text-red-700">{mistake}</li>
              ))}
            </ul>
          </div>
        )}

        {scaffolding.helpfulResources && scaffolding.helpfulResources.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-green-900 mb-2">📚 有用资源</h4>
            <ul className="list-disc list-inside space-y-1">
              {scaffolding.helpfulResources.map((resource, index) => (
                <li key={index} className="text-sm text-green-700">{resource}</li>
              ))}
            </ul>
          </div>
        )}

        {!scaffolding.keyPrompt && !scaffolding.visualAid && (
          <p className="text-sm text-gray-500 text-center py-4">暂无脚手架内容</p>
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
