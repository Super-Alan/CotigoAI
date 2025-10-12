import { Metadata } from 'next'
import Header from '@/components/Header'
import LearningCenter from '@/components/learn/LearningCenter'

export const metadata: Metadata = {
  title: '学习中心 - Cogito AI',
  description: '批判性思维学习中心，包含逻辑谬误库、论证模板、方法论微课和话题包',
}

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <LearningCenter />
    </div>
  )
}