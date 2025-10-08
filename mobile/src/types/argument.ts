// 论点解构相关类型 - 简化结构匹配 Web 端

/**
 * 简化的分析结构 - 匹配 AI 实际返回格式
 */
export interface ArgumentAnalysis {
  id: string;
  inputText: string;
  mainClaim: string;                  // 字符串而不是对象
  premises: string[];                  // 字符串数组而不是对象数组
  evidence: string[];                  // 字符串数组
  assumptions: string[];               // 隐含假设
  logicalStructure: string;            // 逻辑结构
  potentialFallacies: string[];        // 潜在谬误
  strengthAssessment: string;          // 综合评估
  createdAt: string;
}

/**
 * 分析请求
 */
export interface AnalyzeArgumentRequest {
  type: 'text' | 'url';
  content: string;
}

/**
 * 分析响应
 */
export interface AnalyzeArgumentResponse {
  analysis: ArgumentAnalysis;
}

/**
 * SSE 流式事件类型
 */
export type StreamEventType =
  | 'init'
  | 'progress'
  | 'stream'
  | 'dimension'
  | 'complete'
  | 'error';

/**
 * SSE 流式事件
 */
export interface StreamEvent {
  type: StreamEventType;
  message?: string;
  content?: string;
  progress?: number;
  dimension?: string;
  name?: string;
  icon?: string;
  data?: any;
  analysis?: ArgumentAnalysis;
  error?: string;
}
