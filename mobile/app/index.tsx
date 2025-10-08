import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-4xl font-bold mb-4 text-blue-600">
          CotigoAI
        </Text>
        <Text className="text-gray-600 mb-8">批判性思维训练平台</Text>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/conversations" />;
  }

  return <Redirect href="/(auth)/login" />;
}
