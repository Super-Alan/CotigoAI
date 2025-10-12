'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, HelpCircle, Lightbulb, TrendingUp } from 'lucide-react'

interface ProblemAnalysisCardProps {
  topic: string
  context: string
  difficulty: string
  tags: string[]
  keyQuestions: string[]
  learningObjectives: string[]
}

export default function ProblemAnalysisCard({
  topic,
  context,
  difficulty,
  tags,
  keyQuestions,
  learningObjectives
}: ProblemAnalysisCardProps) {
  const difficultyConfig = {
    beginner: { label: '初级', color: 'bg-green-100 text-green-800 border-green-300' },
    intermediate: { label: '中级', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    advanced: { label: '高级', color: 'bg-red-100 text-red-800 border-red-300' }
  }

  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.intermediate

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{topic}</h2>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`${config.color} border`}>
              难度: {config.label}
            </Badge>
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 mb-1">问题背景</div>
            <p className="text-gray-700 leading-relaxed">{context}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Questions */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">核心问题</h3>
          </div>
          <ul className="space-y-2">
            {keyQuestions.map((question, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-purple-600 font-bold mt-0.5">{index + 1}.</span>
                <span className="text-gray-700 flex-1">{question}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Learning Objectives */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">学习目标</h3>
          </div>
          <ul className="space-y-2">
            {learningObjectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 flex-1">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
