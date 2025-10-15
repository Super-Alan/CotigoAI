'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'
import { UsersFilters } from '@/components/admin/UsersFilters'
import { UsersList } from '@/components/admin/UsersList'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function UsersPage() {
  const { isAdmin, isLoading, error } = useAdminAuth()
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'createdAt_desc'
  })

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证管理员权限...</p>
        </div>
      </div>
    )
  }

  if (error || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">您没有访问管理面板的权限</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600 mt-1">管理和查看所有用户信息</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>
      </div>

      <UsersFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <UsersList filters={filters} onFiltersChange={handleFiltersChange} />
    </div>
  )
}