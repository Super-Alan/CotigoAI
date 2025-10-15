'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Edit,
  Ban,
  UserCheck,
  Key
} from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
  updatedAt: string
  lastActiveAt: string | null
  status: 'active' | 'inactive' | 'banned'
  stats: {
    totalConversations: number
    totalMessages: number
    avgMessagesPerConversation: number
  }
}

interface UserProfileProps {
  userId: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatLastActive = (dateString: string | null) => {
  if (!dateString) return '从未活跃'
  
  const now = new Date()
  const lastActive = new Date(dateString)
  const diffInDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return '今天'
  if (diffInDays === 1) return '昨天'
  if (diffInDays < 7) return `${diffInDays}天前`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`
  return `${Math.floor(diffInDays / 30)}个月前`
}

const getStatusBadge = (status: UserData['status']) => {
  const statusConfig = {
    active: { label: '活跃', className: 'bg-green-100 text-green-800' },
    inactive: { label: '非活跃', className: 'bg-gray-100 text-gray-800' },
    banned: { label: '已禁用', className: 'bg-red-100 text-red-800' }
  }
  
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetPasswordError, setResetPasswordError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (action: string) => {
    setActionLoading(action)
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh user data
        fetchUserData()
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async () => {
    setResetPasswordError('')

    if (!newPassword || newPassword.length < 6) {
      setResetPasswordError('密码长度至少6位')
      return
    }

    setActionLoading('reset-password')
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        setResetPasswordOpen(false)
        setNewPassword('')
        alert('密码重置成功')
      } else {
        const data = await response.json()
        setResetPasswordError(data.error || '密码重置失败')
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
      setResetPasswordError('密码重置失败,请稍后重试')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        用户不存在或加载失败
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Avatar and Basic Info */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || ''} />
          <AvatarFallback className="text-lg">
            {user.name?.charAt(0) || user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">
            {user.name || '未设置姓名'}
          </h3>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-2">
            {getStatusBadge(user.status)}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>用户ID</span>
          </div>
          <span className="font-mono text-sm">{user.id}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>注册时间</span>
          </div>
          <span>{formatDate(user.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>最后活跃</span>
          </div>
          <span>{formatLastActive(user.lastActiveAt)}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center space-x-2 text-gray-600">
            <MessageSquare className="h-4 w-4" />
            <span>对话总数</span>
          </div>
          <span>{user.stats.totalConversations}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center space-x-2 text-gray-600">
            <MessageSquare className="h-4 w-4" />
            <span>消息总数</span>
          </div>
          <span>{user.stats.totalMessages}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <MessageSquare className="h-4 w-4" />
            <span>平均消息数</span>
          </div>
          <span>{user.stats.avgMessagesPerConversation}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setResetPasswordOpen(true)}
          disabled={!!actionLoading}
        >
          <Key className="h-4 w-4 mr-2" />
          重置密码
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleUserAction('send-email')}
          disabled={actionLoading === 'send-email'}
        >
          <Mail className="h-4 w-4 mr-2" />
          {actionLoading === 'send-email' ? '发送中...' : '发送邮件'}
        </Button>

        {user.status === 'banned' ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleUserAction('unban')}
            disabled={actionLoading === 'unban'}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {actionLoading === 'unban' ? '解除中...' : '解除禁用'}
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleUserAction('ban')}
            disabled={actionLoading === 'ban'}
          >
            <Ban className="h-4 w-4 mr-2" />
            {actionLoading === 'ban' ? '禁用中...' : '禁用用户'}
          </Button>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置用户密码</DialogTitle>
            <DialogDescription>
              为用户 {user.email} 设置新密码,密码长度至少6位
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                新密码
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新密码"
                minLength={6}
              />
            </div>
            {resetPasswordError && (
              <p className="text-sm text-red-600">{resetPasswordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetPasswordOpen(false)
                setNewPassword('')
                setResetPasswordError('')
              }}
              disabled={actionLoading === 'reset-password'}
            >
              取消
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={actionLoading === 'reset-password'}
            >
              {actionLoading === 'reset-password' ? '重置中...' : '确认重置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}