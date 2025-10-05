# Cogito AI - 项目文件结构

完整的项目文件组织说明。

## 📂 目录结构

\`\`\`
cogito-ai/
├── 📁 src/                          # 源代码目录
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 api/                  # API路由
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 [...nextauth]/
│   │   │   │   │   └── route.ts    # NextAuth处理器
│   │   │   │   └── 📁 signup/
│   │   │   │       └── route.ts    # 用户注册API
│   │   │   ├── 📁 conversations/
│   │   │   │   ├── route.ts        # 对话列表/创建
│   │   │   │   └── 📁 [id]/
│   │   │   │       └── 📁 messages/
│   │   │   │           └── route.ts # 对话消息(流式)
│   │   │   ├── 📁 arguments/
│   │   │   │   ├── route.ts        # 论点记录列表
│   │   │   │   └── 📁 analyze/
│   │   │   │       └── route.ts    # 论点分析API
│   │   │   └── 📁 perspectives/
│   │   │       ├── route.ts        # 视角会话列表/创建
│   │   │       └── 📁 [id]/
│   │   │           ├── 📁 generate/
│   │   │           │   └── route.ts # 生成视角观点
│   │   │           └── 📁 chat/
│   │   │               └── route.ts # 角色对话
│   │   ├── layout.tsx               # 根布局
│   │   └── page.tsx                 # 首页
│   ├── 📁 components/               # React组件 (待实现)
│   │   ├── ui/                      # shadcn/ui组件
│   │   ├── chat/                    # 对话组件
│   │   ├── arguments/               # 论点解构组件
│   │   └── perspectives/            # 多视角组件
│   ├── 📁 lib/                      # 核心库
│   │   ├── 📁 ai/                   # AI服务层
│   │   │   ├── base.ts             # ✅ 基础接口和工具
│   │   │   ├── deepseek.ts         # ✅ Deepseek服务
│   │   │   ├── qwen.ts             # ✅ Qwen服务
│   │   │   └── router.ts           # ✅ AI路由器
│   │   ├── 📁 prompts/
│   │   │   └── index.ts            # ✅ Prompt模板库
│   │   ├── auth.ts                 # ✅ NextAuth配置
│   │   ├── prisma.ts               # ✅ Prisma客户端
│   │   └── utils.ts                # ✅ 工具函数
│   ├── 📁 types/                    # TypeScript类型
│   │   ├── index.ts                # ✅ 核心类型定义
│   │   └── next-auth.d.ts          # ✅ NextAuth类型扩展
│   └── 📁 styles/
│       └── globals.css             # ✅ 全局样式
├── 📁 prisma/
│   └── schema.prisma               # ✅ 数据库模型定义
├── 📁 docs/                         # 文档目录
│   ├── database-schema.md          # ✅ 数据库设计文档
│   ├── api-architecture.md         # ✅ API架构文档
│   ├── DEPLOYMENT.md               # ✅ 部署指南
│   ├── PROJECT_SUMMARY.md          # ✅ 项目总结
│   └── FILE_STRUCTURE.md           # ✅ 本文档
├── 📁 scripts/
│   └── setup.sh                    # ✅ 项目初始化脚本
├── 📁 public/                       # 静态资源 (待添加)
├── .env.example                    # ✅ 环境变量模板
├── .gitignore                      # ✅ Git忽略配置
├── next.config.ts                  # ✅ Next.js配置
├── tailwind.config.ts              # ✅ Tailwind配置
├── tsconfig.json                   # ✅ TypeScript配置
├── postcss.config.mjs              # ✅ PostCSS配置
├── package.json                    # ✅ 项目依赖
├── project.md                      # ✅ 原始需求文档
└── README.md                       # ✅ 项目说明
\`\`\`

---

## 📄 关键文件说明

### 配置文件

#### `package.json`
项目依赖和脚本配置
- 主要依赖: Next.js 14, React 18, Prisma, NextAuth.js
- 脚本: dev, build, lint, db:generate, db:push, db:migrate

#### `tsconfig.json`
TypeScript编译配置
- 启用严格模式
- 路径别名: @/* → src/*

#### `.env.example`
环境变量模板
- 数据库URL
- NextAuth配置
- AI API密钥

### 核心源代码

#### `src/lib/ai/`
AI服务层实现

**base.ts**
- IAIService接口定义
- AIServiceError错误类
- streamResponse流式响应工具
- makeAIRequest统一HTTP请求

**deepseek.ts & qwen.ts**
- 实现IAIService接口
- chat()方法: 对话接口
- analyze()方法: 分析任务
- 流式响应支持

**router.ts**
- AIRouter类: 智能路由
- 自动模型切换
- 统一服务入口

#### `src/lib/prompts/index.ts`
Prompt工程模板

**核心Prompt**:
1. SOCRATIC_SYSTEM_PROMPT - 苏格拉底对话
2. ARGUMENT_ANALYSIS_PROMPT - 论点解构
3. createPerspectivePrompt() - 多视角生成
4. createFollowUpPrompt() - 追问对话
5. ROLE_PRESETS - 角色配置预设

#### `src/lib/auth.ts`
NextAuth.js认证配置

**功能**:
- CredentialsProvider(邮箱密码)
- JWT会话策略
- PrismaAdapter数据库集成
- 自定义页面路由

#### `src/lib/prisma.ts`
Prisma客户端单例

**特性**:
- 全局实例管理
- 开发环境日志
- 热重载支持

### API路由

#### 认证相关
- `api/auth/[...nextauth]/route.ts` - NextAuth处理器
- `api/auth/signup/route.ts` - 用户注册

#### 苏格拉底对话
- `api/conversations/route.ts` - GET(列表) / POST(创建)
- `api/conversations/[id]/messages/route.ts` - GET(历史) / POST(发送)

#### 论点解构
- `api/arguments/route.ts` - GET(历史列表)
- `api/arguments/analyze/route.ts` - POST(分析)

#### 多棱镜视角
- `api/perspectives/route.ts` - GET(列表) / POST(创建)
- `api/perspectives/[id]/generate/route.ts` - POST(生成视角)
- `api/perspectives/[id]/chat/route.ts` - POST(角色对话)

### 数据库

#### `prisma/schema.prisma`
数据模型定义

**11个模型**:
1. User - 用户
2. Account - OAuth账户
3. Session - 会话
4. VerificationToken - 验证令牌
5. UserSettings - 用户设置
6. Conversation - 对话会话
7. Message - 对话消息
8. ArgumentAnalysis - 论点解构
9. PerspectiveSession - 多视角会话
10. Perspective - 视角观点
11. PerspectiveMessage - 视角对话消息
12. SystemConfig - 系统配置

### 类型定义

#### `src/types/index.ts`
核心类型定义

**类型分类**:
- 通用: APIResponse
- AI: ChatMessage, AIRequestOptions
- 对话: ConversationWithMessages
- 论点: Evidence, Assumption, Fallacy
- 视角: RoleConfig, PerspectiveData

#### `src/types/next-auth.d.ts`
NextAuth类型扩展
- Session扩展
- User扩展
- JWT扩展

---

## 🎯 开发优先级

### 已完成 ✅
1. ✅ 项目架构搭建
2. ✅ 数据库设计
3. ✅ AI服务集成
4. ✅ 三大核心API
5. ✅ 用户认证系统
6. ✅ Prompt工程
7. ✅ 完整文档

### 下一步开发 📝

#### 高优先级
1. **UI组件库**
   - 安装shadcn/ui
   - 创建基础组件
   - 实现布局系统

2. **核心页面**
   - 登录/注册页面
   - 对话界面
   - 论点解构界面
   - 多视角界面

3. **状态管理**
   - React Query集成
   - Zustand store创建
   - API hooks封装

#### 中优先级
4. **数据可视化**
   - React Flow论证图
   - D3.js思维导图
   - Recharts统计图表

5. **用户体验**
   - 流式响应渲染
   - 加载状态优化
   - 错误提示优化

#### 低优先级
6. **高级功能**
   - 分享功能
   - 导出功能
   - 主题切换
   - 多语言支持

---

## 📊 代码统计

### 后端实现进度
- ✅ API端点: 10个
- ✅ 数据模型: 11个
- ✅ AI服务: 2个
- ✅ Prompt模板: 5个
- ✅ 类型定义: 15+个

### 前端待实现
- ⏳ UI组件: 0/30+
- ⏳ 页面路由: 0/10+
- ⏳ 状态管理: 0/10+
- ⏳ API hooks: 0/15+

### 文档完成度
- ✅ README.md
- ✅ API架构文档
- ✅ 数据库设计文档
- ✅ 部署指南
- ✅ 项目总结
- ✅ 文件结构说明

---

## 🔍 快速查找

### 需要修改AI模型配置?
→ \`src/lib/ai/router.ts\`

### 需要优化Prompt?
→ \`src/lib/prompts/index.ts\`

### 需要添加新的数据模型?
→ \`prisma/schema.prisma\`

### 需要添加新的API端点?
→ \`src/app/api/*\`

### 需要修改认证逻辑?
→ \`src/lib/auth.ts\`

### 需要查看类型定义?
→ \`src/types/index.ts\`

---

**文件结构清晰,易于导航和维护!**
