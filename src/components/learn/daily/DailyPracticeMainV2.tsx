'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Flame,
  Target,
  Calendar,
  Trophy,
  ArrowLeft,
  BarChart3,
  Settings,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import PathProgressBar from './PathProgressBar';
import TodayTaskCard from './TodayTaskCard';
import type { DailyTask, OptionalPractice } from '@/lib/services/unified-recommendation';

interface DailyStatus {
  todayCompleted: boolean;
  currentStreak: number;
  totalSessions: number;
  weeklyCompletion: number;
  userLevel: string;
  achievements: number;
  todayTask: DailyTask;
  optionalPractices: OptionalPractice[];
}

export default function DailyPracticeMainV2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchDailyStatus();
  }, [session, status, router]);

  const fetchDailyStatus = async () => {
    try {
      const response = await fetch('/api/daily-practice/status');
      if (!response.ok) throw new Error('获取状态失败');

      const data = await response.json();
      setDailyStatus(data);
    } catch (error) {
      console.error('获取每日状态失败:', error);
      toast.error('获取练习状态失败');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (thinkingTypeId: string) => {
    // Redirect to critical thinking practice
    router.push(`/learn/critical-thinking/${thinkingTypeId}/practice`);
  };

  const startTodayTask = () => {
    if (!dailyStatus?.todayTask) return;
    startPractice(dailyStatus.todayTask.thinkingTypeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!dailyStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">获取练习状态失败</p>
          <button
            onClick={fetchDailyStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/learn"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition text-sm sm:text-base min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回批判性思维学习
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            每日练习打卡
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
            跟随个性化学习路径，每天10分钟提升批判性思维能力
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <Flame
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    dailyStatus.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                  }`}
                />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {dailyStatus.currentStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">连续天数</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {dailyStatus.totalSessions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">总练习次数</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {dailyStatus.weeklyCompletion}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">本周完成率</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {dailyStatus.achievements}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">获得成就</div>
            </CardContent>
          </Card>
        </div>

        {/* Path Progress Bar */}
        {dailyStatus.todayTask && (
          <PathProgressBar
            currentPhase={dailyStatus.todayTask.context.currentPhase}
            progress={dailyStatus.todayTask.context.pathProgress}
            nextMilestone={dailyStatus.todayTask.context.nextMilestone}
            completedSteps={dailyStatus.todayTask.context.completedSteps}
            totalSteps={dailyStatus.todayTask.context.totalSteps}
            estimatedTimeLeft={300} // TODO: Get from path
            pathId={dailyStatus.todayTask.pathId}
          />
        )}

        {/* Today's Task Card */}
        {dailyStatus.todayTask && (
          <TodayTaskCard task={dailyStatus.todayTask} onStart={startTodayTask} />
        )}

        {/* Optional Practices */}
        {dailyStatus.optionalPractices && dailyStatus.optionalPractices.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              💪 额外练习（可选）
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              完成今日目标后，你可以选择其他维度的练习来拓展思维能力
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {dailyStatus.optionalPractices.map((practice) => (
                <Card
                  key={practice.id}
                  className={`${practice.color} transition-all duration-300 hover:shadow-lg cursor-pointer active:scale-95`}
                  onClick={() => startPractice(practice.thinkingTypeId)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                      {practice.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">
                      {practice.description}
                    </p>
                    {practice.reason && (
                      <p className="text-xs text-gray-600 italic">
                        💡 {practice.reason}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer active:scale-95"
            onClick={() => router.push('/learn/dashboard')}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                学习进度
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">查看详细的学习数据和能力评估</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer active:scale-95"
            onClick={() => router.push('/learn/daily/settings')}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                练习设置
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">个性化定制练习内容和难度</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer active:scale-95"
            onClick={() => router.push('/learn')}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                学习中心
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">返回主学习中心探索更多内容</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
