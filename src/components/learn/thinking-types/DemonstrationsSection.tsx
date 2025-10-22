'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lightbulb, MessageSquare, Star, HelpCircle } from 'lucide-react';

interface DemonstrationsSectionProps {
  intro?: string;
  content: any;
  completed: boolean;
  onComplete: (completed: boolean) => void;
}

interface Demonstration {
  id?: string;
  demoId?: string;
  title: string;
  category?: string;
  scenario: string | {
    background: string;
    problemStatement: string;
    keyData?: string[];
  };
  question?: string;
  analysis?: string;
  learningObjective?: string;
  stepByStepAnalysis?: Array<{
    stepNumber: number;
    action: string;
    thinkingProcess: string;
    toolOutput: string;
    criticalThinkingPoint?: string;
    modelApplied?: string;
    conceptApplied?: string;
    nextStepRationale?: string;
  }>;
  keyInsights: string[] | Array<{
    insight: string;
    explanation: string;
    generalPrinciple?: string;
    applicableScenarios?: string;
  }>;
  expertCommentary?: string;
  reflectionQuestions?: string[];
  relatedConcepts?: string[];
  practiceGuidance?: string;
  transferableSkills?: string[];
  theoreticalFoundation?: {
    conceptsUsed?: string[];
    modelsUsed?: string[];
  };
  commonMistakesInThisCase?: Array<{
    mistake: string;
    correction: string;
    consequence: string;
  }>;
}

export default function DemonstrationsSection({
  intro,
  content,
  completed,
  onComplete,
}: DemonstrationsSectionProps) {
  const demonstrations: Demonstration[] = content?.demonstrations || [];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      {intro && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">章节介绍</h3>
              <p className="text-purple-800 leading-relaxed">{intro}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Demonstrations List */}
      <div className="space-y-6">
        {demonstrations.map((demo, index) => (
          <Card key={demo.id} className="p-6 hover:shadow-md transition-shadow">
            {/* Demo Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{demo.title}</h3>

                {/* Category */}
                {demo.category && (
                  <Badge variant="outline" className="mb-4">
                    {demo.category}
                  </Badge>
                )}

                {/* Learning Objective */}
                {demo.learningObjective && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 学习目标</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{demo.learningObjective}</p>
                  </div>
                )}

                {/* Scenario */}
                <div className="p-4 bg-gray-50 rounded-lg border mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    情境描述
                  </h4>
                  {typeof demo.scenario === 'string' ? (
                    <p className="text-gray-700 leading-relaxed">{demo.scenario}</p>
                  ) : (
                    <div className="space-y-3">
                      {demo.scenario.keyData && demo.scenario.keyData.length > 0 && (
                        <div className="p-3 bg-white rounded border">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">📊 关键数据</h5>
                          <ul className="space-y-1">
                            {demo.scenario.keyData.map((data, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                {data}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">📖 背景</h5>
                        <p className="text-gray-700 leading-relaxed text-sm">{demo.scenario.background}</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <h5 className="text-sm font-semibold text-yellow-900 mb-2">❓ 核心问题</h5>
                        <p className="text-yellow-800 text-sm leading-relaxed">{demo.scenario.problemStatement}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question */}
                {demo.question && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      核心问题
                    </h4>
                    <blockquote className="text-blue-800 italic border-l-4 border-blue-400 pl-4">
                      {demo.question}
                    </blockquote>
                  </div>
                )}

                {/* Step-by-Step Analysis */}
                {demo.stepByStepAnalysis && demo.stepByStepAnalysis.length > 0 && (
                  <div className="space-y-4 mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      逐步分析过程
                    </h4>
                    {demo.stepByStepAnalysis.map((step, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex-shrink-0">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900 mb-2">{step.action}</h5>
                            {step.modelApplied && (
                              <Badge variant="outline" className="text-xs mb-2">
                                🧠 {step.modelApplied}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-800 mb-1">💭 思考过程：</p>
                            <p className="text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-300">{step.thinkingProcess}</p>
                          </div>
                          {step.toolOutput && (
                            <div className="p-3 bg-white rounded border">
                              <p className="font-medium text-gray-800 mb-1">📌 分析结果：</p>
                              <p className="text-gray-700">{step.toolOutput}</p>
                            </div>
                          )}
                          {step.criticalThinkingPoint && (
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-300">
                              <p className="text-yellow-900">{step.criticalThinkingPoint}</p>
                            </div>
                          )}
                          {step.nextStepRationale && (
                            <div>
                              <p className="font-medium text-gray-800 mb-1">➡️ 下一步：</p>
                              <p className="text-gray-700">{step.nextStepRationale}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simple Analysis (fallback) */}
                {demo.analysis && !demo.stepByStepAnalysis && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      深度分析
                    </h4>
                    <p className="text-green-800 leading-relaxed whitespace-pre-line">{demo.analysis}</p>
                  </div>
                )}

                {/* Key Insights */}
                {demo.keyInsights && demo.keyInsights.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      关键启示
                    </h4>
                    <div className="space-y-4">
                      {demo.keyInsights.map((insight, idx) => {
                        if (typeof insight === 'string') {
                          return (
                            <div key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                              <Circle className="h-2 w-2 mt-1.5 flex-shrink-0 fill-yellow-600" />
                              <span>{insight}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="space-y-2 pb-4 border-b border-yellow-300 last:border-0 last:pb-0">
                            <p className="font-semibold text-yellow-900">💡 {insight.insight}</p>
                            <p className="text-sm text-yellow-800 pl-4 border-l-2 border-yellow-400">{insight.explanation}</p>
                            {insight.generalPrinciple && (
                              <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                                <span className="font-medium">通用原理：</span>{insight.generalPrinciple}
                              </div>
                            )}
                            {insight.applicableScenarios && (
                              <div className="text-xs text-yellow-700">
                                <span className="font-medium">适用场景：</span>{insight.applicableScenarios}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expert Commentary */}
                {demo.expertCommentary && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      专家点评
                    </h4>
                    <p className="text-purple-800 leading-relaxed italic">
                      "{demo.expertCommentary}"
                    </p>
                  </div>
                )}

                {/* Reflection Questions */}
                {demo.reflectionQuestions && demo.reflectionQuestions.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      反思问题
                    </h4>
                    <ul className="space-y-2">
                      {demo.reflectionQuestions.map((question, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="font-semibold flex-shrink-0">{idx + 1}.</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transferable Skills */}
                {demo.transferableSkills && demo.transferableSkills.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      可迁移技能
                    </h4>
                    <ul className="space-y-2">
                      {demo.transferableSkills.map((skill, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Mistakes */}
                {demo.commonMistakesInThisCase && demo.commonMistakesInThisCase.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      常见错误
                    </h4>
                    <div className="space-y-3">
                      {demo.commonMistakesInThisCase.map((mistake, idx) => (
                        <div key={idx} className="space-y-2 pb-3 border-b border-red-300 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-red-900">❌ {mistake.mistake}</p>
                          <p className="text-xs text-red-800 pl-4 border-l-2 border-red-400">
                            <span className="font-medium">✅ 正确做法：</span>{mistake.correction}
                          </p>
                          <p className="text-xs text-red-700">
                            <span className="font-medium">⚠️ 后果：</span>{mistake.consequence}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Guidance */}
                {demo.practiceGuidance && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mb-4">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      实践建议
                    </h4>
                    <p className="text-orange-800 text-sm leading-relaxed">{demo.practiceGuidance}</p>
                  </div>
                )}

                {/* Theoretical Foundation */}
                {demo.theoreticalFoundation && (
                  <div className="p-3 bg-gray-50 rounded border mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">🧠 理论基础</h4>
                    <div className="space-y-2 text-xs">
                      {demo.theoreticalFoundation.conceptsUsed && demo.theoreticalFoundation.conceptsUsed.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">应用概念：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {demo.theoreticalFoundation.conceptsUsed.map((concept, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {demo.theoreticalFoundation.modelsUsed && demo.theoreticalFoundation.modelsUsed.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">应用模型：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {demo.theoreticalFoundation.modelsUsed.map((model, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {model}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Related Concepts */}
                {demo.relatedConcepts && demo.relatedConcepts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">相关概念</h4>
                    <div className="flex flex-wrap gap-2">
                      {demo.relatedConcepts.map((concept, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Practice Suggestion */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-2">动手实践</h4>
            <p className="text-orange-800 mb-3">
              学习完实例演示后，建议您前往练习系统进行实战训练，巩固所学知识。
            </p>
            <Button
              size="sm"
              onClick={() => {
                // Navigate to practice page
                const currentPath = window.location.pathname;
                const thinkingTypeId = currentPath.split('/')[3]; // Extract from URL
                window.location.href = `/learn/critical-thinking/${thinkingTypeId}/practice`;
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              开始练习
            </Button>
          </div>
        </div>
      </Card>

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
