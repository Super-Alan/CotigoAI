# Vercel 环境变量配置指南

## 问题说明

错误信息：`prepared statement "s3" already exists`

**原因**：Supabase 使用 PgBouncer 连接池（端口 6543），在 transaction pooling 模式下不支持 Prisma 的 prepared statements。

## 解决方案

在 Vercel 项目设置中配置正确的 `DATABASE_URL` 环境变量。

### 步骤 1: 登录 Vercel Dashboard

访问：https://vercel.com/dashboard

### 步骤 2: 进入项目设置

1. 选择你的项目（CotigoAI）
2. 点击 **Settings** 标签
3. 点击左侧菜单的 **Environment Variables**

### 步骤 3: 更新 DATABASE_URL

**删除或更新现有的 `DATABASE_URL` 变量，使用以下值：**

```
postgres://postgres.luhuhnlxqpoezqtegnoy:MIKvJ8z5PrYPqmey@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**重要参数说明：**
- 使用端口 **6543** (PgBouncer 连接池)
- `pgbouncer=true` - 禁用 Prisma prepared statements
- `connection_limit=1` - Serverless 环境连接数限制

**环境选择：**
- ✅ Production
- ✅ Preview
- ✅ Development

### 步骤 4: 重新部署

配置完成后，需要触发新的部署：

**方法 1: 通过 Git 推送**
```bash
git commit --allow-empty -m "chore: trigger redeploy with updated env"
git push origin main
```

**方法 2: 通过 Vercel Dashboard**
1. 进入 **Deployments** 标签
2. 找到最新的成功部署
3. 点击右侧的三个点 (...)
4. 选择 **Redeploy**

### 步骤 5: 验证部署

部署完成后访问：
```
https://your-app.vercel.app/api/daily-practice/status
```

应该不再出现 "prepared statement already exists" 错误。

## 其他环境变量（可选）

如果需要，可以添加其他环境变量：

```bash
# AI 模型配置
DEEPSEEK_API_KEY=your-deepseek-key
QWEN_API_KEY=your-qwen-key
ACTIVE_AI_MODEL=deepseek-v3.1

# NextAuth 配置
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

## 本地开发 vs 生产环境

| 环境 | 端口 | 参数 | 用途 |
|------|------|------|------|
| **本地开发** | 5432 (直连) | `sslmode=require` | 迁移、管理操作 |
| **Vercel 生产** | 6543 (PgBouncer) | `pgbouncer=true&connection_limit=1` | Serverless 应用连接 |

## 故障排查

### 如果仍然出现错误

1. **检查环境变量是否正确保存**
   - 在 Vercel Settings → Environment Variables 中确认

2. **确认已重新部署**
   - 环境变量更新后必须重新部署才会生效

3. **检查 Vercel 部署日志**
   ```
   Deployments → 最新部署 → Function Logs
   ```

4. **测试数据库连接**
   ```bash
   # 本地测试（使用 Vercel 的 DATABASE_URL）
   psql "postgres://postgres.luhuhnlxqpoezqtegnoy:MIKvJ8z5PrYPqmey@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

## 参考资料

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with PgBouncer](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/configure-pg-bouncer)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
