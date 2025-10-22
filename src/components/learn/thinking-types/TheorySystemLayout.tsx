'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Brain,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import ConceptsSection from './ConceptsSection';
import ModelsSection from './ModelsSection';
import DemonstrationsSection from './DemonstrationsSection';

interface TheorySystemLayoutProps {
  thinkingTypeId: string;
  level: number;
}

interface TheoryContent {
  id: string;
  thinkingTypeId: string;
  level: number;
  title: string;
  subtitle?: string;
  description: string;
  learningObjectives: string[];

  // 3个核心章节
  conceptsIntro?: string;
  conceptsContent: any;
  modelsIntro?: string;
  modelsContent: any;
  demonstrationsIntro?: string;
  demonstrationsContent: any;

  // 元数据
  estimatedTime: number;
  difficulty: string;
  tags: string[];
  keywords: string[];
  version: string;
  viewCount: number;
  completionRate?: number;
  userRating?: number;
}

interface TheoryProgress {
  id: string;
  userId: string;
  theoryContentId: string;
  status: string;
  progressPercent: number;
  sectionsCompleted: {
    concepts: boolean;
    models: boolean;
    demonstrations: boolean;
  };
  timeSpent: number;
  lastViewedAt: string;
  completedAt?: string;
  bookmarked: boolean;
  selfRating?: number;
  confidenceLevel?: string;
  needsReview: boolean;
  notes?: string;
}

interface NavigationLevel {
  id: string;
  level: number;
  title: string;
  difficulty: string;
}

export default function TheorySystemLayout({
  thinkingTypeId,
  level,
}: TheorySystemLayoutProps) {
  const [content, setContent] = useState<TheoryContent | null>(null);
  const [progress, setProgress] = useState<TheoryProgress | null>(null);
  const [navigation, setNavigation] = useState<{
    previous: NavigationLevel | null;
    next: NavigationLevel | null;
  }>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'concepts' | 'models' | 'demonstrations'>('concepts');
  const [startTime, setStartTime] = useState(Date.now());

  // Fetch content and progress
  useEffect(() => {
    fetchTheoryContent();
    setStartTime(Date.now());
  }, [thinkingTypeId, level]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 0 && timeSpent % 30 === 0) {
        // Update time every 30 seconds
        updateProgress('update_progress', { timeSpent: 30 });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [startTime, content]);

  const fetchTheoryContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/theory-system/${thinkingTypeId}/${level}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch theory content');
      }

      const data = await response.json();
      setContent(data.content);
      setProgress(data.userProgress);
      setNavigation(data.navigation);
    } catch (err) {
      console.error('Failed to load theory content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (action: string, data: any) => {
    if (!content) return;

    try {
      const response = await fetch('/api/theory-system/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theoryContentId: content.id,
          action,
          data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProgress(result.progress);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleSectionComplete = (section: 'concepts' | 'models' | 'demonstrations', completed: boolean) => {
    updateProgress('update_section', { section, completed });
  };

  const handleBookmark = () => {
    if (progress) {
      updateProgress('bookmark', { bookmarked: !progress.bookmarked });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p className="font-medium">加载失败</p>
        <p className="text-sm mt-1">{error || '内容不存在'}</p>
        <Button onClick={fetchTheoryContent} variant="outline" className="mt-3" size="sm">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(content.difficulty)}>
                {getDifficultyLabel(content.difficulty)}
              </Badge>
              <Badge variant="outline">Level {content.level}</Badge>
              {progress?.status === 'completed' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h1>
            {content.subtitle && (
              <p className="text-lg text-gray-600 mb-3">{content.subtitle}</p>
            )}
            <p className="text-gray-700">{content.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="ml-4"
          >
            {progress?.bookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Learning Objectives */}
        {content.learningObjectives && content.learningObjectives.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">学习目标</h3>
            <ul className="space-y-1">
              {content.learningObjectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">学习进度</span>
              <span className="text-sm text-gray-600">{progress.progressPercent}%</span>
            </div>
            <Progress value={progress.progressPercent} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(progress.timeSpent / 60)} 分钟
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  预计 {content.estimatedTime} 分钟
                </span>
              </div>
              {progress.selfRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {progress.selfRating}/5
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Section Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="concepts" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">核心概念</span>
            <span className="sm:hidden">概念</span>
            {progress?.sectionsCompleted.concepts && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">思维模型</span>
            <span className="sm:hidden">模型</span>
            {progress?.sectionsCompleted.models && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="demonstrations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">实例演示</span>
            <span className="sm:hidden">实例</span>
            {progress?.sectionsCompleted.demonstrations && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concepts">
          <ConceptsSection
            intro={content.conceptsIntro}
            content={content.conceptsContent}
            completed={progress?.sectionsCompleted.concepts || false}
            onComplete={(completed) => handleSectionComplete('concepts', completed)}
          />
        </TabsContent>

        <TabsContent value="models">
          <ModelsSection
            intro={content.modelsIntro}
            content={content.modelsContent}
            completed={progress?.sectionsCompleted.models || false}
            onComplete={(completed) => handleSectionComplete('models', completed)}
          />
        </TabsContent>

        <TabsContent value="demonstrations">
          <DemonstrationsSection
            intro={content.demonstrationsIntro}
            content={content.demonstrationsContent}
            completed={progress?.sectionsCompleted.demonstrations || false}
            onComplete={(completed) => handleSectionComplete('demonstrations', completed)}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {navigation.previous ? (
            <Button
              variant="outline"
              onClick={() => window.location.href = `/learn/critical-thinking/${thinkingTypeId}/theory/${navigation.previous!.level}`}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-gray-500">上一个Level</div>
                <div className="text-sm font-medium">{navigation.previous.title}</div>
              </div>
            </Button>
          ) : (
            <div></div>
          )}

          {navigation.next ? (
            <Button
              onClick={() => window.location.href = `/learn/critical-thinking/${thinkingTypeId}/theory/${navigation.next!.level}`}
              className="flex items-center gap-2"
            >
              <div className="text-right">
                <div className="text-xs opacity-90">下一个Level</div>
                <div className="text-sm font-medium">{navigation.next.title}</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </Card>
    </div>
  );
}
