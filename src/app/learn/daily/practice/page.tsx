import { Metadata } from 'next'
import DailyPracticeSession from '@/components/learn/daily/DailyPracticeSession'

export const metadata: Metadata = {
  title: '练习题目 - 每日练习 - Cogito AI',
  description: 'AI生成的个性化批判性思维练习题目，提升逻辑推理和分析能力',
}

export default function DailyPracticeSessionPage() {
  return <DailyPracticeSession />
}