import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
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

type TabType = 'plaza' | 'history';

export default function ConversationsListScreen() {
  const router = useRouter();
  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useConversations();
  const { data: topicsData, isLoading: loadingTopics, refetch: refetchTopics } = useTopics({ limit: 20, page: 1 });
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: generateTopics, isPending: isGenerating } = useGenerateTopics();

  const [activeTab, setActiveTab] = useState<TabType>('plaza');
  const [topic, setTopic] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<CriticalThinkingDimension | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuidingQuestionsModal, setShowGuidingQuestionsModal] = useState(false);
  const [selectedTopicForQuestions, setSelectedTopicForQuestions] = useState<any>(null);

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
          const topicText = topic.trim();
          setTopic('');
          // 传递 new 和 topic 参数，触发自动开始对话
          router.push({
            pathname: `/(tabs)/conversations/${conversation.id}`,
            params: { new: 'true', topic: topicText },
          });
        },
        onError: () => {
          Alert.alert('错误', '创建对话失败，请稍后重试');
        },
      }
    );
  };

  // 选择话题 - 复制到输入框而不是直接开始对话
  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  // 打开生成话题对话框
  const handleOpenGenerateModal = () => {
    setShowGenerateModal(true);
  };

  // 确认生成话题
  const handleConfirmGenerate = () => {
    setShowGenerateModal(false);
    setIsRefreshing(true);

    // 生成新话题 - 可能耗时数分钟
    generateTopics(
      {
        count: 5,
        dimension: selectedDimension,
        difficulty: selectedDifficulty,
      },
      {
        onSuccess: () => {
          // 生成成功后重新获取话题列表
          refetchTopics();
          setIsRefreshing(false);
          Alert.alert('成功', '话题生成完成！');
        },
        onError: () => {
          setIsRefreshing(false);
          Alert.alert('提示', '生成话题失败，请稍后重试');
        },
      }
    );
  };

  // 过滤话题 - 基于搜索查询
  const filteredTopics = topicsData?.topics?.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.topic.toLowerCase().includes(query) ||
      item.referenceUniversity.toLowerCase().includes(query) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }) || [];

  // 打开引导问题框架弹窗
  const handleShowGuidingQuestions = (topicItem: any) => {
    setSelectedTopicForQuestions(topicItem);
    setShowGuidingQuestionsModal(true);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F9FF' }}>
      {/* Header - Tech Blue Style with Gradient */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.05) 0%, transparent 100%)',
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: '700',
            color: '#0C4A6E',
            letterSpacing: -0.8,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
          }}
        >
          对话
        </Text>
        <Text
          style={{
            fontSize: 17,
            color: '#0284C7',
            fontWeight: '500',
            marginTop: 2,
            letterSpacing: -0.408,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
          }}
        >
          Socratic Dialogue
        </Text>
      </View>

      {/* 🎯 核心功能：对话输入区 - Tech Blue 风格 */}
      <View className="mx-5 mb-5">
        <View className="relative">
          <TextInput
            multiline
            value={topic}
            onChangeText={setTopic}
            placeholder="分享你的观点..."
            placeholderTextColor="#94A3B8"
            className="w-full"
            style={{
              minHeight: 140,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 60,
              textAlignVertical: 'top',
              borderRadius: 24,
              backgroundColor: '#FFFFFF',
              fontSize: 17,
              fontWeight: '400',
              color: '#0C4A6E',
              lineHeight: 22,
              letterSpacing: -0.408,
              fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
              borderWidth: 1,
              borderColor: 'rgba(14, 165, 233, 0.15)',
            }}
          />

          {/* Tech Blue 渐变按钮 */}
          <View className="absolute bottom-4 right-4">
            <TouchableOpacity
              onPress={handleStartConversation}
              disabled={!topic.trim() || isCreating}
              activeOpacity={0.8}
              style={{
                background: (!topic.trim() || isCreating)
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                backgroundColor: (!topic.trim() || isCreating) ? '#CBD5E1' : '#0EA5E9',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 16,
                shadowColor: (!topic.trim() || isCreating) ? 'transparent' : '#0EA5E9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '600',
                  letterSpacing: -0.24,
                  fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
                }}
              >
                {isCreating ? '创建中' : '开始对话'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tech Blue Segmented Control */}
      <View
        className="flex-row mx-5 mb-4 p-1"
        style={{
          backgroundColor: 'rgba(224, 242, 254, 0.5)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(14, 165, 233, 0.1)',
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('plaza')}
          className="flex-1 py-2.5"
          style={{
            backgroundColor: activeTab === 'plaza' ? '#FFFFFF' : 'transparent',
            borderRadius: 10,
            shadowColor: activeTab === 'plaza' ? '#0EA5E9' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: activeTab === 'plaza' ? 2 : 0,
          }}
        >
          <Text
            className="text-center"
            style={{
              color: activeTab === 'plaza' ? '#0EA5E9' : '#64748B',
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: -0.24,
            }}
          >
            广场
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          className="flex-1 py-2.5"
          style={{
            backgroundColor: activeTab === 'history' ? '#FFFFFF' : 'transparent',
            borderRadius: 10,
            shadowColor: activeTab === 'history' ? '#0EA5E9' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: activeTab === 'history' ? 2 : 0,
          }}
        >
          <Text
            className="text-center"
            style={{
              color: activeTab === 'history' ? '#0EA5E9' : '#64748B',
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: -0.24,
            }}
          >
            对话
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab内容区 */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={activeTab === 'plaza' ? loadingTopics : loadingConversations}
            onRefresh={activeTab === 'plaza' ? refetchTopics : refetchConversations}
          />
        }
      >
        {/* 话题广场 Tab */}
        {activeTab === 'plaza' && (
          <View className="px-4 pb-4">
            {/* 搜索框和智能生成按钮 */}
            <View className="flex-row items-center gap-2 mb-4">
              {/* 搜索框 */}
              <View className="flex-1 flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
                <Text className="text-gray-400 mr-2">🔍</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="搜索话题..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-sm text-gray-900"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text className="text-gray-400 text-lg">×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 智能生成按钮 */}
              <TouchableOpacity
                onPress={handleOpenGenerateModal}
                disabled={isRefreshing || isGenerating}
                className="bg-purple-100 px-4 py-2 rounded-xl flex-row items-center"
                style={{
                  opacity: (isRefreshing || isGenerating) ? 0.5 : 1,
                }}
              >
                <Text className="text-purple-600 font-medium mr-1">
                  {(isRefreshing || isGenerating) ? '⏳' : '✨'}
                </Text>
                <Text className="text-purple-600 font-medium text-sm">
                  {(isRefreshing || isGenerating) ? '生成中' : '生成'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 话题卡片列表 */}
            {filteredTopics.length > 0 ? (
              filteredTopics.map((item) => item && (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 16,
                    elevation: 3,
                    borderWidth: 0.5,
                    borderColor: 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* 标签行 - Premium 样式 */}
                  <View className="flex-row items-center mb-3">
                    <View
                      style={{
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#34C759',
                          fontWeight: '600',
                          letterSpacing: 0.06,
                        }}
                      >
                        🔍 入门级
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8E8E93',
                        fontWeight: '500',
                        letterSpacing: 0.06,
                      }}
                    >
                      MIT • {DIMENSION_LABELS[item.dimension]}
                    </Text>
                  </View>

                  {/* 话题标题 - SF Pro Display */}
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: 12,
                      lineHeight: 22,
                      letterSpacing: -0.408,
                      fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
                    }}
                  >
                    {item.topic}
                  </Text>

                  {/* 话题描述（如果有） */}
                  {item.description && (
                    <Text className="text-sm text-gray-600 mb-4 leading-5">
                      {item.description}
                    </Text>
                  )}

                  {/* 标签 */}
                  <View className="flex-row flex-wrap mb-4">
                    {item.tags?.map((tag, index) => (
                      <View key={index} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-xs text-gray-700">#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 引导问题框 */}
                  {item.guidingQuestion && (
                    <View className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-4 rounded">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-orange-600 font-semibold text-xs mr-2">🎯</Text>
                        <Text className="text-orange-600 font-semibold text-xs">
                          {item.guidingQuestion.title || '评估环保举措在实际执行中的多重社会影响'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 查看引导问题框架按钮 */}
                  <TouchableOpacity
                    className="mb-3"
                    onPress={() => handleShowGuidingQuestions(item)}
                  >
                    <Text className="text-blue-600 font-medium text-sm">
                      ▶ 查看引导问题框架 →
                    </Text>
                  </TouchableOpacity>

                  {/* 底部操作栏 - Premium 样式 */}
                  <View className="flex-row items-center justify-between">
                    {/* 左侧：生成时间 */}
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8E8E93',
                        fontWeight: '400',
                        letterSpacing: 0.06,
                      }}
                    >
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      }) : '最近生成'}
                    </Text>

                    {/* 右侧：选择话题按钮 - Tech Blue 渐变 */}
                    <TouchableOpacity
                      onPress={() => handleSelectTopic(item.topic)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: '#0EA5E9',
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 12,
                        shadowColor: '#0EA5E9',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontWeight: '600',
                          fontSize: 13,
                          letterSpacing: -0.24,
                        }}
                      >
                        选择话题
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white rounded-xl p-8 items-center">
                <Text className="text-4xl mb-2">💡</Text>
                <Text className="text-gray-500">
                  {searchQuery ? '未找到匹配的话题' : '暂无话题'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={handleOpenGenerateModal}
                    className="mt-4 bg-blue-600 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">生成话题</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* 最近对话 Tab */}
        {activeTab === 'history' && (
          <View className="px-4 pb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">最近对话</Text>

            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => router.push(`/(tabs)/conversations/${conv.id}`)}
                  className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-200"
                >
                  <Text className="font-bold text-gray-900 text-base mb-2">
                    {conv.title}
                  </Text>
                  {conv.topic && (
                    <Text className="text-sm text-gray-600 mb-3 leading-5" numberOfLines={2}>
                      {conv.topic}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </Text>
                    {conv.messageCount !== undefined && (
                      <Text className="text-xs text-gray-500">
                        💬 {conv.messageCount} 条消息
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-white rounded-xl p-8 items-center border border-dashed border-gray-300">
                <Text className="text-4xl mb-2">💭</Text>
                <Text className="text-gray-500 text-sm">还没有对话记录</Text>
                <Text className="text-gray-400 text-xs mt-1">
                  从话题广场开始你的第一次对话
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 智能生成话题对话框 */}
      <Modal
        visible={showGenerateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            {/* 标题 */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">✨ 智能生成话题</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                <Text className="text-2xl text-gray-400">×</Text>
              </TouchableOpacity>
            </View>

            {/* 思维维度选择 */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">思维维度（可选）</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <TouchableOpacity
                  onPress={() => setSelectedDimension(undefined)}
                  className="mr-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: selectedDimension === undefined ? '#3B82F6' : '#F3F4F6',
                  }}
                >
                  <Text style={{ color: selectedDimension === undefined ? '#FFFFFF' : '#6B7280' }}>
                    随机
                  </Text>
                </TouchableOpacity>
                {Object.values(CriticalThinkingDimension).map((dim) => (
                  <TouchableOpacity
                    key={dim}
                    onPress={() => setSelectedDimension(dim)}
                    className="mr-2 px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: selectedDimension === dim ? '#3B82F6' : '#F3F4F6',
                    }}
                  >
                    <Text style={{ color: selectedDimension === dim ? '#FFFFFF' : '#6B7280' }}>
                      {DIMENSION_ICONS[dim]} {DIMENSION_LABELS[dim]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 难度级别选择 */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">难度级别</Text>
              <View className="flex-row gap-3">
                {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setSelectedDifficulty(level)}
                    className="flex-1 py-3 rounded-xl"
                    style={{
                      backgroundColor: selectedDifficulty === level ? '#3B82F6' : '#F3F4F6',
                    }}
                  >
                    <Text
                      className="text-center font-semibold"
                      style={{ color: selectedDifficulty === level ? '#FFFFFF' : '#6B7280' }}
                    >
                      {DIFFICULTY_LABELS[level]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 提示信息 */}
            <View className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6 rounded">
              <Text className="text-yellow-800 text-xs">
                ⏱️ 生成过程可能需要数分钟，请耐心等待
              </Text>
            </View>

            {/* 操作按钮 */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowGenerateModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300"
              >
                <Text className="text-center font-semibold text-gray-700">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmGenerate}
                className="flex-1 py-3 rounded-xl"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Text className="text-center font-semibold text-white">开始生成</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 引导问题框架弹窗 */}
      <Modal
        visible={showGuidingQuestionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuidingQuestionsModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            {/* 标题栏 */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">🎯 引导问题框架</Text>
              <TouchableOpacity onPress={() => setShowGuidingQuestionsModal(false)}>
                <Text className="text-2xl text-gray-400">×</Text>
              </TouchableOpacity>
            </View>

            {/* 话题信息 */}
            {selectedTopicForQuestions && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 话题标题 */}
                <View className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Text className="text-xs text-blue-600 font-semibold mb-2">
                    {selectedTopicForQuestions.referenceUniversity} • {DIMENSION_LABELS[selectedTopicForQuestions.dimension]}
                  </Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {selectedTopicForQuestions.topic}
                  </Text>
                </View>

                {/* 思维框架 */}
                {selectedTopicForQuestions.thinkingFramework && (
                  <View className="mb-5">
                    <Text className="text-sm font-bold text-gray-900 mb-3">💭 思维框架</Text>

                    {/* 核心挑战 */}
                    <View className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <Text className="text-xs font-semibold text-orange-700 mb-1">核心挑战</Text>
                      <Text className="text-sm text-gray-800">
                        {selectedTopicForQuestions.thinkingFramework.coreChallenge}
                      </Text>
                    </View>

                    {/* 常见陷阱 */}
                    {selectedTopicForQuestions.thinkingFramework.commonPitfalls?.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-xs font-semibold text-red-700 mb-2">⚠️ 常见陷阱</Text>
                        {selectedTopicForQuestions.thinkingFramework.commonPitfalls.map((pitfall: string, index: number) => (
                          <View key={index} className="flex-row mb-2">
                            <Text className="text-red-600 mr-2">•</Text>
                            <Text className="flex-1 text-sm text-gray-700">{pitfall}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 优秀回应指标 */}
                    {selectedTopicForQuestions.thinkingFramework.excellentResponseIndicators?.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-xs font-semibold text-green-700 mb-2">✨ 优秀回应指标</Text>
                        {selectedTopicForQuestions.thinkingFramework.excellentResponseIndicators.map((indicator: string, index: number) => (
                          <View key={index} className="flex-row mb-2">
                            <Text className="text-green-600 mr-2">✓</Text>
                            <Text className="flex-1 text-sm text-gray-700">{indicator}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* 引导问题列表 */}
                {selectedTopicForQuestions.guidingQuestions?.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-bold text-gray-900 mb-3">🔄 引导问题阶梯</Text>
                    {selectedTopicForQuestions.guidingQuestions.map((q: any, index: number) => (
                      <View key={index} className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <View className="flex-row items-center mb-2">
                          <View
                            className="px-2 py-1 rounded-full mr-2"
                            style={{ backgroundColor: '#3B82F6' }}
                          >
                            <Text className="text-xs font-bold text-white">
                              L{q.level}
                            </Text>
                          </View>
                          <Text className="text-xs font-semibold text-blue-700">
                            {q.stage}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-800 leading-5">
                          {q.question}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 预期成果 */}
                {selectedTopicForQuestions.expectedOutcomes?.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-bold text-gray-900 mb-3">🎯 预期成果</Text>
                    {selectedTopicForQuestions.expectedOutcomes.map((outcome: string, index: number) => (
                      <View key={index} className="flex-row mb-2">
                        <Text className="text-blue-600 mr-2">→</Text>
                        <Text className="flex-1 text-sm text-gray-700">{outcome}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 关闭按钮 */}
                <TouchableOpacity
                  onPress={() => setShowGuidingQuestionsModal(false)}
                  className="mt-4 py-3 rounded-xl border border-gray-300"
                >
                  <Text className="text-center font-semibold text-gray-700">关闭</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
