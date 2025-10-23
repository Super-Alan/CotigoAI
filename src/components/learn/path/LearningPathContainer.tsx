'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, TrendingUp, Clock, Award, RefreshCw } from 'lucide-react';
import PathTimeline from './PathTimeline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function LearningPathContainer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // 获取当前学习路径
  const { data: pathData, isLoading } = useQuery({
    queryKey: ['learning-path-current'],
    queryFn: async () => {
      const res = await fetch('/api/learning-path/current');
      if (!res.ok) throw new Error('Failed to fetch path');
      return res.json();
    }
  });

  // 获取今日任务（用于标记）
  const { data: dailyStatus } = useQuery({
    queryKey: ['daily-practice-status'],
    queryFn: async () => {
      const res = await fetch('/api/daily-practice/status');
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 60000 // 1分钟缓存
  });

  // 生成新路径
  const generateMutation = useMutation({
    mutationFn: async (config?: any) => {
      const res = await fetch('/api/learning-path/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || {})
      });
      if (!res.ok) throw new Error('Failed to generate path');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path-current'] });
    }
  });

  const handleGeneratePath = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({ forceRegenerate: true });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600"></div>
      </div>
    );
  }

  const path = pathData?.data?.path;
  const currentStep = pathData?.data?.currentStep;

  // 无路径时显示引导
  if (!path) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            开始您的批判性思维学习之旅
          </h2>
          <p className="text-gray-600 mb-6">
            系统将根据您的学习目标和当前水平，为您生成个性化学习路径
          </p>
          <Button
            onClick={handleGeneratePath}
            disabled={isGenerating}
            className="px-8 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              '生成学习路径'
            )}
          </Button>
        </Card>
      </div>
    );
  }

  // 有路径时显示完整界面
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 总览卡片 */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的学习路径</h1>
              <p className="text-sm text-gray-600">
                {path.metadata.learningStyle === 'theory_first' && '理论优先型'}
                {path.metadata.learningStyle === 'practice_first' && '实践优先型'}
                {path.metadata.learningStyle === 'balanced' && '理论实践平衡型'}
                {' · '}
                涵盖 {path.metadata.targetDimensions.length} 个思维维度
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleGeneratePath}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
        </div>

        {/* 进度条 */}
        <Progress value={path.progressPercent} className="h-3 mb-4" />

        {/* 统计信息 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {path.progressPercent}%
            </div>
            <div className="text-xs text-gray-600">总体进度</div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <Award className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {path.completedSteps}/{path.totalSteps}
            </div>
            <div className="text-xs text-gray-600">完成步骤</div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(path.estimatedTimeLeft / 60)}h
            </div>
            <div className="text-xs text-gray-600">预计剩余</div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <GraduationCap className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              Level {currentStep?.level || 1}
            </div>
            <div className="text-xs text-gray-600">当前级别</div>
          </div>
        </div>
      </Card>

      {/* 学习路径时间线 */}
      <PathTimeline
        steps={path.steps}
        currentStepId={currentStep?.id}
        todayTaskStepId={dailyStatus?.todayTask?.stepId}
      />
    </div>
  );
}
