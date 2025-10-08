import { api, tokenManager } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  GeneratePerspectivesRequest,
  StreamEvent,
  Perspective,
  ChatRequest,
  ChatResponse,
  SynthesisRequest,
  SynthesisStreamEvent,
  SavePerspectivesRequest,
  SavePerspectivesResponse,
  PerspectiveSession,
} from '@/src/types/perspective';

export const perspectiveService = {
  /**
   * 流式生成多视角分析（SSE）
   */
  async generatePerspectivesStream(
    data: GeneratePerspectivesRequest,
    onEvent: (event: StreamEvent) => void
  ): Promise<Perspective[]> {
    const token = await tokenManager.getToken();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSPECTIVES.GENERATE_STREAM}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let previousLength = 0;
      let buffer = ''; // 缓冲区存储不完整的 JSON 行
      const perspectives: Perspective[] = [];

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          // 获取新的响应数据
          const currentText = xhr.responseText || '';
          const newText = currentText.substring(previousLength);
          previousLength = currentText.length;

          if (newText) {
            // 将新数据追加到缓冲区
            buffer += newText;

            // 按换行符分割
            const lines = buffer.split('\n');

            // 如果不是最终状态，保留最后一行（可能不完整）
            if (xhr.readyState === 3 && lines.length > 0) {
              buffer = lines.pop() || '';
            } else {
              buffer = '';
            }

            // 处理完整的行
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              try {
                const event: StreamEvent = JSON.parse(trimmedLine);

                // 发送事件给回调
                onEvent(event);

                // 处理特殊事件类型
                switch (event.type) {
                  case 'perspective':
                    if (event.perspective) {
                      perspectives.push(event.perspective);
                    }
                    break;

                  case 'complete':
                    resolve(perspectives);
                    break;

                  case 'error':
                    reject(new Error(event.error || '生成分析失败'));
                    break;
                }
              } catch (parseError) {
                // 忽略解析错误，可能是不完整的 JSON
                if (xhr.readyState === 4) {
                  // 只在最终状态才报告解析错误
                  console.error('[Perspective Stream] JSON Parse error:', parseError);
                  console.error('[Perspective Stream] Failed line:', trimmedLine);
                }
              }
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络连接失败'));
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(JSON.stringify(data));
    });
  },

  /**
   * 与视角角色对话
   */
  async chat(data: ChatRequest): Promise<ChatResponse> {
    return api.post<ChatResponse>(API_CONFIG.ENDPOINTS.PERSPECTIVES.CHAT, data);
  },

  /**
   * 流式生成综合分析（SSE）
   */
  async synthesizeStream(
    data: SynthesisRequest,
    onEvent: (event: SynthesisStreamEvent) => void
  ): Promise<string> {
    const token = await tokenManager.getToken();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSPECTIVES.SYNTHESIZE_STREAM}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let previousLength = 0;
      let buffer = '';
      let fullText = '';

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const currentText = xhr.responseText || '';
          const newText = currentText.substring(previousLength);
          previousLength = currentText.length;

          if (newText) {
            buffer += newText;
            const lines = buffer.split('\n');

            if (xhr.readyState === 3 && lines.length > 0) {
              buffer = lines.pop() || '';
            } else {
              buffer = '';
            }

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              try {
                const event: SynthesisStreamEvent = JSON.parse(trimmedLine);
                onEvent(event);

                if (event.type === 'chunk' && event.chunk) {
                  fullText += event.chunk;
                } else if (event.type === 'complete') {
                  resolve(fullText);
                } else if (event.type === 'error') {
                  reject(new Error(event.error || '生成综合分析失败'));
                }
              } catch (parseError) {
                if (xhr.readyState === 4) {
                  console.error('[Synthesis Stream] Parse error:', parseError);
                }
              }
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络连接失败'));
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(JSON.stringify(data));
    });
  },

  /**
   * 保存分析结果到数据库
   */
  async save(data: SavePerspectivesRequest): Promise<string> {
    const response = await api.post<SavePerspectivesResponse>(
      API_CONFIG.ENDPOINTS.PERSPECTIVES.SAVE,
      data
    );
    return response.id;
  },

  /**
   * 获取历史会话详情
   */
  async getSession(id: string): Promise<PerspectiveSession> {
    return api.get<PerspectiveSession>(API_CONFIG.ENDPOINTS.PERSPECTIVES.GET(id));
  },

  /**
   * 获取用户的视角会话列表
   */
  async getSessionList(): Promise<Array<{
    id: string;
    topic: string;
    perspectives: Array<{ id: string }>;
    createdAt: string;
  }>> {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        id: string;
        topic: string;
        perspectives: Array<{ id: string }>;
        createdAt: string;
      }>;
    }>(API_CONFIG.ENDPOINTS.PERSPECTIVES.LIST);
    return response.data;
  },
};
