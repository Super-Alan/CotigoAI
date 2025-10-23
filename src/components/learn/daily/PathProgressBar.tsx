'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Clock } from 'lucide-react';
import Link from 'next/link';

interface PathProgressBarProps {
  currentPhase: string;
  progress: number; // 0-100
  nextMilestone: string;
  completedSteps: number;
  totalSteps: number;
  estimatedTimeLeft?: number; // minutes
  pathId?: string;
}

export default function PathProgressBar({
  currentPhase,
  progress,
  nextMilestone,
  completedSteps,
  totalSteps,
  estimatedTimeLeft,
  pathId
}: PathProgressBarProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 mb-4 sm:mb-6">
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">学习路径进度</h3>
              <p className="text-xs text-gray-600 hidden sm:block">{currentPhase}</p>
            </div>
          </div>

          {pathId && (
            <Link
              href="/learn/path"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              查看完整路径 →
            </Link>
          )}
        </div>

        {/* Current Phase Badge (Mobile) */}
        <div className="sm:hidden mb-2">
          <Badge variant="outline" className="text-xs">
            {currentPhase}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              总体进度
            </span>
            <span className="text-sm sm:text-base font-bold text-blue-600">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3 bg-white" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {/* Completed Steps */}
          <div className="bg-white rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-[10px] sm:text-xs text-gray-600">已完成</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">
              {completedSteps}/{totalSteps}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">步骤</div>
          </div>

          {/* Next Milestone */}
          <div className="bg-white rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              <span className="text-[10px] sm:text-xs text-gray-600">下一里程碑</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
              {nextMilestone}
            </div>
          </div>

          {/* Estimated Time Left */}
          {estimatedTimeLeft && estimatedTimeLeft > 0 && (
            <div className="bg-white rounded-lg p-2 sm:p-3 hidden sm:block">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-[10px] sm:text-xs text-gray-600">预计剩余</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {Math.round(estimatedTimeLeft / 60)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">小时</div>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white/50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-gray-700">
            💪 坚持每日练习，你已经完成了 <span className="font-bold text-blue-600">{progress}%</span> 的学习路径！
          </p>
        </div>
      </div>
    </Card>
  );
}
