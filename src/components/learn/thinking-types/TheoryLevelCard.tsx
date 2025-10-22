'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, ChevronRight, Clock } from 'lucide-react';

interface TheoryLevelCardProps {
  thinkingTypeId: string;
  level: number;
  title: string;
  difficulty: string;
  completed: boolean;
  progress: number;
  unlocked: boolean;
  estimatedTime?: number;
}

export default function TheoryLevelCard({
  thinkingTypeId,
  level,
  title,
  difficulty,
  completed,
  progress,
  unlocked,
  estimatedTime = 30,
}: TheoryLevelCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return diff;
    }
  };

  if (!unlocked) {
    return (
      <Card className="p-4 bg-gray-50 border-gray-200 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-400">Level {level}</h4>
              <p className="text-sm text-gray-400">完成上一Level解锁</p>
            </div>
          </div>
          <Badge variant="outline" className="text-gray-400">已锁定</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Link href={`/learn/critical-thinking/${thinkingTypeId}/theory/${level}`}>
      <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              completed ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="font-semibold text-blue-600">{level}</span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Level {level}</h4>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(difficulty)}>
              {getDifficultyLabel(difficulty)}
            </Badge>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">学习进度</span>
              <span className="text-xs font-medium text-gray-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            约 {estimatedTime} 分钟
          </span>
          {completed && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              已完成
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
