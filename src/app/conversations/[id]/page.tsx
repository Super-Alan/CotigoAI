'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedAnswer {
  id: string;
  text: string;
  intent: string;
}

interface DialogueRound {
  round: number;
  userMessage: string;
  aiQuestion: string;
  timestamp: Date;
}

export default function ConversationChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoStartExecutedRef = useRef(false); // 使用ref防止严格模式下重复执行

  // 新增状态：助手面板
  const [suggestedAnswers, setSuggestedAnswers] = useState<SuggestedAnswer[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueRound[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载对话历史
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setConversationTitle(data.topic);
          setMessages(
            data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };

    if (params.id) {
      loadConversation();
    }
  }, [params.id]);

  // 自动开始对话逻辑（仅在首次创建对话时触发）
  useEffect(() => {
    // 使用ref防止React严格模式下的重复执行
    if (autoStartExecutedRef.current) return;

    const isNewConversation = searchParams.get('new') === 'true';
    const topic = searchParams.get('topic');

    // 只有在以下条件都满足时才自动开始：
    // 1. URL参数标记为新对话 (new=true)
    // 2. 有话题参数
    // 3. 消息列表为空（确保不是刷新页面加载历史）
    if (isNewConversation && topic && messages.length === 0) {
      // 立即标记为已执行，防止任何重复
      autoStartExecutedRef.current = true;
      setHasAutoStarted(true);

      // 清除URL参数，防止刷新时重复触发
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      url.searchParams.delete('topic');
      window.history.replaceState({}, '', url.toString());

      // 自动发送初始话题,触发AI的首次提问
      const initialMessage = `我想和你探讨这个话题: ${decodeURIComponent(topic)}`;

      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages([userMessage]);

      // 触发AI响应
      triggerAIResponse(initialMessage);
    }
  }, [searchParams, messages.length]);  // 只依赖必要的参数

  const triggerAIResponse = async (userMessage: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      const assistantMessageId = (Date.now() + 1).toString();

      // 添加空的AI消息占位符
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
        },
      ]);

      let buffer = ''; // 缓冲区处理跨chunk边界的数据

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码并添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按行分割，保留最后一个可能不完整的行
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保存最后一个可能不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (!data) continue; // 跳过空数据

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'chunk' && parsed.content) {
                // 使用函数式更新，确保不可变性
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.id === assistantMessageId) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: updated[lastIndex].content + parsed.content,
                    };
                  }
                  return updated;
                });
              } else if (parsed.type === 'done') {
                // 流式传输完成
                break;
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉,发送消息时出现错误。请稍后重试。',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const messageContent = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // 复用triggerAIResponse函数
    await triggerAIResponse(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 生成建议答案
  const generateSuggestions = async (aiQuestion: string) => {
    if (!aiQuestion) return;

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/conversations/${params.id}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion,
          conversationHistory: dialogueHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedAnswers(data.suggestions || []);
      }
    } catch (error) {
      console.error('生成建议答案失败:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 使用建议答案
  const useSuggestedAnswer = (answer: string) => {
    setInput(answer);
  };

  // 生成总结
  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch(`/api/conversations/${params.id}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: dialogueHistory })
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('生成总结失败:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 监听AI回复完成，生成建议并更新轮次
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !isLoading) {
      const userMessages = messages.filter(m => m.role === 'user');
      const newRound = Math.ceil(userMessages.length / 1);

      if (newRound !== currentRound) {
        setCurrentRound(newRound);

        // 更新对话历史
        const lastUserMsg = userMessages[userMessages.length - 1];
        if (lastUserMsg) {
          setDialogueHistory(prev => [...prev, {
            round: newRound,
            userMessage: lastUserMsg.content,
            aiQuestion: lastMessage.content,
            timestamp: new Date()
          }]);
        }

        // 生成建议答案
        generateSuggestions(lastMessage.content);
      }
    }
  }, [messages, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/conversations"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              ← 返回
            </Link>
            <div>
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cogito AI
              </Link>
              {conversationTitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {conversationTitle}
                </p>
              )}
            </div>
          </div>
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
      </header>

      {/* Messages Area - Two Column Layout */}
      <main className="flex-1 overflow-hidden flex">
        {/* Left: Chat Area - Independent Scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-12 space-y-6">
              <div className="text-6xl mb-4">💭</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  开始你的苏格拉底式对话
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  输入你的第一个问题或观点,AI将通过提问引导你深度思考
                </p>
              </div>

              {/* 引导提示卡片 */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <span>🎯</span>
                    <span>对话将如何进行？</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold">1</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">澄清概念</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">明确关键术语的定义</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-bold">2</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">检验证据</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">追溯论点的事实依据</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full text-xs font-bold">3</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">挖掘假设</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">揭示隐藏的前提条件</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold">4</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">探索视角</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">换位思考其他可能性</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span>💡</span>
                      <span>AI不会直接给出答案,而是通过连续的开放式问题引导你自己发现真理</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {message.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            👤
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            🤖
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {message.role === 'user' ? '你' : 'AI导师'}
                        </p>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          🤖
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">AI导师</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">正在思考问题...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Right: Assistant Panel - Independent Scrolling */}
        <div className="w-96 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">💡 智能助手</h3>
              {currentRound > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    第 {currentRound}/5 轮
                  </span>
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                      style={{ width: `${(currentRound / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              参考答案和提问意图分析
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 提问意图分析 */}
            {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>提问意图</span>
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  AI正在通过这个问题引导你思考问题的核心本质，帮助你发现隐藏的假设和潜在的矛盾。
                </p>
              </div>
            )}

            {/* 建议答案 */}
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm text-gray-500 ml-2">生成参考答案...</span>
                </div>
              </div>
            ) : suggestedAnswers.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span>📝</span>
                  <span>参考答案</span>
                </h4>
                {suggestedAnswers.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    onClick={() => useSuggestedAnswer(suggestion.text)}
                  >
                    <p className="text-sm mb-2">{suggestion.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      💡 {suggestion.intent}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  点击任意答案直接使用
                </p>
              </div>
            ) : null}

            {/* 5轮对话完成提示 */}
            {currentRound >= 5 && !showSummary && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎓</span>
                  <h4 className="font-semibold">对话已完成5轮</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  您可以选择继续深入探讨，或结束对话生成思维总结
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={generateSummary}
                    disabled={loadingSummary}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium text-sm"
                  >
                    {loadingSummary ? '生成中...' : '✅ 结束并总结'}
                  </button>
                  <button
                    onClick={() => {
                      // 继续对话，不做任何操作，用户可以继续输入
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    🔄 继续追问
                  </button>
                </div>
              </div>
            )}

            {/* 显示总结 */}
            {showSummary && summary && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span>🎓</span>
                  <span>思维总结</span>
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{summary}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentRound(0);
                    setDialogueHistory([]);
                    setShowSummary(false);
                    setSummary('');
                    setSuggestedAnswers([]);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                >
                  开始新一轮对话
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回答或新问题... (Shift+Enter换行, Enter发送)"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? '思考中...' : '发送'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            AI会通过苏格拉底式提问引导你思考,而不是直接给出答案
          </p>
        </div>
      </div>
    </div>
  );
}
