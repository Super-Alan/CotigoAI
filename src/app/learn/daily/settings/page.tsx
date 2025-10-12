import { Metadata } from 'next'
import DailyPracticeSettings from '@/components/learn/daily/DailyPracticeSettings'

export const metadata: Metadata = {
  title: '练习设置 - CotigoAI',
  description: '个性化您的每日练习体验，调整难度和内容偏好',
}

export default function DailySettingsPage() {
  return <DailyPracticeSettings />
}