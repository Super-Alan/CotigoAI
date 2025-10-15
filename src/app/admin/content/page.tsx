'use client'

import { ContentManagement } from '@/components/admin/ContentManagement'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminContentPage() {
  const { isLoading, hasAccess } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
          <p className="text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    )
  }

  return <ContentManagement />
}