# 🚀 Cogito AI - 快速启动指南

10分钟内快速启动项目!

## ✅ 前置检查清单

在开始之前,请确保你有:

- [ ] Node.js 18.x 或更高版本
- [ ] npm 或 yarn包管理器
- [ ] PostgreSQL 14+ 数据库
- [ ] Deepseek API密钥 或 Qwen API密钥
- [ ] (可选) Redis用于缓存

## 📋 快速启动步骤

### 步骤1: 环境检查 (1分钟)

\`\`\`bash
# 检查Node.js版本
node -v
# 应该显示: v18.x.x 或更高

# 检查npm版本
npm -v

# 检查PostgreSQL是否运行
psql --version
\`\`\`

### 步骤2: 安装依赖 (2-3分钟)

\`\`\`bash
# 进入项目目录
cd /Users/lucky/code/CotigoAI

# 安装所有依赖
npm install
\`\`\`

### 步骤3: 配置环境变量 (2-3分钟)

\`\`\`bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件
nano .env  # 或使用你喜欢的编辑器
\`\`\`

**必填配置**:

\`\`\`env
# 1. 数据库连接 (必填)
DATABASE_URL="postgresql://username:password@localhost:5432/cogito_ai"

# 2. NextAuth密钥 (必填,使用下方命令生成)
NEXTAUTH_SECRET="<运行: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# 3. AI模型API密钥 (至少配置一个)
DEEPSEEK_API_KEY="your-deepseek-api-key"
QWEN_API_KEY="your-qwen-api-key"

# 4. 激活的AI模型
ACTIVE_AI_MODEL="deepseek-v3.1"  # 或 "qwen3-max"
\`\`\`

**生成NEXTAUTH_SECRET**:

\`\`\`bash
openssl rand -base64 32
\`\`\`

**获取AI API密钥**:

- **Deepseek**: 访问 [Deepseek控制台](https://bailian.console.aliyun.com/)
- **Qwen**: 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)

### 步骤4: 准备PostgreSQL数据库 (2分钟)

**选项A: 创建本地数据库**

\`\`\`bash
# 连接到PostgreSQL
psql -U postgres

# 在psql中执行:
CREATE DATABASE cogito_ai;
CREATE USER cogito_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cogito_ai TO cogito_user;
\\q
\`\`\`

然后更新.env中的DATABASE_URL:
\`\`\`env
DATABASE_URL="postgresql://cogito_user:your_password@localhost:5432/cogito_ai"
\`\`\`

**选项B: 使用云数据库 (推荐)**

- [Supabase](https://supabase.com) - 免费额度慷慨
- [Neon](https://neon.tech) - 无服务器PostgreSQL
- [Railway](https://railway.app) - 简单易用

创建数据库后,复制连接字符串到.env的DATABASE_URL。

### 步骤5: 初始化数据库 (1分钟)

\`\`\`bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 验证数据库
npm run db:studio
# 会打开http://localhost:5555的Prisma Studio
\`\`\`

### 步骤6: 启动开发服务器 (30秒)

\`\`\`bash
npm run dev
\`\`\`

打开浏览器访问: **http://localhost:3000**

🎉 **成功!** 你应该能看到Cogito AI的首页了!

---

## 🧪 测试核心功能

### 1. 测试用户注册

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

应该返回:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "测试用户",
    "email": "test@example.com"
  }
}
\`\`\`

### 2. 测试创建对话

首先登录获取session,然后:

\`\`\`bash
curl -X POST http://localhost:3000/api/conversations \\
  -H "Content-Type: application/json" \\
  -H "Cookie: next-auth.session-token=<你的session-token>" \\
  -d '{
    "title": "测试对话",
    "topic": "人工智能的未来"
  }'
\`\`\`

### 3. 测试论点解构

\`\`\`bash
curl -X POST http://localhost:3000/api/arguments/analyze \\
  -H "Content-Type: application/json" \\
  -H "Cookie: next-auth.session-token=<你的session-token>" \\
  -d '{
    "text": "人工智能将取代所有人类工作,因为机器比人类更高效。历史上每次技术革命都会创造新工作,所以不用担心。"
  }'
\`\`\`

---

## 🐛 常见问题排查

### 问题1: 数据库连接失败

**错误**: \`Error: P1001: Can't reach database server\`

**解决方案**:
1. 确认PostgreSQL正在运行: \`pg_isready\`
2. 检查.env中的DATABASE_URL是否正确
3. 确认数据库存在: \`psql -l\`
4. 测试连接: \`psql $DATABASE_URL\`

### 问题2: AI API调用失败

**错误**: \`AIServiceError: DEEPSEEK_API_KEY未配置\`

**解决方案**:
1. 检查.env中是否配置了API密钥
2. 确认API密钥格式正确(通常以\`sk-\`开头)
3. 检查API配额是否用尽
4. 尝试切换到另一个模型

### 问题3: Prisma客户端错误

**错误**: \`Cannot find module '@prisma/client'\`

**解决方案**:
\`\`\`bash
npm run db:generate
\`\`\`

### 问题4: 端口被占用

**错误**: \`Error: listen EADDRINUSE: address already in use :::3000\`

**解决方案**:
\`\`\`bash
# 查找占用3000端口的进程
lsof -i :3000

# 结束该进程
kill -9 <PID>

# 或者使用其他端口
PORT=3001 npm run dev
\`\`\`

### 问题5: NextAuth配置错误

**错误**: \`[next-auth][error][NO_SECRET]\`

**解决方案**:
确保.env中配置了NEXTAUTH_SECRET:
\`\`\`bash
openssl rand -base64 32
# 复制输出到.env的NEXTAUTH_SECRET
\`\`\`

---

## 📚 下一步

### 开发前端UI

参考 [docs/FILE_STRUCTURE.md](./docs/FILE_STRUCTURE.md) 了解项目结构。

**推荐开发顺序**:
1. 安装shadcn/ui组件库
2. 创建认证页面(登录/注册)
3. 实现对话界面
4. 实现论点解构界面
5. 实现多视角界面

### 学习Prompt工程

查看 \`src/lib/prompts/index.ts\` 学习如何优化AI提示词。

### 部署到生产环境

参考 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) 获取完整部署指南。

---

## 🆘 获取帮助

- **文档**: 查看 \`docs/\` 目录下的详细文档
- **API文档**: [docs/api-architecture.md](./docs/api-architecture.md)
- **项目总结**: [docs/PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)
- **问题反馈**: 提交GitHub Issue

---

## 🎯 开发检查清单

完成快速启动后,建议完成以下任务:

- [ ] 创建测试用户账号
- [ ] 测试苏格拉底对话API
- [ ] 测试论点解构API
- [ ] 测试多棱镜视角API
- [ ] 浏览Prisma Studio查看数据库
- [ ] 阅读核心文档
- [ ] 规划前端UI开发

---

**祝你开发顺利! 🚀**

如有问题,请查看 [docs/](./docs/) 目录下的详细文档。
