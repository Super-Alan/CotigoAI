# Cogito AI - 批判性思维数智导师

一款基于苏格拉底式对话的批判性思维训练平台,帮助用户通过AI引导培养深度思考能力。

## 🎯 项目简介

**核心理念**: 从"答案提供者"到"思维脚手架"

Cogito AI不直接提供答案,而是扮演一个"苏格拉底式"的数字导师,通过不断追问、提供多元视角、解构论证,来激发和锻炼用户自己的思维深度和广度。

## ✨ 核心功能

### 1. 苏格拉底对话机器人 💭
- **功能**: 通过四阶段提问引导深度思考
  - 澄清概念 → 检验证据 → 挖掘假设 → 探索视角
- **特点**:
  - 流式对话体验
  - 对话历史持久化
  - 永远不直接给出答案
- **新增 - 智能助手面板** ⭐
  - 💡 参考答案建议（2-3个思维模板）
  - 🎯 提问意图分析（理解AI策略）
  - 📊 5轮对话进度追踪
  - 🎓 AI思维总结（完成5轮后）
  - 一键填入答案，降低学习门槛

### 2. 论点解构器 🔍
- **功能**: 可视化分析论证结构
  - 识别核心主张
  - 提取论据并评估强度
  - 挖掘隐藏假设
  - 检测逻辑谬误
- **特点**:
  - JSON结构化输出
  - 支持8种常见逻辑谬误识别
  - 历史记录查看

### 3. 多棱镜视角 🎭
- **功能**: 从多个角色立场审视同一问题
  - 预设4种经典角色
  - AI角色扮演生成观点
  - 支持与角色追问对话
- **特点**:
  - 打破信息茧房
  - 培养同理心和全局观

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + React Query
- **动画**: Framer Motion
- **数据可视化**: D3.js + React Flow + Recharts

### 后端
- **API**: Next.js API Routes (RESTful)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js (JWT + OAuth2)
- **缓存**: Redis (可选)

### AI集成
- **模型**:
  - Deepseek V3.1
  - 阿里通义 Qwen3 Max
- **核心技术**: 高级Prompt工程

## 📦 项目结构

\`\`\`
cogito-ai/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API路由
│   │   │   ├── auth/       # 认证相关
│   │   │   ├── conversations/  # 苏格拉底对话
│   │   │   ├── arguments/      # 论点解构
│   │   │   └── perspectives/   # 多棱镜视角
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # React组件
│   ├── lib/                 # 核心库
│   │   ├── ai/             # AI服务层
│   │   │   ├── base.ts     # 基础接口
│   │   │   ├── deepseek.ts # Deepseek服务
│   │   │   ├── qwen.ts     # Qwen服务
│   │   │   └── router.ts   # AI路由器
│   │   ├── prompts/        # Prompt模板
│   │   ├── auth.ts         # 认证配置
│   │   ├── prisma.ts       # Prisma客户端
│   │   └── utils.ts        # 工具函数
│   ├── types/              # TypeScript类型定义
│   └── styles/             # 全局样式
├── prisma/
│   └── schema.prisma       # 数据库模型
├── docs/                   # 文档
│   ├── database-schema.md  # 数据库设计
│   └── api-architecture.md # API架构
├── .env.example            # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## 🚀 快速开始

### 前置要求

- Node.js 18.x+
- PostgreSQL 14+
- npm 或 yarn

### 1. 克隆项目

\`\`\`bash
cd /Users/lucky/code/CotigoAI
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量

复制 \`.env.example\` 为 \`.env\` 并填写配置:

\`\`\`bash
cp .env.example .env
\`\`\`

**必填配置**:

\`\`\`env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/cogito_ai"

# NextAuth密钥 (使用下方命令生成)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI模型API密钥
DEEPSEEK_API_KEY="your-deepseek-api-key"
QWEN_API_KEY="your-qwen-api-key"

# 激活的AI模型
ACTIVE_AI_MODEL="deepseek-v3.1"
\`\`\`

**生成NEXTAUTH_SECRET**:

\`\`\`bash
openssl rand -base64 32
\`\`\`

### 4. 初始化数据库

\`\`\`bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 或运行迁移(推荐)
npm run db:migrate
\`\`\`

### 5. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

### 6. (可选) 启动Prisma Studio

\`\`\`bash
npm run db:studio
\`\`\`

## 📝 API文档

详见 [docs/api-architecture.md](./docs/api-architecture.md)

### 主要端点

#### 认证
- \`POST /api/auth/signup\` - 用户注册
- \`POST /api/auth/signin\` - 用户登录
- \`GET /api/auth/session\` - 获取会话

#### 苏格拉底对话
- \`GET /api/conversations\` - 获取对话列表
- \`POST /api/conversations\` - 创建新对话
- \`GET /api/conversations/[id]/messages\` - 获取对话历史
- \`POST /api/conversations/[id]/messages\` - 发送消息(SSE流式)

#### 论点解构
- \`POST /api/arguments/analyze\` - 分析文本
- \`GET /api/arguments\` - 获取历史记录

#### 多棱镜视角
- \`POST /api/perspectives\` - 创建视角会话
- \`POST /api/perspectives/[id]/generate\` - 生成视角观点
- \`POST /api/perspectives/[id]/chat\` - 与角色对话

## 🗄️ 数据库

详见 [docs/database-schema.md](./docs/database-schema.md)

### 核心数据模型

- **User** - 用户信息
- **Conversation** - 对话会话
- **Message** - 对话消息
- **ArgumentAnalysis** - 论点解构记录
- **PerspectiveSession** - 多视角会话
- **Perspective** - 视角观点
- **PerspectiveMessage** - 视角对话消息

## 🔧 开发工具

\`\`\`bash
# 代码检查
npm run lint

# 数据库管理
npm run db:studio

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
\`\`\`

## 🎨 Prompt工程

项目的核心竞争力在于精心设计的Prompt模板,详见 \`src/lib/prompts/index.ts\`

### 关键Prompt

1. **苏格拉底对话**: 四阶段提问逻辑
2. **论点解构**: 结构化JSON输出
3. **角色扮演**: 动态角色配置

## 📊 性能优化

- **流式响应**: SSE实现实时对话体验
- **数据库索引**: 优化查询性能
- **连接池**: Prisma自动管理
- **缓存策略**: Redis缓存AI响应(可选)

## 🔐 安全措施

- **密码加密**: bcrypt哈希
- **JWT认证**: NextAuth.js会话管理
- **API鉴权**: 所有端点验证用户登录状态
- **输入验证**: Zod schema验证

## 🌐 部署

### Vercel部署(推荐)

1. 连接GitHub仓库
2. 配置环境变量
3. 选择PostgreSQL数据库(推荐Supabase或Neon)
4. 自动部署

### Docker部署

\`\`\`bash
# 构建镜像
docker build -t cogito-ai .

# 运行容器
docker run -p 3000:3000 --env-file .env cogito-ai
\`\`\`

## 📄 许可证

MIT License

## 🙏 致谢

- OpenAI for inspiration
- Socrates for the method
- Critical thinking community

## 📧 联系方式

如有问题或建议,欢迎提交Issue或Pull Request。

---

**Built with 🧠 for critical thinkers**
