'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MindMapMessage from './MindMapMessage'

interface MessageRendererProps {
  content: string
  metadata?: {
    type?: string
    action?: string
    [key: string]: any
  }
}

/**
 * 智能消息渲染器
 * 自动检测内容类型并使用合适的渲染方式：
 * 1. 思维导图JSON → MindMapMessage组件
 * 2. Markdown内容 → react-markdown渲染
 * 3. 混合内容（文本+思维导图） → 分段渲染
 * 4. 纯文本 → 直接显示
 */
export default function MessageRenderer({ content, metadata }: MessageRendererProps) {
  // 1. 检测纯思维导图JSON（整个内容都是JSON）
  const tryParsePureMindMap = (): any | null => {
    if (metadata?.action === 'mindmap') {
      try {
        const parsed = JSON.parse(content)
        if (parsed.central && parsed.branches && Array.isArray(parsed.branches)) {
          return parsed
        }
      } catch (e) {
        // 不是纯JSON
      }
    }
    return null
  }

  // 2. 检测嵌入的思维导图JSON（在文本中）
  const detectEmbeddedMindMap = (): { hasMindMap: boolean; parts: Array<{ type: 'text' | 'mindmap'; content: any }> } => {
    const parts: Array<{ type: 'text' | 'mindmap'; content: any }> = []
    let hasMindMap = false
    let currentIndex = 0

    // 辅助函数：使用括号计数找到完整的JSON对象
    const extractJsonObject = (str: string, startIndex: number): { json: string; endIndex: number } | null => {
      let braceCount = 0
      let inString = false
      let escapeNext = false
      let jsonStart = -1

      for (let i = startIndex; i < str.length; i++) {
        const char = str[i]

        if (escapeNext) {
          escapeNext = false
          continue
        }

        if (char === '\\') {
          escapeNext = true
          continue
        }

        if (char === '"' && !escapeNext) {
          inString = !inString
          continue
        }

        if (!inString) {
          if (char === '{') {
            if (braceCount === 0) jsonStart = i
            braceCount++
          } else if (char === '}') {
            braceCount--
            if (braceCount === 0 && jsonStart !== -1) {
              return {
                json: str.substring(jsonStart, i + 1),
                endIndex: i + 1
              }
            }
          }
        }
      }

      return null
    }

    // 查找所有可能的JSON位置
    while (currentIndex < content.length) {
      // 查找 "central": 标记
      const centralIndex = content.indexOf('"central":', currentIndex)

      if (centralIndex === -1) {
        // 没有更多JSON，添加剩余文本
        const remaining = content.substring(currentIndex).trim()
        if (remaining) {
          parts.push({ type: 'text', content: remaining })
        }
        break
      }

      // 向前查找最近的 {
      let jsonStartIndex = centralIndex
      while (jsonStartIndex > currentIndex && content[jsonStartIndex] !== '{') {
        jsonStartIndex--
      }

      // 如果找不到 {，跳过
      if (content[jsonStartIndex] !== '{') {
        currentIndex = centralIndex + 1
        continue
      }

      // 添加JSON之前的文本
      if (jsonStartIndex > currentIndex) {
        const textBefore = content.substring(currentIndex, jsonStartIndex).trim()
        if (textBefore) {
          parts.push({ type: 'text', content: textBefore })
        }
      }

      // 提取完整的JSON对象
      const extracted = extractJsonObject(content, jsonStartIndex)

      if (extracted) {
        try {
          const parsed = JSON.parse(extracted.json)
          if (parsed.central && parsed.branches && Array.isArray(parsed.branches)) {
            parts.push({ type: 'mindmap', content: parsed })
            hasMindMap = true
            currentIndex = extracted.endIndex
          } else {
            // 不是思维导图JSON，作为文本处理
            parts.push({ type: 'text', content: extracted.json })
            currentIndex = extracted.endIndex
          }
        } catch (e) {
          // JSON解析失败，作为文本处理
          parts.push({ type: 'text', content: extracted.json })
          currentIndex = extracted.endIndex
        }
      } else {
        // 找不到完整的JSON，跳过
        currentIndex = centralIndex + 1
      }
    }

    // 如果没有找到任何部分，返回整个内容作为文本
    if (parts.length === 0) {
      parts.push({ type: 'text', content })
    }

    return { hasMindMap, parts }
  }

  // 3. 检测是否包含Markdown格式
  const hasMarkdown = (text: string): boolean => {
    // 检测常见Markdown语法
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题
      /\*\*[^*]+\*\*/,         // 粗体
      /\*[^*]+\*/,             // 斜体
      /^\s*[-*+]\s+/m,         // 无序列表
      /^\s*\d+\.\s+/m,         // 有序列表
      /\[([^\]]+)\]\(([^)]+)\)/, // 链接
      /`[^`]+`/,               // 行内代码
      /^```/m,                 // 代码块
      /^\s*>\s+/m              // 引用
    ]

    return markdownPatterns.some(pattern => pattern.test(text))
  }

  // 渲染逻辑
  const pureMindMap = tryParsePureMindMap()

  if (pureMindMap) {
    // 情况1: 纯思维导图JSON
    return <MindMapMessage data={pureMindMap} />
  }

  const { hasMindMap, parts } = detectEmbeddedMindMap()

  if (hasMindMap) {
    // 情况2: 混合内容（包含思维导图）
    return (
      <div className="space-y-4">
        {parts.map((part, index) => (
          <div key={index}>
            {part.type === 'mindmap' ? (
              <MindMapMessage data={part.content} />
            ) : hasMarkdown(part.content) ? (
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-900 mt-2 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-800 leading-relaxed my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-800 my-2 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-800 my-2 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="text-gray-800" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-gray-800" {...props} />,
                    code: ({ node, inline, ...props }) =>
                      inline
                        ? <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900" {...props} />
                        : <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-900 overflow-x-auto my-2" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {part.content}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 情况3: 纯Markdown或纯文本
  if (hasMarkdown(content)) {
    return (
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-900 mt-2 mb-1" {...props} />,
            p: ({ node, ...props }) => <p className="text-gray-800 leading-relaxed my-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-800 my-2 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-800 my-2 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="text-gray-800" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
            em: ({ node, ...props }) => <em className="italic text-gray-800" {...props} />,
            code: ({ node, inline, ...props }) =>
              inline
                ? <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900" {...props} />
                : <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-900 overflow-x-auto my-2" {...props} />,
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  // 情况4: 纯文本
  return (
    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
      {content}
    </p>
  )
}
