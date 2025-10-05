# AI 集成配置指南

CotigoAI 支持多个 AI 大模型提供商,用于生成多视角分析。

## 支持的 AI 模型

- **Deepseek V3.1** (推荐) - 高性能、低成本的国产大模型
- **Qwen3 Max** - 阿里云通义千问系列模型

## 快速开始

### 1. 获取 API 密钥

#### Deepseek (推荐)
1. 访问 [Deepseek 平台](https://platform.deepseek.com/)
2. 注册并创建 API Key
3. 复制你的 API Key

#### Qwen (备选)
1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 开通服务并获取 API Key

### 2. 配置环境变量

复制 `.env.example` 到 `.env`:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填入你的 API Key:

```env
# 选择激活的模型 (deepseek-v3.1 或 qwen3-max)
ACTIVE_AI_MODEL=deepseek-v3.1

# Deepseek 配置
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Qwen 配置 (可选)
QWEN_API_KEY=your-qwen-api-key-here
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 3. 重启开发服务器

```bash
npm run dev
```

## 功能说明

### 1. 多视角分析生成

当用户提交议题后,系统会:
- 顺序调用 AI 生成每个角色的分析
- **支持流式输出**,实时显示生成过程
- 自动显示进度条和当前生成角色

### 2. 角色对话

用户可以与每个角色进行深入对话:
- AI 会保持角色的专业视角
- 结合议题背景和对话历史
- 提供个性化回应

### 3. 综合分析

AI 会分析所有视角,生成:
- 共识点:不同角色的共同观点
- 主要分歧:关键冲突和矛盾
- 跨视角洞察:综合多个视角的新见解
- 平衡建议:可行的行动方案

## 成本估算

### Deepseek V3.1 定价 (参考)
- 输入: ¥1/百万 tokens
- 输出: ¥2/百万 tokens

### 每次多视角分析成本
- 3个角色分析: ~6K tokens输入 + ~4K tokens输出 ≈ ¥0.02
- 综合分析: ~8K tokens输入 + ~2K tokens输出 ≈ ¥0.025

**总计**: 每次完整分析约 ¥0.05 (5分钱)

## 故障排除

### API 调用失败

如果看到 "AI服务暂时不可用,显示备用内容" 提示:

1. **检查 API Key**
   ```bash
   # 确保 .env 文件中的 API Key 正确
   cat .env | grep DEEPSEEK_API_KEY
   ```

2. **检查网络连接**
   ```bash
   # 测试 API 连接
   curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
        https://api.deepseek.com/v1/models
   ```

3. **查看日志**
   打开浏览器控制台查看详细错误信息

4. **余额检查**
   登录 Deepseek 平台检查账户余额

### 流式输出不工作

1. 检查浏览器是否支持 ReadableStream
2. 查看 Network 标签,确认响应类型为 `text/event-stream`
3. 检查是否有代理或防火墙阻止流式连接

## 切换 AI 模型

编辑 `.env` 文件中的 `ACTIVE_AI_MODEL`:

```env
# 使用 Deepseek
ACTIVE_AI_MODEL=deepseek-v3.1

# 或使用 Qwen
ACTIVE_AI_MODEL=qwen3-max
```

## API 文档

- [Deepseek API 文档](https://platform.deepseek.com/docs)
- [Qwen API 文档](https://help.aliyun.com/zh/dashscope/)

## 技术架构

```
Frontend (perspectives/page.tsx)
  ↓ HTTP POST
API Route (api/perspectives/generate-stream/route.ts)
  ↓ Sequential calls
AI Generator (lib/ai/perspectiveGenerator.ts)
  ↓ Stream: true
AI Router (lib/ai/router.ts)
  ↓ Based on ACTIVE_AI_MODEL
Deepseek/Qwen Service (lib/ai/deepseek.ts|qwen.ts)
  ↓ HTTPS
AI Provider API
```

## 安全建议

1. **永远不要提交 `.env` 文件到 Git**
2. 定期轮换 API Key
3. 为生产环境设置支付限额
4. 使用环境变量管理服务(如 Vercel/Railway)存储敏感信息

## 下一步

- [ ] 添加 OpenAI/Claude 支持
- [ ] 实现响应缓存机制
- [ ] 添加用户自定义角色
- [ ] 支持多语言分析
