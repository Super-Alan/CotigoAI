'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';

interface ArgumentAnalysis {
  mainClaim: string;
  premises: string[];
  evidence: string[];
  assumptions: string[];
  logicalStructure: string;
  potentialFallacies: string[];
  strengthAssessment: string;
}

export default function ArgumentsPage() {
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 流式分析状态
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [revealedDimensions, setRevealedDimensions] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState(''); // AI流式输出内容
  const [analysisId, setAnalysisId] = useState<string | null>(null); // 保存后的ID

  const handleAnalyze = async () => {
    if ((!inputText.trim() && inputType === 'text') || (!inputUrl.trim() && inputType === 'url')) {
      setError('请输入内容或URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setRevealedDimensions([]);
    setProgressMessage('');
    setProgressPercent(0);
    setStreamingContent(''); // 清空流式内容
    setAnalysisId(null); // 清空ID

    try {
      const response = await fetch('/api/arguments/analyze-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: inputType,
          content: inputType === 'text' ? inputText.trim() : inputUrl.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('分析请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let partialAnalysis: any = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            switch (data.type) {
              case 'init':
              case 'progress':
                setProgressMessage(data.message);
                if (data.progress !== undefined) {
                  setProgressPercent(data.progress);
                }
                break;

              case 'stream':
                // 流式输出AI分析内容
                setStreamingContent(prev => prev + data.content);
                if (data.progress !== undefined) {
                  setProgressPercent(data.progress);
                }
                break;

              case 'dimension':
                // 逐步显示维度
                partialAnalysis[data.dimension] = data.data;
                setAnalysis({ ...partialAnalysis } as ArgumentAnalysis);
                setRevealedDimensions(prev => [...prev, data.dimension]);
                setProgressMessage(`${data.icon} ${data.name}已完成`);
                setProgressPercent(data.progress);
                break;

              case 'complete':
                setAnalysis(data.analysis);
                setProgressMessage('✅ 分析完成！');
                setProgressPercent(100);

                // 保存分析结果到数据库
                try {
                  const saveResponse = await fetch('/api/arguments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      inputText: inputType === 'text' ? inputText.trim() : inputUrl.trim(),
                      analysis: data.analysis
                    })
                  });

                  if (saveResponse.ok) {
                    const saved = await saveResponse.json();
                    setAnalysisId(saved.id);
                    console.log('分析结果已保存，ID:', saved.id);
                  }
                } catch (saveError) {
                  console.error('保存失败:', saveError);
                }
                break;

              case 'error':
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('[Stream] 解析错误:', parseError, line);
          }
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析失败,请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔍 论点解构器
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              深度分析论点的逻辑结构、证据支撑和潜在谬误
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">输入待分析内容</h2>

            {/* Input Type Selector */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setInputType('text')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  inputType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📝 文本输入
              </button>
              <button
                onClick={() => setInputType('url')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  inputType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🌐 网页链接
              </button>
            </div>

            {/* Input Area */}
            {inputType === 'text' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="text-input" className="block text-sm font-medium mb-2">
                    输入或粘贴文本内容
                  </label>
                  <textarea
                    id="text-input"
                    rows={8}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="例如: 人工智能最终会取代所有人类工作。因为AI可以24小时不间断工作,不需要休息,效率远高于人类。而且AI学习速度极快,可以在短时间内掌握复杂技能..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="url-input" className="block text-sm font-medium mb-2">
                    输入网页URL地址
                  </label>
                  <input
                    id="url-input"
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="例如: https://mp.weixin.qq.com/s/..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>支持的网站:</strong> 微信公众号文章、知乎专栏、博客文章等各类网页内容
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!inputText.trim() && !inputUrl.trim())}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? '分析中...' : '🔍 开始深度解构'}
            </button>

            {/* Progress Indicator */}
            {isAnalyzing && (
              <div className="mt-4 space-y-3">
                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Progress Message */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {progressMessage || '准备中...'}
                  </p>
                  <span className="ml-auto text-gray-500 dark:text-gray-400 font-medium">
                    {progressPercent}%
                  </span>
                </div>

                {/* Streaming AI Content - Real-time display */}
                {streamingContent && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI 实时分析输出</span>
                    </div>
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                      {streamingContent}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold mb-4">📊 分析结果</h2>

              {/* Main Claim */}
              {analysis.mainClaim && (
                <div
                  className={`border-l-4 border-blue-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('mainClaim')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    🎯 核心论点
                    {revealedDimensions.includes('mainClaim') && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{analysis.mainClaim}</p>
                </div>
              )}

              {/* Premises */}
              {analysis.premises && analysis.premises.length > 0 && (
                <div
                  className={`border-l-4 border-green-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('premises')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    📋 支撑前提
                    {revealedDimensions.includes('premises') && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {analysis.premises.map((premise, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                        <span className="text-gray-800 dark:text-gray-200">{premise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence */}
              {analysis.evidence && analysis.evidence.length > 0 && (
                <div
                  className={`border-l-4 border-purple-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('evidence')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    📊 证据支撑
                    {revealedDimensions.includes('evidence') && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {analysis.evidence.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                        <span className="text-gray-800 dark:text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions */}
              {analysis.assumptions && analysis.assumptions.length > 0 && (
                <div
                  className={`border-l-4 border-amber-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('assumptions')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    🔍 隐含假设
                    {revealedDimensions.includes('assumptions') && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {analysis.assumptions.map((assumption, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                        <span className="text-gray-800 dark:text-gray-200">{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Logical Structure */}
              {analysis.logicalStructure && (
                <div
                  className={`border-l-4 border-indigo-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('logicalStructure')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    🧩 逻辑结构
                    {revealedDimensions.includes('logicalStructure') && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{analysis.logicalStructure}</p>
                </div>
              )}

              {/* Potential Fallacies */}
              {analysis.potentialFallacies && analysis.potentialFallacies.length > 0 && (
                <div
                  className={`border-l-4 border-red-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('potentialFallacies')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-red-700 dark:text-red-300 flex items-center gap-2">
                    ⚠️ 潜在谬误
                    {revealedDimensions.includes('potentialFallacies') && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {analysis.potentialFallacies.map((fallacy, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">⚠️</span>
                        <span className="text-gray-800 dark:text-gray-200">{fallacy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strength Assessment */}
              {analysis.strengthAssessment && (
                <div
                  className={`border-l-4 border-gray-500 pl-4 transition-all duration-500 ${
                    revealedDimensions.includes('strengthAssessment')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    ✨ 综合评估
                    {revealedDimensions.includes('strengthAssessment') && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        已完成
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{analysis.strengthAssessment}</p>
                </div>
              )}
            </div>
          )}

          {/* Feature Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">如何使用解构器？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold mb-1">识别核心论点</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    自动提取文本中的主要观点和结论
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold mb-1">分析证据链</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    评估论据的质量和证据的充分性
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold mb-1">揭示隐藏假设</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    发现论证中未明确说明的前提条件
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-semibold">
                  4
                </span>
                <div>
                  <h3 className="font-semibold mb-1">检测逻辑谬误</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    识别常见的逻辑错误和推理漏洞
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
