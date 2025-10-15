'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X, Download, Users, Mail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UsersFiltersProps {
  filters: {
    search: string
    status: string
    dateRange: string
    sortBy: string
  }
  onFiltersChange: (filters: any) => void
  selectedUsers?: string[]
  onBatchAction?: (action: string, data?: any) => void
}

export function UsersFilters({ 
  filters, 
  onFiltersChange, 
  selectedUsers = [], 
  onBatchAction 
}: UsersFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dateRange: 'all',
      sortBy: 'createdAt_desc'
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.dateRange !== 'all'

  const handleExport = (format: string) => {
    const params = new URLSearchParams({
      format,
      ...filters
    })
    
    const url = `/api/admin/users/export?${params}`
    window.open(url, '_blank')
  }

  const handleBatchEmail = () => {
    if (selectedUsers.length === 0) return
    
    const subject = prompt('邮件主题:')
    const message = prompt('邮件内容:')
    
    if (subject && message && onBatchAction) {
      onBatchAction('send-email', { subject, message })
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户姓名、邮箱或ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                筛选
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-600 text-white rounded-full w-2 h-2" />
                )}
              </Button>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    导出为 CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    导出为 JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Batch Actions */}
              {selectedUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      批量操作 ({selectedUsers.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleBatchEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      发送邮件
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onBatchAction?.('ban')}
                      className="text-red-600"
                    >
                      批量禁用
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBatchAction?.('unban')}>
                      批量解除禁用
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  用户状态
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">活跃用户</SelectItem>
                    <SelectItem value="inactive">非活跃用户</SelectItem>
                    <SelectItem value="banned">已禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  注册时间
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">最近一周</SelectItem>
                    <SelectItem value="month">最近一月</SelectItem>
                    <SelectItem value="quarter">最近三月</SelectItem>
                    <SelectItem value="year">最近一年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  排序方式
                </label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt_desc">注册时间 (新到旧)</SelectItem>
                    <SelectItem value="createdAt_asc">注册时间 (旧到新)</SelectItem>
                    <SelectItem value="name_asc">姓名 (A-Z)</SelectItem>
                    <SelectItem value="name_desc">姓名 (Z-A)</SelectItem>
                    <SelectItem value="lastActive_desc">最后活跃 (新到旧)</SelectItem>
                    <SelectItem value="lastActive_asc">最后活跃 (旧到新)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    清除筛选
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}