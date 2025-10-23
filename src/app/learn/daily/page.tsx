import { Metadata } from 'next'
import Header from '@/components/Header'
import DailyPracticeMainV2 from '@/components/learn/daily/DailyPracticeMainV2'

export const metadata: Metadata = {
  title: '每日练习 - Cogito AI',
  description: '跟随个性化学习路径，每日批判性思维练习，通过AI生成的个性化题目提升思维能力',
}

export default function DailyPracticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <DailyPracticeMainV2 />
    </div>
  )
}