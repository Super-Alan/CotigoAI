// 论点解构相关类型

export interface Premise {
  id: string;
  content: string;
  type: 'explicit' | 'implicit';
}

export interface Evidence {
  id: string;
  content: string;
  type: 'fact' | 'data' | 'example' | 'expert';
  strength: 'strong' | 'moderate' | 'weak';
}

export interface Fallacy {
  id: string;
  type: string;
  description: string;
  location: string;
}

export interface CounterArgument {
  id: string;
  content: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface ArgumentAnalysis {
  id: string;
  inputText: string;
  mainClaim: string;
  premises: Premise[];
  evidence: Evidence[];
  fallacies: Fallacy[];
  counterArguments: CounterArgument[];
  logicChain: string[];
  conclusion: string;
  overallStrength: number; // 0-100
  createdAt: Date;
}

export interface AnalyzeArgumentRequest {
  inputText: string;
}

export interface AnalyzeArgumentResponse {
  analysis: ArgumentAnalysis;
}
