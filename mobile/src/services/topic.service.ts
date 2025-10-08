import { api } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  GeneratedTopic,
  TopicGenerationRequest,
  TopicGenerationResponse,
} from '@/src/types/topic';

export const topicService = {
  /**
   * 生成话题 - 可能耗时数分钟，设置5分钟超时
   */
  async generateTopics(data: TopicGenerationRequest): Promise<GeneratedTopic[]> {
    const response = await api.post<TopicGenerationResponse>(
      API_CONFIG.ENDPOINTS.TOPICS.GENERATE,
      data,
      { timeout: 300000 } // 5分钟超时
    );
    return response.topics;
  },

  /**
   * 获取话题列表
   */
  async getTopics(params?: {
    limit?: number;
    page?: number;
    dimension?: string;
    difficulty?: string;
  }): Promise<{
    topics: GeneratedTopic[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return api.get(API_CONFIG.ENDPOINTS.TOPICS.LIST, { params });
  },

  /**
   * 获取随机话题
   */
  async getRandomTopic(): Promise<GeneratedTopic> {
    return api.get<GeneratedTopic>(API_CONFIG.ENDPOINTS.TOPICS.RANDOM);
  },
};
