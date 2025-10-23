'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, BookOpen, AlertCircle } from 'lucide-react';

interface ConceptsSectionProps {
  intro?: string;
  content: any;
  completed: boolean;
  onComplete: (completed: boolean) => void;
}

interface Concept {
  id?: string;
  conceptId?: string;
  name: string;
  definition: string;
  keyPoints?: string[];
  examples?: string[];
  realWorldExamples?: Array<{
    scenario: string;
    application: string;
    outcome: string;
  }>;
  commonMisconceptions?: Array<{
    misconception: string;
    truth: string;
    realExample: string;
  }> | string[];
  visualAids?: {
    type: string;
    description: string;
    data?: any;
  }[];
}

export default function ConceptsSection({
  intro,
  content,
  completed,
  onComplete,
}: ConceptsSectionProps) {
  const concepts: Concept[] = content?.concepts || [];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      {intro && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">章节介绍</h3>
              <p className="text-blue-800 leading-relaxed">{intro}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Concepts List */}
      <div className="space-y-6">
        {concepts.map((concept, index) => (
          <Card key={concept.id || concept.conceptId || `concept-${index}`} className="p-6 hover:shadow-md transition-shadow">
            {/* Concept Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{concept.name}</h3>
                  <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
                </div>
              </div>
            </div>

            {/* Key Points */}
            {concept.keyPoints && concept.keyPoints.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  核心要点
                </h4>
                <ul className="space-y-2">
                  {concept.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <Circle className="h-2 w-2 mt-1.5 flex-shrink-0 fill-blue-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {concept.examples && concept.examples.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">示例</h4>
                <ul className="space-y-2">
                  {concept.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-green-800">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Real World Examples */}
            {concept.realWorldExamples && concept.realWorldExamples.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">💡 实际应用案例</h4>
                {concept.realWorldExamples.map((example, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-800 mb-2">
                      <span className="font-medium text-green-900">场景：</span>
                      {example.scenario}
                    </div>
                    <div className="text-sm text-gray-800 mb-2">
                      <span className="font-medium text-blue-900">应用：</span>
                      {example.application}
                    </div>
                    <div className="text-sm text-gray-800">
                      <span className="font-medium text-purple-900">成果：</span>
                      {example.outcome}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Common Misconceptions */}
            {concept.commonMisconceptions && concept.commonMisconceptions.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  常见误区
                </h4>
                <div className="space-y-3">
                  {concept.commonMisconceptions.map((misconception, idx) => {
                    // Handle both string format and object format
                    if (typeof misconception === 'string') {
                      return (
                        <div key={idx} className="text-sm text-yellow-800">
                          {misconception}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="font-medium text-yellow-900">
                          ❌ {misconception.misconception}
                        </div>
                        <div className="text-sm text-yellow-800 pl-4 border-l-2 border-yellow-300">
                          <div className="mb-1">
                            <span className="font-medium">✅ 真相：</span>
                            {misconception.truth}
                          </div>
                          <div>
                            <span className="font-medium">📌 例子：</span>
                            {misconception.realExample}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visual Aids */}
            {concept.visualAids && concept.visualAids.length > 0 && (
              <div className="mt-4 space-y-3">
                {concept.visualAids.map((visual, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {visual.type === 'diagram' && '📊 图表'}
                        {visual.type === 'flowchart' && '🔀 流程图'}
                        {visual.type === 'mindmap' && '🧠 思维导图'}
                        {visual.type === 'comparison' && '⚖️ 对比'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{visual.description}</p>
                    {visual.data && (
                      <div className="mt-2 p-3 bg-white rounded border text-xs font-mono">
                        {JSON.stringify(visual.data, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
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
