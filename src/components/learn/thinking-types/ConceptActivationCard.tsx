'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { LearningContent } from '@/lib/knowledge/learning-content-data'

interface ConceptActivationCardProps {
  thinkingTypeName: string
  learningContent: LearningContent
  onProceedToCaseStudy: () => void
  onSkipToPractice: () => void
}

export default function ConceptActivationCard({
  thinkingTypeName,
  learningContent,
  onProceedToCaseStudy,
  onSkipToPractice
}: ConceptActivationCardProps) {
  const [pitfallsExpanded, setPitfallsExpanded] = useState(false)
  const [checkedQuestions, setCheckedQuestions] = useState<Set<number>>(new Set())

  const toggleQuestion = (index: number) => {
    const newChecked = new Set(checkedQuestions)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedQuestions(newChecked)
  }

  return (
    <div className="space-y-6">
      {/* 定义 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            什么是{thinkingTypeName}？
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed">
            {learningContent.definition}
          </p>
        </CardContent>
      </Card>

      {/* 核心方法 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            核心方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningContent.coreMethod.map((method, i) => (
              <div
                key={i}
                className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <Badge className="bg-blue-600 text-white flex-shrink-0">
                    {i + 1}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {method.title}
                    </h4>
                    <p className="text-gray-700 mb-3">
                      {method.description}
                    </p>
                    <Alert className="bg-blue-100 border-blue-300">
                      <Lightbulb className="h-4 w-4 text-blue-700" />
                      <AlertDescription className="text-blue-900">
                        <strong>示例：</strong>{method.example}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 常见陷阱 */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setPitfallsExpanded(!pitfallsExpanded)}
            className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
          >
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              常见陷阱
            </CardTitle>
            {pitfallsExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </CardHeader>
        {pitfallsExpanded && (
          <CardContent>
            <div className="space-y-4">
              {learningContent.commonPitfalls.map((pitfall, i) => (
                <div
                  key={i}
                  className="border border-orange-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {pitfall.title}
                      </h4>
                      <p className="text-gray-700 mb-3">
                        {pitfall.description}
                      </p>
                      <div className="bg-red-50 border border-red-200 p-3 rounded mb-3">
                        <p className="text-red-900">
                          <strong>❌ 错误示例：</strong>
                          {pitfall.example}
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="text-green-900">
                          <strong>✅ 如何避免：</strong>
                          {pitfall.howToAvoid}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 思考检查清单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            思考检查清单
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningContent.keyQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => toggleQuestion(i)}
                className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    checkedQuestions.has(i)
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300'
                  }`}
                >
                  {checkedQuestions.has(i) && (
                    <CheckCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-gray-700">{question}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 答题示例对比 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info className="h-5 w-5 mr-2 text-indigo-600" />
            答题示例对比
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {learningContent.examples.map((ex, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {ex.scenario}
                  </h4>
                  <p className="text-gray-700">
                    <strong>问题：</strong>
                    {ex.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 优秀回答 */}
                  <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                    <Badge className="bg-green-600 text-white mb-3">
                      优秀回答
                    </Badge>
                    <p className="text-gray-800 leading-relaxed">
                      {ex.goodAnswer}
                    </p>
                  </div>

                  {/* 欠佳回答 */}
                  <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                    <Badge className="bg-red-600 text-white mb-3">
                      欠佳回答
                    </Badge>
                    <p className="text-gray-800 leading-relaxed">
                      {ex.poorAnswer}
                    </p>
                  </div>
                </div>

                <Alert className="bg-indigo-50 border-indigo-300">
                  <Info className="h-4 w-4 text-indigo-700" />
                  <AlertDescription className="text-indigo-900">
                    <strong>分析：</strong>
                    {ex.analysis}
                  </AlertDescription>
                </Alert>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 行动按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          onClick={onProceedToCaseStudy}
          size="lg"
          className="flex-1 text-base"
        >
          理解了，看实际案例
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        <Button
          onClick={onSkipToPractice}
          variant="outline"
          size="lg"
          className="flex-1 text-base"
        >
          我已熟悉，直接练习
        </Button>
      </div>
    </div>
  )
}
