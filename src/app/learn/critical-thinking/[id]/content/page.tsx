'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LevelSelector } from '@/components/learn/thinking-types/LevelSelector';
import LearningContentViewer from '@/components/learn/thinking-types/LearningContentViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface LevelProgress {
  level: number;
  unlocked: boolean;
  progress: number;
  questionsCompleted: number;
  averageScore: number;
}

interface LearningContent {
  id: string;
  contentType: 'concepts' | 'frameworks' | 'examples' | 'practice_guide';
  title: string;
  description: string;
  content: {
    markdown: string;
    sections?: any[];
  };
  estimatedTime: number;
  tags: string[];
}

export default function LearningContentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const thinkingTypeId = params.id as string;

  const [currentLevel, setCurrentLevel] = useState(1);
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user progress and level data
  useEffect(() => {
    async function fetchProgress() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/critical-thinking/questions/by-level?thinkingTypeId=${thinkingTypeId}&level=1`
        );

        if (!response.ok) throw new Error('Failed to fetch progress');

        const data = await response.json();
        if (data.success && data.data.userProgress) {
          const progress = data.data.userProgress;

          // Build levels array from progress
          const levelsData: LevelProgress[] = [];
          for (let i = 1; i <= 5; i++) {
            levelsData.push({
              level: i,
              unlocked: progress[`level${i}Unlocked`] || i === 1,
              progress: progress[`level${i}Progress`] || 0,
              questionsCompleted: progress[`level${i}QuestionsCompleted`] || 0,
              averageScore: progress[`level${i}AverageScore`] || 0,
            });
          }

          setLevels(levelsData);
          setCurrentLevel(progress.currentLevel || 1);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('加载进度失败');
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [session, thinkingTypeId]);

  // Fetch learning content for current level
  useEffect(() => {
    async function fetchContent() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/critical-thinking/learning-content?thinkingTypeId=${thinkingTypeId}&level=${currentLevel}`
        );

        if (!response.ok) throw new Error('Failed to fetch content');

        const data = await response.json();
        if (data.success && data.data.contents) {
          setContents(data.data.contents);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('加载学习内容失败');
      }
    }

    fetchContent();
  }, [session, thinkingTypeId, currentLevel]);

  const handleLevelSelect = (level: number) => {
    setCurrentLevel(level);
  };

  const handleStartPractice = () => {
    router.push(`/learn/critical-thinking/${thinkingTypeId}/practice`);
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">请先登录查看学习内容</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">学习内容</h1>
            <p className="text-gray-600">
              系统化学习批判性思维方法，逐级提升思维能力
            </p>
          </div>
          <Button onClick={handleStartPractice} size="lg">
            <BookOpen className="w-4 h-4 mr-2" />
            开始练习
          </Button>
        </div>
      </div>

      {/* Level Selector */}
      <div className="mb-8">
        <LevelSelector
          currentLevel={currentLevel}
          levels={levels}
          onLevelSelect={handleLevelSelect}
        />
      </div>

      {/* Learning Content */}
      <div>
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Level {currentLevel} 的学习内容正在准备中，敬请期待...
            </p>
          </div>
        ) : (
          <LearningContentViewer
            thinkingTypeId={thinkingTypeId}
            level={currentLevel}
            contents={contents}
            onProgressUpdate={(contentId, completed) => {
              console.log(`Content ${contentId} marked as ${completed ? 'completed' : 'incomplete'}`);
              // TODO: Implement progress tracking API call
            }}
          />
        )}
      </div>
    </div>
  );
}
