'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Eye, 
  Mail, 
  Ban, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'
import { UsersFilters } from './UsersFilters'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
  lastActiveAt: string | null
  conversationCount: number
  status: 'active' | 'inactive' | 'banned'
}

interface UsersListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UsersListProps {
  filters: {
    search: string
    status: string
    dateRange: string
    sortBy: string
  }
  onFiltersChange?: (filters: any) => void
}

export function UsersList({ filters: externalFilters, onFiltersChange }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...externalFilters
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data: UsersListResponse = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, externalFilters])

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'send-email', data?: any) => {
    try {
      let endpoint = `/api/admin/users/${userId}/${action}`
      let method = 'POST'
      let body = undefined

      if (action === 'send-email') {
        body = JSON.stringify(data)
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body
      })

      if (!response.ok) throw new Error(`Failed to ${action} user`)
      
      const result = await response.json()
      toast.success(result.message)
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      toast.error(`${action === 'ban' ? '禁用' : action === 'unban' ? '解除禁用' : '发送邮件'}失败`)
    }
  }

  const handleBatchAction = async (action: string, data?: any) => {
    if (selectedUsers.length === 0) {
      toast.error('请先选择用户')
      return
    }

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
          data
        })
      })

      if (!response.ok) throw new Error('Batch action failed')
      
      const result = await response.json()
      
      // Show results
      const successCount = result.results.filter((r: any) => r.success).length
      const failCount = result.results.length - successCount
      
      if (successCount > 0) {
        toast.success(`成功处理 ${successCount} 个用户`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} 个用户处理失败`)
      }
      
      // Clear selection and refresh
      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      console.error('Batch action error:', error)
      toast.error('批量操作失败')
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">活跃</Badge>
      case 'inactive':
        return <Badge variant="secondary">非活跃</Badge>
      case 'banned':
        return <Badge variant="destructive">已禁用</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: zhCN 
    })
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <UsersFilters 
          filters={externalFilters}
          onFiltersChange={onFiltersChange || (() => {})}
          selectedUsers={selectedUsers}
          onBatchAction={handleBatchAction}
        />
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UsersFilters 
        filters={externalFilters}
        onFiltersChange={onFiltersChange || (() => {})}
        selectedUsers={selectedUsers}
        onBatchAction={handleBatchAction}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>用户列表</span>
            <span className="text-sm font-normal text-gray-500">
              共 {pagination.total} 个用户
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">没有找到符合条件的用户</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>最后活跃</TableHead>
                    <TableHead>对话数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ''} alt={user.name || ''} />
                            <AvatarFallback>
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name || '未设置姓名'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastActiveAt ? formatDate(user.lastActiveAt) : '从未活跃'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {user.conversationCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const subject = prompt('邮件主题:')
                              const message = prompt('邮件内容:')
                              if (subject && message) {
                                handleUserAction(user.id, 'send-email', { subject, message })
                              }
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {user.status === 'banned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'ban')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <span className="text-sm">
                    第 {pagination.page} 页，共 {pagination.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}