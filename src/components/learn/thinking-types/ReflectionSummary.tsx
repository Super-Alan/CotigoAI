'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, ArrowRight, AlertCircle } from 'lucide-react'

interface ReflectionData {
  learned: string
  nextSteps: string
  questions?: string
}

interface ReflectionSummaryProps {
  thinkingTypeName: string
  onComplete: (reflection: ReflectionData) => void
  onSkip?: () => void
}

export default function ReflectionSummary({
  thinkingTypeName,
  onComplete,
  onSkip
}: ReflectionSummaryProps) {
  const [learned, setLearned] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [questions, setQuestions] = useState('')
  const [errors, setErrors] = useState<{ learned?: string; nextSteps?: string }>({})

  const validate = (): boolean => {
    const newErrors: { learned?: string; nextSteps?: string } = {}

    if (!learned.trim()) {
      newErrors.learned = '请填写你的学习收获'
    } else if (learned.trim().length < 50) {
      newErrors.learned = `请至少写50字（当前${learned.trim().length}字）`
    }

    if (!nextSteps.trim()) {
      newErrors.nextSteps = '请填写你的改进策略'
    } else if (nextSteps.trim().length < 30) {
      newErrors.nextSteps = `请至少写30字（当前${nextSteps.trim().length}字）`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onComplete({
        learned: learned.trim(),
        nextSteps: nextSteps.trim(),
        questions: questions.trim() || undefined
      })
    }
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-2xl">学习反思与总结</CardTitle>
        </div>
        <CardDescription className="text-base">
          通过反思，将个别经验抽象为通用认知模式，完成深度学习闭环
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 提示信息 */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>为什么要反思？</strong>
            研究表明，主动反思能将知识留存率从35%提升到70%以上。
            请认真思考，而非敷衍了事。
          </AlertDescription>
        </Alert>

        {/* 问题1：新理解 */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <label className="text-base font-semibold text-gray-900">
              1. 通过这道题，我对【{thinkingTypeName}】有了哪些新理解？
              <span className="text-red-500">*</span>
            </label>
            <span className="text-sm text-gray-500">{learned.trim().length}/50字</span>
          </div>
          <Textarea
            placeholder="请具体说明你对这个思维维度的新认识，可以包括：&#10;• 之前不了解的概念或方法&#10;• 对已知概念的更深理解&#10;• 实际应用中的注意事项&#10;&#10;示例：我之前认为相关性就等于因果性，现在理解了必须排除混淆因素..."
            value={learned}
            onChange={(e) => {
              setLearned(e.target.value)
              if (errors.learned) setErrors({ ...errors, learned: undefined })
            }}
            className="min-h-[150px] text-base"
            maxLength={500}
          />
          {errors.learned && (
            <p className="text-sm text-red-600">{errors.learned}</p>
          )}
        </div>

        {/* 问题2：改进策略 */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <label className="text-base font-semibold text-gray-900">
              2. 下次遇到类似问题，我会采取什么不同的策略？
              <span className="text-red-500">*</span>
            </label>
            <span className="text-sm text-gray-500">{nextSteps.trim().length}/30字</span>
          </div>
          <Textarea
            placeholder="请写出可执行的具体策略，避免泛泛而谈：&#10;• 我会先做什么？&#10;• 需要特别注意哪些陷阱？&#10;• 如何检验自己的思路是否正确？&#10;&#10;示例：我会先列出所有可能的混淆因素，然后逐一检查它们是否影响结论..."
            value={nextSteps}
            onChange={(e) => {
              setNextSteps(e.target.value)
              if (errors.nextSteps) setErrors({ ...errors, nextSteps: undefined })
            }}
            className="min-h-[120px] text-base"
            maxLength={300}
          />
          {errors.nextSteps && (
            <p className="text-sm text-red-600">{errors.nextSteps}</p>
          )}
        </div>

        {/* 问题3：困惑（可选） */}
        <div className="space-y-3">
          <label className="text-base font-semibold text-gray-900">
            3. 我还有哪些困惑或疑问？
            <span className="text-sm font-normal text-gray-500 ml-2">（可选）</span>
          </label>
          <Textarea
            placeholder="如果有任何不理解的地方，请写下来。系统会记录你的疑问，帮助后续针对性学习。"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            className="min-h-[100px] text-base"
            maxLength={200}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            完成本次练习
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              暂时跳过
            </Button>
          )}
        </div>

        {/* 提示文本 */}
        <p className="text-sm text-gray-500 text-center">
          反思是学习的核心环节，建议花2-3分钟认真填写
        </p>
      </CardContent>
    </Card>
  )
}
