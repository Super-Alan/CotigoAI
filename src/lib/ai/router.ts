import { AIModel, ChatMessage, AIRequestOptions } from '@/types';
import { IAIService, AIServiceError } from './base';
import { DeepseekService } from './deepseek';
import { QwenService } from './qwen';

/**
 * AI服务路由器
 * 根据配置自动路由到对应的AI服务
 */
export class AIRouter {
  private deepseekService?: DeepseekService;
  private qwenService?: QwenService;
  private activeModel: AIModel;

  constructor() {
    try {
      this.deepseekService = new DeepseekService();
    } catch (error) {
      console.warn('Deepseek服务初始化失败:', error);
    }

    try {
      this.qwenService = new QwenService();
    } catch (error) {
      console.warn('Qwen服务初始化失败:', error);
    }

    // 从环境变量获取激活的模型
    this.activeModel = (process.env.ACTIVE_AI_MODEL as AIModel) || 'deepseek-v3.1';
  }

  /**
   * 获取当前激活的AI服务
   */
  private getActiveService(model?: AIModel): IAIService {
    const targetModel = model || this.activeModel;

    if (targetModel === 'deepseek-v3.1') {
      if (!this.deepseekService) {
        throw new AIServiceError('SERVICE_UNAVAILABLE', 'Deepseek服务未配置');
      }
      return this.deepseekService;
    } else if (targetModel === 'qwen3-max') {
      if (!this.qwenService) {
        throw new AIServiceError('SERVICE_UNAVAILABLE', 'Qwen服务未配置');
      }
      return this.qwenService;
    }

    throw new AIServiceError('INVALID_MODEL', `不支持的模型: ${targetModel}`);
  }

  /**
   * 对话接口
   */
  async chat(
    messages: ChatMessage[],
    options: AIRequestOptions = {}
  ): Promise<string | ReadableStream> {
    const service = this.getActiveService(options.model);
    return service.chat(messages, options);
  }

  /**
   * 分析接口
   */
  async analyze(
    text: string,
    task: string,
    options: AIRequestOptions = {}
  ): Promise<any> {
    const service = this.getActiveService(options.model);
    return service.analyze(text, task, options);
  }

  /**
   * 设置激活模型
   */
  setActiveModel(model: AIModel) {
    this.activeModel = model;
  }

  /**
   * 获取当前激活模型
   */
  getActiveModel(): AIModel {
    return this.activeModel;
  }
}

// 导出单例
export const aiRouter = new AIRouter();
