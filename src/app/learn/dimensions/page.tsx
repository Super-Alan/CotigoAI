import { Metadata } from 'next'
import DimensionsCenter from '@/components/learn/DimensionsCenter'

export const metadata: Metadata = {
  title: '思维维度学习中心 - Cogito AI',
  description: '深入了解五大核心思维维度，系统化提升批判性思维能力。包含学习框架、核心方法和实践案例。',
}

export default function DimensionsPage() {
  return <DimensionsCenter />
}