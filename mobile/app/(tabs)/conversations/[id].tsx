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
  Animated,
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
import { VoiceInputButton } from '@/src/components/VoiceInputButton';
import { VoiceInputModal } from '@/src/components/VoiceInputModal';
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
  
  // 动画相关
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string>('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string>(''); // 临时显示用户消息

  // 语音输入相关状态
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceRecognizedText, setVoiceRecognizedText] = useState('');

  // 对话轮次与历史记录
  const [currentRound, setCurrentRound] = useState(0);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{
    round: number;
    userMessage: string;
    aiQuestion: string;
    timestamp: Date;
  }>>([]);
  const [conversationEnded, setConversationEnded] = useState(false);

  // 总结相关状态（已移除，现在总结直接输出到对话框）

  // Prevent duplicate suggestion generation
  const suggestionsGeneratedRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  // 阿里云 API Key (从环境变量或配置获取)
  const DASHSCOPE_API_KEY = process.env.EXPO_PUBLIC_DASHSCOPE_API_KEY || '';

  // Extract suggestions array from response
  const suggestions = (suggestionsData as any)?.suggestions || suggestionsData || [];

  // 监听状态变化
  useEffect(() => {
    // 状态变化处理逻辑
  }, [currentRound, conversationEnded, suggestions, suggestionsData, isLoadingSuggestions, showAssistant]);

  // 专门监听 showAssistant 状态变化并处理动画
  useEffect(() => {
    if (showAssistant) {
      // 显示动画
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 隐藏动画
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showAssistant, slideAnim]);

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

  // 监听AI回复完成，自动生成建议答案并更新轮次（参考Web端）- 防止重复调用
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
      const conversationHistory = (conversation.messages || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 更新轮次和对话历史记录（参考Web端逻辑）
      const userMessages = (conversation.messages || []).filter(m => m.role === 'user');
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
      }

      getSuggestions({
        conversationId: id,
        question: lastMessage.content,
        conversationHistory,
      });

      // 触发建议生成

    }
  }, [conversation?.messages, isSending, streamingMessage, currentRound]);

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
        console.error('Failed to decode topic:', error, { topic });
        // 解码失败时使用原始值
      }
      const initialMessage = `我想和你探讨这个话题: ${decodedTopic}`;

      // 清除URL参数（Expo Router方式）
      router.setParams({ new: undefined, topic: undefined });

      // 直接触发发送消息
      sendMessageToAI(initialMessage).catch((error) => {
        console.error('Failed to send initial message:', error, { initialMessage, id });
        // 处理发送失败
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
                      console.error('Failed to refetch conversation after message sent:', refetchError, { id });
                      setError('消息发送成功，但刷新失败。请手动刷新页面。');
                      setPendingUserMessage(''); // 失败时立即清除
                      setIsSending(false);
                    });
                  } else if (data.type === 'error') {
                    throw new Error(data.message || 'AI响应错误');
                  }
                } catch (parseError) {
                  console.error('Failed to parse SSE data:', parseError, { line, newText });
                  // 解析错误处理
                }
              }
            }
          }
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Network error in sendMessageToAI:', { message, id, url });
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
      console.error('Error in sendMessageToAI:', error, { message, id });
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

  const handleGenerateSummary = async () => {
    if (!id) return;

    // 检查是否已有总结消息
    const hasSummary = conversation?.messages?.some(msg =>
      msg.role === 'assistant' && msg.content.includes('📊 对话总结')
    );

    if (hasSummary) {
      // 如果已有总结，关闭抽屉并滚动到总结位置
      setShowAssistant(false);
      // 延迟滚动以确保抽屉关闭动画完成
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
      return;
    }

    // 关闭智能助手抽屉
    setShowAssistant(false);

    // 设置生成状态并清除错误
    setIsSending(true);
    setError(null);
    
    // 临时显示占位符消息
    setStreamingMessage('📊 正在生成对话总结...\n\n');

    let xhr: XMLHttpRequest | null = null;

    // 30秒超时控制
    const timeoutId = setTimeout(() => {
      setStreamingMessage('❌ 生成总结超时，请稍后重试');
      setIsSending(false);
      if (xhr) {
        xhr.abort();
      }
      // 显示错误消息一段时间后清除
      setTimeout(() => {
        setStreamingMessage('');
      }, 3000);
    }, 30000);

    try {
      const token = await tokenManager.getToken();
      const url = `${API_CONFIG.BASE_URL}/conversations/${id}/summary`;

      // 使用 XMLHttpRequest 进行 SSE 连接（React Native兼容）
      xhr = new XMLHttpRequest();

      let previousLength = 0;
      let summaryContent = '📊 对话总结\n\n';
      let jsonBuffer = ''; // 用于累积不完整的JSON数据

      xhr.onreadystatechange = () => {
        if (xhr?.readyState === 3 || xhr?.readyState === 4) {
          // 接收到部分数据或全部数据
          const currentText = xhr.responseText || '';
          const newText = currentText.substring(previousLength);
          previousLength = currentText.length;

          if (newText) {
            // 将新数据添加到缓冲区
            jsonBuffer += newText;
            
            // 尝试解析缓冲区中的JSON对象
            let processedLength = 0;
            const lines = jsonBuffer.split('\n');
            
            // 处理除最后一行外的所有行（最后一行可能不完整）
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line) {
                try {
                  const data = JSON.parse(line);
                  processedLength += lines[i].length + 1; // +1 for newline

                  if (data.type === 'chunk' && data.content) {
                    summaryContent += data.content;
                    // 实时更新流式消息内容
                    setStreamingMessage(summaryContent);
                  } else if (data.type === 'complete') {
                    clearTimeout(timeoutId);

                    // 保存总结消息到数据库
                    fetch(`${API_CONFIG.BASE_URL}/conversations/${id}/messages`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        role: 'assistant',
                        content: summaryContent
                      })
                    }).then(() => {
                      // 标记对话已结束
                      setConversationEnded(true);
                      
                      // 刷新对话以获取保存的消息
                      refetch().then((refetchResult) => {
                        setStreamingMessage('');
                        setIsSending(false);
                        
                        // 滚动到底部显示新消息
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                      }).catch((refetchError) => {
                        console.error('Failed to refetch conversation after summary saved:', refetchError, { id });
                        setStreamingMessage('');
                        setIsSending(false);
                      });
                    }).catch((saveError) => {
                      console.error('Failed to save summary message:', saveError, { id, summaryContent });
                      // 即使保存失败，也显示总结内容
                      setConversationEnded(true);
                      setIsSending(false);
                      setTimeout(() => {
                        setStreamingMessage('');
                      }, 100);
                    });
                  } else if (data.type === 'error') {
                    clearTimeout(timeoutId);
                    throw new Error(data.error || '生成总结失败');
                  }
                } catch (parseError) {
                  console.error('Failed to parse JSON in handleGenerateSummary:', parseError, { line, jsonBuffer });
                  // JSON解析失败，可能是不完整的数据，继续等待更多数据
                  break; // 跳出循环，等待更多数据
                }
              }
            }
            
            // 移除已处理的数据，保留未处理的部分
            if (processedLength > 0) {
              jsonBuffer = jsonBuffer.substring(processedLength);
            }
            
            // 如果是最后一行且不为空，尝试解析（可能是完整的JSON）
            const lastLine = lines[lines.length - 1].trim();
            if (lastLine && xhr?.readyState === 4) { // 只在请求完成时处理最后一行
              try {
                const data = JSON.parse(lastLine);
                
                if (data.type === 'chunk' && data.content) {
                  summaryContent += data.content;
                  setStreamingMessage(summaryContent);
                } else if (data.type === 'complete') {
                  clearTimeout(timeoutId);
                  
                  // 保存总结消息到数据库
                  fetch(`${API_CONFIG.BASE_URL}/conversations/${id}/messages`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      role: 'assistant',
                      content: summaryContent
                    })
                  }).then(() => {
                    setConversationEnded(true);
                    
                    // 刷新对话以获取保存的消息
                    refetch().then(() => {
                      setStreamingMessage('');
                      setIsSending(false);
                      
                      // 滚动到底部显示新消息
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                    }).catch((refetchError) => {
                      console.error('Failed to refetch conversation after summary saved (second instance):', refetchError, { id });
                      setStreamingMessage('');
                      setIsSending(false);
                    });
                  }).catch((saveError) => {
                    console.error('Failed to save summary message (second instance):', saveError, { id, summaryContent });
                    // 即使保存失败，也显示总结内容
                    setConversationEnded(true);
                    setIsSending(false);
                    setTimeout(() => {
                      setStreamingMessage('');
                    }, 100);
                  });
                } else if (data.type === 'error') {
                  clearTimeout(timeoutId);
                  throw new Error(data.error || '生成总结失败');
                }
              } catch (parseError) {
                console.error('Failed to parse last line in handleGenerateSummary:', parseError, { lastLine });
                // 最后一行解析失败，忽略
              }
            }
          }
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Network error in handleGenerateSummary:', { id, url });
        setStreamingMessage('❌ 网络连接失败，请稍后重试');
        setIsSending(false);
        // 显示错误消息一段时间后清除
        setTimeout(() => {
          setStreamingMessage('');
        }, 3000);
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(JSON.stringify({
        rounds: dialogueHistory
      }));

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error in handleGenerateSummary:', error, { id, dialogueHistory });
      setStreamingMessage('❌ 生成总结失败，请稍后重试');
      setIsSending(false);
      
      if (xhr) {
        xhr.abort();
      }
      
      // 显示错误消息一段时间后清除
      setTimeout(() => {
        setStreamingMessage('');
      }, 3000);
    }
  };

  const handleContinueAsking = () => {
    setConversationEnded(false);
    setShowAssistant(false);
  };

  // 语音输入处理
  const handleVoiceInput = () => {
    setShowVoiceModal(true);
  };

  const handleVoiceResult = (text: string) => {
    setVoiceRecognizedText(text);
    setInput(text);
    setShowVoiceModal(false);
  };

  const handleVoiceCancel = () => {
    setShowVoiceModal(false);
  };

  // 渲染消息列表
  const renderMessages = () => {
    const allMessages = [...(conversation?.messages || [])];

    // 如果有待发送的用户消息，添加到列表中
    if (pendingUserMessage) {
      allMessages.push({
        id: 'pending-user',
        role: 'user' as const,
        content: pendingUserMessage,
        createdAt: new Date().toISOString(),
      });
    }

    // 如果有流式消息，添加到列表中
    if (streamingMessage) {
      allMessages.push({
        id: 'streaming',
        role: 'assistant' as const,
        content: streamingMessage,
        createdAt: new Date().toISOString(),
      });
    }

    return allMessages.map((message) => (
      <MessageBubble
        key={message.id}
        message={{
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: new Date(message.createdAt),
        }}
        isStreaming={message.id === 'streaming'}
      />
    ));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 18, color: '#64748b' }}>←</Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1e293b',
            flex: 1,
          }} numberOfLines={1}>
            {conversation?.topic || '对话'}
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 40,
            }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{
                marginTop: 12,
                color: '#64748b',
                fontSize: 16,
              }}>
                加载对话中...
              </Text>
            </View>
          ) : (
            <>
              {renderMessages()}
              {error && (
                <View style={{
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca',
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 8,
                }}>
                  <Text style={{ color: '#dc2626', fontSize: 14 }}>
                    {error}
                  </Text>
                  {lastFailedMessage && (
                    <TouchableOpacity
                      onPress={handleRetry}
                      style={{
                        marginTop: 8,
                        backgroundColor: '#dc2626',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 4,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>
                        重试
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* 智能助手抽屉 */}
        {showAssistant && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                })
              }],
            }}
          >
            {/* 抽屉头部 */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>🤖</Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1e293b',
                }}>
                  智能助手
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAssistant(false)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#f8fafc',
                }}
              >
                <Text style={{ fontSize: 16, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 抽屉内容 */}
            <ScrollView
              style={{ maxHeight: 300 }}
              contentContainerStyle={{ padding: 20 }}
            >
              {/* 对话已总结状态 */}
              {conversationEnded && (
                <View style={{
                  backgroundColor: '#f0f9ff',
                  borderColor: '#0ea5e9',
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 20, marginBottom: 8 }}>📊</Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: 4,
                  }}>
                    对话已总结
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#075985',
                    textAlign: 'center',
                    marginBottom: 12,
                  }}>
                    本次苏格拉底式对话已完成总结
                  </Text>
                  <TouchableOpacity
                    onPress={handleContinueAsking}
                    style={{
                      backgroundColor: '#0ea5e9',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      继续追问
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 结束对话选项 - 只在轮次>=5且对话未结束时显示 */}
              {!conversationEnded && currentRound >= 5 && (
                <View style={{
                  backgroundColor: '#fef3c7',
                  borderColor: '#f59e0b',
                  borderWidth: 2,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: 8,
                  }}>
                    💭 对话进展
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#a16207',
                    marginBottom: 12,
                  }}>
                    已进行 {currentRound} 轮对话，您可以选择：
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      style={{
                        flex: 1,
                        backgroundColor: isGeneratingSummary ? '#d1d5db' : '#f59e0b',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        color: isGeneratingSummary ? '#6b7280' : 'white',
                        fontSize: 14,
                        fontWeight: '500',
                      }}>
                        {isGeneratingSummary ? '生成中...' : '结束并总结'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowAssistant(false)}
                      style={{
                        flex: 1,
                        backgroundColor: '#6b7280',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: '500',
                      }}>
                        继续对话
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 建议答案 */}
              {!conversationEnded && suggestions.length > 0 && (
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: 12,
                  }}>
                    💡 参考思路
                  </Text>
                  {suggestions.map((suggestion: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleUseSuggestion(suggestion.text || suggestion)}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: '#475569',
                        lineHeight: 20,
                      }}>
                        {suggestion.text || suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 加载状态 */}
              {isLoadingSuggestions && (
                <View style={{
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: '#64748b',
                  }}>
                    正在生成建议...
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        )}

        {/* Input Area */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-end gap-2">
            {/* 语音输入按钮 */}
            {!input.trim() && DASHSCOPE_API_KEY && (
              <VoiceInputButton
                apiKey={DASHSCOPE_API_KEY}
                onResult={handleVoiceResult}
                disabled={isSending}
              />
            )}

            {/* 文本输入框 */}
            <TextInput
              multiline
              value={input}
              onChangeText={setInput}
              placeholder={conversationEnded ? "对话已结束" : "输入你的回答或新问题..."}
              editable={!conversationEnded}
              className={`flex-1 rounded-xl px-4 py-3 max-h-24 ${
                conversationEnded ? 'bg-gray-200 text-gray-500' : 'bg-gray-50'
              }`}
            />

            {/* 发送按钮 */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={conversationEnded || !input.trim() || isSending}
              className={`w-12 h-12 rounded-xl items-center justify-center ${
                conversationEnded
                  ? 'bg-gray-300'
                  : input.trim() && !isSending
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              <Text className="text-white text-xl">
                {conversationEnded ? '✓' : '↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 语音识别结果确认对话框 */}
        <VoiceInputModal
          visible={showVoiceModal}
          recognizedText={voiceRecognizedText}
          onConfirm={handleVoiceConfirm}
          onCancel={handleVoiceCancel}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
