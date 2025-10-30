'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Database,
  Info,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TheoryContentTabProps {
  theoryContents: any[]
  theoryContentsLoading: boolean
  theoryContentsPage: number
  theoryContentsTotalPages: number
  theoryContentsFilters: {
    thinkingTypeId: string
    level: string
    difficulty: string
    validationStatus: string
    isPublished: string
    search: string
  }
  expandedTheoryId: string | null
  thinkingTypes: Array<{ id: string; name: string; icon: string; description: string }>
  setTheoryContentsFilters: (filters: any) => void
  setTheoryContentsPage: (page: number) => void
  setExpandedTheoryId: (id: string | null) => void
  openCreateTheoryDialog: () => void
  openEditTheoryDialog: (theory: any) => void
  handleDeleteTheory: (id: string) => void
}

export function TheoryContentTab({
  theoryContents,
  theoryContentsLoading,
  theoryContentsPage,
  theoryContentsTotalPages,
  theoryContentsFilters,
  expandedTheoryId,
  thinkingTypes,
  setTheoryContentsFilters,
  setTheoryContentsPage,
  setExpandedTheoryId,
  openCreateTheoryDialog,
  openEditTheoryDialog,
  handleDeleteTheory
}: TheoryContentTabProps) {
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const getValidationStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'validated': 'bg-blue-100 text-blue-800',
      'published': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const renderContentSection = (title: string, intro: string | null, content: any, icon: string) => {
    if (!intro && (!content || Object.keys(content).length === 0)) {
      return null
    }

    return (
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-2">{icon} {title}</h4>
        {intro && (
          <div className="bg-blue-50 p-3 rounded-lg mb-2">
            <p className="text-sm text-gray-700 leading-relaxed">{intro}</p>
          </div>
        )}
        {content && Object.keys(content).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle>理论知识管理 - 3章节体系</CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Database className="h-3 w-3" />
              <span>数据表: TheoryContent</span>
              <span className="text-gray-300">|</span>
              <Info className="h-3 w-3" />
              <span>用于: 核心概念、思维模型、实例演示（3个纯理论章节）</span>
            </div>
          </div>
          <Button variant="default" onClick={openCreateTheoryDialog}>
            <Plus className="h-4 w-4 mr-2" />
            创建理论内容
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <Input
              placeholder="搜索标题、描述..."
              value={theoryContentsFilters.search}
              onChange={(e) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, search: e.target.value })
                setTheoryContentsPage(1)
              }}
            />

            {/* Thinking Type */}
            <Select
              value={theoryContentsFilters.thinkingTypeId || undefined}
              onValueChange={(value) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, thinkingTypeId: value === 'all' ? '' : value })
                setTheoryContentsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部思维类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {thinkingTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level */}
            <Select
              value={theoryContentsFilters.level || undefined}
              onValueChange={(value) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, level: value === 'all' ? '' : value })
                setTheoryContentsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部Level</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty */}
            <Select
              value={theoryContentsFilters.difficulty || undefined}
              onValueChange={(value) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, difficulty: value === 'all' ? '' : value })
                setTheoryContentsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部难度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                <SelectItem value="beginner">初级</SelectItem>
                <SelectItem value="intermediate">中级</SelectItem>
                <SelectItem value="advanced">高级</SelectItem>
              </SelectContent>
            </Select>

            {/* Validation Status */}
            <Select
              value={theoryContentsFilters.validationStatus || undefined}
              onValueChange={(value) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, validationStatus: value === 'all' ? '' : value })
                setTheoryContentsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="验证状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="validated">已验证</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
              </SelectContent>
            </Select>

            {/* Published Status */}
            <Select
              value={theoryContentsFilters.isPublished || undefined}
              onValueChange={(value) => {
                setTheoryContentsFilters({ ...theoryContentsFilters, isPublished: value === 'all' ? '' : value })
                setTheoryContentsPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="发布状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="true">已发布</SelectItem>
                <SelectItem value="false">未发布</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {Object.values(theoryContentsFilters).some(v => v) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTheoryContentsFilters({
                    thinkingTypeId: '',
                    level: '',
                    difficulty: '',
                    validationStatus: '',
                    isPublished: '',
                    search: ''
                  })
                  setTheoryContentsPage(1)
                }}
              >
                清除筛选
              </Button>
            </div>
          )}
        </div>

        {/* Contents List */}
        {theoryContentsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : theoryContents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>暂无理论内容</p>
            <p className="text-sm mt-1">点击"创建理论内容"开始添加理论知识</p>
          </div>
        ) : (
          <div className="space-y-4">
            {theoryContents.map((theory) => {
              const isExpanded = expandedTheoryId === theory.id
              return (
                <Card key={theory.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{theory.thinkingType.icon}</span>
                          <span className="font-medium text-gray-700">{theory.thinkingType.name}</span>
                          <Badge variant="outline">Level {theory.level}</Badge>
                          <Badge className={getDifficultyColor(theory.difficulty)}>
                            {theory.difficulty === 'beginner' ? '初级' : theory.difficulty === 'intermediate' ? '中级' : '高级'}
                          </Badge>
                          <Badge className={getValidationStatusColor(theory.validationStatus)}>
                            {theory.validationStatus === 'draft' ? '草稿' : theory.validationStatus === 'validated' ? '已验证' : '已发布'}
                          </Badge>
                          {theory.isPublished && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已发布
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{theory.title}</h3>
                        {theory.subtitle && (
                          <p className="text-sm text-gray-500 mb-2">{theory.subtitle}</p>
                        )}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{theory.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>⏱️ {theory.estimatedTime} 分钟</span>
                          <span>📚 {theory._count.userProgress} 人学习</span>
                          <span>💬 {theory._count.contentFeedback} 条反馈</span>
                          <span>📅 {new Date(theory.createdAt).toLocaleDateString('zh-CN')}</span>
                          {theory.version && <span>v{theory.version}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditTheoryDialog(theory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTheory(theory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTheoryId(isExpanded ? null : theory.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              收起
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              详情
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-6">
                        {/* Learning Objectives */}
                        {theory.learningObjectives && theory.learningObjectives.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">🎯 学习目标</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-purple-50 p-3 rounded-lg">
                              {theory.learningObjectives.map((obj: string, idx: number) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 3 Core Sections */}
                        {renderContentSection('📚 核心概念', theory.conceptsIntro, theory.conceptsContent, '1️⃣')}
                        {renderContentSection('🧠 思维模型', theory.modelsIntro, theory.modelsContent, '2️⃣')}
                        {renderContentSection('💡 实例演示', theory.demonstrationsIntro, theory.demonstrationsContent, '3️⃣')}

                        {/* Tags & Keywords */}
                        <div className="grid grid-cols-2 gap-4">
                          {theory.tags && theory.tags.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">🏷️ 标签</h4>
                              <div className="flex flex-wrap gap-2">
                                {theory.tags.map((tag: string, idx: number) => (
                                  <Badge key={idx} variant="secondary">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {theory.keywords && theory.keywords.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">🔑 关键词</h4>
                              <div className="flex flex-wrap gap-2">
                                {theory.keywords.map((keyword: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{keyword}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quality Metrics (V3) */}
                        {theory.qualityMetrics && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">📊 质量指标</h4>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm">
                              <pre className="text-xs text-gray-700">
                                {JSON.stringify(theory.qualityMetrics, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Review Notes */}
                        {theory.reviewNotes && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">📝 审核备注</h4>
                            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-gray-700">
                              {theory.reviewNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* Pagination */}
            {theoryContentsTotalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={theoryContentsPage === 1}
                  onClick={() => setTheoryContentsPage(theoryContentsPage - 1)}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  第 {theoryContentsPage} / {theoryContentsTotalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={theoryContentsPage === theoryContentsTotalPages}
                  onClick={() => setTheoryContentsPage(theoryContentsPage + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
