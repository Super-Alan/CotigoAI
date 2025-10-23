'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, BookOpen, Brain, Loader2, ArrowRight, X, ArrowLeft } from 'lucide-react'

interface SearchResult {
  type: 'theory' | 'learning_content'
  id: string
  thinkingTypeId: string
  thinkingTypeName?: string
  level?: number
  title: string
  description: string
  contentType?: string
  tags?: string[]
  keywords?: string[]
  matchScore?: number
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [searchMode, setSearchMode] = useState<'idle' | 'database' | 'ai'>('idle')
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  // 格式化 AI 输出 - 彻底重写版本
  const formatAIResponse = (text: string): string => {
    console.log('=== 格式化前 ===');
    console.log(text.substring(0, 500)); // 只打印前500字符

    // Step 1: 强制识别并标准化所有标题
    // 匹配: "核心观点"、"## 详细分析"、"###详细分析1."等所有变体
    text = text.replace(/(^|\n)(#{0,3}\s*)?(核心观点|详细分析|实践建议)(\s*\d+\.)?/g, (match, prefix, hashes, keyword) => {
      return `\n\n## ${keyword}\n\n`;
    });

    // Step 2: 分离所有数字列表项
    // 处理粘连的列表项: "内容。1. 下一项" -> "内容。\n\n1. 下一项"
    text = text.replace(/([^|\n])(\d+)\.\s+/g, (match, before, num) => {
      // 如果前面是换行符或开头,保持原样
      if (before === '\n' || !before) {
        return match;
      }
      // 否则在前面添加两个换行符
      return `${before}\n\n${num}. `;
    });

    // Step 3: 逐行解析和重组
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 处理标题
      if (line.startsWith('##')) {
        // 标题前后添加空行
        if (result.length > 0) result.push('');
        result.push(line);
        result.push('');
        continue;
      }

      // 处理数字列表项
      const listMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (listMatch) {
        const [, num, content] = listMatch;

        // 列表项前添加空行
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('');
        }

        // 检查是否已经有粗体标题
        const boldMatch = content.match(/^\*\*([^*]+)\*\*(.*)$/);
        if (boldMatch) {
          // 已有粗体标题
          const [, title, rest] = boldMatch;
          result.push(`${num}. **${title}**`);
          if (rest.trim()) {
            result.push('');
            result.push(`   ${rest.trim()}`);
          }
        } else {
          // 自动提取标题: 第一个标点前的内容
          const punctMatch = content.match(/^([^，。：；！？,.:;!?]+)([，。：；！？,.:;!?].*)$/);
          if (punctMatch && punctMatch[1].length <= 25) {
            const [, title, rest] = punctMatch;
            result.push(`${num}. **${title}**`);
            if (rest.trim()) {
              result.push('');
              result.push(`   ${rest.trim()}`);
            }
          } else {
            // 整个内容作为标题
            result.push(`${num}. **${content}**`);
          }
        }
        continue;
      }

      // 普通内容行
      result.push(line);
    }

    const formatted = result.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    console.log('=== 格式化后 ===');
    console.log(formatted.substring(0, 500));

    return formatted;
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setSearching(true)
    setResults([])
    setAiResponse('')

    try {
      // Step 1: Search database
      setSearchMode('database')
      const response = await fetch(`/api/search/learning?q=${encodeURIComponent(searchQuery)}`)

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.data.results.length > 0) {
          setResults(data.data.results)
          setSearchMode('database')
          setSearching(false)
          return
        }
      }

      // Step 2: If no results, use AI fallback
      setSearchMode('ai')
      setAiStreaming(true)

      abortControllerRef.current = new AbortController()
      const aiResponse = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
        signal: abortControllerRef.current.signal
      })

      if (!aiResponse.ok) {
        throw new Error('AI search failed')
      }

      const reader = aiResponse.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setAiStreaming(false)
                // 最终格式化
                setAiResponse(formatAIResponse(accumulatedText))
                break
              }
              accumulatedText += data
              // 实时格式化显示
              setAiResponse(formatAIResponse(accumulatedText))
            }
          }
        }
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error)
      }
    } finally {
      setSearching(false)
      setAiStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/learn/search?q=${encodeURIComponent(query.trim())}`)
      handleSearch(query.trim())
    }
  }

  const getContentTypeLabel = (contentType?: string) => {
    const labels: Record<string, string> = {
      concepts: '核心概念',
      frameworks: '思维模型',
      examples: '实例演示',
      practice_guide: '练习指南'
    }
    return contentType ? labels[contentType] || contentType : ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/learn" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回学习中心
        </Link>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">智能学习搜索</h1>
          <p className="text-gray-600">搜索理论知识、学习内容和思维方法，如果没找到相关内容，AI 将为您智能解答</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mb-8">
          <form onSubmit={handleSubmit} className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索理论知识、学习内容、思维方法..."
              className="pl-16 pr-32 h-20 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 shadow-lg bg-white"
              autoFocus
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={searching || !query.trim()}
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="max-w-5xl">
          {searchMode === 'idle' && !initialQuery && (
            <div className="text-center py-16 text-gray-500">
              <Brain className="h-20 w-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">输入关键词开始搜索</p>
              <p className="text-sm mt-2">支持搜索理论知识、学习内容和思维方法</p>
            </div>
          )}

          {searching && results.length === 0 && !aiResponse && (
            <div className="text-center py-16">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">正在搜索中...</p>
            </div>
          )}

          {/* Database Results */}
          {searchMode === 'database' && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">找到 {results.length} 条相关内容</span>
              </div>

              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/learn/critical-thinking/${result.thinkingTypeId}${result.level ? `?level=${result.level}` : ''}`}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer border-2 hover:border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {result.type === 'theory' && (
                              <Badge className="bg-purple-100 text-purple-800">理论知识</Badge>
                            )}
                            {result.type === 'learning_content' && (
                              <Badge className="bg-blue-100 text-blue-800">学习内容</Badge>
                            )}
                            {result.level && (
                              <Badge variant="outline">Level {result.level}</Badge>
                            )}
                            {result.contentType && (
                              <Badge variant="secondary">{getContentTypeLabel(result.contentType)}</Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{result.title}</h3>
                          <p className="text-gray-600 line-clamp-2">{result.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                      </div>

                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {result.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {result.thinkingTypeName && (
                        <div className="mt-3 text-sm text-gray-500">
                          <span className="font-medium">{result.thinkingTypeName}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* AI Response */}
          {searchMode === 'ai' && (aiResponse || aiStreaming) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900">AI 智能回答</span>
                {aiStreaming && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                )}
              </div>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6 sm:p-8">
                  {/* 使用 min-h 防止内容增加时的布局抖动 */}
                  <div className="min-h-[200px]">
                    <MarkdownRenderer
                      content={aiResponse || '正在生成回答...'}
                      className="text-gray-800"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-500 text-center mt-4">
                💡 提示：AI 回答基于批判性思维和学习方法论知识库
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
