'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface PerspectiveData {
  id: string;
  roleName: string;
  roleConfig: {
    roleId: string;
    roleIcon: string;
  };
  viewpoint: string;
  createdAt: string;
}

interface SessionData {
  id: string;
  topic: string;
  perspectives: PerspectiveData[];
  createdAt: string;
}

export default function PerspectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && params.id) {
      loadSessionData();
    }
  }, [status, params.id]);

  const loadSessionData = async () => {
    try {
      const response = await fetch(`/api/perspectives/${params.id}`);
      if (!response.ok) {
        throw new Error('无法加载视角分析数据');
      }
      const data = await response.json();
      console.log('[Perspective Detail] 接收到的数据:', data);
      setSessionData(data);
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

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {error || '未找到视角分析数据'}
            </h2>
            <Link
              href="/perspectives"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回多棱镜页面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 text-sm">
          <Link
            href="/perspectives"
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回多棱镜列表
          </Link>
          <span className="text-gray-400">|</span>
          <p className="text-gray-600 dark:text-gray-300 truncate max-w-xl">
            {sessionData.topic.length > 80
              ? sessionData.topic.substring(0, 80) + '...'
              : sessionData.topic}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Topic Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            分析议题
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-lg">
              {sessionData.topic}
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            分析时间：{new Date(sessionData.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>

        {/* Perspectives Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🔮</span>
            多角度视角分析
          </h2>

          {sessionData.perspectives.map((perspective, idx) => (
            <div
              key={perspective.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{perspective.roleConfig.roleIcon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {perspective.roleName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    视角 {idx + 1} / {sessionData.perspectives.length}
                  </p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <MarkdownRenderer content={perspective.viewpoint} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/perspectives"
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            返回多棱镜页面
          </Link>
        </div>
      </div>
    </div>
  );
}
