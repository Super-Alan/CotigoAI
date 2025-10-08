import React from 'react';
import { View, Text } from 'react-native';
import type { Message } from '@/types/conversation';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex ${isUser ? 'items-end' : 'items-start'} mb-4 px-4`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : 'bg-white dark:bg-gray-800 shadow-md'
        }`}
      >
        {/* 角色标识 */}
        <View className="flex-row items-center mb-1">
          <Text className={`text-xs font-medium ${isUser ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {isUser ? '你' : 'AI 导师'}
          </Text>
        </View>

        {/* 消息内容 */}
        <Text
          className={`text-base ${
            isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {message.content}
        </Text>

        {/* 时间戳 */}
        <Text
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {new Date((message as any).createdAt || message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
