import { Metadata } from 'next'
import Header from '@/components/Header'
import LearningPath from '@/components/learn/LearningPath'

export const metadata: Metadata = {
  title: '个性化学习路径 - Cogito AI',
  description: 'AI驱动的个性化批判性思维学习路径规划和推荐系统',
}

export default function LearningPathPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <LearningPath />
    </div>
  )
}