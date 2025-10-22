'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import MindMapVisualization from './MindMapVisualization'
import { CaseAnalysisResult } from '@/lib/prompts/case-analysis-prompts'

interface CaseAnalysisDisplayProps {
  caseAnalysis: CaseAnalysisResult
  className?: string
}

/**
 * 案例分析展示组件
 * 展示AI生成的专业案例分析，包括：
 * 1. 问题概述
 * 2. 关键要点
 * 3. 框架分析步骤
 * 4. 常见错误
 * 5. 改进建议
 * 6. 思维导图
 */
export default function CaseAnalysisDisplay({ caseAnalysis, className = '' }: CaseAnalysisDisplayProps) {
  // Defensive check: ensure caseAnalysis has required structure
  if (!caseAnalysis) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <p>案例分析数据不完整</p>
      </div>
    )
  }

  const [expandedSteps, setExpandedSteps] = useState<number[]>([0]) // 默认展开第一个步骤

  const toggleStep = (index: number) => {
    setExpandedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const expandAll = () => {
    setExpandedSteps((caseAnalysis.frameworkAnalysis || []).map((_, i) => i))
  }

  const collapseAll = () => {
    setExpandedSteps([])
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 问题概述 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            问题概述
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {caseAnalysis.overview}
          </p>
        </CardContent>
      </Card>

      {/* 关键要点 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            关键要点
          </CardTitle>
          <CardDescription>
            这道题目的核心观点和重要发现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(caseAnalysis.keyPoints || []).map((point, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed flex-1">
                    {point}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 框架分析步骤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                分析框架与步骤
              </CardTitle>
              <CardDescription className="mt-2">
                系统化的分析方法和详细步骤
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                disabled={expandedSteps.length === (caseAnalysis.frameworkAnalysis || []).length}
              >
                全部展开
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                disabled={expandedSteps.length === 0}
              >
                全部收起
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(caseAnalysis.frameworkAnalysis || []).map((step, index) => {
              const isExpanded = expandedSteps.includes(index)

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-blue-300"
                >
                  {/* 步骤标题 */}
                  <button
                    onClick={() => toggleStep(index)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-900 text-left">
                        {step.step}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {/* 步骤内容 */}
                  {isExpanded && (
                    <div className="p-6 bg-white space-y-4">
                      {/* 分析内容 */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">📝 分析内容</h4>
                        <p className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-200">
                          {step.analysis}
                        </p>
                      </div>

                      {/* 实例展示 */}
                      {step.examples && step.examples.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">💡 实例说明</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {step.examples.map((example, exIndex) => (
                              <div
                                key={exIndex}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                              >
                                <div className="flex items-start space-x-2">
                                  <Badge variant="outline" className="bg-white text-blue-600 border-blue-300 flex-shrink-0">
                                    实例 {exIndex + 1}
                                  </Badge>
                                  <p className="text-sm text-blue-900">
                                    {example}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 常见错误 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            常见错误与避免方法
          </CardTitle>
          <CardDescription>
            学习如何识别和避免这些思维陷阱
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(caseAnalysis.pitfalls || []).map((pitfall, index) => (
              <div
                key={index}
                className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-orange-900">
                      ❌ {pitfall.mistake}
                    </h4>
                    <p className="text-sm text-orange-800 pl-4 border-l-2 border-orange-300">
                      <span className="font-medium">原因：</span>{pitfall.why}
                    </p>
                    <p className="text-sm text-orange-800 pl-4 border-l-2 border-green-300 bg-green-50 rounded p-2">
                      <span className="font-medium">✅ 如何避免：</span>{pitfall.howToAvoid}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 改进建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
            改进建议
          </CardTitle>
          <CardDescription>
            进一步提升思维质量的具体建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(caseAnalysis.recommendations || []).map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 思维导图 */}
      <MindMapVisualization data={caseAnalysis.mindmap} />
    </div>
  )
}
