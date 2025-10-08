import { api } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  ArgumentAnalysis,
  AnalyzeArgumentRequest,
  AnalyzeArgumentResponse,
} from '@/src/types/argument';

export const argumentService = {
  /**
   * 分析论点
   */
  async analyzeArgument(data: AnalyzeArgumentRequest): Promise<ArgumentAnalysis> {
    const response = await api.post<AnalyzeArgumentResponse>(
      API_CONFIG.ENDPOINTS.ARGUMENTS.ANALYZE,
      data
    );
    return response.analysis;
  },

  /**
   * 获取分析历史列表
   */
  async getAnalyses(): Promise<ArgumentAnalysis[]> {
    return api.get<ArgumentAnalysis[]>(API_CONFIG.ENDPOINTS.ARGUMENTS.LIST);
  },

  /**
   * 获取单个分析详情
   */
  async getAnalysis(id: string): Promise<ArgumentAnalysis> {
    return api.get<ArgumentAnalysis>(API_CONFIG.ENDPOINTS.ARGUMENTS.GET(id));
  },
};
