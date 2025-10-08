import { api } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  PerspectiveSession,
  Perspective,
  CreatePerspectiveSessionRequest,
  GeneratePerspectivesRequest,
  SynthesizePerspectivesRequest,
  PerspectiveMessage,
} from '@/src/types/perspective';

export const perspectiveService = {
  /**
   * 创建新的多棱镜会话
   */
  async createSession(data: CreatePerspectiveSessionRequest): Promise<PerspectiveSession> {
    return api.post<PerspectiveSession>(
      API_CONFIG.ENDPOINTS.PERSPECTIVES.CREATE,
      data
    );
  },

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<PerspectiveSession[]> {
    return api.get<PerspectiveSession[]>(API_CONFIG.ENDPOINTS.PERSPECTIVES.LIST);
  },

  /**
   * 获取会话详情
   */
  async getSession(id: string): Promise<PerspectiveSession> {
    return api.get<PerspectiveSession>(API_CONFIG.ENDPOINTS.PERSPECTIVES.GET(id));
  },

  /**
   * 生成多个视角
   */
  async generatePerspectives(data: GeneratePerspectivesRequest): Promise<Perspective[]> {
    return api.post<Perspective[]>(
      API_CONFIG.ENDPOINTS.PERSPECTIVES.GENERATE(data.sessionId),
      { count: data.count || 5 }
    );
  },

  /**
   * 与特定视角对话
   */
  async chatWithPerspective(
    sessionId: string,
    perspectiveId: string,
    message: string
  ): Promise<PerspectiveMessage> {
    return api.post<PerspectiveMessage>(
      API_CONFIG.ENDPOINTS.PERSPECTIVES.CHAT(sessionId),
      {
        perspectiveId,
        message,
      }
    );
  },

  /**
   * 综合所有视角
   */
  async synthesizePerspectives(data: SynthesizePerspectivesRequest): Promise<{ synthesis: string }> {
    return api.post(API_CONFIG.ENDPOINTS.PERSPECTIVES.SYNTHESIZE, data);
  },

  /**
   * 保存视角
   */
  async savePerspective(sessionId: string, perspectiveId: string): Promise<void> {
    return api.post(API_CONFIG.ENDPOINTS.PERSPECTIVES.SAVE, {
      sessionId,
      perspectiveId,
    });
  },
};
