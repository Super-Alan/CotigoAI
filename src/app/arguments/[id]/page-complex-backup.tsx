'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Analysis {
  mainClaim: {
    statement: string;
    implicit: boolean;
    context: string;
  };
  premises: Array<{
    premise: string;
    support: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  evidence: Array<{
    type: 'empirical' | 'anecdotal' | 'statistical' | 'expert' | 'theoretical';
    content: string;
    credibility: 'high' | 'medium' | 'low';
    source?: string;
  }>;
  assumptions: Array<{
    assumption: string;
    explicit: boolean;
    challenge: string;
  }>;
  logicalStructure: {
    type: string;
    validity: string;
    coherence: string;
  };
  potentialFallacies: Array<{
    type: string;
    description: string;
    location: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  strengthAssessment: {
    overall: 'strong' | 'moderate' | 'weak';
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface ArgumentData {
  id: string;
  inputText: string;
  analysis: Analysis;
  createdAt: string;
}

export default function ArgumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [argumentData, setArgumentData] = useState<ArgumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && params.id) {
      loadArgumentData();
    }
  }, [status, params.id]);

  const loadArgumentData = async () => {
    try {
      const response = await fetch(`/api/arguments/${params.id}`);
      if (!response.ok) {
        throw new Error('无法加载解构数据');
      }
      const data = await response.json();
      console.log('[Detail Page] 接收到的数据:', {
        id: data.id,
        analysisKeys: data.analysis ? Object.keys(data.analysis) : 'undefined',
        mainClaim: data.analysis?.mainClaim
      });
      setArgumentData(data);
    } catch (err) {
      console.error('加载失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !argumentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {error || '未找到解构数据'}
            </h2>
            <Link
              href="/arguments"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回解构页面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { analysis } = argumentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 text-sm">
          <Link
            href="/arguments"
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回解构列表
          </Link>
          <span className="text-gray-400">|</span>
          <p className="text-gray-600 dark:text-gray-300 truncate max-w-xl">
            {argumentData.inputText.length > 80
              ? argumentData.inputText.substring(0, 80) + '...'
              : argumentData.inputText}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Text Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            输入文本
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {argumentData.inputText}
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            分析时间：{new Date(argumentData.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Main Claim */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 opacity-100 transform translate-y-0 transition-all duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              核心论点
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-white mb-2">
                  {analysis.mainClaim?.statement || '无法识别核心论点'}
                </p>
                {analysis.mainClaim?.implicit && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    隐含论点
                  </span>
                )}
              </div>
              {analysis.mainClaim?.context && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>上下文：</strong>
                  <p className="mt-1">{analysis.mainClaim.context}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premises */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              支撑前提
            </h3>
            <div className="space-y-3">
              {(analysis.premises || []).map((premise, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-medium text-gray-800 dark:text-white flex-1">
                      {idx + 1}. {premise.premise}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded shrink-0 ${
                        premise.relevance === 'high'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : premise.relevance === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {premise.relevance === 'high'
                        ? '高相关'
                        : premise.relevance === 'medium'
                        ? '中等相关'
                        : '低相关'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    <strong>支撑作用：</strong> {premise.support}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              证据支撑
            </h3>
            <div className="space-y-3">
              {(analysis.evidence || []).map((ev, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {ev.type === 'empirical'
                            ? '实证'
                            : ev.type === 'statistical'
                            ? '统计'
                            : ev.type === 'expert'
                            ? '专家'
                            : ev.type === 'anecdotal'
                            ? '轶事'
                            : '理论'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            ev.credibility === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : ev.credibility === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {ev.credibility === 'high'
                            ? '🔴 高度可信'
                            : ev.credibility === 'medium'
                            ? '🟡 中等可信'
                            : '⚪️ 需要验证'}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{ev.content}</p>
                      {ev.source && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          来源：{ev.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              隐含假设
            </h3>
            <div className="space-y-3">
              {(analysis.assumptions || []).map((assumption, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <p className="font-medium text-gray-800 dark:text-white flex-1">
                      {idx + 1}. {assumption.assumption}
                    </p>
                    {!assumption.explicit && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded shrink-0">
                        隐含
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    <strong>批判性思考：</strong>
                    <p className="mt-1">{assumption.challenge}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logical Structure */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              逻辑结构
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>论证类型：</strong> {analysis.logicalStructure?.type || '未知'}
                </p>
                {analysis.logicalStructure?.validity && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <strong>有效性评估：</strong>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 ml-4">
                      {analysis.logicalStructure.validity}
                    </p>
                  </>
                )}
                {analysis.logicalStructure?.coherence && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-2">
                      <strong>连贯性分析：</strong>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 ml-4">
                      {analysis.logicalStructure.coherence}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Potential Fallacies */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              潜在谬误
            </h3>
            {(analysis.potentialFallacies || []).length > 0 ? (
              <div className="space-y-3">
                {(analysis.potentialFallacies || []).map((fallacy, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      fallacy.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : fallacy.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {fallacy.type}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded shrink-0 ${
                          fallacy.severity === 'high'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                            : fallacy.severity === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {fallacy.severity === 'high'
                          ? '严重'
                          : fallacy.severity === 'medium'
                          ? '中等'
                          : '轻微'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {fallacy.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      位置：{fallacy.location}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">未发现明显的逻辑谬误</p>
            )}
          </div>

          {/* Strength Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              综合评估
            </h3>
            <div className="space-y-4">
              {analysis.strengthAssessment?.overall && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    整体强度：
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      analysis.strengthAssessment.overall === 'strong'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : analysis.strengthAssessment.overall === 'moderate'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {analysis.strengthAssessment.overall === 'strong'
                      ? '强'
                      : analysis.strengthAssessment.overall === 'moderate'
                      ? '中等'
                      : '弱'}
                  </span>
                </div>
              )}

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-300 mb-2">
                  ✅ 优势
                </p>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {(analysis.strengthAssessment?.strengths || []).map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="font-medium text-red-800 dark:text-red-300 mb-2">
                  ⚠️ 弱点
                </p>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {(analysis.strengthAssessment?.weaknesses || []).map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  💡 改进建议
                </p>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {(analysis.strengthAssessment?.recommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/arguments"
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            返回解构页面
          </Link>
        </div>
      </div>
    </div>
  );
}
