// API 配置常量
export const API_CONFIG = {
  // 开发环境使用本地服务器，生产环境使用实际域名
  // 注意：移动设备需要使用电脑的局域网 IP，不能用 localhost
  BASE_URL: __DEV__
    ? 'http://192.168.31.118:3011/api'
    : 'https://your-production-domain.com/api',

  TIMEOUT: 30000, // 30 秒超时

  // API 端点
  ENDPOINTS: {
    // 认证
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },

    // 对话
    CONVERSATIONS: {
      LIST: '/conversations',
      CREATE: '/conversations',
      GET: (id: string) => `/conversations/${id}`,
      DELETE: (id: string) => `/conversations/${id}`,
      MESSAGES: (id: string) => `/conversations/${id}/messages`,
      SUGGESTIONS: (id: string) => `/conversations/${id}/suggestions`,
      SUMMARY: (id: string) => `/conversations/${id}/summary`,
    },

    // 论点解构
    ARGUMENTS: {
      ANALYZE: '/arguments/analyze',
      ANALYZE_STREAM: '/arguments/analyze-stream',
      LIST: '/arguments',
      GET: (id: string) => `/arguments/${id}`,
    },

    // 多棱镜视角
    PERSPECTIVES: {
      GENERATE_STREAM: '/perspectives/generate-stream',
      CHAT: '/perspectives/chat',
      SYNTHESIZE_STREAM: '/perspectives/synthesize-stream',
      SAVE: '/perspectives/save',
      LIST: '/perspectives',
      GET: (id: string) => `/perspectives/${id}`,
    },

    // 话题生成
    TOPICS: {
      GENERATE: '/topics/generate',
      LIST: '/topics/list',
      RANDOM: '/topics/random',
    },

    // 用户
    USER: {
      PROFILE: '/user/profile',
      HISTORY: '/user/history',
      HISTORY_ALL: '/user/history/all',
    },
  },
} as const;
