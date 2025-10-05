import { ChatMessage, AIRequestOptions } from '@/types';
import { IAIService, AIServiceError, makeAIRequest, streamResponse } from './base';

/**
 * 阿里通义Qwen AI服务实现
 * 参考API文档: https://bailian.console.aliyun.com/#/api/?type=model&url=2712576
 */
export class QwenService implements IAIService {
  private apiKey: string;
  private apiUrl: string;
  private defaultModel = 'qwen3-max';

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || '';
    this.apiUrl = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1';

    if (!this.apiKey) {
      throw new AIServiceError('CONFIG_ERROR', 'QWEN_API_KEY未配置');
    }
  }

  /**
   * 对话接口
   */
  async chat(
    messages: ChatMessage[],
    options: AIRequestOptions = {}
  ): Promise<string | ReadableStream> {
    const {
      model = this.defaultModel,
      stream = false,
      temperature = 0.7,
      maxTokens = 4000,
    } = options;

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    try {
      const response = await makeAIRequest(
        `${this.apiUrl}/chat/completions`,
        this.apiKey,
        requestBody,
        stream
      );

      if (stream) {
        // 返回流式响应
        return this.createStreamResponse(response);
      } else {
        // 返回完整响应
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError('CHAT_ERROR', '对话请求失败', error);
    }
  }

  /**
   * 分析任务接口
   */
  async analyze(
    text: string,
    task: string,
    options: AIRequestOptions = {}
  ): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: task,
      },
      {
        role: 'user',
        content: text,
      },
    ];

    try {
      const response = await this.chat(messages, { ...options, stream: false });

      // 尝试解析JSON响应
      if (typeof response === 'string') {
        try {
          return JSON.parse(response);
        } catch {
          return { raw: response };
        }
      }

      return response;
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError('ANALYZE_ERROR', '分析任务失败', error);
    }
  }

  /**
   * 创建流式响应
   */
  private createStreamResponse(response: Response): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResponse(response)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}
