import { api, tokenManager } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type {
  ArgumentAnalysis,
  AnalyzeArgumentRequest,
  AnalyzeArgumentResponse,
  StreamEvent,
} from '@/src/types/argument';

export const argumentService = {
  /**
   * 流式分析论点（SSE）
   */
  async analyzeArgumentStream(
    data: AnalyzeArgumentRequest,
    onEvent: (event: StreamEvent) => void
  ): Promise<ArgumentAnalysis> {
    const token = await tokenManager.getToken();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARGUMENTS.ANALYZE_STREAM}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let previousLength = 0;
      let buffer = ''; // 缓冲区存储不完整的 JSON 行

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

            // 如果不是最终状态（readyState 4），保留最后一行（可能不完整）
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
                  case 'complete':
                    if (event.analysis) {
                      resolve(event.analysis);
                    }
                    break;

                  case 'error':
                    reject(new Error(event.error || '分析失败'));
                    break;
                }
              } catch (parseError) {
                // 忽略解析错误，可能是不完整的 JSON
                if (xhr.readyState === 4) {
                  // 只在最终状态才报告解析错误
                  console.error('[Stream] JSON Parse error:', parseError);
                  console.error('[Stream] Failed line:', trimmedLine);
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
   * 获取分析历史列表
   */
  async getAnalyses(): Promise<ArgumentAnalysis[]> {
    const response = await api.get<{
      success: boolean;
      data: Array<{
        id: string;
        inputText: string;
        analysis: Omit<ArgumentAnalysis, 'id' | 'inputText' | 'createdAt'>;
        createdAt: string;
      }>;
    }>(API_CONFIG.ENDPOINTS.ARGUMENTS.LIST);

    // 转换为扁平化结构数组
    return response.data.map(item => ({
      id: item.id,
      inputText: item.inputText,
      createdAt: item.createdAt,
      ...item.analysis,
    }));
  },

  /**
   * 获取单个分析详情
   */
  async getAnalysis(id: string): Promise<ArgumentAnalysis> {
    const response = await api.get<{
      id: string;
      inputText: string;
      analysis: Omit<ArgumentAnalysis, 'id' | 'inputText' | 'createdAt'>;
      createdAt: string;
    }>(API_CONFIG.ENDPOINTS.ARGUMENTS.GET(id));

    // 转换为扁平化结构
    return {
      id: response.id,
      inputText: response.inputText,
      createdAt: response.createdAt,
      ...response.analysis,
    };
  },

  /**
   * 保存分析结果到数据库
   */
  async saveAnalysis(inputText: string, analysis: Omit<ArgumentAnalysis, 'id' | 'inputText' | 'createdAt'>): Promise<string> {
    const response = await api.post<{ success: boolean; id: string }>(
      API_CONFIG.ENDPOINTS.ARGUMENTS.LIST,
      { inputText, analysis }
    );
    return response.id;
  },
};
