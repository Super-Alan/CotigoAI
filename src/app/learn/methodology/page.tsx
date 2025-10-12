import { Metadata } from 'next'
import Header from '@/components/Header'
import MethodologyLessons from '@/components/learn/MethodologyLessons'

export const metadata: Metadata = {
  title: '方法论微课 - Cogito AI',
  description: '学习批判性思维方法论，包含交互式任务与自测',
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <MethodologyLessons />
    </div>
  )
}