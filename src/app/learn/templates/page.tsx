import { Metadata } from 'next'
import Header from '@/components/Header'
import ArgumentTemplates from '@/components/learn/ArgumentTemplates'

export const metadata: Metadata = {
  title: '论证结构与写作模板 - Cogito AI',
  description: '掌握PEEL、CER等论证结构和写作模板',
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <ArgumentTemplates />
    </div>
  )
}