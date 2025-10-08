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

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('错误', '请填写所有必填项');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少为 6 位');
      return;
    }

    try {
      await signup(email, password, name);
      router.replace('/(tabs)/conversations');
    } catch (err) {
      Alert.alert('注册失败', error || '注册时出现错误，请稍后重试');
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
          <View className="items-center mt-8 mb-6">
            <Text className="text-4xl font-bold mb-2">
              <Text className="text-blue-600">Cotigo</Text>
              <Text className="text-purple-600">AI</Text>
            </Text>
            <Text className="text-gray-600 text-base">批判性思维训练平台</Text>
          </View>

          {/* 表单区域 */}
          <View className="mt-4">
            <Text className="text-2xl font-bold mb-6 text-gray-900">创建账号</Text>

            <Input
              label="姓名（可选）"
              placeholder="请输入姓名"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="请输入密码（至少6位）"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="确认密码"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {error && (
              <Text className="text-red-500 text-sm mb-4">{error}</Text>
            )}

            <Button
              title={isLoading ? '注册中...' : '注册'}
              onPress={handleSignup}
              loading={isLoading}
              className="mt-4"
            />

            {/* 登录链接 */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">已有账号？ </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">立即登录</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
