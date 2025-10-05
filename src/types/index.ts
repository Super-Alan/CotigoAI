// ============ 通用类型 ============
export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

// ============ AI模型类型 ============
export type AIModel = 'deepseek-v3.1' | 'qwen3-max';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIRequestOptions = {
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
};

// ============ 苏格拉底对话类型 ============
export type MessageType = 'initial' | 'followup';

export type ConversationWithMessages = {
  id: string;
  userId: string;
  title: string;
  topic: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

// ============ 论点解构类型 ============
export type EvidenceType = '事实' | '数据' | '案例';
export type EvidenceStrength = 'strong' | 'moderate' | 'weak';
export type AssumptionImpact = 'high' | 'medium' | 'low';
export type FallacySeverity = 'major' | 'minor';

export type Evidence = {
  text: string;
  type: EvidenceType;
  strength: EvidenceStrength;
};

export type Assumption = {
  assumption: string;
  validity: string;
  impact: AssumptionImpact;
};

export type Fallacy = {
  type: string;
  description: string;
  location: string;
  severity: FallacySeverity;
};

export type ArgumentAnalysisResult = {
  mainClaim: string;
  evidence: Evidence[];
  assumptions: Assumption[];
  fallacies: Fallacy[];
};

// ============ 多棱镜视角类型 ============
export type RoleConfig = {
  name: string;
  background: string;
  values: string[];
  systemPrompt: string;
};

export type PerspectiveData = {
  id: string;
  roleName: string;
  viewpoint: string;
  roleConfig: RoleConfig;
  createdAt: Date;
};

export type PerspectiveSessionWithData = {
  id: string;
  userId: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
  perspectives: PerspectiveData[];
  messages: {
    id: string;
    perspectiveId: string | null;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

// ============ 用户类型 ============
export type UserWithSettings = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  settings: {
    defaultModel: string;
    theme: string;
    language: string;
    enableAnalytics: boolean;
  } | null;
};
