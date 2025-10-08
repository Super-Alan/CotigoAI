import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useConversation,
  useGetSuggestions,
  useGenerateSummary,
} from '@/src/hooks/useConversations';
import { MessageBubble } from '@/src/components/MessageBubble';
import { Button } from '@/src/components/Button';
import { tokenManager } from '@/src/services/api';
import { API_CONFIG } from '@/src/constants/api';

export default function ConversationDetailScreen() {
  const { id, new: isNew, topic } = useLocalSearchParams<{ id: string; new?: string; topic?: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const autoStartExecutedRef = useRef(false);

  const { data: conversation, isLoading, refetch } = useConversation(id);
  const { mutate: getSuggestions, data: suggestionsData, isPending: isLoadingSuggestions } = useGetSuggestions();
  const { mutate: generateSummary, isPending: isGeneratingSummary } =
    useGenerateSummary();

  const [input, setInput] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string>('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string>(''); // 临时显示用户消息

  // Prevent duplicate suggestion generation
  const suggestionsGeneratedRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  // Extract suggestions array from response
  const suggestions = suggestionsData?.suggestions || suggestionsData || [];

  useEffect(() => {
    // 自动滚动到底部
    if (conversation?.messages && conversation.messages.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // 清理timeout，防止内存泄漏
      return () => clearTimeout(timeoutId);
    }
  }, [conversation?.messages, streamingMessage]);

  // 监听AI回复完成，自动生成建议答案（参考Web端）- 防止重复调用
  useEffect(() => {
    const lastMessage = conversation?.messages?.[conversation.messages.length - 1];

    // 当AI回复完成且不在发送状态时，自动生成建议答案
    if (lastMessage && lastMessage.role === 'assistant' && !isSending && !streamingMessage) {
      // 防止对同一条消息重复生成建议
      if (lastMessageIdRef.current === lastMessage.id && suggestionsGeneratedRef.current) {
        return;
      }

      // 标记为已处理
      lastMessageIdRef.current = lastMessage.id;
      suggestionsGeneratedRef.current = true;

      // 获取对话历史
      const conversationHistory = conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      getSuggestions({
        conversationId: id,
        question: lastMessage.content,
        conversationHistory,
      });
    }
  }, [conversation?.messages, isSending, streamingMessage]);

  // 重置建议生成标记当用户发送新消息时
  useEffect(() => {
    if (isSending) {
      suggestionsGeneratedRef.current = false;
    }
  }, [isSending]);

  // 自动开始对话逻辑（仅在首次创建对话时触发）
  useEffect(() => {
    // 防止重复执行
    if (autoStartExecutedRef.current) {
      return;
    }

    const isNewConversation = isNew === 'true';
    const hasMessages = conversation?.messages && conversation.messages.length > 0;

    // 只有在以下条件都满足时才自动开始：
    if (isNewConversation && topic && !hasMessages && conversation) {
      // 立即标记为已执行，防止任何重复
      autoStartExecutedRef.current = true;

      // 自动发送初始话题,触发AI的首次提问
      let decodedTopic = topic;
      try {
        decodedTopic = decodeURIComponent(topic);
      } catch (error) {
        console.warn('[Auto-Start] Failed to decode topic, using raw value:', error);
      }
      const initialMessage = `我想和你探讨这个话题: ${decodedTopic}`;

      // 清除URL参数（Expo Router方式）
      router.setParams({ new: undefined, topic: undefined });

      // 直接触发发送消息
      sendMessageToAI(initialMessage).catch((error) => {
        console.error('[Auto-Start] Failed to send message:', error);
      });
    }
  }, [isNew, topic, conversation, id]);

  const sendMessageToAI = async (message: string) => {
    if (!message.trim() || !id) {
      return;
    }

    setIsSending(true);
    setStreamingMessage('');
    setError(null);
    setPendingUserMessage(message); // 立即显示用户消息

    let xhr: XMLHttpRequest | null = null;

    // 30秒超时控制
    const timeoutId = setTimeout(() => {
      setError('请求超时，请检查网络连接');
      setIsSending(false);
      if (xhr) {
        xhr.abort();
      }
    }, 30000);

    try {
      const token = await tokenManager.getToken();
      const url = `${API_CONFIG.BASE_URL}/conversations/${id}/messages`;

      // 使用 XMLHttpRequest 进行 SSE 连接（React Native兼容）
      xhr = new XMLHttpRequest();

      let previousLength = 0;

      xhr.onreadystatechange = () => {
        if (xhr?.readyState === 3 || xhr?.readyState === 4) {
          // 接收到部分数据或全部数据
          const currentText = xhr.responseText || '';
          const newText = currentText.substring(previousLength);
          previousLength = currentText.length;

          if (newText) {
            // 解析SSE数据
            const lines = newText.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'chunk') {
                    setStreamingMessage((prev) => prev + data.content);
                  } else if (data.type === 'done') {
                    clearTimeout(timeoutId);

                    // 刷新对话以获取保存的消息
                    refetch().then(() => {
                      setStreamingMessage('');
                      // 延迟清除pendingUserMessage，确保新数据已渲染
                      setTimeout(() => {
                        setPendingUserMessage('');
                      }, 100);
                      setIsSending(false);
                    }).catch((refetchError) => {
                      console.error('Failed to refetch conversation:', refetchError);
                      setError('消息发送成功，但刷新失败。请手动刷新页面。');
                      setPendingUserMessage(''); // 失败时立即清除
                      setIsSending(false);
                    });
                  } else if (data.type === 'error') {
                    throw new Error(data.message || 'AI响应错误');
                  }
                } catch (parseError) {
                  console.error('SSE parse error:', parseError, 'Line:', line);
                }
              }
            }
          }
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeoutId);
        setError('网络连接失败，请检查网络');
        setLastFailedMessage(message);
        setStreamingMessage('');
        setPendingUserMessage(''); // 清除临时用户消息
        setIsSending(false);
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(JSON.stringify({ message }));

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Send message error:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      setError(errorMessage);
      setLastFailedMessage(message);
      setStreamingMessage('');
      setPendingUserMessage(''); // 清除临时用户消息
      setIsSending(false);

      if (xhr) {
        xhr.abort();
      }
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      setError(null);
      sendMessageToAI(lastFailedMessage);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !id) return;

    const message = input.trim();
    setInput('');
    await sendMessageToAI(message);
  };

  const handleUseSuggestion = (content: string) => {
    setInput(content);
    setShowAssistant(false);
  };

  const handleGenerateSummary = () => {
    if (!id) return;
    generateSummary(id);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">对话不存在</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-blue-600 text-2xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900" numberOfLines={1}>
              {conversation.title}
            </Text>
            {conversation.topic && (
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {conversation.topic}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="py-4"
        >
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-4xl mb-2">💭</Text>
              <Text className="text-gray-500">开始你的思考之旅</Text>
              <Text className="text-gray-400 text-sm mt-1 text-center px-8">
                AI 会通过连续的开放式问题引导你深入思考
              </Text>
            </View>
          )}

          {/* Pending user message (临时显示 - 只在消息还未保存到数据库时显示) */}
          {pendingUserMessage && !conversation.messages.some(m => m.role === 'user' && m.content === pendingUserMessage) && (
            <View className="px-4 mb-4 flex-row justify-end">
              <View className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
                <Text className="text-white text-base">{pendingUserMessage}</Text>
                <Text className="text-blue-100 text-xs mt-1">发送中...</Text>
              </View>
            </View>
          )}

          {/* Streaming message */}
          {streamingMessage && (
            <View className="px-4 mb-4">
              <View className="bg-white dark:bg-gray-800 shadow-md rounded-2xl px-4 py-3 max-w-[80%]">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    AI 导师
                  </Text>
                </View>
                <Text className="text-base text-gray-900 dark:text-gray-100">
                  {streamingMessage}
                </Text>
              </View>
            </View>
          )}

          {isSending && !streamingMessage && (
            <View className="px-4">
              <View className="bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="ml-2 text-gray-500">AI 正在思考...</Text>
                </View>
              </View>
            </View>
          )}

          {/* Error message with retry */}
          {error && (
            <View className="px-4 mb-4">
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <View className="flex-row items-start">
                  <Text className="text-red-600 text-base mr-2">⚠️</Text>
                  <View className="flex-1">
                    <Text className="text-red-800 text-sm font-medium mb-1">发送失败</Text>
                    <Text className="text-red-600 text-sm mb-2">{error}</Text>
                    <View className="flex-row gap-3">
                      {lastFailedMessage && (
                        <TouchableOpacity
                          onPress={handleRetry}
                          className="bg-blue-600 px-4 py-2 rounded-lg"
                          disabled={isSending}
                        >
                          <Text className="text-white text-sm font-medium">
                            {isSending ? '重试中...' : '重试'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => setError(null)}
                        className="bg-gray-200 px-4 py-2 rounded-lg"
                      >
                        <Text className="text-gray-700 text-sm font-medium">关闭</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 智能助手浮动按钮 */}
        {conversation.messages && conversation.messages.length > 0 && !showAssistant && (
          <TouchableOpacity
            onPress={() => setShowAssistant(true)}
            className="absolute bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-xl items-center justify-center"
            style={{ elevation: 5 }}
          >
            {suggestions && suggestions.length > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {suggestions.length}
                </Text>
              </View>
            )}
            <Text className="text-2xl">💡</Text>
          </TouchableOpacity>
        )}

        {/* 智能助手抽屉 */}
        {showAssistant && (
          <View className="absolute inset-0 bg-black/50">
            <TouchableOpacity
              className="flex-1"
              onPress={() => setShowAssistant(false)}
            />
            <View className="bg-white rounded-t-3xl max-h-[75vh]">
              {/* 抽屉把手 */}
              <View className="items-center pt-3 pb-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>

              {/* 内容 */}
              <View className="px-4 pb-8">
                <Text className="text-lg font-bold mb-4">💡 智能助手</Text>

                {isLoadingSuggestions ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-gray-500 mt-4">正在生成建议...</Text>
                  </View>
                ) : suggestions && suggestions.length > 0 ? (
                  <ScrollView className="max-h-96">
                    {suggestions.map((suggestion: any, index: number) => {
                      // 兼容API返回格式: text/content, difficulty/level
                      const content = suggestion.text || suggestion.content;
                      const difficulty = suggestion.difficulty || (index === 0 ? 'simple' : index === 1 ? 'moderate' : 'deep');

                      const difficultyConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
                        simple: { bg: 'bg-green-100', text: 'text-green-700', label: '入门', icon: '🌱' },
                        moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '进阶', icon: '🌿' },
                        deep: { bg: 'bg-purple-100', text: 'text-purple-700', label: '深度', icon: '🌳' },
                      };

                      const config = difficultyConfig[difficulty] || difficultyConfig.simple;

                      return (
                        <TouchableOpacity
                          key={suggestion.id || index}
                          onPress={() => handleUseSuggestion(content)}
                          className="bg-gray-50 rounded-xl p-4 mb-3"
                        >
                          <View className="flex-row items-center mb-2">
                            <View className={`px-2 py-1 rounded ${config.bg}`}>
                              <Text className={`text-xs font-semibold ${config.text}`}>
                                {config.icon} {config.label}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-gray-900">{content}</Text>
                          {suggestion.intent && (
                            <Text className="text-xs text-gray-500 mt-2">💡 {suggestion.intent}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text className="text-gray-500 text-center py-8">
                    暂无建议答案
                  </Text>
                )}

                {/* 生成总结按钮 */}
                {conversation.messages && conversation.messages.length >= 5 && (
                  <Button
                    title={isGeneratingSummary ? '生成中...' : '生成思维总结'}
                    onPress={handleGenerateSummary}
                    loading={isGeneratingSummary}
                    variant="secondary"
                    className="mt-4"
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-end gap-2">
            <TextInput
              multiline
              value={input}
              onChangeText={setInput}
              placeholder="输入你的回答或新问题..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 max-h-24"
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isSending}
              className={`w-12 h-12 rounded-xl items-center justify-center ${
                input.trim() && !isSending
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              <Text className="text-white text-xl">↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
