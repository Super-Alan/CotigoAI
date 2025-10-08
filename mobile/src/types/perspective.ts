// 多棱镜视角相关类型

export interface PerspectiveRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Perspective {
  id: string;
  sessionId: string;
  roleName: string;
  roleConfig: {
    name: string;
    description: string;
    background: string;
    coreValues: string[];
    thinkingStyle: string;
  };
  viewpoint: string;
  createdAt: Date;
}

export interface PerspectiveMessage {
  id: string;
  sessionId: string;
  perspectiveId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface PerspectiveSession {
  id: string;
  userId: string;
  topic: string;
  perspectives: Perspective[];
  messages: PerspectiveMessage[];
  synthesis?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePerspectiveSessionRequest {
  topic: string;
}

export interface GeneratePerspectivesRequest {
  sessionId: string;
  count?: number;
}

export interface SynthesizePerspectivesRequest {
  sessionId: string;
}

export interface SavePerspectiveRequest {
  sessionId: string;
  perspectiveId: string;
}
