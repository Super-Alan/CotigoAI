import { aiRouter } from './ai/router';
import { ChatMessage } from '@/types';

/**
 * OpenAI兼容层
 * 将OpenAI API调用映射到项目的AI路由器
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAICompletionOptions {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIChoice {
  message?: {
    content: string | null;
  };
}

interface OpenAICompletion {
  choices: OpenAIChoice[];
}

class OpenAICompatibility {
  chat = {
    completions: {
      create: async (options: OpenAICompletionOptions): Promise<OpenAICompletion> => {
        try {
          // 转换消息格式
          const messages: ChatMessage[] = options.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));

          // 调用AI路由器
          const response = await aiRouter.chat(messages, {
            temperature: options.temperature,
            maxTokens: options.max_tokens,
            stream: false
          });

          // 确保返回字符串
          const content = typeof response === 'string' ? response : '';

          // 返回OpenAI格式的响应
          return {
            choices: [
              {
                message: {
                  content
                }
              }
            ]
          };
        } catch (error) {
          console.error('OpenAI compatibility layer error:', error);
          throw error;
        }
      }
    }
  };
}

export const openai = new OpenAICompatibility();
