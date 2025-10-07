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

export default function ConversationsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 话题推荐状态
  const [selectedDimension, setSelectedDimension] = useState<CriticalThinkingDimension | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // 页面加载时生成初始话题
  useEffect(() => {
    generateTopics();
  }, []);

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
      setGeneratedTopics(data.topics);
    } catch (error) {
      console.error('Error generating topics:', error);
      alert('生成话题失败,请稍后重试');
    } finally {
      setIsGenerating(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              💭 苏格拉底对话
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              QS Top 10 高校面试级批判性思维训练
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">开始自定义对话</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="topic-input" className="block text-sm font-medium mb-2">
                  输入你的观点或议题
                </label>
                <textarea
                  id="topic-input"
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如: 我认为人工智能最终会取代所有人类工作..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <button
                onClick={() => handleStartConversation()}
                disabled={!topic.trim() || isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? '创建中...' : '开始苏格拉底式对话 →'}
              </button>
            </div>
          </div>

          {/* Dimension Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🎯 选择批判性思维训练维度</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              <button
                onClick={() => {
                  setSelectedDimension(null);
                  setGeneratedTopics([]);
                }}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedDimension === null
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl mb-2">🌈</div>
                <div className="font-medium text-sm">混合训练</div>
              </button>
              {Object.values(CriticalThinkingDimension).map((dim) => (
                <button
                  key={dim}
                  onClick={() => {
                    setSelectedDimension(dim);
                    setGeneratedTopics([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedDimension === dim
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{DIMENSION_ICONS[dim]}</div>
                  <div className="font-medium text-sm">{DIMENSION_LABELS[dim]}</div>
                </button>
              ))}
            </div>

            {selectedDimension && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {getDimensionDescription(selectedDimension)}
                </p>
              </div>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 选择难度级别</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setSelectedDifficulty(null);
                  setGeneratedTopics([]);
                }}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedDifficulty === null
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-medium">🎲 混合难度</div>
                <div className="text-xs text-gray-500 mt-1">自适应推荐</div>
              </button>
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setGeneratedTopics([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedDifficulty === diff
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium">{DIFFICULTY_LABELS[diff]}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {diff === 'beginner' && '日常生活相关'}
                    {diff === 'intermediate' && '社会热点议题'}
                    {diff === 'advanced' && '国际视野深度'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateTopics}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating ? '⏳ 生成中...' : '✨ 生成专属话题推荐'}
            </button>
          </div>

          {/* Generated Topics */}
          {generatedTopics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">🎓 为你生成的话题</h2>
                <span className="text-sm text-gray-500">共 {generatedTopics.length} 个</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTopics.map((genTopic) => (
                  <div
                    key={genTopic.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-purple-400 transition group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getDimensionColorClass(genTopic.dimension)}`}>
                          {DIMENSION_ICONS[genTopic.dimension]} {DIMENSION_LABELS[genTopic.dimension]}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(genTopic.difficulty)}`}>
                          {DIFFICULTY_LABELS[genTopic.difficulty]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{genTopic.referenceUniversity}</span>
                    </div>

                    {/* Topic */}
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {genTopic.topic}
                    </h3>

                    {/* Context */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{genTopic.context}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {genTopic.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Core Challenge */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 mb-3">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        🎯 {genTopic.thinkingFramework.coreChallenge}
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
                      <div className="mt-3 space-y-2 pl-4">
                        {genTopic.guidingQuestions.map((gq) => (
                          <div key={gq.level} className="text-sm">
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {gq.level}. {gq.stage}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 ml-4 mt-1">→ {gq.question}</p>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* Start Button */}
                    <button
                      onClick={() => handleStartConversation(genTopic.topic)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
                    >
                      开始训练 →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">💡 苏格拉底对话四阶段</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold mb-1">澄清概念</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI会帮你明确术语定义,避免模糊表述</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold mb-1">检验证据</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">追溯你的论点是否有事实支持</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold mb-1">挖掘假设</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">揭示你没有意识到的隐藏前提</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold">
                  4
                </span>
                <div>
                  <h3 className="font-semibold mb-1">探索视角</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">引导你换位思考,看到其他可能性</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
