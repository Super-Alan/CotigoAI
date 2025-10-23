'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Eye, Edit, Code } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
) as any

const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
) as any

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  height?: number
  required?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder = '输入内容...',
  height = 300,
  required = false
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit')

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            编辑
          </TabsTrigger>
          <TabsTrigger value="split" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            分屏
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            预览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <div data-color-mode="light">
            <MDEditor
              value={value}
              onChange={(val: string | undefined) => onChange(val || '')}
              height={height}
              preview="edit"
              hideToolbar={false}
              enableScroll={true}
              visibleDragbar={false}
              textareaProps={{
                placeholder
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="split" className="mt-4">
          <div data-color-mode="light">
            <MDEditor
              value={value}
              onChange={(val: string | undefined) => onChange(val || '')}
              height={height}
              preview="live"
              hideToolbar={false}
              enableScroll={true}
              visibleDragbar={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div data-color-mode="light">
            <MDPreview
              source={value || placeholder}
              style={{
                padding: 16,
                minHeight: height,
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: '#fff'
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-gray-500 mt-1">
        支持 Markdown 语法，可以使用**粗体**、*斜体*、[链接](url)、列表等
      </p>
    </div>
  )
}
