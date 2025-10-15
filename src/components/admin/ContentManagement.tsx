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
  Settings
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
  }, [currentPage, searchTerm, categoryFilter, difficultyFilter, isPublicFilter])

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">内容管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            话题管理
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            题库管理
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
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建话题
                </Button>
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

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>题库管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                题库管理功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>课程管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                课程管理功能开发中...
              </div>
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

      {/* 话题编辑/创建对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? '编辑话题' : '创建话题'}
            </DialogTitle>
            <DialogDescription>
              {editingTopic ? '修改话题信息' : '创建新的对话话题'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">话题标题</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="输入话题标题"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">难度</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dimension">思维维度</Label>
              <Select
                value={formData.dimension}
                onValueChange={(value) => setFormData({ ...formData, dimension: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择思维维度" />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map(dim => (
                    <SelectItem key={dim} value={dim}>
                      {getDimensionLabel(dim)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="context">话题背景</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="输入话题背景信息"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="referenceUniversity">参考院校</Label>
              <Input
                id="referenceUniversity"
                value={formData.referenceUniversity}
                onChange={(e) => setFormData({ ...formData, referenceUniversity: e.target.value })}
                placeholder="输入参考院校"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
              <Label htmlFor="isPublic">公开话题</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}>
              {editingTopic ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}