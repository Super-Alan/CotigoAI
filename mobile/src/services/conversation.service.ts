import { api } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  Conversation,
  CreateConversationRequest,
  SendMessageRequest,
  Message,
  SuggestedAnswer,
  ConversationSummary,
} from '@/src/types/conversation';

export const conversationService = {
  /**
   * 获取对话列表
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<{ success: boolean; data: Conversation[] }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.LIST
    );
    // 处理API响应格式：支持包装和直接返回
    if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
    }
    return [];
  },

  /**
   * 创建新对话
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await api.post<Conversation | { success: boolean; data: Conversation }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE,
      data
    );
    // 处理包装响应
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Conversation }).data;
    }
    return response as Conversation;
  },

  /**
   * 获取对话详情
   */
  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get<Conversation | { success: boolean; data: Conversation }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.GET(id)
    );
    // 处理包装响应
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Conversation }).data;
    }
    return response as Conversation;
  },

  /**
   * 删除对话
   */
  async deleteConversation(id: string): Promise<void> {
    return api.delete(API_CONFIG.ENDPOINTS.CONVERSATIONS.DELETE(id));
  },

  /**
   * 发送消息
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await api.post<Message | { success: boolean; data: Message }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.MESSAGES(data.conversationId),
      { content: data.content }
    );
    // 处理包装响应
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Message }).data;
    }
    return response as Message;
  },

  /**
   * 获取建议答案
   */
  async getSuggestions(data: { conversationId: string; question: string; conversationHistory: any[] }): Promise<SuggestedAnswer[]> {
    const response = await api.post<SuggestedAnswer[] | { success: boolean; data: SuggestedAnswer[] } | { suggestions: SuggestedAnswer[] }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.SUGGESTIONS(data.conversationId),
      { question: data.question, conversationHistory: data.conversationHistory }
    );

    // 处理多种响应格式
    if (response && typeof response === 'object') {
      if ('suggestions' in response && Array.isArray(response.suggestions)) {
        return response.suggestions;
      }
      if ('data' in response && Array.isArray(response.data)) {
        return (response as { data: SuggestedAnswer[] }).data;
      }
      if (Array.isArray(response)) {
        return response;
      }
    }
    return [];
  },

  /**
   * 生成对话总结
   */
  async generateSummary(conversationId: string): Promise<ConversationSummary> {
    const response = await api.post<ConversationSummary | { success: boolean; data: ConversationSummary }>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.SUMMARY(conversationId)
    );
    // 处理包装响应
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: ConversationSummary }).data;
    }
    return response as ConversationSummary;
  },
};
