'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface HistoryItem {
  id: string;
  title: string;
  type: 'conversation' | 'argument' | 'perspective';
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'conversation' | 'argument' | 'perspective'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadHistory();
    }
  }, [status, router]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/history/all');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conversation':
        return { emoji: '💭', name: '对话', color: 'blue' };
      case 'argument':
        return { emoji: '🔍', name: '解构', color: 'purple' };
      case 'perspective':
        return { emoji: '🎭', name: '视角', color: 'green' };
      default:
        return { emoji: '📄', name: '未知', color: 'gray' };
    }
  };

  const getTypeUrl = (type: string, id: string) => {
    switch (type) {
      case 'conversation':
        return `/conversations/${id}`;
      case 'argument':
        return `/arguments/${id}`;
      case 'perspective':
        return `/perspectives/${id}`;
      default:
        return '/';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((item) => item.type === filter);

  const getFilterColor = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'argument':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'perspective':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              📚 历史记录
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看你的所有对话、解构和视角分析历史
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              全部
              {history.length > 0 && (
                <span className="ml-2 text-xs opacity-75">({history.length})</span>
              )}
            </button>
            <button
              onClick={() => setFilter('conversation')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'conversation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💭 对话
              <span className="text-xs opacity-75">
                ({history.filter(h => h.type === 'conversation').length})
              </span>
            </button>
            <button
              onClick={() => setFilter('argument')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'argument'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔍 解构
              <span className="text-xs opacity-75">
                ({history.filter(h => h.type === 'argument').length})
              </span>
            </button>
            <button
              onClick={() => setFilter('perspective')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'perspective'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🎭 视角
              <span className="text-xs opacity-75">
                ({history.filter(h => h.type === 'perspective').length})
              </span>
            </button>
          </div>

          {/* History List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">加载历史记录...</p>
              </div>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const typeInfo = getTypeLabel(item.type);
                return (
                  <Link
                    key={item.id}
                    href={getTypeUrl(item.type, item.id)}
                    className="block bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-3xl mt-1">
                        {typeInfo.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`px-3 py-1 rounded-full font-medium ${getFilterColor(item.type)}`}>
                            {typeInfo.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                暂无{filter === 'all' ? '' : getTypeLabel(filter).name}历史记录
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                开始使用 Cogito AI 创建你的第一个分析吧
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/conversations"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  💭 苏格拉底对话
                </Link>
                <Link
                  href="/arguments"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  🔍 论点解构
                </Link>
                <Link
                  href="/perspectives"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  🎭 多棱镜视角
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
