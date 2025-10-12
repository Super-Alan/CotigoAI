import { Metadata } from 'next'
import DailyPracticeFeedback from '@/components/learn/daily/DailyPracticeFeedback'

export const metadata: Metadata = {
  title: '练习反馈 - 每日练习 - Cogito AI',
  description: 'AI智能分析您的练习表现，提供个性化学习建议和改进方向',
}

export default function DailyPracticeFeedbackPage() {
  return <DailyPracticeFeedback />
}