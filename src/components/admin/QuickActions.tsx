'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    name: '添加用户',
    description: '创建新的用户账户',
    href: '/admin/users/new',
    icon: UserPlus,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: '添加内容',
    description: '创建新的话题或题目',
    href: '/admin/content/new',
    icon: Plus,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: '查看异常',
    description: '检查系统异常和错误',
    href: '/admin/analytics?filter=errors',
    icon: AlertTriangle,
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    name: '导出报告',
    description: '生成数据分析报告',
    href: '/admin/analytics/export',
    icon: Download,
    color: 'bg-purple-500 hover:bg-purple-600'
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <div className="group relative overflow-hidden rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}