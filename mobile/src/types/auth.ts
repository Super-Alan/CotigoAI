// 用户接口
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

// 认证响应
export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

// 用户会话
export interface UserSession {
  user: User;
  token: string;
  expiresAt: Date;
}
