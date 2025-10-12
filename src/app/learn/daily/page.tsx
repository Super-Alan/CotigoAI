import { Metadata } from 'next'
import Header from '@/components/Header'
import DailyPracticeMain from '@/components/learn/daily/DailyPracticeMain'

export const metadata: Metadata = {
  title: '每日练习 - Cogito AI',
  description: '每日批判性思维练习，通过AI生成的个性化题目提升思维能力，培养良好的学习习惯',
}

export default function DailyPracticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <DailyPracticeMain />
    </div>
  )
}