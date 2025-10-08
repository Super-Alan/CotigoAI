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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F9FF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo 区域 - Tech Blue 渐变设计 */}
          <View className="items-center mt-16 mb-12">
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '700',
                  color: '#0EA5E9',
                  letterSpacing: -0.96,
                  fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
                }}
              >
                Cotigo
              </Text>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '700',
                  color: '#06B6D4',
                  letterSpacing: -0.96,
                  fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
                }}
              >
                AI
              </Text>
            </View>
            <Text
              style={{
                fontSize: 17,
                color: '#0284C7',
                fontWeight: '500',
                letterSpacing: -0.408,
                fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
              }}
            >
              批判性思维训练平台
            </Text>
          </View>

          {/* 表单区域 - Tech Blue 玻璃质感卡片 */}
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: 24,
              marginTop: 8,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 6,
              borderWidth: 1,
              borderColor: 'rgba(14, 165, 233, 0.15)',
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                marginBottom: 24,
                color: '#0C4A6E',
                letterSpacing: -0.56,
                fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display',
              }}
            >
              登录
            </Text>

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
              <View
                style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  borderLeftWidth: 3,
                  borderLeftColor: '#FF3B30',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#FF3B30',
                    fontWeight: '500',
                    letterSpacing: -0.24,
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            <Button
              title={isLoading ? '登录中...' : '登录'}
              onPress={handleLogin}
              loading={isLoading}
              className="mt-4"
            />

            {/* 注册链接 - Tech Blue 样式 */}
            <View className="flex-row justify-center mt-6">
              <Text
                style={{
                  fontSize: 15,
                  color: '#64748B',
                  fontWeight: '400',
                  letterSpacing: -0.24,
                }}
              >
                还没有账号？{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#0EA5E9',
                      fontWeight: '600',
                      letterSpacing: -0.24,
                    }}
                  >
                    立即注册
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
