'use client'

import { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Database,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

export default function ConceptContentTab() {
  const [concepts, setConcepts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [thinkingTypes, setThinkingTypes] = useState<any[]>([])

  // 筛选条件
  const [filters, setFilters] = useState({
    thinkingTypeId: '',
    level: '',
    difficulty: '',
    isPublished: '',
    search: ''
  })

  // 对话框状态
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingConcept, setEditingConcept] = useState<any>(null)

  useEffect(() => {
    fetchThinkingTypes()
  }, [])

  useEffect(() => {
    fetchConcepts()
  }, [page, filters])

  const fetchThinkingTypes = async () => {
    try {
      const res = await fetch('/api/thinking-types')
      const result = await res.json()
      if (result.success) {
        setThinkingTypes(result.data)
      }
    } catch (error) {
      console.error('获取思维维度失败:', error)
    }
  }

  const fetchConcepts = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(filters.thinkingTypeId && { thinkingTypeId: filters.thinkingTypeId }),
        ...(filters.level && { level: filters.level }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.isPublished && { isPublished: filters.isPublished }),
        ...(filters.search && { search: filters.search })
      })

      const res = await fetch(`/api/admin/content/concepts?${params}`)
      const result = await res.json()

      if (result.success) {
        setConcepts(result.data.concepts)
        setTotalPages(result.data.pagination.totalPages)
        setTotal(result.data.pagination.total)
      } else {
        toast.error(result.error || '获取概念列表失败')
      }
    } catch (error) {
      console.error('获取概念列表失败:', error)
      toast.error('获取概念列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (concept: any) => {
    setEditingConcept(concept)
    setShowEditDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个概念吗？如果已有用户学习过，将无法删除。')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/content/concepts/${id}`, {
        method: 'DELETE'
      })

      const result = await res.json()

      if (result.success) {
        toast.success('删除成功')
        fetchConcepts()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleTogglePublish = async (concept: any) => {
    try {
      const res = await fetch(`/api/admin/content/concepts/${concept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !concept.isPublished
        })
      })

      const result = await res.json()

      if (result.success) {
        toast.success(concept.isPublished ? '已设为未发布' : '已发布')
        fetchConcepts()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const renderContentPreview = (title: string, intro: string | null, content: any, icon: any) => {
    if (!intro && (!content || !content.sections || content.sections.length === 0)) {
      return null
    }

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        {intro && (
          <div className="bg-blue-50 p-3 rounded-lg mb-2">
            <p className="text-sm text-gray-700 leading-relaxed">{intro}</p>
          </div>
        )}
        {content && content.sections && content.sections.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">共 {content.sections.length} 个部分</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总概念数</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已发布</p>
                <p className="text-2xl font-bold text-green-600">
                  {concepts.filter(c => c.isPublished).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI生成</p>
                <p className="text-2xl font-bold text-purple-600">
                  {concepts.filter(c => c.generatedBy === 'ai').length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">手动创建</p>
                <p className="text-2xl font-bold text-orange-600">
                  {concepts.filter(c => c.generatedBy === 'manual').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            筛选与搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select
              value={filters.thinkingTypeId}
              onValueChange={(value) => {
                setFilters({ ...filters, thinkingTypeId: value })
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="思维维度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部维度</SelectItem>
                {thinkingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.level}
              onValueChange={(value) => {
                setFilters({ ...filters, level: value })
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部级别</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.difficulty}
              onValueChange={(value) => {
                setFilters({ ...filters, difficulty: value })
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="难度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部难度</SelectItem>
                <SelectItem value="beginner">初级</SelectItem>
                <SelectItem value="intermediate">中级</SelectItem>
                <SelectItem value="advanced">高级</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isPublished}
              onValueChange={(value) => {
                setFilters({ ...filters, isPublished: value })
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="发布状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="true">已发布</SelectItem>
                <SelectItem value="false">未发布</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="搜索标题或描述..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1)
                  fetchConcepts()
                }
              }}
              className="md:col-span-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* 概念列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>概念列表 ({total})</CardTitle>
            <Button onClick={() => {
              setEditingConcept(null)
              setShowEditDialog(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              新增概念
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : concepts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">暂无概念内容</p>
            </div>
          ) : (
            <div className="space-y-4">
              {concepts.map((concept) => (
                <Card key={concept.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{concept.thinkingType.icon}</span>
                          <Badge variant="outline">{concept.thinkingType.name}</Badge>
                          <Badge variant="outline">Level {concept.level}</Badge>
                          <Badge variant="outline">顺序 #{concept.order}</Badge>
                          <Badge className={getDifficultyColor(concept.difficulty)}>
                            {concept.difficulty === 'beginner' ? '初级' :
                             concept.difficulty === 'intermediate' ? '中级' : '高级'}
                          </Badge>
                          {concept.isPublished ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已发布
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              未发布
                            </Badge>
                          )}
                          {concept.generatedBy === 'ai' && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI生成
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{concept.title}</h3>
                        {concept.subtitle && (
                          <p className="text-sm text-gray-600 mt-1">{concept.subtitle}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === concept.id ? null : concept.id)}
                        >
                          {expandedId === concept.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(concept)}
                        >
                          {concept.isPublished ? '取消发布' : '发布'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(concept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(concept.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedId === concept.id && (
                    <CardContent className="border-t pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">概念描述</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>
                        </div>

                        {renderContentPreview(
                          '核心概念',
                          concept.conceptsIntro,
                          concept.conceptsContent,
                          <BookOpen className="h-4 w-4" />
                        )}

                        {renderContentPreview(
                          '思维模型',
                          concept.modelsIntro,
                          concept.modelsContent,
                          <Database className="h-4 w-4" />
                        )}

                        {renderContentPreview(
                          '实例演示',
                          concept.demonstrationsIntro,
                          concept.demonstrationsContent,
                          <Eye className="h-4 w-4" />
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">预计时间</p>
                            <p className="text-sm font-medium">{concept.estimatedTime} 分钟</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">浏览量</p>
                            <p className="text-sm font-medium">{concept.viewCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">完成率</p>
                            <p className="text-sm font-medium">{concept.completionRate?.toFixed(1) || 0}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">平均评分</p>
                            <p className="text-sm font-medium">{concept.averageRating?.toFixed(1) || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                第 {page} 页，共 {totalPages} 页
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框（简化版） */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConcept ? '编辑概念' : '新增概念'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              提示：如需完整编辑功能，请使用批量生成脚本或直接修改数据库。
              此界面仅提供基础编辑功能。
            </p>
            {editingConcept && (
              <div>
                <p className="text-sm font-medium">概念ID: {editingConcept.id}</p>
                <p className="text-sm font-medium">标题: {editingConcept.title}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
