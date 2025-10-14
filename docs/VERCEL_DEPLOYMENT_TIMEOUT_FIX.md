# Vercel 部署 - AI 请求超时问题解决方案

## 问题描述

在 Vercel 生产环境中，聊天功能可能出现以下错误：

```
AIServiceError: 对话请求失败
ConnectTimeoutError: Connect Timeout Error (timeout: 10000ms)
```

**根本原因**：
- Vercel serverless 函数位于国外，连接国内 AI 服务器（DeepSeek/Qwen）网络延迟较高
- 默认 10 秒超时对于跨国网络请求不够

## 解决方案

### 1. 代码层面修复 ✅

已在 `src/lib/ai/base.ts` 中实现：
- 添加可配置的超时参数 `AI_REQUEST_TIMEOUT`
- 默认超时时间从 10 秒增加到 60 秒
- 更友好的超时错误提示

### 2. Vercel 环境变量配置

#### 方法一：通过 Vercel Dashboard（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

   | Name | Value | Environment |
   |------|-------|-------------|
   | `AI_REQUEST_TIMEOUT` | `60000` | Production, Preview, Development |

5. **重新部署**项目以应用更改

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add AI_REQUEST_TIMEOUT production
# 输入值: 60000

# 重新部署
vercel --prod
```

#### 方法三：通过 `.env` 文件（本地测试）

在项目根目录的 `.env` 文件中添加：

```env
AI_REQUEST_TIMEOUT=60000
```

### 3. 超时时间调整建议

根据实际情况调整超时时间：

- **默认值**：`60000` (60 秒) - 适合大多数情况
- **网络较慢**：`90000` (90 秒) - 如果仍然超时
- **本地开发**：`30000` (30 秒) - 国内网络通常较快

### 4. 验证修复是否生效

部署后测试：

1. 访问聊天页面：`https://your-domain.vercel.app/chat`
2. 发送一条消息
3. 检查是否正常响应，不再出现超时错误

### 5. 监控和日志

在 Vercel Dashboard 中查看日志：

```bash
# 或使用 CLI 查看实时日志
vercel logs your-project-name --follow
```

## 其他可能的解决方案

### 方案 A：使用国内 CDN 或代理

如果超时问题持续，考虑：
- 使用 Cloudflare Workers 作为 API 代理
- 使用阿里云函数计算部署（国内环境）

### 方案 B：切换到国际 AI 服务

如果可能，切换到国际化的 AI 服务：
- OpenAI API
- Anthropic Claude API
- Google Gemini API

修改 `.env`：
```env
ACTIVE_AI_MODEL="openai-gpt-4"
```

## 常见问题

### Q: 为什么设置了环境变量仍然超时？

A: 确保：
1. 环境变量在 **Production** 环境中设置
2. 已重新部署项目（设置环境变量后）
3. 超时时间足够长（建议 ≥60 秒）

### Q: 如何测试超时配置是否生效？

A: 在代码中添加日志：

```typescript
// src/lib/ai/base.ts
console.log('AI_REQUEST_TIMEOUT:', process.env.AI_REQUEST_TIMEOUT);
```

部署后查看 Vercel 日志。

### Q: Vercel 函数有执行时间限制吗？

A: 是的，Vercel 免费版函数执行时间限制为 **10 秒**，Pro 版为 **60 秒**。

如果你使用免费版，建议：
- 升级到 Pro 版
- 或使用后台任务处理长时间请求

## 技术细节

修改的文件：
- `src/lib/ai/base.ts` - 添加 AbortController 超时控制
- `.env.example` - 添加 `AI_REQUEST_TIMEOUT` 配置说明

关键代码：
```typescript
const timeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT || '60000');
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

const response = await fetch(url, {
  signal: controller.signal,  // 关键：传递 signal
  // ...
});
```

## 总结

1. ✅ **立即操作**：在 Vercel 添加 `AI_REQUEST_TIMEOUT=60000` 环境变量
2. ✅ **重新部署**：使配置生效
3. ✅ **测试验证**：确认聊天功能正常
4. 📊 **持续监控**：查看 Vercel 日志，必要时调整超时时间

如果问题仍然存在，请检查：
- API Key 是否正确
- API URL 是否可访问
- Vercel 账户类型和限制
