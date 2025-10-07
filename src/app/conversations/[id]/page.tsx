'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Header from '@/components/Header';

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
  difficulty?: 'simple' | 'moderate' | 'deep';
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
  const [conversationEnded, setConversationEnded] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加一个toast提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存对话结束状态到localStorage
  useEffect(() => {
    if (params.id && conversationEnded) {
      localStorage.setItem(`conversation_${params.id}_ended`, 'true');
    }
  }, [conversationEnded, params.id]);

  // 保存助手面板状态到localStorage
  useEffect(() => {
    if (params.id) {
      localStorage.setItem(`conversation_${params.id}_showAssistant`, showAssistant.toString());
    }
  }, [showAssistant, params.id]);

  // 加载对话历史和状态
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

      // 恢复对话结束状态
      const savedEndedState = localStorage.getItem(`conversation_${params.id}_ended`);
      if (savedEndedState === 'true') {
        setConversationEnded(true);
      }

      // 恢复助手面板显示状态
      const savedAssistantState = localStorage.getItem(`conversation_${params.id}_showAssistant`);
      if (savedAssistantState !== null) {
        setShowAssistant(savedAssistantState === 'true');
      }
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
    // 检查是否已有总结
    const hasSummary = messages.some(msg =>
      msg.role === 'assistant' && msg.content.includes('📊 对话总结')
    );

    if (hasSummary) {
      const userChoice = confirm(
        '您已经生成过总结了。\n\n' +
        '• 点击"确定"继续追问\n' +
        '• 点击"取消"查看之前的总结'
      );

      if (!userChoice) {
        // 用户选择查看总结，滚动到总结位置
        const summaryElement = document.querySelector('[data-summary-message]');
        summaryElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      } else {
        // 用户选择继续追问，重置对话状态
        setConversationEnded(false);
        localStorage.removeItem(`conversation_${params.id}_ended`);
        return;
      }
    }

    setLoadingSummary(true);

    // 添加AI总结消息占位符
    const summaryMessageId = `summary-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: summaryMessageId,
        role: 'assistant' as const,
        content: '📊 正在生成对话总结...\n\n',
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch(`/api/conversations/${params.id}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: dialogueHistory })
      });

      if (!response.ok) {
        throw new Error('生成总结失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let summaryContent = '📊 对话总结\n\n';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.type === 'chunk' && data.content) {
              summaryContent += data.content;
              // 实时更新消息内容
              setMessages((prev) => {
                const updated = [...prev];
                const index = updated.findIndex(msg => msg.id === summaryMessageId);
                if (index !== -1) {
                  updated[index] = {
                    ...updated[index],
                    content: summaryContent
                  };
                }
                return updated;
              });
            } else if (data.type === 'complete') {
              // 保存总结消息到数据库
              try {
                await fetch(`/api/conversations/${params.id}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    role: 'assistant',
                    content: summaryContent
                  })
                });
              } catch (saveError) {
                console.error('保存总结消息失败:', saveError);
              }

              // 标记对话已结束
              setConversationEnded(true);
            } else if (data.type === 'error') {
              throw new Error(data.error || '生成总结失败');
            }
          } catch (parseError) {
            console.warn('解析响应行失败:', line, parseError);
          }
        }
      }
    } catch (error) {
      console.error('生成总结失败:', error);
      // 更新消息显示错误
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(msg => msg.id === summaryMessageId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            content: '❌ 生成总结失败，请稍后重试'
          };
        }
        return updated;
      });
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
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-hidden">
      {/* Header with Back Button and Title */}
      <div className="flex-shrink-0">
        <Header />
        {conversationTitle && (
          <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="container mx-auto flex items-center gap-3">
              {/* Icon-only Back Button */}
              <Link
                href="/conversations"
                className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                title="返回对话列表"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              {/* Topic Title with Icon */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {conversationTitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    苏格拉底式对话
                  </p>
                </div>
              </div>

              {/* Desktop: Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(conversationTitle)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                  title="复制话题"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area - Two Column Layout */}
      <main className="flex-1 overflow-hidden flex">
        {/* Left: Chat Area - Independent Scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
          {/* Toggle Assistant Panel Button - PC Only */}
          {messages.length > 0 && (
            <div className="hidden lg:flex p-3 border-b border-gray-200 dark:border-gray-700 justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              {conversationEnded && (
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  对话已结束
                </span>
              )}
              <button
                onClick={() => setShowAssistant(!showAssistant)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition font-medium shadow-sm ml-auto"
              >
                {showAssistant ? (
                  <>
                    <span>隐藏助手</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    <span>显示助手</span>
                  </>
                )}
              </button>
            </div>
          )}
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
                    className={`max-w-[80%] rounded-2xl px-6 py-4 relative group ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                    }`}
                    {...(message.content.includes('📊 对话总结') ? { 'data-summary-message': true } : {})}
                  >
                    {/* 复制按钮 */}
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className={`absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.role === 'user'
                          ? 'hover:bg-white/20 text-white/80 hover:text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                      title="复制消息"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
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
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} className="text-sm" />
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
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

        {/* Right: Assistant Panel - Independent Scrolling - PC Only */}
        {showAssistant && (
        <div className="hidden lg:flex lg:w-96 bg-white dark:bg-gray-800 flex-col overflow-hidden">
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
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span>💡</span>
                    <span>提示：AI每次只会提出一个核心问题，专注思考这个问题即可。下方的参考答案按难度排序，选择适合你的思考深度。</span>
                  </p>
                </div>
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
                  <span>参考答案（由浅入深）</span>
                </h4>
                {suggestedAnswers.map((suggestion, index) => {
                  const difficultyConfig = {
                    simple: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: '入门', icon: '🌱' },
                    moderate: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: '进阶', icon: '🌿' },
                    deep: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: '深度', icon: '🌳' }
                  };
                  const difficulty = suggestion.difficulty || (index === 0 ? 'simple' : index === 1 ? 'moderate' : 'deep');
                  const config = difficultyConfig[difficulty];

                  return (
                    <div
                      key={suggestion.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                      onClick={() => useSuggestedAnswer(suggestion.text)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm flex-1">{suggestion.text}</p>
                        <span className={`${config.color} px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1`}>
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        💡 {suggestion.intent}
                      </p>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  点击任意答案直接使用 • 建议从简单答案开始思考
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
        )}
      </main>

      {/* Mobile: Assistant Panel Drawer - Bottom Sheet */}
      {showAssistant && messages.length > 0 && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAssistant(false)}
        >
          <div
            className="w-full max-h-[75vh] bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-lg">💡</span>
                  </div>
                  <h3 className="font-bold text-lg">智能助手</h3>
                </div>
                <button
                  onClick={() => setShowAssistant(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {currentRound > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    第 {currentRound}/5 轮
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                      style={{ width: `${(currentRound / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {Math.round((currentRound / 5) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 提问意图分析 */}
              {messages[messages.length - 1]?.role === 'assistant' && (
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
                    <span>参考答案（由浅入深）</span>
                  </h4>
                  {suggestedAnswers.map((suggestion, index) => {
                    const difficultyConfig = {
                      simple: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: '入门', icon: '🌱' },
                      moderate: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: '进阶', icon: '🌿' },
                      deep: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: '深度', icon: '🌳' }
                    };
                    const difficulty = suggestion.difficulty || (index === 0 ? 'simple' : index === 1 ? 'moderate' : 'deep');
                    const config = difficultyConfig[difficulty];

                    return (
                      <div
                        key={suggestion.id}
                        className="group bg-white dark:bg-gray-700/50 rounded-xl p-4 active:bg-blue-50 dark:active:bg-blue-900/20 transition-all duration-200 border-2 border-gray-200 dark:border-gray-600 active:border-blue-400 dark:active:border-blue-500 shadow-sm active:shadow-md"
                        onClick={() => {
                          useSuggestedAnswer(suggestion.text);
                          setShowAssistant(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm flex-1 font-medium text-gray-800 dark:text-gray-200">{suggestion.text}</p>
                          <span className={`${config.color} px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 shadow-sm`}>
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs">💡</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic flex-1">
                            {suggestion.intent}
                          </p>
                        </div>
                        {/* Tap hint */}
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 opacity-0 group-active:opacity-100 transition-opacity">
                          <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">
                            点击使用此答案 ✓
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    点击任意答案直接使用 • 建议从简单答案开始思考
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
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        generateSummary();
                        setShowAssistant(false);
                      }}
                      disabled={loadingSummary}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium text-sm"
                    >
                      {loadingSummary ? '生成中...' : '✅ 结束并总结'}
                    </button>
                    <button
                      onClick={() => setShowAssistant(false)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
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
                      setShowAssistant(false);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    开始新一轮对话
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Floating Assistant Button - Fixed Bottom Right */}
      {messages.length > 0 && !showAssistant && (
        <button
          onClick={() => setShowAssistant(true)}
          className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          {/* Badge for suggestions count */}
          {suggestedAnswers.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {suggestedAnswers.length}
            </span>
          )}
          {/* Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      )}

      {/* Input Area */}
      <div className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationEnded ? "对话已结束" : "输入你的回答或新问题... (Shift+Enter换行, Enter发送)"}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
              disabled={isLoading || conversationEnded}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || conversationEnded}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {isLoading ? '思考中...' : conversationEnded ? '已结束' : '发送'}
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
