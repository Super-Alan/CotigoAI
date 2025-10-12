import { Metadata } from 'next'
import Header from '@/components/Header'
import ProgressDashboard from '@/components/learn/ProgressDashboard'

export const metadata: Metadata = {
  title: '学习仪表板 - Cogito AI',
  description: '五维思维能力进度追踪和学习数据可视化分析',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <ProgressDashboard />
    </div>
  )
}