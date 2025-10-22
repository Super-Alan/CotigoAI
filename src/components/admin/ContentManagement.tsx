'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  BookOpen,
  MessageSquare,
  Target,
  Settings,
  Sparkles,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Topic {
  id: string
  topic: string
  category: string
  context: string
  referenceUniversity: string
  dimension: string
  difficulty: string
  tags: string[]
  thinkingFramework: any
  guidingQuestions: any[]
  expectedOutcomes: string[]
  isPublic: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface TopicFormData {
  topic: string
  category: string
  context: string
  referenceUniversity: string
  dimension: string
  difficulty: string
  tags: string[]
  thinkingFramework: any
  guidingQuestions: any[]
  expectedOutcomes: string[]
  isPublic: boolean
}

const CATEGORIES = [
  'policy', 'technology', 'social', 'ethics', 'science', 'philosophy'
]

const DIMENSIONS = [
  'causal_analysis', 'premise_challenge', 'fallacy_detection', 
  'iterative_reflection', 'connection_transfer'
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const LEVEL_CONFIGS = [
  {
    level: 1,
    name: '基础入门',
    description: '识别与理解 - 掌握基本概念和识别方法',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    guidedQuestionCount: '5-7个引导问题',
    scaffoldingRecommended: true
  },
  {
    level: 2,
    name: '初步应用',
    description: '简单分析 - 进行基础分析和简单应用',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    guidedQuestionCount: '4-6个引导问题',
    scaffoldingRecommended: true
  },
  {
    level: 3,
    name: '深入分析',
    description: '复杂推理 - 深入分析和复杂推理',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    guidedQuestionCount: '3-5个引导问题',
    scaffoldingRecommended: false
  },
  {
    level: 4,
    name: '综合运用',
    description: '跨域整合 - 综合运用多种思维工具',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    guidedQuestionCount: '2-4个引导问题',
    scaffoldingRecommended: false
  },
  {
    level: 5,
    name: '专家创新',
    description: '创新应用 - 创新性应用和拓展思维方法',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    guidedQuestionCount: '0-2个开放性引导问题',
    scaffoldingRecommended: false
  }
]

interface AIGenerationRequest {
  thinkingTypeId: string
  level: number
  count: number
  difficulty: string
  topics?: string[]
  customPrompt?: string
  includeScaffolding?: boolean
  includeCaseStudy?: boolean
}

interface AIGenerationResult {
  generated: number
  requested: number
  questions: Array<{
    id: string
    topic: string
    question?: string
    difficulty: string
    level: number
  }>
}

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState('topics')
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [isPublicFilter, setIsPublicFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState<TopicFormData>({
    topic: '',
    category: '',
    context: '',
    referenceUniversity: '',
    dimension: '',
    difficulty: 'beginner',
    tags: [],
    thinkingFramework: {},
    guidingQuestions: [],
    expectedOutcomes: [],
    isPublic: false
  })

  // AI Generation state
  const [aiGenerationOpen, setAiGenerationOpen] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGenerationRequest, setAiGenerationRequest] = useState<AIGenerationRequest>({
    thinkingTypeId: '',
    level: 1,
    count: 5,
    difficulty: 'intermediate',
    topics: [],
    customPrompt: '',
    includeScaffolding: true,  // Default enabled for Level 1-2
    includeCaseStudy: true      // Default enabled
  })
  const [aiGenerationResult, setAiGenerationResult] = useState<AIGenerationResult | null>(null)
  const [aiGenerationProgress, setAiGenerationProgress] = useState<string[]>([]) // Real-time progress messages
  const [thinkingTypes, setThinkingTypes] = useState<Array<{id: string, name: string, icon: string, description: string}>>([])

  // Questions bank state
  const [questions, setQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionsPage, setQuestionsPage] = useState(1)
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1)
  const [questionsFilters, setQuestionsFilters] = useState({
    thinkingTypeId: '',
    difficulty: '',
    level: '',
    search: ''
  })
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

  // Learning Content state (课程管理)
  const [learningContents, setLearningContents] = useState<any[]>([])
  const [learningContentsLoading, setLearningContentsLoading] = useState(false)
  const [learningContentsPage, setLearningContentsPage] = useState(1)
  const [learningContentsTotalPages, setLearningContentsTotalPages] = useState(1)
  const [learningContentsFilters, setLearningContentsFilters] = useState({
    thinkingTypeId: '',
    level: '',
    contentType: '',
    search: ''
  })
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null)
  const [createContentDialogOpen, setCreateContentDialogOpen] = useState(false)
  const [contentFormData, setContentFormData] = useState({
    thinkingTypeId: '',
    level: 1,
    contentType: 'concepts',
    title: '',
    description: '',
    content: {},
    estimatedTime: 10,
    orderIndex: 1,
    tags: [] as string[],
    prerequisites: [] as string[]
  })
  const [isCreatingContent, setIsCreatingContent] = useState(false)

  // Fetch thinking types for AI generation
  const fetchThinkingTypes = async () => {
    try {
      const response = await fetch('/api/thinking-types')
      if (!response.ok) throw new Error('Failed to fetch thinking types')
      const data = await response.json()
      // API returns { success: true, data: { types: [...] } }
      setThinkingTypes(data.data?.types || [])
    } catch (error) {
      console.error('Failed to fetch thinking types:', error)
      toast.error('加载思维类型失败')
    }
  }

  // Fetch questions bank
  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true)
      const params = new URLSearchParams({
        page: questionsPage.toString(),
        limit: '10'
      })
      if (questionsFilters.thinkingTypeId) params.append('thinkingTypeId', questionsFilters.thinkingTypeId)
      if (questionsFilters.difficulty) params.append('difficulty', questionsFilters.difficulty)
      if (questionsFilters.level) params.append('level', questionsFilters.level)
      if (questionsFilters.search) params.append('search', questionsFilters.search)

      const response = await fetch(`/api/admin/content/questions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch questions')

      const data = await response.json()
      setQuestions(data.data.questions)
      setQuestionsTotalPages(data.data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('加载题库失败')
    } finally {
      setQuestionsLoading(false)
    }
  }

  // AI Generation handlers
  const handleAIGeneration = async () => {
    // Validate required fields
    if (!aiGenerationRequest.thinkingTypeId) {
      toast.error('请先选择思维类型')
      return
    }

    try {
      setAiGenerating(true)
      setAiGenerationResult(null)
      setAiGenerationProgress([]) // Clear previous progress

      const response = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiGenerationRequest)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI生成失败')
      }

      // 检查是否是流式响应
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        // 处理流式响应
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('无法读取响应流')
        }

        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.status) {
                  case 'generating':
                    setAiGenerationProgress(prev => [...prev, `⚡ ${data.message}`])
                    toast.info(data.message)
                    break
                  case 'progress':
                    // Show real-time AI generation progress
                    console.log('AI生成进度:', data.chunk)
                    setAiGenerationProgress(prev => [...prev, `🤔 生成中: ${data.chunk?.substring(0, 100) || '...'}`])
                    break
                  case 'parsed':
                    setAiGenerationProgress(prev => [...prev, `✅ AI已生成 ${data.count} 道题目`])
                    toast.info(`AI已生成 ${data.count} 道题目，正在保存...`)
                    break
                  case 'saving':
                    setAiGenerationProgress(prev => [...prev, `💾 [${data.current}/${data.total}] ${data.topic}`])
                    toast.info(`正在保存第 ${data.current}/${data.total} 道题目: ${data.topic}`)
                    break
                  case 'completed':
                    setAiGenerationProgress(prev => [...prev, `🎉 完成！已保存 ${data.data.generated} 道题目`])
                    setAiGenerationResult(data.data)
                    toast.success(`成功生成并保存 ${data.data.generated} 道题目！`)
                    break
                  case 'error':
                    setAiGenerationProgress(prev => [...prev, `❌ 错误: ${data.message}`])
                    toast.error(data.message)
                    break
                }
              } catch (e) {
                console.error('解析SSE消息失败:', e)
              }
            }
          }
        }
      } else {
        // 非流式响应的回退逻辑
        const data = await response.json()
        setAiGenerationResult(data.data)
        toast.success(`成功生成 ${data.data.generated} 道题目`)
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      toast.error(error instanceof Error ? error.message : 'AI生成失败')
    } finally {
      setAiGenerating(false)
    }
  }

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
        ...(isPublicFilter !== 'all' && { isPublic: isPublicFilter })
      })

      const response = await fetch(`/api/admin/content/topics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch topics')
      
      const data = await response.json()
      setTopics(data.topics)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch topics:', error)
      toast.error('获取话题列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
    fetchThinkingTypes()
  }, [currentPage, searchTerm, categoryFilter, difficultyFilter, isPublicFilter])

  // Load questions when switching to questions tab
  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions()
    }
  }, [activeTab, questionsPage, questionsFilters])

  // Fetch learning contents
  const fetchLearningContents = async () => {
    try {
      setLearningContentsLoading(true)
      const params = new URLSearchParams({
        page: learningContentsPage.toString(),
        limit: '10'
      })
      if (learningContentsFilters.thinkingTypeId) params.append('thinkingTypeId', learningContentsFilters.thinkingTypeId)
      if (learningContentsFilters.level) params.append('level', learningContentsFilters.level)
      if (learningContentsFilters.contentType) params.append('contentType', learningContentsFilters.contentType)
      if (learningContentsFilters.search) params.append('search', learningContentsFilters.search)

      const response = await fetch(`/api/admin/content/learning-content?${params}`)
      if (!response.ok) throw new Error('Failed to fetch learning contents')

      const data = await response.json()
      setLearningContents(data.data.contents)
      setLearningContentsTotalPages(data.data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch learning contents:', error)
      toast.error('加载学习内容失败')
    } finally {
      setLearningContentsLoading(false)
    }
  }

  // Load learning contents when switching to lessons tab
  useEffect(() => {
    if (activeTab === 'lessons') {
      fetchLearningContents()
    }
  }, [activeTab, learningContentsPage, learningContentsFilters])

  // Create learning content handler
  const handleCreateLearningContent = async () => {
    try {
      // Validation
      if (!contentFormData.thinkingTypeId || !contentFormData.title || !contentFormData.description) {
        toast.error('请填写必填字段')
        return
      }

      setIsCreatingContent(true)

      const response = await fetch('/api/admin/content/learning-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentFormData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建失败')
      }

      toast.success('学习内容创建成功')
      setCreateContentDialogOpen(false)

      // Reset form
      setContentFormData({
        thinkingTypeId: '',
        level: 1,
        contentType: 'concepts',
        title: '',
        description: '',
        content: {},
        estimatedTime: 10,
        orderIndex: 1,
        tags: [],
        prerequisites: []
      })

      // Refresh list
      fetchLearningContents()
    } catch (error) {
      console.error('Failed to create learning content:', error)
      toast.error(error instanceof Error ? error.message : '创建学习内容失败')
    } finally {
      setIsCreatingContent(false)
    }
  }

  const handleCreateTopic = async () => {
    try {
      const response = await fetch('/api/admin/content/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create topic')
      
      toast.success('话题创建成功')
      setIsDialogOpen(false)
      resetForm()
      fetchTopics()
    } catch (error) {
      console.error('Failed to create topic:', error)
      toast.error('话题创建失败')
    }
  }

  const handleUpdateTopic = async () => {
    if (!editingTopic) return

    try {
      const response = await fetch(`/api/admin/content/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update topic')
      
      toast.success('话题更新成功')
      setIsDialogOpen(false)
      setEditingTopic(null)
      resetForm()
      fetchTopics()
    } catch (error) {
      console.error('Failed to update topic:', error)
      toast.error('话题更新失败')
    }
  }

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('确定要删除这个话题吗？')) return

    try {
      const response = await fetch(`/api/admin/content/topics/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete topic')
      
      toast.success('话题删除成功')
      fetchTopics()
    } catch (error) {
      console.error('Failed to delete topic:', error)
      toast.error('话题删除失败')
    }
  }

  const resetForm = () => {
    setFormData({
      topic: '',
      category: '',
      context: '',
      referenceUniversity: '',
      dimension: '',
      difficulty: 'beginner',
      tags: [],
      thinkingFramework: {},
      guidingQuestions: [],
      expectedOutcomes: [],
      isPublic: false
    })
  }

  const openEditDialog = (topic: Topic) => {
    setEditingTopic(topic)
    setFormData({
      topic: topic.topic,
      category: topic.category,
      context: topic.context,
      referenceUniversity: topic.referenceUniversity,
      dimension: topic.dimension,
      difficulty: topic.difficulty,
      tags: topic.tags,
      thinkingFramework: topic.thinkingFramework,
      guidingQuestions: topic.guidingQuestions,
      expectedOutcomes: topic.expectedOutcomes,
      isPublic: topic.isPublic
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingTopic(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      'causal_analysis': '因果分析',
      'premise_challenge': '前提质疑',
      'fallacy_detection': '谬误检测',
      'iterative_reflection': '迭代反思',
      'connection_transfer': '知识迁移'
    }
    return labels[dimension] || dimension
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const getContentTypeLabel = (contentType: string) => {
    const labels: Record<string, string> = {
      'concepts': '概念知识',
      'frameworks': '思维框架',
      'examples': '案例示例',
      'practice_guide': '练习指南'
    }
    return labels[contentType] || contentType
  }

  const getContentTypeColor = (contentType: string) => {
    const colors: Record<string, string> = {
      'concepts': 'bg-blue-100 text-blue-800',
      'frameworks': 'bg-purple-100 text-purple-800',
      'examples': 'bg-green-100 text-green-800',
      'practice_guide': 'bg-orange-100 text-orange-800'
    }
    return colors[contentType] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">内容管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            话题管理
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            题库管理
          </TabsTrigger>
          <TabsTrigger value="ai-generation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI生成
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            课程管理
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            模板管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>话题管理</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setAiGenerationOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI生成话题
                  </Button>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建话题
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 搜索和筛选 */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索话题..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="难度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部难度</SelectItem>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={isPublicFilter} onValueChange={setIsPublicFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="可见性" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="true">公开</SelectItem>
                    <SelectItem value="false">私有</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 话题列表 */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>话题</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>维度</TableHead>
                      <TableHead>难度</TableHead>
                      <TableHead>使用次数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium">{topic.topic}</div>
                          <div className="text-sm text-gray-500 truncate">{topic.context}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{topic.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getDimensionLabel(topic.dimension)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(topic.difficulty)}>
                            {topic.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{topic.usageCount}</TableCell>
                        <TableCell>
                          <Badge variant={topic.isPublic ? "default" : "secondary"}>
                            {topic.isPublic ? '公开' : '私有'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(topic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTopic(topic.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* 分页 */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  第 {currentPage} 页，共 {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New AI Generation Tab */}
        <TabsContent value="ai-generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI 智能内容生成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generation Parameters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">生成参数</h3>
                  
                  <div>
                    <Label htmlFor="thinking-type">思维类型</Label>
                    <Select
                      value={aiGenerationRequest.thinkingTypeId}
                      onValueChange={(value) => setAiGenerationRequest({
                        ...aiGenerationRequest,
                        thinkingTypeId: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择思维类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {thinkingTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{type.name}</span>
                                <span className="text-xs text-gray-500">{type.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {aiGenerationRequest.thinkingTypeId && (
                      <div className="mt-2 p-3 rounded-lg bg-purple-50 border border-purple-200">
                        {thinkingTypes.find(t => t.id === aiGenerationRequest.thinkingTypeId) && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-lg">{thinkingTypes.find(t => t.id === aiGenerationRequest.thinkingTypeId)?.icon}</span>
                            <div>
                              <div className="font-medium text-purple-900">
                                {thinkingTypes.find(t => t.id === aiGenerationRequest.thinkingTypeId)?.name}
                              </div>
                              <div className="text-purple-700 text-xs mt-1">
                                {thinkingTypes.find(t => t.id === aiGenerationRequest.thinkingTypeId)?.description}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="level">认知级别</Label>
                    <Select
                      value={aiGenerationRequest.level.toString()}
                      onValueChange={(value) => {
                        const level = parseInt(value)
                        const levelConfig = LEVEL_CONFIGS[level - 1]
                        setAiGenerationRequest({
                          ...aiGenerationRequest,
                          level,
                          // Auto-enable scaffolding for Level 1-2
                          includeScaffolding: levelConfig.scaffoldingRecommended
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_CONFIGS.map(config => (
                          <SelectItem key={config.level} value={config.level.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">Level {config.level}: {config.name}</span>
                              <span className="text-xs text-gray-500">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {aiGenerationRequest.level > 0 && (
                      <div className={`mt-2 p-3 rounded-lg ${LEVEL_CONFIGS[aiGenerationRequest.level - 1].bgColor}`}>
                        <div className="text-sm">
                          <div className={`font-medium ${LEVEL_CONFIGS[aiGenerationRequest.level - 1].color}`}>
                            {LEVEL_CONFIGS[aiGenerationRequest.level - 1].name}
                          </div>
                          <div className="text-gray-600 text-xs mt-1">
                            {LEVEL_CONFIGS[aiGenerationRequest.level - 1].description}
                          </div>
                          <div className="text-gray-700 text-xs mt-2">
                            引导问题: {LEVEL_CONFIGS[aiGenerationRequest.level - 1].guidedQuestionCount}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="count">生成数量</Label>
                      <Select
                        value={aiGenerationRequest.count.toString()}
                        onValueChange={(value) => setAiGenerationRequest({
                          ...aiGenerationRequest,
                          count: parseInt(value)
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 5, 8, 10, 15].map(count => (
                            <SelectItem key={count} value={count.toString()}>
                              {count} 道题目
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">难度等级</Label>
                      <Select
                        value={aiGenerationRequest.difficulty}
                        onValueChange={(value) => setAiGenerationRequest({
                          ...aiGenerationRequest,
                          difficulty: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">初级</SelectItem>
                          <SelectItem value="intermediate">中级</SelectItem>
                          <SelectItem value="advanced">高级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scaffolding and Case Study Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <Label htmlFor="scaffolding" className="text-sm font-medium">
                          包含思维脚手架
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          {aiGenerationRequest.level <= 2
                            ? '推荐为Level 1-2提供详细的思维框架和提示'
                            : 'Level 3+通常不需要脚手架，鼓励自主构建'
                          }
                        </p>
                      </div>
                      <Switch
                        id="scaffolding"
                        checked={aiGenerationRequest.includeScaffolding}
                        onCheckedChange={(checked) => setAiGenerationRequest({
                          ...aiGenerationRequest,
                          includeScaffolding: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <Label htmlFor="case-study" className="text-sm font-medium">
                          生成案例分析
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          为每道题目生成详细的案例分析和应用场景
                        </p>
                      </div>
                      <Switch
                        id="case-study"
                        checked={aiGenerationRequest.includeCaseStudy}
                        onCheckedChange={(checked) => setAiGenerationRequest({
                          ...aiGenerationRequest,
                          includeCaseStudy: checked
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-prompt">自定义提示词（可选）</Label>
                    <Textarea
                      id="custom-prompt"
                      value={aiGenerationRequest.customPrompt}
                      onChange={(e) => setAiGenerationRequest({
                        ...aiGenerationRequest,
                        customPrompt: e.target.value
                      })}
                      placeholder="输入特定的生成要求或主题方向..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleAIGeneration}
                    disabled={aiGenerating || !aiGenerationRequest.thinkingTypeId}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        AI 生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        开始生成
                      </>
                    )}
                  </Button>
                </div>

                {/* Generation Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">生成结果</h3>

                  {/* Real-time Progress Display */}
                  {aiGenerating && aiGenerationProgress.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2 text-blue-700 font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>实时进度</span>
                      </div>
                      <div className="space-y-1 text-sm font-mono">
                        {aiGenerationProgress.map((msg, idx) => (
                          <div key={idx} className="text-gray-700 leading-relaxed">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiGenerationResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>生成完成！</span>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">生成题目：</span>
                            <span className="text-green-700">{aiGenerationResult.questions?.length || aiGenerationResult.generated || 0} 道</span>
                          </div>
                          <div>
                            <span className="font-medium">请求数量：</span>
                            <span className="text-green-700">{aiGenerationResult.requested || 0} 道</span>
                          </div>
                        </div>
                      </div>

                      {/* Preview of generated content */}
                      {aiGenerationResult.questions && aiGenerationResult.questions.length > 0 && (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          <h4 className="font-medium">题目预览：</h4>
                          {aiGenerationResult.questions.slice(0, 3).map((question, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                              <div className="font-medium mb-1">{question.question || question.topic}</div>
                              {question.difficulty && (
                                <div className="text-gray-600 text-xs">
                                  难度: {question.difficulty} | Level: {question.level || 1}
                                </div>
                              )}
                            </div>
                          ))}
                          {aiGenerationResult.questions.length > 3 && (
                            <div className="text-sm text-gray-500 text-center">
                              还有 {aiGenerationResult.questions.length - 3} 道题目...
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setAiGenerationResult(null)
                            setAiGenerationProgress([])
                          }}
                          className="flex-1"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          重新生成
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>配置参数后点击"开始生成"</p>
                      <p className="text-sm">AI将为您智能生成高质量的批判性思维题目</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Generation Tips */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-2">AI生成提示</h4>
                    <ul className="space-y-1 text-blue-800">
                      <li>• <strong>Level系统</strong>：选择1-5级认知层次，AI会生成对应难度和脚手架</li>
                      <li>• <strong>思维脚手架</strong>：Level 1-2推荐启用，提供详细的思维框架</li>
                      <li>• <strong>案例分析</strong>：启用后为每道题生成专业的案例解析</li>
                      <li>• <strong>引导问题</strong>：根据Level自动调整数量（Level 1: 5-7个，Level 5: 0-2个）</li>
                      <li>• 自定义提示词可以指定特定的主题领域或要求</li>
                      <li>• 建议先预览生成结果，确认质量后再保存到题库</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>题库管理</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('ai-generation')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI生成题目
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <Input
                    placeholder="搜索题目、内容..."
                    value={questionsFilters.search}
                    onChange={(e) => {
                      setQuestionsFilters({ ...questionsFilters, search: e.target.value })
                      setQuestionsPage(1)
                    }}
                  />

                  {/* Thinking Type */}
                  <Select
                    value={questionsFilters.thinkingTypeId || undefined}
                    onValueChange={(value) => {
                      setQuestionsFilters({ ...questionsFilters, thinkingTypeId: value === 'all' ? '' : value })
                      setQuestionsPage(1)
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

                  {/* Difficulty */}
                  <Select
                    value={questionsFilters.difficulty || undefined}
                    onValueChange={(value) => {
                      setQuestionsFilters({ ...questionsFilters, difficulty: value === 'all' ? '' : value })
                      setQuestionsPage(1)
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

                  {/* Level */}
                  <Select
                    value={questionsFilters.level || undefined}
                    onValueChange={(value) => {
                      setQuestionsFilters({ ...questionsFilters, level: value === 'all' ? '' : value })
                      setQuestionsPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部Level</SelectItem>
                      <SelectItem value="1">Level 1 - 基础入门</SelectItem>
                      <SelectItem value="2">Level 2 - 初步应用</SelectItem>
                      <SelectItem value="3">Level 3 - 深入分析</SelectItem>
                      <SelectItem value="4">Level 4 - 综合运用</SelectItem>
                      <SelectItem value="5">Level 5 - 专家创新</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Questions List */}
              {questionsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">加载中...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无题目</p>
                  <p className="text-sm mt-1">使用AI生成功能创建新题目</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => {
                    const isExpanded = expandedQuestionId === question.id
                    return (
                      <Card key={question.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{question.thinkingType.icon}</span>
                                <span className="font-medium text-gray-700">{question.thinkingType.name}</span>
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty === 'beginner' ? '初级' : question.difficulty === 'intermediate' ? '中级' : '高级'}
                                </Badge>
                                <Badge variant="outline">Level {question.level}</Badge>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{question.topic}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.context}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>📝 {question.guidingQuestions.length} 个引导问题</span>
                                <span>🎯 {question._count.practiceSessions} 次练习</span>
                                <span>📅 {new Date(question.createdAt).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
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

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t space-y-6">
                              {/* Full Context */}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">📖 题目背景</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{question.context}</p>
                              </div>

                              {/* Question */}
                              {question.question && question.question !== question.topic && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">❓ 问题描述</h4>
                                  <p className="text-sm text-gray-600">{question.question}</p>
                                </div>
                              )}

                              {/* Learning Objectives */}
                              {question.learningObjectives && question.learningObjectives.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">🎯 学习目标</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {question.learningObjectives.map((obj: string, idx: number) => (
                                      <li key={idx}>{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Guiding Questions */}
                              {question.guidingQuestions.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">💡 引导问题</h4>
                                  <div className="space-y-2">
                                    {question.guidingQuestions.map((gq: any, idx: number) => (
                                      <div key={gq.id} className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">
                                          {idx + 1}. {gq.question}
                                        </p>
                                        {gq.purpose && (
                                          <p className="text-xs text-blue-700 mt-1">💭 {gq.purpose}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Scaffolding (for Level 1-3) */}
                              {question.scaffolding && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">🏗️ 思维脚手架</h4>
                                  <div className="bg-purple-50 p-4 rounded-lg space-y-2 text-sm">
                                    {question.scaffolding.keyPrompt && (
                                      <p className="text-purple-900">
                                        <strong>关键提示:</strong> {question.scaffolding.keyPrompt}
                                      </p>
                                    )}
                                    {question.scaffolding.visualAid && (
                                      <p className="text-purple-900">
                                        <strong>可视化辅助:</strong> {question.scaffolding.visualAid}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Expected Outcomes */}
                              {question.expectedOutcomes && question.expectedOutcomes.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">✨ 期望成果</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {question.expectedOutcomes.map((outcome: string, idx: number) => (
                                      <li key={idx}>{outcome}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Tags */}
                              {question.tags && question.tags.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">🏷️ 标签</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {question.tags.map((tag: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">{tag}</Badge>
                                    ))}
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
                  {questionsTotalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={questionsPage === 1}
                        onClick={() => setQuestionsPage(p => p - 1)}
                      >
                        上一页
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-600">
                        第 {questionsPage} / {questionsTotalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={questionsPage === questionsTotalPages}
                        onClick={() => setQuestionsPage(p => p + 1)}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>课程管理 - Level 学习内容</CardTitle>
                <Button
                  variant="default"
                  onClick={() => setCreateContentDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建学习内容
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <Input
                    placeholder="搜索标题、描述..."
                    value={learningContentsFilters.search}
                    onChange={(e) => {
                      setLearningContentsFilters({ ...learningContentsFilters, search: e.target.value })
                      setLearningContentsPage(1)
                    }}
                  />

                  {/* Thinking Type */}
                  <Select
                    value={learningContentsFilters.thinkingTypeId || undefined}
                    onValueChange={(value) => {
                      setLearningContentsFilters({ ...learningContentsFilters, thinkingTypeId: value === 'all' ? '' : value })
                      setLearningContentsPage(1)
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
                    value={learningContentsFilters.level || undefined}
                    onValueChange={(value) => {
                      setLearningContentsFilters({ ...learningContentsFilters, level: value === 'all' ? '' : value })
                      setLearningContentsPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部Level</SelectItem>
                      <SelectItem value="1">Level 1 - 基础入门</SelectItem>
                      <SelectItem value="2">Level 2 - 初步应用</SelectItem>
                      <SelectItem value="3">Level 3 - 深入分析</SelectItem>
                      <SelectItem value="4">Level 4 - 综合运用</SelectItem>
                      <SelectItem value="5">Level 5 - 专家创新</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Content Type */}
                  <Select
                    value={learningContentsFilters.contentType || undefined}
                    onValueChange={(value) => {
                      setLearningContentsFilters({ ...learningContentsFilters, contentType: value === 'all' ? '' : value })
                      setLearningContentsPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部内容类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部内容</SelectItem>
                      <SelectItem value="concepts">📚 概念知识</SelectItem>
                      <SelectItem value="frameworks">🔧 思维框架</SelectItem>
                      <SelectItem value="examples">💡 案例示例</SelectItem>
                      <SelectItem value="practice_guide">📝 练习指南</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Quick Filter Chips */}
                  <div className="flex items-center gap-2">
                    {(learningContentsFilters.thinkingTypeId || learningContentsFilters.level || learningContentsFilters.contentType || learningContentsFilters.search) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLearningContentsFilters({
                            thinkingTypeId: '',
                            level: '',
                            contentType: '',
                            search: ''
                          })
                          setLearningContentsPage(1)
                        }}
                      >
                        清除筛选
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contents List */}
              {learningContentsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">加载中...</p>
                </div>
              ) : learningContents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无学习内容</p>
                  <p className="text-sm mt-1">点击"创建学习内容"开始添加课程资料</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningContents.map((content) => {
                    const isExpanded = expandedContentId === content.id
                    return (
                      <Card key={content.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{content.thinkingType.icon}</span>
                                <span className="font-medium text-gray-700">{content.thinkingType.name}</span>
                                <Badge variant="outline">Level {content.level}</Badge>
                                <Badge className={getContentTypeColor(content.contentType)}>
                                  {getContentTypeLabel(content.contentType)}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>⏱️ {content.estimatedTime} 分钟</span>
                                <span>📅 {new Date(content.createdAt).toLocaleDateString('zh-CN')}</span>
                                {content.tags && content.tags.length > 0 && (
                                  <span>🏷️ {content.tags.length} 个标签</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedContentId(isExpanded ? null : content.id)}
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

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t space-y-6">
                              {/* Full Description */}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">📖 详细描述</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{content.description}</p>
                              </div>

                              {/* Content Preview */}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">📄 内容预览</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {JSON.stringify(content.content, null, 2)}
                                  </pre>
                                </div>
                              </div>

                              {/* Tags */}
                              {content.tags && content.tags.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">🏷️ 标签</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {content.tags.map((tag: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Prerequisites */}
                              {content.prerequisites && content.prerequisites.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">📚 前置内容</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {content.prerequisites.map((prereq: string, idx: number) => (
                                      <Badge key={idx} variant="outline">{prereq}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Order Index */}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">📊 排序索引</h4>
                                <p className="text-sm text-gray-600">显示顺序: {content.orderIndex}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Pagination */}
                  {learningContentsTotalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={learningContentsPage === 1}
                        onClick={() => setLearningContentsPage(p => p - 1)}
                      >
                        上一页
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-600">
                        第 {learningContentsPage} / {learningContentsTotalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={learningContentsPage === learningContentsTotalPages}
                        onClick={() => setLearningContentsPage(p => p + 1)}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>模板管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                模板管理功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generation Dialog */}
      <Dialog open={aiGenerationOpen} onOpenChange={setAiGenerationOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI 智能内容生成
            </DialogTitle>
            <DialogDescription>
              使用 Qwen AI 智能生成高质量的批判性思维练习题目
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Generation Presets */}
            <div>
              <h3 className="text-lg font-semibold mb-3">快速生成模板</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left"
                  onClick={() => setAiGenerationRequest({
                    ...aiGenerationRequest,
                    level: 1,
                    count: 5,
                    difficulty: 'beginner',
                    includeScaffolding: true,
                    includeCaseStudy: true,
                    customPrompt: '适合初学者的基础批判性思维题目'
                  })}
                >
                  <div>
                    <div className="font-medium">初学者套餐</div>
                    <div className="text-sm text-gray-500">Level 1: {LEVEL_CONFIGS[0].name}</div>
                    <div className="text-xs text-gray-400 mt-1">5题 • 含脚手架 • 基础难度</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left"
                  onClick={() => setAiGenerationRequest({
                    ...aiGenerationRequest,
                    level: 3,
                    count: 8,
                    difficulty: 'intermediate',
                    includeScaffolding: false,
                    includeCaseStudy: true,
                    customPrompt: '中等难度的综合性批判思维训练'
                  })}
                >
                  <div>
                    <div className="font-medium">进阶套餐</div>
                    <div className="text-sm text-gray-500">Level 3: {LEVEL_CONFIGS[2].name}</div>
                    <div className="text-xs text-gray-400 mt-1">8题 • 自主构建 • 中等难度</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left"
                  onClick={() => setAiGenerationRequest({
                    ...aiGenerationRequest,
                    level: 5,
                    count: 10,
                    difficulty: 'advanced',
                    includeScaffolding: false,
                    includeCaseStudy: true,
                    customPrompt: '高难度的复杂批判性思维挑战'
                  })}
                >
                  <div>
                    <div className="font-medium">专家套餐</div>
                    <div className="text-sm text-gray-500">Level 5: {LEVEL_CONFIGS[4].name}</div>
                    <div className="text-xs text-gray-400 mt-1">10题 • 创新应用 • 高级难度</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Same content as the AI generation tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ... same generation parameters and results as above ... */}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiGenerationOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Learning Content Dialog */}
      <Dialog open={createContentDialogOpen} onOpenChange={setCreateContentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              创建学习内容
            </DialogTitle>
            <DialogDescription>
              为特定Level和思维类型创建学习资料（概念知识、思维框架、案例示例、练习指南）
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Thinking Type */}
            <div>
              <Label htmlFor="content-thinking-type">思维类型 *</Label>
              <Select
                value={contentFormData.thinkingTypeId}
                onValueChange={(value) => setContentFormData({ ...contentFormData, thinkingTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择思维类型" />
                </SelectTrigger>
                <SelectContent>
                  {thinkingTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level and Content Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-level">Level *</Label>
                <Select
                  value={contentFormData.level.toString()}
                  onValueChange={(value) => setContentFormData({ ...contentFormData, level: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_CONFIGS.map(config => (
                      <SelectItem key={config.level} value={config.level.toString()}>
                        Level {config.level}: {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-type">内容类型 *</Label>
                <Select
                  value={contentFormData.contentType}
                  onValueChange={(value) => setContentFormData({ ...contentFormData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concepts">📚 概念知识</SelectItem>
                    <SelectItem value="frameworks">🔧 思维框架</SelectItem>
                    <SelectItem value="examples">💡 案例示例</SelectItem>
                    <SelectItem value="practice_guide">📝 练习指南</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="content-title">标题 *</Label>
              <Input
                id="content-title"
                value={contentFormData.title}
                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                placeholder="例如：因果分析的基本概念"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="content-description">描述 *</Label>
              <Textarea
                id="content-description"
                value={contentFormData.description}
                onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                placeholder="详细描述这个学习内容的目标和要点..."
                rows={3}
              />
            </div>

            {/* Content (JSON) */}
            <div>
              <Label htmlFor="content-content">内容主体（JSON格式）</Label>
              <Textarea
                id="content-content"
                value={JSON.stringify(contentFormData.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || '{}')
                    setContentFormData({ ...contentFormData, content: parsed })
                  } catch (err) {
                    // Invalid JSON, keep current value
                  }
                }}
                placeholder='{"sections": [{"type": "text", "content": "..."}]}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                支持富文本、交互元素等。格式示例：{`{"sections": [{"type": "text", "content": "..."}]}`}
              </p>
            </div>

            {/* Estimated Time and Order Index */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-time">预计学习时间（分钟）</Label>
                <Input
                  id="content-time"
                  type="number"
                  min="1"
                  value={contentFormData.estimatedTime}
                  onChange={(e) => setContentFormData({ ...contentFormData, estimatedTime: parseInt(e.target.value) || 10 })}
                />
              </div>

              <div>
                <Label htmlFor="content-order">排序索引</Label>
                <Input
                  id="content-order"
                  type="number"
                  min="1"
                  value={contentFormData.orderIndex}
                  onChange={(e) => setContentFormData({ ...contentFormData, orderIndex: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="content-tags">标签（逗号分隔）</Label>
              <Input
                id="content-tags"
                value={contentFormData.tags.join(', ')}
                onChange={(e) => setContentFormData({
                  ...contentFormData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="例如：基础概念, 初学者, 必修"
              />
            </div>

            {/* Prerequisites */}
            <div>
              <Label htmlFor="content-prereq">前置内容ID（逗号分隔）</Label>
              <Input
                id="content-prereq"
                value={contentFormData.prerequisites.join(', ')}
                onChange={(e) => setContentFormData({
                  ...contentFormData,
                  prerequisites: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="例如：clm123abc, clm456def"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateContentDialogOpen(false)}
              disabled={isCreatingContent}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateLearningContent}
              disabled={isCreatingContent || !contentFormData.thinkingTypeId || !contentFormData.title || !contentFormData.description}
            >
              {isCreatingContent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  创建
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... existing topic dialog ... */}
    </div>
  )
}