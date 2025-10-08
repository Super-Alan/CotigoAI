import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useConversations } from '@/src/hooks/useConversations';
import { useArguments } from '@/src/hooks/useArguments';
import { usePerspectiveSessions } from '@/src/hooks/usePerspectives';
import { Button } from '@/src/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: conversations } = useConversations();
  const { data: argumentAnalyses } = useArguments();
  const { data: perspectiveSessions } = usePerspectiveSessions();

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗?', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">我的</Text>
      </View>

      <ScrollView className="flex-1">
        {/* 用户信息卡片 */}
        <View className="bg-white m-4 rounded-2xl p-6 shadow-sm items-center">
          {/* 头像 */}
          <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full items-center justify-center mb-3">
            <Text className="text-3xl text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>

          {/* 用户名 */}
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {user?.name || '用户'}
          </Text>
          <Text className="text-sm text-gray-500 mb-4">{user?.email}</Text>

          {/* 会员标签（可选） */}
          <View className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1 rounded-full">
            <Text className="text-white text-sm font-semibold">✨ 标准会员</Text>
          </View>
        </View>

        {/* 统计数据 */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold mb-3">我的数据</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {conversations?.length || 0}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">对话记录</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {argumentAnalyses?.length || 0}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">论点分析</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {perspectiveSessions?.length || 0}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">视角会话</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 功能菜单 */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold mb-3">设置</Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 账号设置 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => Alert.alert('提示', '功能开发中')}
            >
              <Text className="text-2xl mr-3">👤</Text>
              <Text className="flex-1 text-gray-900">账号设置</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            {/* 通知设置 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => Alert.alert('提示', '功能开发中')}
            >
              <Text className="text-2xl mr-3">🔔</Text>
              <Text className="flex-1 text-gray-900">通知设置</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            {/* 主题设置 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => Alert.alert('提示', '功能开发中')}
            >
              <Text className="text-2xl mr-3">🎨</Text>
              <Text className="flex-1 text-gray-900">主题设置</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            {/* 语言设置 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => Alert.alert('提示', '功能开发中')}
            >
              <Text className="text-2xl mr-3">🌐</Text>
              <Text className="flex-1 text-gray-900">语言设置</Text>
              <Text className="text-sm text-gray-500 mr-2">简体中文</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            {/* 帮助中心 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => Alert.alert('提示', '功能开发中')}
            >
              <Text className="text-2xl mr-3">❓</Text>
              <Text className="flex-1 text-gray-900">帮助中心</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>

            {/* 关于我们 */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() =>
                Alert.alert(
                  'CotigoAI',
                  '版本 1.0.0\n\n批判性思维训练平台\n帮助你培养独立思考和理性分析能力'
                )
              }
            >
              <Text className="text-2xl mr-3">ℹ️</Text>
              <Text className="flex-1 text-gray-900">关于我们</Text>
              <Text className="text-sm text-gray-500 mr-2">v1.0.0</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 退出登录按钮 */}
        <View className="mx-4 mb-8">
          <Button
            title="退出登录"
            onPress={handleLogout}
            variant="outline"
          />
        </View>

        {/* 底部安全区域 */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
