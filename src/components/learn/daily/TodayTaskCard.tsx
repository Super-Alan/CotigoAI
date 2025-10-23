'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CheckCircle,
  Play,
  Target,
  Clock,
  Lightbulb,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import type { DailyTask } from '@/lib/services/unified-recommendation';

interface TodayTaskCardProps {
  task: DailyTask;
  onStart: () => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const difficultyLabels = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级'
};

export default function TodayTaskCard({ task, onStart }: TodayTaskCardProps) {
  const difficultyClass = difficultyColors[task.difficulty] || 'bg-gray-100 text-gray-800';
  const difficultyLabel = difficultyLabels[task.difficulty] || '未知';

  // If task is completed today
  if (task.isCompleted) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 text-green-600">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
            <div>
              <div className="text-lg sm:text-xl font-bold">今日练习已完成！</div>
              <div className="text-sm text-gray-700 mt-1">
                完成于 {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '今天'}
                {task.score && (
                  <span className="ml-2">
                    · 得分: <span className="font-bold">{task.score}</span>分
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                📊 路径进度已更新: {task.context.completedSteps}/{task.context.totalSteps} 步骤完成
              </div>
            </div>
          </div>

          {/* Tomorrow Preview */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">明日预告</span>
            </div>
            <p className="text-sm text-gray-700">
              {task.context.nextMilestone}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Task not completed yet
  return (
    <Card className="bg-white border-2 border-blue-300 shadow-lg mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg sm:text-xl">今日任务</CardTitle>
          </div>
          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
            🎯 路径推荐
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Title */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {task.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={difficultyClass}>
              Level {task.level} · {difficultyLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              约 {task.estimatedTime} 分钟
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          {task.description}
        </p>

        {/* Path Context */}
        <div className="space-y-2">
          {/* Current Position */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-blue-900 mb-1">📍 当前位置</div>
              <div className="text-sm text-gray-700">
                {task.context.currentPhase} · 第 {task.context.currentStepIndex + 1}/{task.context.totalSteps} 步
              </div>
            </div>
          </div>

          {/* Why This Task */}
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-purple-900 mb-1">💡 学习目标</div>
              <div className="text-sm text-gray-700">
                {task.context.whyThisTask}
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-green-900 mb-1">🎯 完成后将达成</div>
              <div className="text-sm text-gray-700">
                {task.context.nextMilestone}
              </div>
            </div>
          </div>
        </div>

        {/* What You Will Learn */}
        {task.context.whatYouWillLearn && task.context.whatYouWillLearn.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              📚 本次练习你将掌握：
            </div>
            <ul className="space-y-1">
              {task.context.whatYouWillLearn.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* First Time User */}
        {task.isFirstTime && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-yellow-900 mb-1">
                  👋 欢迎开始你的批判性思维之旅！
                </div>
                <div className="text-sm text-gray-700">
                  我们为你精心规划了个性化学习路径，让我们从基础开始，循序渐进地提升思维能力。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <Button
          onClick={onStart}
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 group"
        >
          <Play className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
          开始今日练习
        </Button>

        {/* Progress Info */}
        <div className="text-center text-xs text-gray-500">
          完成后，你的学习路径进度将自动更新
        </div>
      </CardContent>
    </Card>
  );
}
