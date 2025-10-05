'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 每周推荐话题（基于热点经济和科技动态）
const weeklyTopics = [
  {
    id: 1,
    category: '科技伦理',
    topic: 'OpenAI Sora视频生成技术是否会威胁影视行业从业者的生计？',
    context: '2025年1月,OpenAI发布Sora文生视频模型,能够生成高质量60秒视频',
    tags: ['AI技术', '就业影响', '创意产业'],
  },
  {
    id: 2,
    category: '经济政策',
    topic: '美联储降息政策是否真的能有效缓解通货膨胀？',
    context: '2024年底美联储开始新一轮降息周期,但核心通胀率仍维持在3%以上',
    tags: ['货币政策', '宏观经济', '通货膨胀'],
  },
  {
    id: 3,
    category: '科技发展',
    topic: '量子计算商业化是否被过度炒作？',
    context: 'IBM、Google等公司宣布量子计算突破,但实际应用场景仍然有限',
    tags: ['量子计算', '技术泡沫', '投资决策'],
  },
  {
    id: 4,
    category: '社会议题',
    topic: '四天工作制是否真的能提高生产力？',
    context: '多国试点四天工作制,企业和员工反馈不一',
    tags: ['工作制度', '生产力', '工作生活平衡'],
  },
  {
    id: 5,
    category: '环境科技',
    topic: '碳捕获技术是否是应对气候变化的有效解决方案？',
    context: '多家科技公司投资碳捕获技术,但成本和效率仍存在争议',
    tags: ['气候变化', '绿色科技', '可持续发展'],
  },
];

export default function ConversationsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartConversation = async () => {
    if (!topic.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          autoStart: true, // 标记为自动开始对话
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      // 跳转到对话页面,URL参数标记为新对话
      router.push(`/conversations/${data.id}?new=true&topic=${encodeURIComponent(topic.trim())}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('创建对话失败,请稍后重试');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    // 自动滚动到输入框
    document.getElementById('topic-input')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cogito AI
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4">
              <Link href="/conversations" className="text-blue-600 font-medium">
                对话
              </Link>
              <Link href="/arguments" className="text-gray-600 hover:text-blue-600">
                解构
              </Link>
              <Link href="/perspectives" className="text-gray-600 hover:text-blue-600">
                视角
              </Link>
            </nav>
            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              💭 苏格拉底对话
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              通过四阶段提问,引导你进行深度批判性思考
            </p>
          </div>

          {/* Start Conversation - 置于顶端 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">开始新的对话</h2>
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
                onClick={handleStartConversation}
                disabled={!topic.trim() || isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? '创建中...' : '开始苏格拉底式对话 →'}
              </button>
            </div>
          </div>

          {/* Weekly Recommended Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📅 本周推荐话题</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                基于最新经济和科技动态
              </span>
            </div>

            <div className="space-y-3">
              {weeklyTopics.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectTopic(item.topic)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition group"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {item.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                        {item.topic}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.context}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>提示:</strong> 点击任意话题即可快速开始对话
              </p>
            </div>
          </div>

          {/* Feature Description - 四阶段说明 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">如何开始？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold mb-1">澄清概念</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI会帮你明确术语定义,避免模糊表述
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold mb-1">检验证据</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    追溯你的论点是否有事实支持
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold mb-1">挖掘假设</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    揭示你没有意识到的隐藏前提
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold">
                  4
                </span>
                <div>
                  <h3 className="font-semibold mb-1">探索视角</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    引导你换位思考,看到其他可能性
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>对话建议</span>
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• AI不会直接告诉你答案,而是通过连续的开放式问题引导你思考</li>
              <li>• 保持开放的心态,认真思考每一个问题</li>
              <li>• 可以随时表达困惑或请求澄清</li>
              <li>• 没有"正确答案",重要的是思考过程</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
