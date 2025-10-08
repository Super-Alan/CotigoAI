# 📱 CotigoAI Mobile App

基于 Expo 和 React Native 的批判性思维训练移动应用。

## 🎯 项目简介

CotigoAI Mobile 是一款专注于批判性思维能力培养的移动应用，提供：

- **苏格拉底对话**: 通过提问引导深度思考
- **论点解构器**: 可视化分析论证结构
- **多棱镜视角**: 从多个角度审视问题
- **智能话题生成**: 基于 QS Top 10 高校面试标准

## 🏗️ 技术栈

- **Framework**: Expo SDK 54 + React Native
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for RN)
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand + React Query
- **API Client**: Axios
- **Storage**: Expo Secure Store + MMKV

## 📦 项目结构

\`\`\`
mobile/
├── app/                        # Expo Router 文件路由
│   ├── (auth)/                # 认证相关页面
│   ├── (tabs)/                # Tab 导航页面
│   │   ├── conversations/     # 对话模块
│   │   ├── arguments/         # 论点解构
│   │   ├── perspectives/      # 多棱镜视角
│   │   └── profile/           # 个人中心
│   └── _layout.tsx            # 根布局
├── src/
│   ├── components/            # 通用组件
│   ├── services/              # API 服务层
│   ├── hooks/                 # 自定义 Hooks
│   ├── store/                 # Zustand Store
│   ├── types/                 # TypeScript 类型
│   ├── utils/                 # 工具函数
│   └── constants/             # 常量配置
├── assets/                    # 静态资源
├── tailwind.config.js         # Tailwind 配置
└── app.json                   # Expo 配置
\`\`\`

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Expo Go App (用于真机测试)
- iOS Simulator / Android Emulator (可选)

### 安装依赖

\`\`\`bash
cd mobile
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
# 启动 Expo 开发服务器
npm start

# 或者直接在特定平台运行
npm run ios      # iOS 模拟器
npm run android  # Android 模拟器
npm run web      # Web 浏览器
\`\`\`

### 在真机上测试

1. 安装 Expo Go App：
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 扫描终端中的二维码

## 🔧 配置

### API 端点配置

编辑 \`src/constants/api.ts\`:

\`\`\`typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3011/api'      // 开发环境
    : 'https://your-domain.com/api',   // 生产环境
  TIMEOUT: 30000,
};
\`\`\`

### 环境变量

创建 \`.env\` 文件：

\`\`\`bash
API_URL=http://localhost:3011/api
APP_ENV=development
\`\`\`

## 📱 核心功能

### 1. 认证系统
- 邮箱/密码登录
- 用户注册
- Token 持久化
- 自动刷新机制

### 2. 苏格拉底对话
- 实时对话交互
- 智能建议答案
- 对话历史记录
- 思维总结生成

### 3. 论点解构
- 文本结构化分析
- 可视化展示
- 历史记录管理

### 4. 多棱镜视角
- 多角度分析
- 视角对话
- 综合结论

## 🎨 设计系统

### 颜色主题

\`\`\`typescript
colors: {
  primary: '#3B82F6',    // 蓝色
  secondary: '#8B5CF6',  // 紫色
  success: '#10B981',    // 绿色
  warning: '#F59E0B',    // 橙色
  error: '#EF4444',      // 红色
}
\`\`\`

### 组件库

- \`Button\`: 按钮组件（支持多种变体和大小）
- \`Input\`: 输入框组件（支持图标和错误提示）
- \`MessageBubble\`: 消息气泡（用于对话界面）

## 🔐 安全特性

- Token 加密存储 (Expo Secure Store)
- HTTPS 通信
- 自动 Token 刷新
- 生物识别认证 (计划中)

## 📊 状态管理

使用 Zustand 进行全局状态管理：

\`\`\`typescript
// src/store/authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
\`\`\`

## 🧪 测试

\`\`\`bash
# 运行测试
npm test

# 运行 lint
npm run lint

# 类型检查
npm run type-check
\`\`\`

## 📦 构建与发布

### iOS

\`\`\`bash
# 构建
eas build --platform ios

# 提交到 App Store
eas submit --platform ios
\`\`\`

### Android

\`\`\`bash
# 构建
eas build --platform android

# 提交到 Google Play
eas submit --platform android
\`\`\`

## 🤝 与 Web 端的关系

移动端与 Web 端共享：
- ✅ 类型定义 (\`src/types/\`)
- ✅ API 端点 (后端 API)
- ✅ 业务逻辑 (部分)
- ✅ 设计系统 (颜色、字体)

## 📝 开发计划

### Phase 1: 基础设施 ✅
- [x] 项目初始化
- [x] 类型定义
- [x] API 服务层
- [x] 基础组件库

### Phase 2: 核心功能 (进行中)
- [ ] 认证流程
- [ ] 对话模块
- [ ] 论点解构
- [ ] 多棱镜视角

### Phase 3: 优化增强 (计划中)
- [ ] 离线支持
- [ ] 推送通知
- [ ] 生物识别
- [ ] 性能优化

## 📖 相关文档

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [NativeWind 文档](https://www.nativewind.dev/)
- [Expo Router 文档](https://expo.github.io/router/docs)

## 💡 常见问题

### Q: 如何连接本地开发服务器？

A: 确保手机和电脑在同一局域网，修改 API_CONFIG.BASE_URL 为电脑的局域网 IP。

### Q: 为什么 Tailwind 样式不生效？

A: 检查 \`babel.config.js\` 是否正确配置了 NativeWind。

### Q: 如何调试网络请求？

A: 使用 React Native Debugger 或 Flipper 工具。

## 📄 许可证

MIT License

## 👥 贡献者

- 开发团队: CotigoAI Team

---

**🎉 开始你的批判性思维训练之旅！**
