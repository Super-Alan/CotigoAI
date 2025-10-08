import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '@/types/conversation';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex ${isUser ? 'items-end' : 'items-start'} mb-3 px-4`}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
        className={`max-w-[80%] ${isUser ? '' : ''}`}
      >
        {/* 角色标识 - Tech Blue 设计 */}
        <View className="flex-row items-center mb-1.5">
          <View
            className="mr-1.5"
            style={[
              styles.avatar,
              { backgroundColor: isUser ? 'rgba(255, 255, 255, 0.25)' : 'rgba(14, 165, 233, 0.12)' },
            ]}
          >
            <Text style={styles.avatarEmoji}>
              {isUser ? '👤' : '🤖'}
            </Text>
          </View>
          <Text
            style={[
              styles.roleLabel,
              { color: isUser ? 'rgba(255, 255, 255, 0.95)' : '#0284C7' },
            ]}
          >
            {isUser ? '你' : 'AI 导师'}
          </Text>
        </View>

        {/* 消息内容 - SF Pro 字体样式 */}
        <Text
          style={[
            styles.messageContent,
            { color: isUser ? '#FFFFFF' : '#0C4A6E' },
          ]}
        >
          {message.content}
        </Text>

        {/* 时间戳 - Tech Blue 样式 */}
        <Text
          style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255, 255, 255, 0.75)' : '#64748B' },
          ]}
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

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#0EA5E9',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.15)',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 10,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.06,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  messageContent: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.408,
    fontWeight: '400',
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '400',
    letterSpacing: 0.06,
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text',
  },
});
