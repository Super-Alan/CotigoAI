'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  CriticalThinkingDimension,
  DifficultyLevel,
  GeneratedTopic,
  DIMENSION_LABELS,
  DIMENSION_ICONS,
  DIMENSION_COLORS,
  DIFFICULTY_LABELS,
} from '@/types/topic';
import { getDimensionDescription } from '@/lib/topicGenerator';

export default function ConversationsPageV2() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Tab状态
  const [activeTab, setActiveTab] = useState<'list' | 'generate'>('list');

  // 话题列表状态
  const [topicList, setTopicList] = useState<GeneratedTopic[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 话题生成状态
  const [selectedDimension, setSelectedDimension] = useState<CriticalThinkingDimension | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // 初始加载话题列表和恢复生成配置
  useEffect(() => {
    loadTopicList();

    // 从localStorage恢复上次的选择
    const savedDimension = localStorage.getItem('topic_generation_dimension');
    const savedDifficulty = localStorage.getItem('topic_generation_difficulty');

    if (savedDimension && savedDimension !== 'null') {
      setSelectedDimension(savedDimension as CriticalThinkingDimension);
    }
    if (savedDifficulty && savedDifficulty !== 'null') {
      setSelectedDifficulty(savedDifficulty as DifficultyLevel);
    }
  }, []);

  // 保存选择到localStorage
  useEffect(() => {
    localStorage.setItem('topic_generation_dimension', String(selectedDimension));
    localStorage.setItem('topic_generation_difficulty', String(selectedDifficulty));
  }, [selectedDimension, selectedDifficulty]);

  // 阻止生成过程中的页面离开
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        e.preventDefault();
        e.returnValue = '话题正在生成中，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  // 懒加载：监听滚动事件
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (!target || activeTab !== 'list') return;

      const { scrollTop, scrollHeight, clientHeight } = target;
      // 滚动到距离底部 100px 时触发加载
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoadingList) {
        loadTopicList(currentPage + 1, true);
      }
    };

    const scrollContainer = document.getElementById('topic-list-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeTab, currentPage, hasMore, isLoadingList]);

  const handleStartConversation = async (selectedTopic?: string) => {
    const topicText = selectedTopic || topic.trim();
    if (!topicText || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicText,
          autoStart: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      router.push(`/conversations/${data.id}?new=true&topic=${encodeURIComponent(topicText)}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('创建对话失败,请稍后重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 新增：将话题复制到输入框
  const handleCopyTopicToInput = (topicText: string) => {
    setTopic(topicText);
    // 滚动到页面顶部的输入框
    document.getElementById('topic-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 聚焦输入框
    setTimeout(() => {
      document.getElementById('topic-input')?.focus();
    }, 500);
  };

  const loadTopicList = async (page: number = 1, append: boolean = false) => {
    if (isLoadingList) return;

    setIsLoadingList(true);
    try {
      const response = await fetch(`/api/topics/list?limit=10&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to load topics');
      }
      const data = await response.json();

      if (append) {
        // 懒加载模式：追加新数据
        setTopicList((prev) => [...prev, ...data.topics]);
      } else {
        // 初始加载：替换数据
        setTopicList(data.topics);
      }

      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotal(data.pagination.total);
        // 判断是否还有更多数据
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const shuffleTopics = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/topics/random?count=6');
      if (!response.ok) {
        throw new Error('Failed to shuffle topics');
      }
      const data = await response.json();
      setTopicList(data.topics);
    } catch (error) {
      console.error('Error shuffling topics:', error);
      alert('换一换失败,请稍后重试');
    } finally {
      setIsLoadingList(false);
    }
  };

  const generateTopics = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimension: selectedDimension,
          difficulty: selectedDifficulty,
          count: 6,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate topics');
      }

      const data = await response.json();

      // 显示去重统计信息
      if (data.stats && data.stats.existing > 0) {
        console.log(`[话题生成] 总计: ${data.stats.total}, 新增: ${data.stats.new}, 已存在: ${data.stats.existing}`);
      }

      // 生成后切换到列表Tab并刷新列表
      await loadTopicList(1);
      setActiveTab('list');
    } catch (error) {
      console.error('Error generating topics:', error);
      alert('生成话题失败,请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (tab: 'list' | 'generate') => {
    // 如果正在生成，提示用户
    if (isGenerating && tab !== activeTab) {
      const confirmed = window.confirm('话题正在生成中，切换Tab会中断操作。确定要切换吗？');
      if (!confirmed) {
        return;
      }
      // 用户确认后停止生成状态（虽然后台请求会继续）
      setIsGenerating(false);
    }
    setActiveTab(tab);
  };

  const getDimensionColorClass = (dimension: CriticalThinkingDimension) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      purple: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
      green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      pink: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colorMap[DIMENSION_COLORS[dimension]] || colorMap.blue;
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colorMap = {
      beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return colorMap[difficulty];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
          {/* Title - Modern tech style */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 glass rounded-full mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-mono font-medium">QS Top 10 面试标准</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4 text-gradient tracking-tight">
              苏格拉底对话
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              一场随时可以开始的对话，开启名校顶级思维训练
            </p>
          </div>

          {/* Quick Start Input - Minimalist & Bold */}
          <div className="group relative">
            {/* 极简标题 */}
            <h2 className="text-sm font-medium text-muted-foreground mb-3 tracking-wide">快速开始自定义对话</h2>

            {/* 主输入区 - 大气简约 */}
            <div className="relative">
              <textarea
                id="topic-input"
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="输入你的观点，开启一场思维挑战..."
                className="w-full px-6 py-5 text-lg border-2 border-border/60 dark:border-border/40 rounded-2xl focus:ring-0 focus:border-primary bg-card dark:bg-card text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 resize-none shadow-sm hover:border-border/80 focus:shadow-lg"
                style={{ minHeight: '120px' }}
              />

              {/* 悬浮操作按钮 */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => handleStartConversation()}
                  disabled={!topic.trim() || isCreating}
                  className="group/btn flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isCreating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      <span className="text-sm">创建中</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold">开始对话</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Modern style */}
          <div className="glass rounded-3xl shadow-colored overflow-hidden flex flex-col border-2 border-white/20 dark:border-white/10" style={{ height: 'calc(100vh - 450px)', minHeight: '600px' }}>
            <div className="border-b border-border/50 flex-shrink-0 p-2 bg-muted/30">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`relative flex-1 px-6 py-3 text-center font-display font-semibold transition-smooth rounded-xl overflow-hidden ${
                    activeTab === 'list'
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {activeTab === 'list' && (
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"></span>
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    话题广场
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`relative flex-1 px-6 py-3 text-center font-display font-semibold transition-smooth rounded-xl overflow-hidden ${
                    activeTab === 'generate'
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {activeTab === 'generate' && (
                    <span className="absolute inset-0 bg-gradient-to-r from-secondary to-accent"></span>
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    定制生成
                  </span>
                </button>
              </div>
            </div>

            <div id="topic-list-container" className="flex-1 overflow-y-auto p-6">
              {/* Tab 1: Topic List */}
              {activeTab === 'list' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {topicList.length > 0 ? '最近生成的话题' : '暂无话题'}
                    </h3>
                    {topicList.length > 0 && (
                      <button
                        onClick={shuffleTopics}
                        disabled={isLoadingList}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                      >
                        {isLoadingList ? '⏳ 加载中...' : '🎲 随机换一换'}
                      </button>
                    )}
                  </div>

                  {isLoadingList && topicList.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : topicList.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        还没有生成过话题，去「定制生成」创建专属话题吧！
                      </p>
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        去生成话题 →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-6">
                        {topicList.map((genTopic) => (
                        <div
                          key={genTopic.id}
                          className="group relative glass rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-smooth hover:shadow-colored"
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-smooth -z-10"></div>

                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-2 flex-wrap">
                              <span className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg backdrop-blur-sm ${getDimensionColorClass(genTopic.dimension as CriticalThinkingDimension)}`}>
                                {DIMENSION_ICONS[genTopic.dimension as CriticalThinkingDimension]} {DIMENSION_LABELS[genTopic.dimension as CriticalThinkingDimension]}
                              </span>
                              <span className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg backdrop-blur-sm ${getDifficultyColor(genTopic.difficulty as DifficultyLevel)}`}>
                                {DIFFICULTY_LABELS[genTopic.difficulty as DifficultyLevel]}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground shrink-0 px-3 py-1.5 bg-muted/50 rounded-lg">{genTopic.referenceUniversity}</span>
                          </div>

                          {/* Topic */}
                          <h3 className="font-display font-bold text-xl mb-3 text-foreground group-hover:text-gradient transition-smooth leading-snug">
                            {genTopic.topic}
                          </h3>

                          {/* Context */}
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{genTopic.context}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {genTopic.tags.map((tag) => (
                              <span key={tag} className="text-xs font-mono px-3 py-1 bg-muted/70 text-muted-foreground rounded-lg hover:bg-muted transition-smooth">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Core Challenge */}
                          <div className="relative p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border-l-4 border-amber-500 rounded-r-xl mb-4 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 relative z-10 leading-relaxed">
                              <span className="text-lg mr-2">🎯</span>
                              {genTopic.thinkingFramework.coreChallenge}
                            </p>
                          </div>

                          {/* Expandable Details */}
                          <details
                            className="mb-3"
                            open={expandedTopic === genTopic.id}
                            onToggle={(e) => setExpandedTopic(e.currentTarget.open ? genTopic.id! : null)}
                          >
                            <summary className="cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
                              查看引导问题框架 →
                            </summary>
                            <div className="mt-3 space-y-3 pl-4">
                              {/* Thinking Framework */}
                              {genTopic.thinkingFramework.commonPitfalls && genTopic.thinkingFramework.commonPitfalls.length > 0 && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                                    ⚠️ 常见思维误区：
                                  </p>
                                  <ul className="text-xs text-red-700 dark:text-red-200 space-y-1">
                                    {genTopic.thinkingFramework.commonPitfalls.map((pitfall: string, idx: number) => (
                                      <li key={idx}>• {pitfall}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Guiding Questions */}
                              <div className="space-y-2">
                                {genTopic.guidingQuestions.map((gq: any, idx: number) => (
                                  <div key={idx} className="text-sm border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                      {gq.stage}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs">
                                      💬 {gq.question}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Expected Outcomes */}
                              {genTopic.expectedOutcomes && genTopic.expectedOutcomes.length > 0 && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                    🎯 学习成果：
                                  </p>
                                  <ul className="text-xs text-green-700 dark:text-green-200 space-y-1">
                                    {genTopic.expectedOutcomes.map((outcome: string, idx: number) => (
                                      <li key={idx}>• {outcome}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </details>

                          {/* Footer: Time + Button */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Created Time */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-mono text-xs">
                                {genTopic.createdAt
                                  ? new Date(genTopic.createdAt).toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '未知时间'}
                              </span>
                            </div>

                            {/* Right: Start Button (Compact) */}
                            <button
                              onClick={() => handleCopyTopicToInput(genTopic.topic)}
                              className="group/btn flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-medium px-5 py-2.5 rounded-lg hover:shadow-lg transition-smooth text-sm shrink-0"
                            >
                              <span>开始训练</span>
                              <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        ))}
                      </div>

                      {/* Lazy Loading Indicator */}
                      {isLoadingList && (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                            <span className="text-sm font-medium">加载更多话题中...</span>
                          </div>
                        </div>
                      )}

                      {/* No More Data */}
                      {!hasMore && topicList.length > 0 && (
                        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>━━━━</span>
                            <span>已加载全部 {total} 个话题</span>
                            <span>━━━━</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Generate */}
              {activeTab === 'generate' && (
                <div className="space-y-6">
                  {/* Pro Tip */}
                  <div className="relative p-6 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                        ✨
                      </div>
                      <div>
                        <p className="font-display font-bold text-lg text-purple-900 dark:text-purple-100 mb-2">
                          专业提示词系统已启用
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-200 leading-relaxed">
                          基于 QS Top 10 高校面试题深度优化，每个维度都有专业的出题框架和质量保障机制。
                          选择特定维度可获得更精准、更专业的话题生成。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dimension Selector */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      <h3 className="text-xl font-display font-bold">选择批判性思维训练维度</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                      <button
                        onClick={() => setSelectedDimension(null)}
                        className={`group/dim relative p-5 rounded-2xl border-2 transition-smooth overflow-hidden ${
                          selectedDimension === null
                            ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        {selectedDimension === null && (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                        )}
                        <div className="relative z-10 text-center">
                          <div className="text-3xl mb-2">🌈</div>
                          <div className="font-display font-semibold text-sm">混合训练</div>
                        </div>
                      </button>
                      {Object.values(CriticalThinkingDimension).map((dim) => (
                        <button
                          key={dim}
                          onClick={() => setSelectedDimension(dim)}
                          className={`group/dim relative p-5 rounded-2xl border-2 transition-smooth overflow-hidden ${
                            selectedDimension === dim
                              ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          {selectedDimension === dim && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                          )}
                          <div className="relative z-10 text-center">
                            <div className="text-3xl mb-2">{DIMENSION_ICONS[dim]}</div>
                            <div className="font-display font-semibold text-xs leading-tight">{DIMENSION_LABELS[dim]}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedDimension && (
                      <div className="relative p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <p className="text-sm text-blue-900 dark:text-blue-100 relative z-10 leading-relaxed">
                          {getDimensionDescription(selectedDimension)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Difficulty Selector */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-8 w-1 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
                      <h3 className="text-xl font-display font-bold">选择难度级别</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => setSelectedDifficulty(null)}
                        className={`relative p-5 rounded-2xl border-2 transition-smooth overflow-hidden ${
                          selectedDifficulty === null
                            ? 'border-secondary bg-gradient-to-br from-secondary/10 to-accent/10'
                            : 'border-border hover:border-secondary/50 hover:bg-muted/50'
                        }`}
                      >
                        {selectedDifficulty === null && (
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5"></div>
                        )}
                        <div className="relative z-10">
                          <div className="font-display font-semibold mb-1">🎲 混合难度</div>
                          <div className="text-xs font-mono text-muted-foreground">自适应推荐</div>
                        </div>
                      </button>
                      {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`relative p-5 rounded-2xl border-2 transition-smooth overflow-hidden ${
                            selectedDifficulty === diff
                              ? 'border-secondary bg-gradient-to-br from-secondary/10 to-accent/10'
                              : 'border-border hover:border-secondary/50 hover:bg-muted/50'
                          }`}
                        >
                          {selectedDifficulty === diff && (
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5"></div>
                          )}
                          <div className="relative z-10">
                            <div className="font-display font-semibold mb-1">{DIFFICULTY_LABELS[diff]}</div>
                            <div className="text-xs font-mono text-muted-foreground">
                              {diff === 'beginner' && '本地化·单一领域'}
                              {diff === 'intermediate' && '国家级·跨领域'}
                              {diff === 'advanced' && '全球性·系统性'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="space-y-5">
                    {isGenerating && (
                      <div className="relative p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-500/50 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                          </div>
                          <div>
                            <p className="font-display font-semibold text-amber-900 dark:text-amber-100 mb-1">
                              正在生成话题中，请勿离开页面
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-200 leading-relaxed">
                              这个过程需要5-10秒，完成后会自动切换到「话题广场」
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center pt-2">
                      <button
                        onClick={generateTopics}
                        disabled={isGenerating}
                        className="group relative px-12 py-5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-display font-bold text-lg rounded-2xl hover:shadow-colored transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-xl overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {isGenerating ? (
                            <>
                              <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></span>
                              生成中...
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                              生成专属话题推荐
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Description - Modern card grid */}
          <div className="glass rounded-3xl shadow-colored p-8 border-2 border-white/20 dark:border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              <h2 className="text-2xl font-display font-bold">苏格拉底对话四阶段</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-smooth overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-blue-500 text-white rounded-2xl font-display font-bold text-lg shadow-lg">
                    1
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">澄清概念</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">AI会帮你明确术语定义,避免模糊表述</p>
                  </div>
                </div>
              </div>
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-smooth overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-secondary to-pink-500 text-white rounded-2xl font-display font-bold text-lg shadow-lg">
                    2
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">检验证据</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">追溯你的论点是否有事实支持</p>
                  </div>
                </div>
              </div>
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-smooth overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl font-display font-bold text-lg shadow-lg">
                    3
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">挖掘假设</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">揭示你没有意识到的隐藏前提</p>
                  </div>
                </div>
              </div>
              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 transition-smooth overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl font-display font-bold text-lg shadow-lg">
                    4
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">探索视角</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">引导你换位思考,看到其他可能性</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
