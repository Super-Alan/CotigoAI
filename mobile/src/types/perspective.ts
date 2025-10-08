// 多棱镜视角相关类型 - 匹配 Web 端完整功能

/**
 * 角色定义
 */
export interface PerspectiveRole {
  id: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * 视角分析（单个角色的观点）
 */
export interface Perspective {
  roleId: string;
  roleName: string;
  roleIcon: string;
  analysis: string;
  timestamp: string;
}

/**
 * 生成请求
 */
export interface GeneratePerspectivesRequest {
  issue: string;
  roles: string[];  // 角色 ID 数组
}

/**
 * 生成响应
 */
export interface GeneratePerspectivesResponse {
  issue: string;
  perspectives: Perspective[];
  generatedAt: string;
}

/**
 * 流式事件类型
 */
export type StreamEventType =
  | 'init'          // 初始化
  | 'progress'      // 进度更新
  | 'chunk'         // 流式文本块
  | 'perspective'   // 单个视角完成
  | 'complete'      // 全部完成
  | 'error';        // 错误

/**
 * 流式事件
 */
export interface StreamEvent {
  type: StreamEventType;
  // init 事件
  total?: number;
  issue?: string;
  // progress 事件
  current?: number;
  roleName?: string;
  roleIcon?: string;
  // chunk 事件
  roleId?: string;
  chunk?: string;
  // perspective 事件
  perspective?: Perspective;
  // complete 事件
  generatedAt?: string;
  // error 事件
  error?: string;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * 聊天请求
 */
export interface ChatRequest {
  roleId: string;
  issue: string;
  message: string;
  history: ChatMessage[];
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  message: string;
  timestamp: string;
}

/**
 * 综合分析请求
 */
export interface SynthesisRequest {
  issue: string;
  perspectives: Array<{
    roleId: string;
    roleName: string;
    analysis: string;
  }>;
}

/**
 * 综合分析流式事件
 */
export interface SynthesisStreamEvent {
  type: 'init' | 'chunk' | 'complete' | 'error';
  chunk?: string;
  error?: string;
}

/**
 * 保存请求
 */
export interface SavePerspectivesRequest {
  topic: string;
  perspectives: Perspective[];
}

/**
 * 保存响应
 */
export interface SavePerspectivesResponse {
  id: string;
  success: boolean;
}

/**
 * 历史会话（详情页加载）
 */
export interface PerspectiveSession {
  id: string;
  topic: string;
  perspectives: Array<{
    id: string;
    roleName: string;
    roleConfig: {
      roleId: string;
      roleIcon: string;
    };
    viewpoint: string;
    createdAt: string;
  }>;
  createdAt: string;
}
