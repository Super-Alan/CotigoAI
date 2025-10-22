'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronDown, ChevronUp, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import TheoryLevelCard from './TheoryLevelCard';

interface TheorySystemContainerV2Props {
  thinkingTypeId: string;
  thinkingTypeName: string;
  initialExpanded?: boolean;
}

interface LevelData {
  id: string;
  level: number;
  title: string;
  difficulty: string;
  estimatedTime: number;
  userProgress: {
    status: string;
    progressPercent: number;
  };
}

interface OverallProgress {
  totalLevels: number;
  completedLevels: number;
  averageProgress: number;
}

// 维度颜色主题映射
const dimensionColors = {
  causal_analysis: {
    gradient: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    progressBg: 'bg-blue-600',
    badgeBg: 'bg-blue-100 text-blue-800',
    hoverBorder: 'hover:border-blue-300',
  },
  premise_challenge: {
    gradient: 'from-green-50 to-green-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    progressBg: 'bg-green-600',
    badgeBg: 'bg-green-100 text-green-800',
    hoverBorder: 'hover:border-green-300',
  },
  fallacy_detection: {
    gradient: 'from-red-50 to-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    progressBg: 'bg-red-600',
    badgeBg: 'bg-red-100 text-red-800',
    hoverBorder: 'hover:border-red-300',
  },
  iterative_reflection: {
    gradient: 'from-purple-50 to-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    progressBg: 'bg-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800',
    hoverBorder: 'hover:border-purple-300',
  },
  connection_transfer: {
    gradient: 'from-orange-50 to-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    progressBg: 'bg-orange-600',
    badgeBg: 'bg-orange-100 text-orange-800',
    hoverBorder: 'hover:border-orange-300',
  },
} as const;

type DimensionKey = keyof typeof dimensionColors;

export default function TheorySystemContainerV2({
  thinkingTypeId,
  thinkingTypeName,
  initialExpanded = false,
}: TheorySystemContainerV2Props) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取维度颜色主题
  const colors = dimensionColors[thinkingTypeId as DimensionKey] || dimensionColors.causal_analysis;

  // Fetch theory system overview when expanded
  useEffect(() => {
    if (isExpanded && levels.length === 0) {
      fetchTheoryOverview();
    }
  }, [isExpanded]);

  const fetchTheoryOverview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/theory-system/${thinkingTypeId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch theory system overview');
      }

      const data = await response.json();
      setLevels(data.levels);
      setOverallProgress(data.overallProgress);
    } catch (err) {
      console.error('Failed to load theory system:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-300 ${
      isExpanded ? `bg-gradient-to-br ${colors.gradient} ${colors.hoverBorder}` : 'hover:shadow-md'
    }`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-white/50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-4">
          {/* Icon with animation */}
          <div className={`p-3 ${colors.iconBg} rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-110`}>
            <GraduationCap className={`h-6 w-6 ${colors.iconColor}`} />
          </div>

          {/* Title and description */}
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
              {thinkingTypeName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              理论学习系统 - 5个Level × 3个章节
            </p>
          </div>
        </div>

        {/* Right side: Progress badge and chevron */}
        <div className="flex items-center gap-3">
          {overallProgress && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge className={`${colors.badgeBg} font-semibold px-3 py-1`}>
                {Math.round(overallProgress.averageProgress)}% 完成
              </Badge>
            </div>
          )}
          <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? colors.iconBg : 'hover:bg-gray-100'}`}>
            {isExpanded ? (
              <ChevronUp className={`h-5 w-5 ${isExpanded ? colors.iconColor : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content with smooth animation */}
      {isExpanded && (
        <div className="border-t border-gray-200 animate-in slide-in-from-top duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/50">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-3 ${colors.progressBg.replace('bg-', 'border-')}`}></div>
              <p className="mt-4 text-sm text-gray-600">加载理论内容中...</p>
            </div>
          ) : error ? (
            <div className="m-4 sm:m-6 bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
              <p className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                加载失败
              </p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : levels.length > 0 ? (
            <div className="p-4 sm:p-6 space-y-5 bg-white/50">
              {/* Enhanced Progress Summary Card */}
              {overallProgress && (
                <div className={`bg-white rounded-xl border-2 p-5 shadow-sm ${colors.hoverBorder}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-5 w-5 ${colors.iconColor}`} />
                      <span className="font-semibold text-gray-900">学习进度总览</span>
                    </div>
                    <Badge className={`${colors.badgeBg} font-bold text-base px-3 py-1`}>
                      {Math.round(overallProgress.averageProgress)}%
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <Progress
                    value={overallProgress.averageProgress}
                    className="h-3 mb-3"
                  />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{overallProgress.totalLevels}</div>
                      <div className="text-xs text-gray-600 mt-1">总Level数</div>
                    </div>
                    <div className={`${colors.gradient.replace('from-', 'bg-').replace(' to-', '/50 bg-')} rounded-lg p-3`}>
                      <div className="text-2xl font-bold text-gray-900">{overallProgress.completedLevels}</div>
                      <div className="text-xs text-gray-700 mt-1 font-medium">已完成</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{overallProgress.totalLevels - overallProgress.completedLevels}</div>
                      <div className="text-xs text-gray-600 mt-1">待学习</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Level Cards with staggered animation */}
              <div className="space-y-3">
                {levels.map((levelData, index) => (
                  <div
                    key={levelData.id}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <TheoryLevelCard
                      thinkingTypeId={thinkingTypeId}
                      level={levelData.level}
                      title={levelData.title}
                      difficulty={levelData.difficulty}
                      completed={levelData.userProgress.status === 'completed'}
                      progress={levelData.userProgress.progressPercent}
                      unlocked={true} // All levels unlocked by default
                      estimatedTime={levelData.estimatedTime}
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced Learning Tips */}
              <div className={`mt-4 p-5 rounded-xl border-2 bg-gradient-to-r ${colors.gradient} ${colors.hoverBorder}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 ${colors.iconBg} rounded-lg flex-shrink-0`}>
                    <BookOpen className={`h-5 w-5 ${colors.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">💡 学习建议</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      建议从<strong>Level 1</strong>开始逐步学习，每个Level包含<strong>核心概念、思维模型和实例演示</strong>三个章节。
                      完成所有章节后，您将系统掌握该维度的批判性思维能力。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="m-4 sm:m-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-yellow-800">
              <p className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                暂无内容
              </p>
              <p className="text-sm mt-2">该思维维度的理论内容正在准备中，敬请期待...</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
