'use client';

import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LevelInfo {
  level: number;
  progress: number;
  unlocked: boolean;
  questionsCompleted: number;
  averageScore?: number;
  currentLevel?: boolean;
}

interface LevelSelectorProps {
  levels: LevelInfo[];
  currentLevel: number;
  onLevelSelect: (level: number) => void;
  className?: string;
}

export function LevelSelector({
  levels,
  currentLevel,
  onLevelSelect,
  className,
}: LevelSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className="text-lg font-semibold text-gray-900">选择Level</h3>
      <div className="grid grid-cols-5 gap-2">
        {levels.map((levelInfo) => {
          const isActive = levelInfo.level === currentLevel;
          const isUnlocked = levelInfo.unlocked;
          const isCompleted = levelInfo.progress >= 100;

          return (
            <button
              key={levelInfo.level}
              onClick={() => isUnlocked && onLevelSelect(levelInfo.level)}
              disabled={!isUnlocked}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                isActive && 'border-blue-500 bg-blue-50',
                !isActive && isUnlocked && 'border-gray-300 hover:border-blue-300',
                !isUnlocked && 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              )}
            >
              {/* Level标签 */}
              <div className="text-xs font-medium text-gray-500 mb-1">Level {levelInfo.level}</div>

              {/* 图标 */}
              <div className="mb-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : isUnlocked ? (
                  <Circle className="w-8 h-8 text-blue-500" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* 进度信息 */}
              {isUnlocked && (
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {levelInfo.progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    {levelInfo.questionsCompleted}题
                  </div>
                  {(levelInfo.averageScore ?? 0) > 0 && (
                    <div className="text-xs text-gray-500">
                      {levelInfo.averageScore?.toFixed(0)}分
                    </div>
                  )}
                </div>
              )}

              {/* 未解锁提示 */}
              {!isUnlocked && (
                <div className="text-xs text-gray-400 text-center mt-1">
                  待解锁
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 解锁提示 */}
      {levels.some((l) => !l.unlocked) && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
          💡 提示：完成上一Level的10道题目（准确率80%以上）即可解锁下一Level
        </div>
      )}
    </div>
  );
}
