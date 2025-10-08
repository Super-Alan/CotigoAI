import { tokenManager } from './api';
import { API_CONFIG } from '@/src/constants/api';
import type { LoginRequest, SignupRequest, AuthResponse, User } from '@/src/types/auth';

// NextAuth 基础 URL
const BASE_URL = API_CONFIG.BASE_URL.replace('/api', '');

export const authService = {
  /**
   * 用户登录 (移动端专用端点)
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/mobile-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || '登录失败');
      }

      if (!result.token || !result.user) {
        throw new Error('登录响应格式错误');
      }

      // 保存 token
      await tokenManager.setToken(result.token);

      return {
        user: result.user,
        token: result.token,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || '登录失败,请检查网络连接');
    }
  },

  /**
   * 用户注册
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      // 调用注册 API
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '注册失败');
      }

      // 注册成功后自动登录
      return this.login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || '注册失败,请稍后重试');
    }
  },

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await tokenManager.removeToken();
    }
  },

  /**
   * 检查是否已登录
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenManager.getToken();
    return token !== null;
  },

  /**
   * 获取当前用户信息 (通过 API 请求)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await tokenManager.getToken();
      if (!token) return null;

      const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
};
