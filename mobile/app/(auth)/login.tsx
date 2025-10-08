import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)/conversations');
    } catch (err) {
      Alert.alert('登录失败', error || '请检查您的邮箱和密码');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo 区域 */}
          <View className="items-center mt-12 mb-8">
            <Text className="text-4xl font-bold mb-2">
              <Text className="text-blue-600">Cotigo</Text>
              <Text className="text-purple-600">AI</Text>
            </Text>
            <Text className="text-gray-600 text-base">批判性思维训练平台</Text>
          </View>

          {/* 表单区域 */}
          <View className="mt-8">
            <Text className="text-2xl font-bold mb-6 text-gray-900">登录</Text>

            <Input
              label="邮箱"
              placeholder="请输入邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {error && (
              <Text className="text-red-500 text-sm mb-4">{error}</Text>
            )}

            <Button
              title={isLoading ? '登录中...' : '登录'}
              onPress={handleLogin}
              loading={isLoading}
              className="mt-4"
            />

            {/* 注册链接 */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">还没有账号？ </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">立即注册</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
