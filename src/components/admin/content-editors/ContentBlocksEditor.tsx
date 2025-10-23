'use client'

import { JsonFieldEditor } from './JsonFieldEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ContentBlock {
  type: 'text' | 'list' | 'code' | 'quote' | 'table' | 'image' | 'video'
  content: string
  title?: string
  language?: string
  items?: string[]
  rows?: string[][]
}

interface ContentBlocks {
  blocks?: ContentBlock[]
}

interface ContentBlocksEditorProps {
  value: ContentBlocks
  onChange: (value: ContentBlocks) => void
  label?: string
  required?: boolean
}

export function ContentBlocksEditor({
  value,
  onChange,
  label = '内容块',
  required = false
}: ContentBlocksEditorProps) {
  const renderFormView = (content: ContentBlocks, onFormChange: (value: ContentBlocks) => void) => {
    const blocks = content.blocks || []

    const addBlock = (type: ContentBlock['type']) => {
      const newBlock: ContentBlock = {
        type,
        content: '',
        title: '',
        ...(type === 'list' && { items: [''] }),
        ...(type === 'code' && { language: 'javascript' }),
        ...(type === 'table' && { rows: [['', '']] })
      }

      const newBlocks = [...blocks, newBlock]
      onFormChange({ ...content, blocks: newBlocks })
    }

    const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
      const newBlocks = [...blocks]
      newBlocks[index] = { ...newBlocks[index], ...updates }
      onFormChange({ ...content, blocks: newBlocks })
    }

    const removeBlock = (index: number) => {
      const newBlocks = blocks.filter((_, i) => i !== index)
      onFormChange({ ...content, blocks: newBlocks })
    }

    const moveBlock = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return
      if (direction === 'down' && index === blocks.length - 1) return

      const newBlocks = [...blocks]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
      onFormChange({ ...content, blocks: newBlocks })
    }

    const getBlockIcon = (type: ContentBlock['type']) => {
      const icons: Record<ContentBlock['type'], string> = {
        text: '📝',
        list: '📋',
        code: '💻',
        quote: '💬',
        table: '📊',
        image: '🖼️',
        video: '🎥'
      }
      return icons[type]
    }

    const getBlockLabel = (type: ContentBlock['type']) => {
      const labels: Record<ContentBlock['type'], string> = {
        text: '文本',
        list: '列表',
        code: '代码',
        quote: '引用',
        table: '表格',
        image: '图片',
        video: '视频'
      }
      return labels[type]
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">共 {blocks.length} 个内容块</p>
          <div className="flex gap-1 flex-wrap">
            {(['text', 'list', 'code', 'quote', 'table', 'image', 'video'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock(type)}
                className="text-xs"
              >
                {getBlockIcon(type)} {getBlockLabel(type)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="flex items-center gap-1">
                  {getBlockIcon(block.type)} {getBlockLabel(block.type)} #{index + 1}
                </Badge>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {block.type !== 'table' && (
                <div>
                  <Label className="text-sm">标题（可选）</Label>
                  <Input
                    value={block.title || ''}
                    onChange={(e) => updateBlock(index, { title: e.target.value })}
                    placeholder="内容块标题..."
                  />
                </div>
              )}

              {block.type === 'text' && (
                <div>
                  <Label className="text-sm">文本内容</Label>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="输入文本内容..."
                    rows={5}
                  />
                </div>
              )}

              {block.type === 'list' && (
                <div>
                  <Label className="text-sm">列表项（每行一个）</Label>
                  <Textarea
                    value={(block.items || []).join('\n')}
                    onChange={(e) => updateBlock(index, {
                      items: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="• 列表项1&#10;• 列表项2&#10;• 列表项3"
                    rows={6}
                  />
                </div>
              )}

              {block.type === 'code' && (
                <>
                  <div>
                    <Label className="text-sm">编程语言</Label>
                    <Select
                      value={block.language || 'javascript'}
                      onValueChange={(value) => updateBlock(index, { language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">代码内容</Label>
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="输入代码..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              )}

              {block.type === 'quote' && (
                <div>
                  <Label className="text-sm">引用内容</Label>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="输入引用的文字..."
                    rows={4}
                  />
                </div>
              )}

              {block.type === 'image' && (
                <>
                  <div>
                    <Label className="text-sm">图片URL</Label>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">图片描述（alt text）</Label>
                    <Input
                      value={block.title || ''}
                      onChange={(e) => updateBlock(index, { title: e.target.value })}
                      placeholder="图片的描述..."
                    />
                  </div>
                </>
              )}

              {block.type === 'video' && (
                <>
                  <div>
                    <Label className="text-sm">视频URL</Label>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">视频标题</Label>
                    <Input
                      value={block.title || ''}
                      onChange={(e) => updateBlock(index, { title: e.target.value })}
                      placeholder="视频标题..."
                    />
                  </div>
                </>
              )}

              {block.type === 'table' && (
                <div>
                  <Label className="text-sm">表格内容（CSV格式，逗号分隔）</Label>
                  <Textarea
                    value={(block.rows || []).map(row => row.join(',')).join('\n')}
                    onChange={(e) => updateBlock(index, {
                      rows: e.target.value.split('\n').filter(Boolean).map(line => line.split(','))
                    })}
                    placeholder="标题1,标题2,标题3&#10;数据1,数据2,数据3&#10;数据4,数据5,数据6"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    用逗号分隔列，每行一个数据行
                  </p>
                </div>
              )}
            </div>
          ))}

          {blocks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
              暂无内容块，选择上方按钮添加不同类型的内容
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderPreview = (content: ContentBlocks) => {
    const blocks = content.blocks || []

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={index}>
            {block.title && block.type !== 'image' && block.type !== 'video' && (
              <h4 className="font-semibold text-sm mb-2">{block.title}</h4>
            )}

            {block.type === 'text' && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content}</p>
            )}

            {block.type === 'list' && (
              <ul className="list-disc list-inside space-y-1">
                {(block.items || []).map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{item}</li>
                ))}
              </ul>
            )}

            {block.type === 'code' && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                <code className={`language-${block.language}`}>{block.content}</code>
              </pre>
            )}

            {block.type === 'quote' && (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic text-gray-700">
                {block.content}
              </blockquote>
            )}

            {block.type === 'image' && (
              <div className="border rounded-lg p-2 bg-gray-50">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">🖼️ {block.title || '图片'}</span>
                </div>
                <p className="text-xs text-gray-600">{block.content}</p>
              </div>
            )}

            {block.type === 'video' && (
              <div className="border rounded-lg p-2 bg-gray-50">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">🎥 {block.title || '视频'}</span>
                </div>
                <p className="text-xs text-gray-600">{block.content}</p>
              </div>
            )}

            {block.type === 'table' && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <tbody>
                    {(block.rows || []).map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx === 0 ? 'bg-gray-100' : ''}>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`border border-gray-300 px-4 py-2 text-sm ${
                              rowIdx === 0 ? 'font-semibold' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <p className="text-sm text-gray-500 text-center">暂无内容</p>
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
      height={600}
      renderFormView={renderFormView}
      renderPreview={renderPreview}
    />
  )
}
