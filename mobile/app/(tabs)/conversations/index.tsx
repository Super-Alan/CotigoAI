import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConversations, useCreateConversation } from '@/src/hooks/useConversations';
import { useTopics, useGenerateTopics } from '@/src/hooks/useTopics';
import { Button } from '@/src/components/Button';
import {
  CriticalThinkingDimension,
  DifficultyLevel,
  DIMENSION_LABELS,
  DIMENSION_ICONS,
  DIFFICULTY_LABELS,
} from '@/src/types/topic';

export default function ConversationsListScreen() {
  const router = useRouter();
  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useConversations();
  const { data: topicsData, isLoading: loadingTopics, refetch: refetchTopics } = useTopics({ limit: 6, page: 1 });
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: generateTopics, isPending: isGenerating } = useGenerateTopics();

  const [topic, setTopic] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<CriticalThinkingDimension | null>(
    null
  );
  const [showTopicSquare, setShowTopicSquare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 开始新对话
  const handleStartConversation = () => {
    if (!topic.trim()) {
      Alert.alert('提示', '请输入话题内容');
      return;
    }

    createConversation(
      { topic },
      {
        onSuccess: (conversation) => {
          setTopic('');
          router.push(`/(tabs)/conversations/${conversation.id}`);
        },
        onError: () => {
          Alert.alert('错误', '创建对话失败，请稍后重试');
        },
      }
    );
  };

  // 生成话题
  const handleGenerateTopics = () => {
    generateTopics(
      {
        dimension: selectedDimension || undefined,
        difficulty: 'intermediate' as DifficultyLevel,
        count: 3,
      },
      {
        onSuccess: (topics) => {
          if (topics.length > 0) {
            setTopic(topics[0].topic);
            setShowTopicGenerator(false);
          }
        },
      }
    );
  };

  // 选择话题
  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setShowTopicSquare(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">苏格拉底对话</Text>
        <Text className="text-sm text-gray-600 mt-1">
          通过提问引导深度思考
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loadingConversations} onRefresh={refetchConversations} />
        }
      >
        {/* 🎯 核心功能：苏格拉底对话输入区 */}
        <View className="bg-white m-4 rounded-2xl p-5 shadow-lg">
          <Text className="text-xl font-bold mb-2 text-gray-900">开始新对话</Text>
          <Text className="text-sm text-gray-600 mb-4">
            输入你的观点，开启一场思维挑战...
          </Text>

          <TextInput
            multiline
            numberOfLines={4}
            value={topic}
            onChangeText={setTopic}
            placeholder="例如：我认为人工智能最终会取代所有人类工作"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl p-4 text-base mb-4"
            style={{ minHeight: 120, textAlignVertical: 'top' }}
          />

          <View className="flex-row gap-3">
            <Button
              title={isCreating ? '创建中...' : '开始对话'}
              onPress={handleStartConversation}
              loading={isCreating}
              className="flex-1"
            />
            <TouchableOpacity
              onPress={() => setShowTopicSquare(!showTopicSquare)}
              className="bg-purple-100 px-5 rounded-xl items-center justify-center"
            >
              <Text className="text-2xl">✨</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 📚 话题推荐区 - 快速选择 */}
        {topicsData && topicsData.topics.length > 0 && (
          <View className="px-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-900">💡 推荐话题</Text>
              <TouchableOpacity onPress={() => setShowTopicSquare(true)}>
                <Text className="text-sm text-blue-600">查看更多 →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {topicsData.topics.slice(0, 3).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectTopic(item.topic)}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 w-72 border border-blue-100"
                    style={{ width: 280 }}
                  >
                    <Text className="text-xs text-gray-500 mb-2">
                      {DIMENSION_ICONS[item.dimension]} {DIMENSION_LABELS[item.dimension]}
                    </Text>
                    <Text className="text-sm text-gray-900 leading-5" numberOfLines={3}>
                      {item.topic}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 📜 历史对话 - 快速入口 */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">📜 最近对话</Text>
            <TouchableOpacity onPress={() => setShowHistory(true)}>
              <Text className="text-sm text-blue-600">查看全部 →</Text>
            </TouchableOpacity>
          </View>

          {conversations && conversations.length > 0 ? (
            conversations.slice(0, 3).map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/(tabs)/conversations/${conv.id}`)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <Text className="font-semibold text-gray-900 mb-1">
                  {conv.title}
                </Text>
                {conv.topic && (
                  <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                    {conv.topic}
                  </Text>
                )}
                <Text className="text-xs text-gray-400">
                  {new Date(conv.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center border border-dashed border-gray-300">
              <Text className="text-3xl mb-2">💭</Text>
              <Text className="text-gray-500 text-sm">还没有对话记录</Text>
            </View>
          )}
        </View>

        {/* ✨ 话题生成器 Modal */}
        {showTopicSquare && (
          <View className="px-4 py-4 bg-white rounded-t-3xl shadow-2xl mb-4 border-t-2 border-blue-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">✨ 智能生成话题</Text>
              <TouchableOpacity onPress={() => setShowTopicSquare(false)}>
                <Text className="text-gray-500 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            {/* 维度选择 */}
            <Text className="font-semibold mb-2 text-gray-700">选择思维维度</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {Object.values(CriticalThinkingDimension).map((dim) => (
                  <TouchableOpacity
                    key={dim}
                    onPress={() => setSelectedDimension(dim)}
                    className={`px-4 py-2 rounded-full ${
                      selectedDimension === dim
                        ? 'bg-blue-600'
                        : 'bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedDimension === dim ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {DIMENSION_ICONS[dim]} {DIMENSION_LABELS[dim]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Button
              title={isGenerating ? '生成中...' : '生成3个话题'}
              onPress={handleGenerateTopics}
              loading={isGenerating}
            />

            {/* 话题列表 */}
            {topicsData && topicsData.topics.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm text-gray-600 mb-3">
                  共 {topicsData.pagination.total} 个话题
                </Text>
                {topicsData.topics.map((item) => (
                  <View key={item.id} className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
                    <Text className="text-xs text-gray-500 mb-2">
                      {DIMENSION_ICONS[item.dimension]} {DIMENSION_LABELS[item.dimension]} · {DIFFICULTY_LABELS[item.difficulty]}
                    </Text>
                    <Text className="text-sm text-gray-900 mb-3 leading-5">
                      {item.topic}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleSelectTopic(item.topic)}
                      className="bg-blue-600 rounded-lg py-2 px-4"
                    >
                      <Text className="text-white text-center text-sm font-medium">
                        使用此话题
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
