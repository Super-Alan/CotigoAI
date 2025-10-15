import { notFound } from 'next/navigation'
import { UserProfile } from '@/components/admin/UserProfile'
import { UserActivity } from '@/components/admin/UserActivity'
import { UserStats } from '@/components/admin/UserStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Ban, Mail } from 'lucide-react'
import Link from 'next/link'

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = params

  // TODO: Fetch user data from API
  // For now, we'll use mock data structure
  
  if (!id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回用户列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">用户详情</h1>
            <p className="text-gray-600">查看和管理用户信息</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            发送邮件
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            编辑用户
          </Button>
          <Button variant="destructive" size="sm">
            <Ban className="h-4 w-4 mr-2" />
            禁用用户
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfile userId={id} />
            </CardContent>
          </Card>
        </div>

        {/* User Stats and Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户统计</CardTitle>
            </CardHeader>
            <CardContent>
              <UserStats userId={id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <UserActivity userId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}