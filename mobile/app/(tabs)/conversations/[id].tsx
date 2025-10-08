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
  useSendMessage,
  useGetSuggestions,
  useGenerateSummary,
} from '@/src/hooks/useConversations';
import { MessageBubble } from '@/src/components/MessageBubble';
import { Button } from '@/src/components/Button';

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: conversation, isLoading } = useConversation(id);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: getSuggestions, data: suggestions, isPending: isLoadingSuggestions } = useGetSuggestions();
  const { mutate: generateSummary, isPending: isGeneratingSummary } =
    useGenerateSummary();

  const [input, setInput] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    // 自动滚动到底部
    if (conversation?.messages && conversation.messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation?.messages]);

  useEffect(() => {
    // 当打开智能助手时，生成建议答案
    if (showAssistant && conversation?.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage.role === 'assistant') {
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
    }
  }, [showAssistant, conversation, id, getSuggestions]);

  const handleSend = () => {
    if (!input.trim() || !id) return;

    const message = input.trim();
    setInput('');

    sendMessage({
      conversationId: id,
      content: message,
    });
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

          {isSending && (
            <View className="px-4">
              <View className="bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="ml-2 text-gray-500">AI 正在思考...</Text>
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
                    {suggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion.id}
                        onPress={() => handleUseSuggestion(suggestion.content)}
                        className="bg-gray-50 rounded-xl p-4 mb-3"
                      >
                        <View className="flex-row items-center mb-2">
                          <View
                            className={`px-2 py-1 rounded ${
                              suggestion.level === 'beginner'
                                ? 'bg-green-100'
                                : suggestion.level === 'intermediate'
                                ? 'bg-blue-100'
                                : 'bg-purple-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                suggestion.level === 'beginner'
                                  ? 'text-green-700'
                                  : suggestion.level === 'intermediate'
                                  ? 'text-blue-700'
                                  : 'text-purple-700'
                              }`}
                            >
                              {suggestion.level === 'beginner'
                                ? '入门'
                                : suggestion.level === 'intermediate'
                                ? '进阶'
                                : '高级'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-900">{suggestion.content}</Text>
                      </TouchableOpacity>
                    ))}
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
