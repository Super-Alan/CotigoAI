'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, Edit, Code, CheckCircle, AlertCircle } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface JsonFieldEditorProps {
  value: any
  onChange: (value: any) => void
  label?: string
  placeholder?: string
  height?: number
  required?: boolean
  renderFormView?: (value: any, onChange: (value: any) => void) => React.ReactNode
  renderPreview?: (value: any) => React.ReactNode
}

export function JsonFieldEditor({
  value,
  onChange,
  label,
  placeholder = '{}',
  height = 300,
  required = false,
  renderFormView,
  renderPreview
}: JsonFieldEditorProps) {
  const [mode, setMode] = useState<'form' | 'json' | 'preview'>(renderFormView ? 'form' : 'json')
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleJsonChange = (newValue: string | undefined) => {
    if (!newValue) {
      setJsonText('')
      return
    }

    setJsonText(newValue)

    try {
      const parsed = JSON.parse(newValue)
      setJsonError(null)
      onChange(parsed)
    } catch (error) {
      setJsonError('JSON 格式错误')
    }
  }

  const handleFormChange = (newValue: any) => {
    onChange(newValue)
    setJsonText(JSON.stringify(newValue, null, 2))
    setJsonError(null)
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      setJsonError(null)
    } catch (error) {
      setJsonError('无法格式化，JSON 格式错误')
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className={`grid ${renderFormView ? 'grid-cols-3' : 'grid-cols-2'} w-full max-w-md`}>
            {renderFormView && (
              <TabsTrigger value="form" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                表单
              </TabsTrigger>
            )}
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              JSON
            </TabsTrigger>
            {renderPreview && (
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                预览
              </TabsTrigger>
            )}
          </TabsList>

          {mode === 'json' && (
            <Button
              variant="outline"
              size="sm"
              onClick={formatJson}
              disabled={!!jsonError}
            >
              格式化
            </Button>
          )}
        </div>

        {renderFormView && (
          <TabsContent value="form" className="mt-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              {renderFormView(value, handleFormChange)}
            </div>
          </TabsContent>
        )}

        <TabsContent value="json" className="mt-4">
          <div className="border rounded-lg overflow-hidden">
            <Editor
              height={height}
              defaultLanguage="json"
              value={jsonText}
              onChange={handleJsonChange}
              theme="vs"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>

          {jsonError ? (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="mt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">JSON 格式正确</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {renderPreview && (
          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-white min-h-[200px]">
              {renderPreview(value)}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <p className="text-xs text-gray-500 mt-1">
        {renderFormView ? '可以使用表单编辑或直接编辑 JSON 代码' : '直接编辑 JSON 格式数据'}
      </p>
    </div>
  )
}
