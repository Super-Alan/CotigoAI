'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Sparkles, BookOpen, Brain, Loader2, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

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

interface EnhancedSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EnhancedSearchModal({ open, onOpenChange }: EnhancedSearchModalProps) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [searchMode, setSearchMode] = useState<'idle' | 'database' | 'ai'>('idle')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setAiResponse('')
      setSearchMode('idle')
      return
    }

    const timer = setTimeout(() => {
      handleSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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
                break
              }
              accumulatedText += data
              setAiResponse(accumulatedText)
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

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setQuery('')
    setResults([])
    setAiResponse('')
    setSearchMode('idle')
    onOpenChange(false)
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            智能学习搜索
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索理论知识、学习内容、思维方法..."
              className="pl-12 pr-12 h-16 text-lg rounded-xl border-2 focus:border-blue-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {searchMode === 'idle' && (
            <div className="text-center py-12 text-gray-500">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">输入关键词开始搜索...</p>
              <p className="text-sm mt-2">支持搜索理论知识、学习内容和思维方法</p>
            </div>
          )}

          {searching && results.length === 0 && !aiResponse && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">正在搜索中...</p>
            </div>
          )}

          {/* Database Results */}
          {searchMode === 'database' && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">找到 {results.length} 条相关内容</span>
              </div>

              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/learn/critical-thinking/${result.thinkingTypeId}${result.level ? `?level=${result.level}` : ''}`}
                  onClick={handleClose}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-blue-300">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{result.title}</h3>
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
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900">AI 智能回答</span>
                {aiStreaming && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                )}
              </div>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-500 text-center">
                💡 提示：AI 回答基于批判性思维和学习方法论知识库
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>快捷键：</span>
              <kbd className="px-2 py-1 bg-white border rounded">Ctrl/Cmd + K</kbd>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
