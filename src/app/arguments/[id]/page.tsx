'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// 简化的数据结构，匹配AI实际返回的格式
interface SimplifiedAnalysis {
  mainClaim: string;  // 字符串而不是对象
  premises: string[];  // 字符串数组而不是对象数组
  evidence: string[];  // 字符串数组
  assumptions: string[];  // 字符串数组
  logicalStructure: string;  // 字符串而不是对象
  potentialFallacies: string[];  // 字符串数组
  strengthAssessment: string;  // 字符串而不是对象
}

interface ArgumentData {
  id: string;
  inputText: string;
  analysis: SimplifiedAnalysis;
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
      console.log('[Detail Page] 接收到的数据:', data);
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              核心论点
            </h3>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-600">
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                <MarkdownRenderer content={analysis.mainClaim || '无法识别核心论点'} />
              </div>
            </div>
          </div>

          {/* Premises */}
          {analysis.premises && analysis.premises.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                支撑前提
              </h3>
              <div className="space-y-3">
                {analysis.premises.map((premise, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="font-medium text-gray-800 dark:text-white flex gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">{idx + 1}.</span>
                      <div className="flex-1">
                        <MarkdownRenderer content={premise} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {analysis.evidence && analysis.evidence.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                证据支撑
              </h3>
              <div className="space-y-3">
                {analysis.evidence.map((ev, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <div className="text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                      <div className="flex-1">
                        <MarkdownRenderer content={ev} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {analysis.assumptions && analysis.assumptions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                隐含假设
              </h3>
              <div className="space-y-3">
                {analysis.assumptions.map((assumption, idx) => (
                  <div key={idx} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                    <div className="font-medium text-gray-800 dark:text-white flex gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                      <div className="flex-1">
                        <MarkdownRenderer content={assumption} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logical Structure */}
          {analysis.logicalStructure && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                逻辑结构
              </h3>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500">
                <div className="text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={analysis.logicalStructure} />
                </div>
              </div>
            </div>
          )}

          {/* Potential Fallacies */}
          {analysis.potentialFallacies && analysis.potentialFallacies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                潜在谬误
              </h3>
              <div className="space-y-3">
                {analysis.potentialFallacies.map((fallacy, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-l-4 bg-red-50 dark:bg-red-900/20 border-red-500"
                  >
                    <div className="font-medium text-gray-800 dark:text-white flex gap-2">
                      <span className="text-red-600 dark:text-red-400 font-bold shrink-0">{idx + 1}.</span>
                      <div className="flex-1">
                        <MarkdownRenderer content={fallacy} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strength Assessment */}
          {analysis.strengthAssessment && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                综合评估
              </h3>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-l-4 border-purple-500">
                <div className="text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={analysis.strengthAssessment} />
                </div>
              </div>
            </div>
          )}
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
