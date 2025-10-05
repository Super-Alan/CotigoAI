# Cogito AI - 部署指南

完整的生产环境部署指南。

## 🚀 部署选项

### 选项1: Vercel部署 (推荐)

Vercel是Next.js的官方部署平台,提供最佳的性能和开发体验。

#### 步骤

1. **准备PostgreSQL数据库**

推荐使用以下服务之一:

- [Supabase](https://supabase.com) - 免费额度慷慨
- [Neon](https://neon.tech) - 无服务器PostgreSQL
- [Railway](https://railway.app) - 简单易用

获取数据库连接URL,格式如:
\`\`\`
postgresql://username:password@host:5432/database
\`\`\`

2. **部署到Vercel**

a. 将代码推送到GitHub仓库

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

b. 在Vercel导入项目
- 访问 https://vercel.com
- 点击 "Import Project"
- 选择你的GitHub仓库
- Vercel会自动检测Next.js项目

c. 配置环境变量

在Vercel项目设置中添加以下环境变量:

\`\`\`env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
DEEPSEEK_API_KEY=your-key
QWEN_API_KEY=your-key
ACTIVE_AI_MODEL=deepseek-v3.1
\`\`\`

d. 部署

Vercel会自动构建和部署。每次推送到main分支都会触发自动部署。

3. **初始化数据库**

在本地运行Prisma迁移:

\`\`\`bash
# 使用生产数据库URL
DATABASE_URL="postgresql://..." npx prisma migrate deploy
\`\`\`

或在Vercel中添加构建命令:

\`\`\`json
// package.json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
\`\`\`

---

### 选项2: Docker部署

#### Dockerfile

\`\`\`dockerfile
# 创建 Dockerfile
FROM node:18-alpine AS base

# 依赖安装阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

#### docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/cogito_ai
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - QWEN_API_KEY=${QWEN_API_KEY}
      - ACTIVE_AI_MODEL=deepseek-v3.1
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cogito_ai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
\`\`\`

#### 部署命令

\`\`\`bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
\`\`\`

---

### 选项3: VPS部署 (Ubuntu/Debian)

#### 系统要求

- Ubuntu 20.04+ 或 Debian 11+
- 2GB+ RAM
- 20GB+ 磁盘空间

#### 步骤

1. **安装Node.js 18+**

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

2. **安装PostgreSQL**

\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres psql
CREATE DATABASE cogito_ai;
CREATE USER cogito_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cogito_ai TO cogito_user;
\\q
\`\`\`

3. **安装Redis (可选)**

\`\`\`bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
\`\`\`

4. **部署应用**

\`\`\`bash
# 克隆代码
git clone <your-repo-url> /var/www/cogito-ai
cd /var/www/cogito-ai

# 安装依赖
npm ci --production

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 初始化数据库
npx prisma generate
npx prisma migrate deploy

# 构建应用
npm run build

# 使用PM2运行
sudo npm install -g pm2
pm2 start npm --name "cogito-ai" -- start
pm2 save
pm2 startup
\`\`\`

5. **配置Nginx反向代理**

\`\`\`nginx
# /etc/nginx/sites-available/cogito-ai
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

\`\`\`bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/cogito-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

6. **配置SSL (Let's Encrypt)**

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
\`\`\`

---

## 🔒 生产环境安全检查清单

- [ ] 使用强密码和随机生成的NEXTAUTH_SECRET
- [ ] 配置数据库防火墙,只允许应用服务器访问
- [ ] 启用HTTPS/SSL证书
- [ ] 配置CORS策略
- [ ] 设置适当的速率限制
- [ ] 定期备份数据库
- [ ] 监控日志和错误
- [ ] 配置环境变量而非硬编码敏感信息

## 📊 性能优化建议

### 数据库优化

\`\`\`sql
-- 创建必要的索引
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
\`\`\`

### 缓存策略

使用Redis缓存AI响应:

\`\`\`typescript
// 伪代码示例
const cacheKey = \`ai:\${hash(messages)}\`;
const cached = await redis.get(cacheKey);

if (cached) {
  return cached;
}

const response = await aiRouter.chat(messages);
await redis.set(cacheKey, response, 'EX', 3600); // 1小时过期
\`\`\`

### CDN配置

在Vercel自动启用,其他平台可使用Cloudflare CDN。

## 🔧 环境变量完整列表

\`\`\`env
# 必填
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<random-secret>"
DEEPSEEK_API_KEY="sk-..."
QWEN_API_KEY="sk-..."

# 可选
ACTIVE_AI_MODEL="deepseek-v3.1"
REDIS_URL="redis://localhost:6379"
NODE_ENV="production"

# AI API自定义URL (可选)
DEEPSEEK_API_URL="https://api.deepseek.com/v1"
QWEN_API_URL="https://dashscope.aliyuncs.com/api/v1"
\`\`\`

## 📈 监控和日志

### 推荐工具

- **应用监控**: Sentry, LogRocket
- **性能监控**: Vercel Analytics, New Relic
- **日志管理**: Papertrail, Logtail
- **数据库监控**: Prisma Pulse

### 设置Sentry

\`\`\`bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
\`\`\`

## 🔄 CI/CD配置

### GitHub Actions示例

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      # Vercel自动部署或使用vercel CLI
\`\`\`

## 🆘 故障排查

### 数据库连接失败

\`\`\`bash
# 测试数据库连接
npx prisma db push

# 查看Prisma日志
DATABASE_URL="..." npx prisma db push --preview-feature
\`\`\`

### AI API调用失败

- 检查API密钥是否正确
- 验证API配额是否用尽
- 查看网络连接和防火墙设置

### 构建失败

\`\`\`bash
# 清理缓存重新构建
rm -rf .next node_modules
npm install
npm run build
\`\`\`

---

**祝您部署顺利! 🚀**
