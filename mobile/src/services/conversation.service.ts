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
    return response.data;
  },

  /**
   * 创建新对话
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return api.post<Conversation>(API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE, data);
  },

  /**
   * 获取对话详情
   */
  async getConversation(id: string): Promise<Conversation> {
    return api.get<Conversation>(API_CONFIG.ENDPOINTS.CONVERSATIONS.GET(id));
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
    return api.post<Message>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.MESSAGES(data.conversationId),
      { content: data.content }
    );
  },

  /**
   * 获取建议答案
   */
  async getSuggestions(data: { conversationId: string; question: string; conversationHistory: any[] }): Promise<SuggestedAnswer[]> {
    return api.post<SuggestedAnswer[]>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.SUGGESTIONS(data.conversationId),
      { question: data.question, conversationHistory: data.conversationHistory }
    );
  },

  /**
   * 生成对话总结
   */
  async generateSummary(conversationId: string): Promise<ConversationSummary> {
    return api.post<ConversationSummary>(
      API_CONFIG.ENDPOINTS.CONVERSATIONS.SUMMARY(conversationId)
    );
  },
};
