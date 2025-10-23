'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Lock, Clock, BookOpen, Code, Target, RefreshCw } from 'lucide-react';
import type { PathStep } from '@/types/learning-path';
import { useRouter } from 'next/navigation';
import { STEP_TYPE_LABELS, DIFFICULTY_LEVELS } from '@/types/learning-path';

interface PathTimelineProps {
  steps: PathStep[];
  currentStepId?: string;
  todayTaskStepId?: string; // 新增：今日任务步骤ID
}

export default function PathTimeline({ steps, currentStepId, todayTaskStepId }: PathTimelineProps) {
  const router = useRouter();

  // 按Level分组
  const groupedByLevel = steps.reduce((acc, step) => {
    if (!acc[step.level]) acc[step.level] = [];
    acc[step.level].push(step);
    return acc;
  }, {} as Record<number, PathStep[]>);

  const getStepIcon = (type: PathStep['type']) => {
    switch (type) {
      case 'learning': return BookOpen;
      case 'practice': return Code;
      case 'assessment': return Target;
      case 'review': return RefreshCw;
      default: return Circle;
    }
  };

  const getStepColor = (status: PathStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-300';
      case 'in_progress': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'available': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'locked': return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: PathStep['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  const handleStepClick = (step: PathStep) => {
    if (step.status !== 'locked') {
      router.push(step.href);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">学习步骤</h2>
        <Badge variant="outline" className="text-xs">
          共 {steps.length} 个步骤
        </Badge>
      </div>

      {Object.entries(groupedByLevel).map(([level, levelSteps]) => (
        <div key={level} className="space-y-3">
          <div className="flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
            <Badge className="bg-blue-600 text-white px-3 py-1">
              Level {level}
            </Badge>
            <span className="text-sm text-gray-600">
              ({levelSteps.filter(s => s.completed).length}/{levelSteps.length} 已完成)
            </span>
          </div>

          <div className="space-y-3 relative pl-8">
            {/* 时间线连接线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {levelSteps.map((step, index) => {
              const Icon = getStepIcon(step.type);
              const isCurrentStep = step.id === currentStepId;
              const isTodayTask = step.id === todayTaskStepId && !step.completed;

              return (
                <Card
                  key={step.id}
                  className={`relative p-4 transition-all duration-200 cursor-pointer ${
                    isTodayTask ? 'ring-2 ring-green-500 shadow-lg bg-green-50' :
                    isCurrentStep ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  } ${step.status === 'locked' ? 'opacity-60' : ''}`}
                  onClick={() => handleStepClick(step)}
                >
                  {/* 时间线圆点 */}
                  <div className={`absolute left-[-2rem] top-6 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    getStepColor(step.status)
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.status === 'locked' ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <Badge variant="outline" className="text-xs">
                          {STEP_TYPE_LABELS[step.type]}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(step.difficulty)}`}>
                          {DIFFICULTY_LEVELS[step.difficulty]}
                        </Badge>
                        {isTodayTask && (
                          <Badge className="bg-green-600 text-white text-xs animate-pulse">
                            📅 今日任务
                          </Badge>
                        )}
                        {isCurrentStep && !isTodayTask && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            当前步骤
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {step.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedTime} 分钟
                        </div>
                        {step.timeSpent && step.timeSpent > 0 && (
                          <div className="text-green-600">
                            已学习 {step.timeSpent} 分钟
                          </div>
                        )}
                        {step.progressPercent > 0 && step.progressPercent < 100 && (
                          <div className="text-blue-600">
                            进度 {step.progressPercent}%
                          </div>
                        )}
                      </div>

                      {/* 自适应元数据提示 */}
                      {step.adaptiveMetadata?.adjustmentReason && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                          💡 {step.adaptiveMetadata.adjustmentReason}
                        </div>
                      )}
                    </div>

                    <div>
                      {step.status === 'locked' ? (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="h-4 w-4 mr-1" />
                          未解锁
                        </Button>
                      ) : step.completed ? (
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className={isCurrentStep ? 'bg-blue-600' : ''}
                        >
                          {step.status === 'in_progress' ? '继续学习' : '开始'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 前置条件提示 */}
                  {step.prerequisites.length > 0 && !step.completed && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      需要先完成 {step.prerequisites.length} 个前置步骤
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
