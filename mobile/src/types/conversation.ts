// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// 消息接口
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 对话接口
export interface Conversation {
  id: string;
  title: string;
  topic?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

// 创建对话请求
export interface CreateConversationRequest {
  topic?: string;
}

// 发送消息请求
export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

// 建议答案接口
export interface SuggestedAnswer {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  reasoning?: string;
}

// 对话总结接口
export interface ConversationSummary {
  conversationId: string;
  summary: string;
  keyInsights: string[];
  thinkingProgress: {
    clarityScore: number;
    depthScore: number;
    perspectiveScore: number;
  };
  createdAt: Date;
}
