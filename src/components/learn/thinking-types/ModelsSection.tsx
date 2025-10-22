'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Target, Lightbulb, AlertTriangle } from 'lucide-react';

interface ModelsSectionProps {
  intro?: string;
  content: any;
  completed: boolean;
  onComplete: (completed: boolean) => void;
}

interface ThinkingModel {
  id: string;
  name: string;
  description: string;
  steps: {
    step: string;
    description: string;
    tips?: string;
    commonMistakes?: string;
  }[];
  useCases: string[];
  examples?: string[];
  relatedModels?: string[];
}

export default function ModelsSection({
  intro,
  content,
  completed,
  onComplete,
}: ModelsSectionProps) {
  const models: ThinkingModel[] = content?.models || [];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      {intro && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">章节介绍</h3>
              <p className="text-green-800 leading-relaxed">{intro}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Models List */}
      <div className="space-y-6">
        {models.map((model, index) => (
          <Card key={model.id} className="p-6 hover:shadow-md transition-shadow">
            {/* Model Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{model.name}</h3>
                <p className="text-gray-700 leading-relaxed">{model.description}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                使用步骤
              </h4>
              {model.steps.map((step, idx) => (
                <div key={idx} className="ml-6 border-l-2 border-green-200 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-semibold text-xs flex-shrink-0 -ml-[25px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{step.step}</h5>
                      <p className="text-sm text-gray-700 mt-1">{step.description}</p>
                    </div>
                  </div>

                  {step.tips && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">💡 技巧</p>
                          <p className="text-sm text-blue-800">{step.tips}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.commonMistakes && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ 常见错误</p>
                          <p className="text-sm text-yellow-800">{step.commonMistakes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Use Cases */}
            {model.useCases && model.useCases.length > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">适用场景</h4>
                <ul className="space-y-1">
                  {model.useCases.map((useCase, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {model.examples && model.examples.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">应用示例</h4>
                <div className="space-y-2">
                  {model.examples.map((example, idx) => (
                    <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                      {example}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Related Models */}
            {model.relatedModels && model.relatedModels.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">相关模型</h4>
                <div className="flex flex-wrap gap-2">
                  {model.relatedModels.map((related, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {related}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Completion Button */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">完成章节学习</h4>
            <p className="text-sm text-gray-600">
              标记为完成后，您的学习进度将会更新
            </p>
          </div>
          <Button
            onClick={() => onComplete(!completed)}
            variant={completed ? 'outline' : 'default'}
            className="ml-4"
          >
            {completed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                已完成
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                标记完成
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
