'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, BookOpen, Target, CheckCircle, ArrowRight } from 'lucide-react'

export interface ReflectionSummaryProps {
  evaluation: any
  level: number
  onComplete: (reflectionNotes: string, improvementPlan: string) => void
  onSkip: () => void
}

export default function ReflectionSummary({
  evaluation,
  level,
  onComplete,
  onSkip
}: ReflectionSummaryProps) {
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [improvementPlan, setImprovementPlan] = useState('')
  const [selectedTakeaways, setSelectedTakeaways] = useState<string[]>([])

  // 根据Level提供不同的反思引导问题
  const getReflectionQuestions = (level: number) => {
    const baseQuestions = [
      '这次练习中，你最大的收获是什么？',
      '你在思考过程中遇到了什么困难？',
      'AI反馈中哪一点对你最有启发？'
    ]

    const advancedQuestions = [
      '下次遇到类似问题，你会采取什么不同的策略？',
      '你发现了自己的哪些思维盲点？',
      '这次练习让你对批判性思维有了哪些新的理解？'
    ]

    if (level <= 2) {
      return baseQuestions
    } else if (level <= 4) {
      return [...baseQuestions, advancedQuestions[0], advancedQuestions[1]]
    } else {
      return [...baseQuestions, ...advancedQuestions]
    }
  }

  const commonTakeaways = [
    '学会了从多个角度看问题',
    '提高了逻辑分析能力',
    '发现了思维盲点',
    '加强了证据意识',
    '改进了论证结构',
    '培养了批判性质疑精神'
  ]

  const handleTakeawayToggle = (takeaway: string) => {
    setSelectedTakeaways(prev =>
      prev.includes(takeaway)
        ? prev.filter(t => t !== takeaway)
        : [...prev, takeaway]
    )
  }

  const handleSubmit = () => {
    const notes = reflectionNotes || selectedTakeaways.join('; ')
    onComplete(notes, improvementPlan)
  }

  const reflectionQuestions = getReflectionQuestions(level)

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            反思总结
          </CardTitle>
          <CardDescription>
            通过反思加深理解，将学习转化为持久的能力提升
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 引导问题 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              反思引导问题
            </h4>
            <div className="space-y-2">
              {reflectionQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg text-sm text-gray-700"
                >
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 快速标签选择 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              关键收获标签 <span className="text-xs text-gray-500 font-normal">（可选择多个）</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonTakeaways.map((takeaway) => (
                <Badge
                  key={takeaway}
                  variant={selectedTakeaways.includes(takeaway) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedTakeaways.includes(takeaway)
                      ? 'bg-purple-600'
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => handleTakeawayToggle(takeaway)}
                >
                  {selectedTakeaways.includes(takeaway) && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {takeaway}
                </Badge>
              ))}
            </div>
          </div>

          {/* 反思笔记 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              详细反思笔记 <span className="text-xs text-gray-500 font-normal">（可选）</span>
            </h4>
            <Textarea
              placeholder="记录你的深入思考和感悟..."
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* 改进计划 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              改进计划 <span className="text-xs text-gray-500 font-normal">（可选）</span>
            </h4>
            <Textarea
              placeholder="下次练习时，你计划如何改进？..."
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              提示：具体的改进计划更容易执行，如"下次先列出所有可能的角度再分析"
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={selectedTakeaways.length === 0 && !reflectionNotes.trim()}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              完成反思
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
            >
              暂时跳过
            </Button>
          </div>

          {/* 提示信息 */}
          {selectedTakeaways.length === 0 && !reflectionNotes.trim() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              💡 至少选择一个收获标签或填写反思笔记，以完成本步骤
            </div>
          )}
        </CardContent>
      </Card>

      {/* Level差异化提示 */}
      {level >= 4 && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-indigo-900 mb-1">
                  高级Level反思建议
                </div>
                <div className="space-y-1 text-xs">
                  <p>• 关注元认知：你是如何思考这个问题的？</p>
                  <p>• 迁移应用：这种思维方式可以应用到哪些其他场景？</p>
                  <p>• 系统视角：这次练习如何影响你对批判性思维的整体认识？</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
