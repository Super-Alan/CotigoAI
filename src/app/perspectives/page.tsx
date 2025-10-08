'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePerspectivesPersistence } from '@/lib/hooks/usePerspectivesPersistence';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Header from '@/components/Header';

interface Perspective {
  roleId: string;
  roleName: string;
  roleIcon: string;
  analysis: string;
  timestamp: string;
}

interface GenerateResponse {
  issue: string;
  perspectives: Perspective[];
  generatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SynthesisResult {
  fullText: string;
  streamingText?: string;
}

export default function PerspectivesPage() {
  const persistence = usePerspectivesPersistence();

  const [issue, setIssue] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [activeChatRole, setActiveChatRole] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison' | 'synthesis'>('individual');
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [isLoadingSynthesis, setIsLoadingSynthesis] = useState(false);
  const [generatingRole, setGeneratingRole] = useState<{ name: string; icon: string } | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [socraticQuestions, setSocraticQuestions] = useState<Record<string, any>>({});
  const [loadingSocratic, setLoadingSocratic] = useState<string | null>(null);
  const [expandedSocratic, setExpandedSocratic] = useState<string | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    if (!persistence.isHydrated) return;

    const savedResult = persistence.loadResult();
    const savedMessages = persistence.loadChatMessages();
    const savedIssue = persistence.loadIssue();
    const savedRoles = persistence.loadSelectedRoles();

    if (savedResult) setResult(savedResult);
    if (savedMessages) setChatMessages(savedMessages);
    if (savedIssue) setIssue(savedIssue);
    if (savedRoles.length > 0) setSelectedRoles(savedRoles);
  }, [persistence.isHydrated]);

  // Persist data on changes
  useEffect(() => {
    if (!persistence.isHydrated) return;
    persistence.saveResult(result);
  }, [result, persistence.isHydrated]);

  useEffect(() => {
    if (!persistence.isHydrated) return;
    persistence.saveChatMessages(chatMessages);
  }, [chatMessages, persistence.isHydrated]);

  useEffect(() => {
    if (!persistence.isHydrated) return;
    persistence.saveIssue(issue);
  }, [issue, persistence.isHydrated]);

  useEffect(() => {
    if (!persistence.isHydrated) return;
    persistence.saveSelectedRoles(selectedRoles);
  }, [selectedRoles, persistence.isHydrated]);

  const availableRoles = [
    { id: 'economist', name: '经济学家', icon: '💰', description: '从经济效益和市场角度分析' },
    { id: 'ethicist', name: '伦理学家', icon: '⚖️', description: '从道德和价值观角度审视' },
    { id: 'scientist', name: '科学家', icon: '🔬', description: '基于实证研究和数据分析' },
    { id: 'environmentalist', name: '环保主义者', icon: '🌱', description: '关注生态和可持续发展' },
    { id: 'educator', name: '教育工作者', icon: '📚', description: '从教育和人才培养角度看' },
    { id: 'policymaker', name: '政策制定者', icon: '🏛️', description: '考虑政策可行性和社会影响' },
  ];

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleGenerate = async () => {
    if (!issue.trim() || selectedRoles.length < 2) {
      setError('请输入议题并至少选择2个角色');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setGeneratingRole(null);
    setGenerationProgress({ current: 0, total: 0 });

    try {
      const response = await fetch('/api/perspectives/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue,
          roles: selectedRoles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let partialResult: GenerateResponse = {
        issue,
        perspectives: [],
        generatedAt: new Date().toISOString()
      };
      const perspectives: any[] = [];

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
                console.log('[Stream] 初始化:', data);
                setGenerationProgress({ current: 0, total: data.total });
                partialResult.issue = data.issue;
                break;

              case 'progress':
                console.log('[Stream] 正在生成:', data.roleName);
                setGeneratingRole({
                  name: data.roleName,
                  icon: data.roleIcon
                });
                setGenerationProgress({ current: data.current, total: data.total });
                break;

              case 'chunk':
                // Handle streaming text chunks
                console.log('[Stream] 收到文本块:', data.roleId, data.chunk.substring(0, 20) + '...');

                // Find or create perspective for this role
                const existingIndex = perspectives.findIndex(p => p.roleId === data.roleId);

                if (existingIndex >= 0) {
                  // Update existing perspective
                  perspectives[existingIndex].analysis += data.chunk;
                } else {
                  // Create new partial perspective
                  const roleInfo = availableRoles.find(r => r.id === data.roleId);
                  perspectives.push({
                    roleId: data.roleId,
                    roleName: roleInfo?.name || '',
                    roleIcon: roleInfo?.icon || '',
                    analysis: data.chunk,
                    timestamp: new Date().toISOString()
                  });
                }

                // Update UI with streaming content
                partialResult.perspectives = [...perspectives];
                setResult({ ...partialResult });
                break;

              case 'perspective':
                console.log('[Stream] 视角完成:', data.perspective.roleName);

                // Replace partial perspective with complete one
                const completeIndex = perspectives.findIndex(p => p.roleId === data.perspective.roleId);
                if (completeIndex >= 0) {
                  perspectives[completeIndex] = data.perspective;
                } else {
                  perspectives.push(data.perspective);
                }

                // Update result with completed perspective
                partialResult.perspectives = [...perspectives];
                setResult({ ...partialResult });

                setGenerationProgress({ current: data.current, total: data.total });
                break;

              case 'complete':
                console.log('[Stream] 全部完成');
                setGeneratingRole(null);
                partialResult.generatedAt = data.generatedAt;
                setResult({ ...partialResult });

                // 保存分析结果到数据库
                try {
                  const saveResponse = await fetch('/api/perspectives/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      topic: partialResult.issue,
                      perspectives: partialResult.perspectives
                    })
                  });

                  if (saveResponse.ok) {
                    const saved = await saveResponse.json();
                    console.log('[Perspectives] 分析结果已保存，ID:', saved.id);
                    // 可以在这里添加一个状态来存储 sessionId，用于后续查看
                  }
                } catch (saveError) {
                  console.error('[Perspectives] 保存失败:', saveError);
                  // 不影响主流程，静默失败
                }
                break;

              case 'error':
                console.error('[Stream] 错误:', data.error);
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('[Stream] 解析错误:', parseError, line);
          }
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成分析时发生错误');
    } finally {
      setIsLoading(false);
      setGeneratingRole(null);
    }
  };

  const handleReset = () => {
    setIssue('');
    setSelectedRoles([]);
    setResult(null);
    setError(null);
    setActiveChatRole(null);
    setChatMessages({});
    persistence.clearAll();
  };

  const handleStartChat = (roleId: string) => {
    setActiveChatRole(roleId);
    if (!chatMessages[roleId]) {
      setChatMessages((prev) => ({ ...prev, [roleId]: [] }));
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !activeChatRole || !result) return;

    const messageToSend = currentMessage;
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setChatMessages((prev) => ({
      ...prev,
      [activeChatRole]: [...(prev[activeChatRole] || []), userMessage]
    }));

    setCurrentMessage('');
    setIsSendingMessage(true);
    setError(null);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);

    try {
      const response = await fetch('/api/perspectives/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: activeChatRole,
          issue: result.issue,
          message: messageToSend,
          history: chatMessages[activeChatRole] || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp
      };

      // Only add assistant message (user message already added)
      setChatMessages((prev) => ({
        ...prev,
        [activeChatRole]: [...(prev[activeChatRole] || []), assistantMessage]
      }));

      // Scroll to bottom after adding assistant message
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息时发生错误');
      // Remove user message on error
      setChatMessages((prev) => ({
        ...prev,
        [activeChatRole]: (prev[activeChatRole] || []).slice(0, -1)
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCloseChat = () => {
    setActiveChatRole(null);
  };

  const handleGenerateSocraticQuestions = async (perspective: Perspective) => {
    if (!result) return;

    // If already loaded, just toggle
    if (socraticQuestions[perspective.roleId]) {
      setExpandedSocratic(expandedSocratic === perspective.roleId ? null : perspective.roleId);
      return;
    }

    setLoadingSocratic(perspective.roleId);
    setError(null);

    try {
      const response = await fetch('/api/perspectives/socratic-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleName: perspective.roleName,
          analysis: perspective.analysis,
          issue: result.issue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成提问失败');
      }

      const questions = await response.json();
      setSocraticQuestions(prev => ({
        ...prev,
        [perspective.roleId]: questions
      }));
      setExpandedSocratic(perspective.roleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成批判性提问时发生错误');
    } finally {
      setLoadingSocratic(null);
    }
  };

  const handleGenerateSynthesis = async () => {
    if (!result || result.perspectives.length < 2) {
      console.log('[Synthesis] 跳过生成：缺少必要数据', { result, perspectiveCount: result?.perspectives.length });
      return;
    }

    console.log('[Synthesis] 开始生成综合分析', {
      issue: result.issue,
      perspectiveCount: result.perspectives.length
    });

    setIsLoadingSynthesis(true);
    setError(null);

    // Initialize synthesis with streaming text
    let streamingText = '';
    setSynthesis({
      fullText: '',
      streamingText: ''
    });

    try {
      const response = await fetch('/api/perspectives/synthesize-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue: result.issue,
          perspectives: result.perspectives.map(p => ({
            roleId: p.roleId,
            roleName: p.roleName,
            analysis: p.analysis
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成综合分析失败');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

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
                console.log('[Synthesis Stream] 初始化');
                break;

              case 'chunk':
                // Accumulate streaming text
                streamingText += data.chunk;
                setSynthesis((prev) => ({
                  ...prev!,
                  streamingText
                }));
                break;

              case 'complete':
                console.log('[Synthesis Stream] 完成，全文长度:', streamingText.length);
                setSynthesis({
                  fullText: streamingText,
                  streamingText: ''
                });
                break;

              case 'error':
                console.error('[Synthesis Stream] 错误:', data.error);
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('[Synthesis Stream] 解析错误:', parseError, line);
          }
        }
      }

    } catch (err) {
      console.error('[Synthesis] 生成失败', err);
      setError(err instanceof Error ? err.message : '生成综合分析时发生错误');
    } finally {
      setIsLoadingSynthesis(false);
    }
  };

  // Auto-generate synthesis when switching to synthesis view
  useEffect(() => {
    console.log('[Synthesis] Effect triggered', {
      viewMode,
      hasResult: !!result,
      hasSynthesis: !!synthesis,
      isLoadingSynthesis
    });

    if (viewMode === 'synthesis' && result && !synthesis && !isLoadingSynthesis) {
      console.log('[Synthesis] 条件满足，触发生成');
      handleGenerateSynthesis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🎭 多棱镜视角
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              从多个角色立场审视同一问题,打破信息茧房
            </p>
          </div>

          {!result ? (
            <>

              {/* Issue Input */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">提出你的议题</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="issue" className="block text-sm font-medium mb-2">
                      议题描述
                    </label>
                    <textarea
                      id="issue"
                      rows={4}
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="输入议题例如: 人工智能是否应该被允许参与司法判决？"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">选择角色视角 (至少2个)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      disabled={isLoading}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        selectedRoles.includes(role.id)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{role.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{role.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {role.description}
                          </p>
                        </div>
                        {selectedRoles.includes(role.id) && (
                          <span className="text-green-500 text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    ❌ 错误
                  </h3>
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!issue.trim() || selectedRoles.length < 2 || isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {generatingRole ? (
                      <span>
                        正在分析：{generatingRole.icon} {generatingRole.name} ({generationProgress.current}/{generationProgress.total})
                      </span>
                    ) : (
                      <span>正在准备分析...</span>
                    )}
                  </>
                ) : (
                  '生成多视角分析 →'
                )}
              </button>

              {/* Info Box */}
              <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  💡 提示
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  选择背景差异较大的角色,能获得更丰富的视角碰撞。每个角色的观点都基于其专业背景和价值取向,帮助你全面理解复杂议题。
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Progressive Generation Indicator */}
              {isLoading && generationProgress.total > 0 && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      正在生成多视角分析
                    </h3>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {generationProgress.current} / {generationProgress.total}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                    ></div>
                  </div>

                  {/* Currently Generating Role */}
                  {generatingRole && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-2xl">{generatingRole.icon}</span>
                      <span className="font-medium">{generatingRole.name}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">正在分析中...</span>
                    </div>
                  )}

                  {/* Generated Roles List */}
                  {result && result.perspectives.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.perspectives.map((p) => (
                        <div key={p.roleId} className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm">
                          <span>{p.roleIcon}</span>
                          <span>{p.roleName}</span>
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Results Display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                  >
                    ← 返回并创建新分析
                  </button>

                  {/* View Mode Switcher */}
                  <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('individual')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        viewMode === 'individual'
                          ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      title="详细查看每个角色的完整分析"
                    >
                      📋 逐个查看
                    </button>
                    <button
                      onClick={() => setViewMode('comparison')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        viewMode === 'comparison'
                          ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      title="并排对比不同角色的观点"
                    >
                      🔄 对比视角
                    </button>
                    <button
                      onClick={() => setViewMode('synthesis')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition relative ${
                        viewMode === 'synthesis'
                          ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      title="AI 生成综合分析：提取共识、识别冲突、发现洞察"
                    >
                      🎯 综合分析
                      {!synthesis && viewMode !== 'synthesis' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Issue Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-4">议题</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                    {result.issue}
                  </p>
                </div>

                {/* Individual View */}
                {viewMode === 'individual' && (
                  <div className="space-y-6">
                    {/* Tip: Try Synthesis */}
                    {!synthesis && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                              💡 发现更多洞察
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                              点击上方"🎯 综合分析"按钮，AI 将自动提取所有视角的共识、识别关键冲突，并生成跨视角的独特洞察和行动建议。
                            </p>
                            <button
                              onClick={() => setViewMode('synthesis')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              立即查看综合分析 →
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              const tip = document.querySelector('[data-tip="synthesis"]');
                              if (tip) tip.remove();
                            }}
                            className="text-blue-400 hover:text-blue-600 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {result.perspectives.map((perspective, index) => (
                      <div
                        key={perspective.roleId}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-l-4 border-green-500"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{perspective.roleIcon}</span>
                            <div>
                              <h3 className="text-2xl font-bold">{perspective.roleName}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                视角 {index + 1} / {result.perspectives.length}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGenerateSocraticQuestions(perspective)}
                              disabled={loadingSocratic === perspective.roleId}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition text-sm font-medium"
                            >
                              {loadingSocratic === perspective.roleId ? '生成中...' : '🤔 批判性提问'}
                            </button>
                            <button
                              onClick={() => handleStartChat(perspective.roleId)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                            >
                              💬 与该角色对话
                            </button>
                          </div>
                        </div>
                        <MarkdownRenderer content={perspective.analysis} />

                        {/* Socratic Questions Section */}
                        {expandedSocratic === perspective.roleId && socraticQuestions[perspective.roleId] && (
                          <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                              🤔 苏格拉底式批判性提问
                            </h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                              以下问题旨在帮助你深度思考这个视角的假设、证据和推理逻辑
                            </p>
                            <div className="space-y-4">
                              {socraticQuestions[perspective.roleId].questions?.map((q: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl">
                                      {q.type === 'assumption' ? '🎯' :
                                       q.type === 'evidence' ? '📊' :
                                       q.type === 'counterexample' ? '🔄' :
                                       q.type === 'logic' ? '🧠' : '👁️'}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        {q.question}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        💡 {q.purpose}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comparison View */}
                {viewMode === 'comparison' && (
                  <div className="space-y-6">
                    {/* Tip: Try Synthesis */}
                    {!synthesis && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                              ✨ 想要 AI 帮你总结这些视角的异同吗？
                            </h4>
                            <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                              切换到"综合分析"，AI 将智能识别共识点、冲突点，并提供跨视角的独特洞察。
                            </p>
                            <button
                              onClick={() => setViewMode('synthesis')}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                            >
                              查看 AI 综合分析 →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {result.perspectives.map((perspective) => (
                        <div
                          key={perspective.roleId}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{perspective.roleIcon}</span>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold">{perspective.roleName}</h3>
                            </div>
                            <button
                              onClick={() => handleStartChat(perspective.roleId)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                            >
                              💬 对话
                            </button>
                          </div>
                          <div className="text-sm line-clamp-[20] overflow-hidden">
                            <MarkdownRenderer content={perspective.analysis} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synthesis View */}
                {viewMode === 'synthesis' && (
                  <div className="space-y-6">
                    {isLoadingSynthesis || synthesis?.streamingText ? (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            正在生成综合分析...
                          </h3>
                        </div>
                        {synthesis?.streamingText && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                            <MarkdownRenderer content={synthesis.streamingText} />
                          </div>
                        )}
                      </div>
                    ) : synthesis ? (
                      <>
                        {/* 完整综合分析 - 直接显示 Markdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            🎯 批判性综合分析
                          </h3>
                          <div className="prose prose-slate dark:prose-invert max-w-none">
                            <MarkdownRenderer content={synthesis.fullText || ''} />
                          </div>
                        </div>

                        {/* All Perspectives Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            📚 所有视角总览
                          </h3>
                          <div className="space-y-4">
                            {result.perspectives.map((perspective) => (
                              <div
                                key={perspective.roleId}
                                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 hover:border-blue-500 transition"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{perspective.roleIcon}</span>
                                  <h4 className="font-semibold text-lg">{perspective.roleName}</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                  {perspective.analysis.substring(0, 200)}...
                                </p>
                                <button
                                  onClick={() => setViewMode('individual')}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  查看完整分析 →
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">综合分析生成失败</p>
                        <button
                          onClick={handleGenerateSynthesis}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          重新生成
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:opacity-90 transition"
                >
                  分析其他议题
                </button>
              </div>

              {/* Chat Modal */}
              {activeChatRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {result.perspectives.find((p) => p.roleId === activeChatRole)?.roleIcon}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold">
                            与{result.perspectives.find((p) => p.roleId === activeChatRole)?.roleName}对话
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            关于: {result.issue}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseChat}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4" id="chat-messages">
                      {(!chatMessages[activeChatRole] || chatMessages[activeChatRole].length === 0) && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                          开始与该角色对话，深入探讨您的议题
                        </div>
                      )}
                      {chatMessages[activeChatRole]?.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isSendingMessage && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 border-t dark:border-gray-700">
                      {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
                          placeholder="输入您的问题..."
                          disabled={isSendingMessage}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || isSendingMessage}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        >
                          {isSendingMessage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              发送中
                            </>
                          ) : (
                            '发送'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
