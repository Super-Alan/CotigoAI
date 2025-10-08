import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
}

/**
 * 从请求中获取用户ID（支持 NextAuth session 和 JWT token）
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // 1. 尝试从 Authorization header 获取 JWT token (移动端)
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      return decoded.userId;
    } catch (err) {
      console.error('JWT verification failed:', err);
      // 继续尝试其他方法
    }
  }

  // 2. 尝试从 NextAuth session 获取 (Web端)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (err) {
    console.error('Session retrieval failed:', err);
  }

  return null;
}

/**
 * 验证请求是否已授权
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string; error?: never } | { userId?: never; error: { message: string; status: number } }> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return {
      error: {
        message: '未授权访问',
        status: 401,
      },
    };
  }

  return { userId };
}
