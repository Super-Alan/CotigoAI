import { ChatMessage, AIRequestOptions } from '@/types';

/**
 * 基础AI服务接口
 */
export interface IAIService {
  chat(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<string | ReadableStream>;

  analyze(
    text: string,
    task: string,
    options?: AIRequestOptions
  ): Promise<any>;
}

/**
 * AI服务错误类
 */
export class AIServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * 创建流式响应
 */
export async function* streamResponse(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new AIServiceError('STREAM_ERROR', '无法读取响应流');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 统一的HTTP请求处理
 */
export async function makeAIRequest(
  url: string,
  apiKey: string,
  body: any,
  stream: boolean = false
): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new AIServiceError(
      'API_ERROR',
      error.message || `HTTP ${response.status}: ${response.statusText}`,
      error
    );
  }

  return response;
}
