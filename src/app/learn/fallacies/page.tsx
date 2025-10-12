import { Metadata } from 'next'
import Header from '@/components/Header'
import FallaciesLibrary from '@/components/learn/FallaciesLibrary'

export const metadata: Metadata = {
  title: '逻辑谬误与偏差库 - Cogito AI',
  description: '学习识别和应对各种逻辑谬误与认知偏差',
}

export default function FallaciesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <FallaciesLibrary />
    </div>
  )
}