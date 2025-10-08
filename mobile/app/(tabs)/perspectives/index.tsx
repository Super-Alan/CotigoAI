import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  usePerspectiveSessions,
  useCreatePerspectiveSession,
} from '@/src/hooks/usePerspectives';
import { Button } from '@/src/components/Button';

export default function PerspectivesScreen() {
  const router = useRouter();
  const { data: sessions, isLoading, refetch } = usePerspectiveSessions();
  const { mutate: createSession, isPending: isCreating } = useCreatePerspectiveSession();

  const [topic, setTopic] = useState('');

  const handleCreateSession = () => {
    if (!topic.trim()) {
      Alert.alert('提示', '请输入话题内容');
      return;
    }

    createSession(
      { topic: topic.trim() },
      {
        onSuccess: (session) => {
          setTopic('');
          router.push(`/(tabs)/perspectives/${session.id}`);
        },
        onError: () => {
          Alert.alert('错误', '创建会话失败，请稍后重试');
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">多棱镜视角</Text>
        <Text className="text-sm text-gray-600 mt-1">
          从不同角度探索同一话题
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* 创建新会话 */}
        <View className="bg-white m-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">创建新视角会话</Text>

          <TextInput
            multiline
            numberOfLines={4}
            value={topic}
            onChangeText={setTopic}
            placeholder="输入你想要探索的话题或问题..."
            className="bg-gray-50 rounded-xl p-4 text-base mb-3"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Button
            title={isCreating ? '创建中...' : '创建会话'}
            onPress={handleCreateSession}
            loading={isCreating}
          />

          <View className="mt-3 bg-blue-50 rounded-xl p-3">
            <Text className="text-sm text-blue-900">
              💡 系统将生成多个不同视角来分析你的话题，帮助你全面理解问题
            </Text>
          </View>
        </View>

        {/* 历史会话列表 */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold mb-3">历史会话</Text>

          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push(`/(tabs)/perspectives/${session.id}`)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                {/* 话题 */}
                <Text className="font-semibold text-gray-900 mb-2" numberOfLines={2}>
                  {session.topic}
                </Text>

                {/* 视角数量 */}
                <View className="flex-row items-center gap-4 mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm">
                      👥 {session.perspectives?.length || 0} 个视角
                    </Text>
                  </View>
                  {session.synthesis && (
                    <View className="flex-row items-center">
                      <Text className="text-green-600 text-sm">✅ 已综合</Text>
                    </View>
                  )}
                </View>

                {/* 视角预览 */}
                {session.perspectives && session.perspectives.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {session.perspectives.slice(0, 3).map((perspective) => (
                      <View
                        key={perspective.id}
                        className="px-2 py-1 bg-purple-100 rounded-full"
                      >
                        <Text className="text-xs text-purple-700">
                          {perspective.name}
                        </Text>
                      </View>
                    ))}
                    {session.perspectives.length > 3 && (
                      <View className="px-2 py-1 bg-gray-100 rounded-full">
                        <Text className="text-xs text-gray-600">
                          +{session.perspectives.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* 时间 */}
                <Text className="text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <Text className="text-4xl mb-2">🔮</Text>
              <Text className="text-gray-500">还没有视角会话</Text>
              <Text className="text-gray-400 text-sm mt-1">
                创建你的第一个多视角探索会话
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
