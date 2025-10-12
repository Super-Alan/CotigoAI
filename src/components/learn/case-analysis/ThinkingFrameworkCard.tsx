'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, AlertTriangle, CheckCircle } from 'lucide-react'

interface ThinkingFrameworkCardProps {
  coreChallenge: string
  commonPitfalls: string[]
  excellentIndicators: string[]
  thinkingSteps?: Array<{
    step: number
    title: string
    description: string
    keyPoints: string[]
  }>
}

export default function ThinkingFrameworkCard({
  coreChallenge,
  commonPitfalls,
  excellentIndicators,
  thinkingSteps
}: ThinkingFrameworkCardProps) {
  return (
    <div className="space-y-6">
      {/* Core Challenge */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">核心挑战</h3>
            <p className="text-gray-700 leading-relaxed text-base">{coreChallenge}</p>
          </div>
        </div>
      </Card>

      {/* Common Pitfalls */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-600 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">常见陷阱</h3>
            <div className="space-y-3">
              {commonPitfalls.map((pitfall, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white bg-opacity-60 p-3 rounded-lg">
                  <Badge variant="destructive" className="mt-0.5 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700">{pitfall}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Excellent Indicators */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-600 rounded-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">优秀回答指标</h3>
            <div className="space-y-3">
              {excellentIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white bg-opacity-60 p-3 rounded-lg">
                  <Badge className="mt-0.5 flex-shrink-0 bg-green-600">
                    ✓
                  </Badge>
                  <span className="text-gray-700">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Thinking Steps */}
      {thinkingSteps && thinkingSteps.length > 0 && (
        <Card className="p-6 bg-white border-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">思维步骤</h3>
          <div className="space-y-6">
            {thinkingSteps.map((step, index) => (
              <div key={index} className="relative pl-8 pb-6 last:pb-0">
                {/* Step Line */}
                {index < thinkingSteps.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-purple-300"></div>
                )}

                {/* Step Number */}
                <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {step.step}
                </div>

                {/* Step Content */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-700 text-sm mb-3">{step.description}</p>

                  {step.keyPoints && step.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      {step.keyPoints.map((point, pointIndex) => (
                        <div key={pointIndex} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
