import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  usePerspectiveSession,
  useGeneratePerspectives,
  useChatWithPerspective,
  useSynthesizePerspectives,
} from '@/src/hooks/usePerspectives';
import { Button } from '@/src/components/Button';
import type { Perspective } from '@/src/types/perspective';

export default function PerspectiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: session, isLoading } = usePerspectiveSession(id);
  const { mutate: generatePerspectives, isPending: isGenerating } =
    useGeneratePerspectives();
  const { mutate: chatWithPerspective, isPending: isChatting } =
    useChatWithPerspective();
  const { mutate: synthesize, isPending: isSynthesizing } = useSynthesizePerspectives();

  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | null>(
    null
  );
  const [input, setInput] = useState('');
  const [showSynthesis, setShowSynthesis] = useState(false);

  useEffect(() => {
    // 如果会话没有视角，自动生成
    if (session && (!session.perspectives || session.perspectives.length === 0)) {
      generatePerspectives({ sessionId: id });
    }
  }, [session]);

  useEffect(() => {
    // 自动滚动到底部
    if (selectedPerspective?.messages && selectedPerspective.messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedPerspective?.messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !selectedPerspective) return;

    const message = input.trim();
    setInput('');

    chatWithPerspective({
      sessionId: id,
      perspectiveId: selectedPerspective.id,
      content: message,
    });
  };

  const handleSynthesize = () => {
    synthesize(
      { sessionId: id },
      {
        onSuccess: () => {
          setShowSynthesis(true);
          Alert.alert('成功', '视角综合完成');
        },
        onError: () => {
          Alert.alert('错误', '综合失败，请稍后重试');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">会话不存在</Text>
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
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-blue-600 text-2xl">←</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {session.topic}
              </Text>
              <Text className="text-xs text-gray-500">
                {session.perspectives?.length || 0} 个视角
              </Text>
            </View>
            {session.perspectives && session.perspectives.length > 0 && (
              <Button
                title={isSynthesizing ? '综合中' : '综合视角'}
                onPress={handleSynthesize}
                loading={isSynthesizing}
                variant="secondary"
                size="sm"
              />
            )}
          </View>
        </View>

        {/* 生成中提示 */}
        {isGenerating && (
          <View className="p-4 bg-blue-50 border-b border-blue-100">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="ml-2 text-blue-900">正在生成多视角分析...</Text>
            </View>
          </View>
        )}

        {/* 综合结果 */}
        {showSynthesis && session.synthesis && (
          <View className="m-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">🔮 综合分析</Text>
              <TouchableOpacity
                onPress={() => setShowSynthesis(false)}
                className="ml-auto"
              >
                <Text className="text-gray-500 text-xl">×</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-900">{session.synthesis}</Text>
          </View>
        )}

        {/* 视角卡片列表 */}
        {!selectedPerspective && session.perspectives && session.perspectives.length > 0 && (
          <ScrollView className="flex-1 p-4">
            <Text className="text-lg font-semibold mb-3">选择一个视角对话</Text>
            {session.perspectives.map((perspective) => (
              <TouchableOpacity
                key={perspective.id}
                onPress={() => setSelectedPerspective(perspective)}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">{perspective.icon}</Text>
                  <Text className="text-lg font-semibold text-gray-900 flex-1">
                    {perspective.name}
                  </Text>
                </View>
                <Text className="text-gray-700 mb-2">{perspective.description}</Text>
                <Text className="text-sm text-gray-500 italic">
                  "{perspective.stance}"
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 对话界面 */}
        {selectedPerspective && (
          <>
            {/* 视角信息栏 */}
            <View className="bg-white border-b border-gray-200 px-4 py-2">
              <TouchableOpacity
                onPress={() => setSelectedPerspective(null)}
                className="flex-row items-center"
              >
                <Text className="text-blue-600 mr-2">←</Text>
                <Text className="text-xl mr-2">{selectedPerspective.icon}</Text>
                <Text className="font-semibold text-gray-900">
                  {selectedPerspective.name}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 消息列表 */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerClassName="p-4"
            >
              {/* 视角介绍 */}
              <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                <Text className="text-gray-900 mb-2">
                  {selectedPerspective.description}
                </Text>
                <Text className="text-sm text-purple-700 italic">
                  立场: {selectedPerspective.stance}
                </Text>
              </View>

              {/* 对话消息 */}
              {selectedPerspective.messages && selectedPerspective.messages.length > 0 ? (
                selectedPerspective.messages.map((message) => (
                  <View
                    key={message.id}
                    className={`mb-3 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <Text
                        className={
                          message.role === 'user' ? 'text-white' : 'text-gray-900'
                        }
                      >
                        {message.content}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-12">
                  <Text className="text-4xl mb-2">💬</Text>
                  <Text className="text-gray-500">开始与这个视角对话</Text>
                </View>
              )}

              {isChatting && (
                <View className="items-start">
                  <View className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text className="ml-2 text-gray-500">思考中...</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* 输入区 */}
            <View className="bg-white border-t border-gray-200 px-4 py-3">
              <View className="flex-row items-end gap-2">
                <TextInput
                  multiline
                  value={input}
                  onChangeText={setInput}
                  placeholder="输入你的问题..."
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 max-h-24"
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!input.trim() || isChatting}
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    input.trim() && !isChatting ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white text-xl">↑</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* 空状态 */}
        {!selectedPerspective &&
          (!session.perspectives || session.perspectives.length === 0) &&
          !isGenerating && (
            <View className="flex-1 items-center justify-center p-8">
              <Text className="text-4xl mb-2">🔮</Text>
              <Text className="text-gray-500 text-center">
                正在为你生成多个视角...
              </Text>
            </View>
          )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
