'use client';

import { TrendingUp, Award, ArrowRight, Lock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NextLevelGuidanceProps {
  currentLevel: number;
  levelProgress: {
    level: number;
    questionsCompleted: number;
    averageScore: number;
    progress: number;
  };
  unlockStatus?: {
    unlocked: boolean;
    level: number;
    message: string;
    questionsCompleted: number;
    questionsRequired: number;
    averageScore: number;
    requiredScore: number;
  };
  onNextQuestion?: () => void;
  onViewNextLevel?: () => void;
  className?: string;
}

export function NextLevelGuidance({
  currentLevel,
  levelProgress,
  unlockStatus,
  onNextQuestion,
  onViewNextLevel,
  className,
}: NextLevelGuidanceProps) {
  const questionsRemaining = unlockStatus
    ? Math.max(0, unlockStatus.questionsRequired - unlockStatus.questionsCompleted)
    : 0;

  const scoreGap = unlockStatus ? unlockStatus.requiredScore - unlockStatus.averageScore : 0;

  const showCongratulations = unlockStatus?.unlocked;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 恭喜解锁新Level */}
      {showCongratulations ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-10 h-10 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-green-900">
                🎉 恭喜！解锁Level {unlockStatus.level}！
              </h3>
              <p className="text-sm text-green-700">你已成功掌握Level {currentLevel}的核心技能</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">已完成题目</div>
              <div className="text-2xl font-bold text-gray-900">
                {unlockStatus.questionsCompleted}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">平均准确率</div>
              <div className="text-2xl font-bold text-green-600">
                {unlockStatus.averageScore.toFixed(0)}%
              </div>
            </div>
          </div>

          {onViewNextLevel && (
            <Button
              onClick={onViewNextLevel}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              查看Level {unlockStatus.level}内容
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Level进度卡片 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Level {currentLevel} 进度
                </h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {levelProgress.progress.toFixed(0)}%
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.progress}%` }}
                />
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">已完成</div>
                <div className="text-xl font-bold text-gray-900">
                  {levelProgress.questionsCompleted}题
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">平均分</div>
                <div className="text-xl font-bold text-gray-900">
                  {levelProgress.averageScore.toFixed(0)}分
                </div>
              </div>
            </div>
          </div>

          {/* 解锁下一Level提示 */}
          {unlockStatus && !unlockStatus.unlocked && currentLevel < 5 && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    解锁Level {unlockStatus.level}
                  </h3>
                  <p className="text-sm text-gray-700">{unlockStatus.message}</p>
                </div>
              </div>

              {/* 解锁条件进度 */}
              <div className="space-y-3">
                {/* 题目数量 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">完成题目</span>
                    <span className="font-medium text-gray-900">
                      {unlockStatus.questionsCompleted}/{unlockStatus.questionsRequired}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        unlockStatus.questionsCompleted >= unlockStatus.questionsRequired
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      )}
                      style={{
                        width: `${(unlockStatus.questionsCompleted / unlockStatus.questionsRequired) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 准确率 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">准确率</span>
                    <span className="font-medium text-gray-900">
                      {unlockStatus.averageScore.toFixed(0)}% / {unlockStatus.requiredScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        unlockStatus.averageScore >= unlockStatus.requiredScore
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      )}
                      style={{
                        width: `${Math.min((unlockStatus.averageScore / unlockStatus.requiredScore) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 下一步建议 */}
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  💡 提升建议：
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {questionsRemaining > 0 && (
                    <li>• 继续练习，还需完成 {questionsRemaining} 道题</li>
                  )}
                  {scoreGap > 0 && (
                    <li>• 提高准确率 {scoreGap.toFixed(0)}% 以达到解锁标准</li>
                  )}
                  <li>• 复习Level {currentLevel}的核心概念和框架</li>
                  <li>• 分析错题，总结常见错误模式</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* 继续练习按钮 */}
      {onNextQuestion && !showCongratulations && (
        <Button onClick={onNextQuestion} className="w-full" size="lg">
          <TrendingUp className="mr-2 w-5 h-5" />
          继续练习
        </Button>
      )}
    </div>
  );
}
