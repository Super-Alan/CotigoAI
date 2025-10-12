import { Metadata } from 'next'
import DailyPracticeProgress from '@/components/learn/daily/DailyPracticeProgress'

export const metadata: Metadata = {
  title: '学习进度 - CotigoAI',
  description: '查看您的每日练习进度、能力评估和历史记录',
}

export default function DailyProgressPage() {
  return <DailyPracticeProgress />
}