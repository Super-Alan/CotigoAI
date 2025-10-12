import { Metadata } from 'next'
import Header from '@/components/Header'
import TopicPackages from '@/components/learn/TopicPackages'

export const metadata: Metadata = {
  title: '话题包 - Cogito AI',
  description: '探索复杂话题的多视角分析与可视化解构',
}

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <TopicPackages />
    </div>
  )
}