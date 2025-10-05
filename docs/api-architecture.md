# Cogito AI - API架构设计

## API 总体架构

```
Next.js API Routes (app/api/*)
├─ /auth/*              - 认证相关 (NextAuth.js)
├─ /conversations/*     - 苏格拉底对话
├─ /arguments/*         - 论点解构
├─ /perspectives/*      - 多棱镜视角
├─ /ai/*                - 大模型代理层
└─ /admin/*             - 管理端配置
```

## 核心API端点设计

### 1. 认证API (`/api/auth/*`)

```typescript
// NextAuth.js 自动生成的端点
POST   /api/auth/signin       - 登录
POST   /api/auth/signout      - 登出
POST   /api/auth/signup       - 注册
GET    /api/auth/session      - 获取会话
GET    /api/auth/providers    - 获取OAuth提供商
```

### 2. 苏格拉底对话API (`/api/conversations/*`)

```typescript
// 会话管理
GET    /api/conversations                    - 获取用户的所有对话列表
POST   /api/conversations                    - 创建新对话
GET    /api/conversations/[id]               - 获取特定对话详情
PATCH  /api/conversations/[id]               - 更新对话标题
DELETE /api/conversations/[id]               - 删除对话

// 消息交互
POST   /api/conversations/[id]/messages      - 发送新消息 (流式响应)
GET    /api/conversations/[id]/messages      - 获取对话历史

// 请求示例
POST /api/conversations/[id]/messages
{
  "content": "我认为人工智能最终会取代所有人类工作。",
  "metadata": {
    "messageType": "initial" | "followup"
  }
}

// 响应 (Server-Sent Events 流式)
data: {"type": "chunk", "content": "你说的'所有工作'具体指哪些类型？"}
data: {"type": "chunk", "content": "是否包括创造性或情感类的工作？"}
data: {"type": "done"}
```

### 3. 论点解构API (`/api/arguments/*`)

```typescript
POST   /api/arguments/analyze               - 提交文本进行解构分析
GET    /api/arguments                        - 获取用户的历史解构
GET    /api/arguments/[id]                   - 获取特定解构详情
DELETE /api/arguments/[id]                   - 删除解构记录

// 请求示例
POST /api/arguments/analyze
{
  "text": "长篇文本内容..."
}

// 响应示例
{
  "id": "clx123...",
  "analysis": {
    "mainClaim": "核心主张识别结果",
    "evidence": [
      {
        "text": "论据1",
        "type": "事实" | "数据" | "案例",
        "strength": "strong" | "moderate" | "weak"
      }
    ],
    "assumptions": [
      {
        "assumption": "隐藏假设1",
        "validity": "需要验证",
        "impact": "high" | "medium" | "low"
      }
    ],
    "fallacies": [
      {
        "type": "稻草人谬误",
        "description": "具体说明",
        "location": "文本位置或引用",
        "severity": "major" | "minor"
      }
    ]
  },
  "createdAt": "2025-10-02T..."
}
```

### 4. 多棱镜视角API (`/api/perspectives/*`)

```typescript
// 会话管理
GET    /api/perspectives                     - 获取用户的视角会话列表
POST   /api/perspectives                     - 创建新的视角会话
GET    /api/perspectives/[id]                - 获取特定会话详情
DELETE /api/perspectives/[id]                - 删除会话

// 视角生成
POST   /api/perspectives/[id]/generate       - 生成多个视角观点
GET    /api/perspectives/[id]/perspectives   - 获取已生成的视角列表

// 追问对话
POST   /api/perspectives/[id]/chat           - 与特定角色对话

// 请求示例
POST /api/perspectives
{
  "topic": "是否应该对富人征收更高的税？",
  "roles": [
    "自由市场经济学家",
    "社会主义活动家",
    "中产阶级纳税人",
    "政府财政部长"
  ]
}

// 生成视角响应
POST /api/perspectives/[id]/generate
{
  "roleNames": ["自由市场经济学家", "社会主义活动家"]
}

Response:
{
  "perspectives": [
    {
      "id": "per_123...",
      "roleName": "自由市场经济学家",
      "viewpoint": "从自由市场角度的详细观点...",
      "roleConfig": {
        "background": "经济学博士，主张...",
        "values": ["自由竞争", "最小政府干预"]
      }
    }
  ]
}

// 追问对话
POST /api/perspectives/[id]/chat
{
  "perspectiveId": "per_123...",
  "message": "如果这会导致贫富差距扩大呢？"
}
```

### 5. 大模型代理层 (`/api/ai/*`)

```typescript
// 内部使用的API,不直接暴露给前端
POST   /api/ai/chat                    - 通用对话接口
POST   /api/ai/analyze                 - 分析类任务
POST   /api/ai/generate                - 生成类任务

// 统一请求格式
{
  "model": "deepseek-v3.1" | "qwen3-max",
  "messages": [
    {"role": "system", "content": "系统提示词"},
    {"role": "user", "content": "用户输入"}
  ],
  "stream": true | false,
  "temperature": 0.7,
  "maxTokens": 4000
}
```

### 6. 系统配置API (`/api/admin/*`) - 仅管理员

```typescript
GET    /api/admin/config                - 获取系统配置
PATCH  /api/admin/config                - 更新配置
GET    /api/admin/models                - 获取可用模型列表
PATCH  /api/admin/models/active         - 切换激活模型
```

## 大模型集成服务层

```typescript
// lib/ai/deepseek.ts
export class DeepseekService {
  async chat(messages, options): Promise<Stream | string>
  async analyze(text, task): Promise<AnalysisResult>
}

// lib/ai/qwen.ts
export class QwenService {
  async chat(messages, options): Promise<Stream | string>
  async analyze(text, task): Promise<AnalysisResult>
}

// lib/ai/router.ts
export class AIRouter {
  // 根据系统配置自动路由到对应模型
  async route(request): Promise<AIResponse> {
    const activeModel = await getActiveModel()
    return activeModel === 'deepseek-v3.1'
      ? deepseekService.process(request)
      : qwenService.process(request)
  }
}
```

## Prompt工程模板

```typescript
// lib/prompts/socratic.ts
export const SOCRATIC_SYSTEM_PROMPT = `
你是一名苏格拉底式的哲学导师,你的唯一目标是通过提问来挑战和启发用户,
你绝不能直接给出答案或自己的观点。

你的提问应该遵循以下逻辑链条:
1. 澄清概念 - 确保术语定义清晰
2. 检验证据 - 追溯论点的事实基础
3. 挖掘假设 - 揭示隐藏的前提条件
4. 探索其他视角 - 引导换位思考

提问风格:
- 开放式问题为主
- 引导而非灌输
- 保持中立和好奇
- 鼓励深度思考
`

// lib/prompts/argument-analyzer.ts
export const ARGUMENT_ANALYSIS_PROMPT = `
请对以下文本进行批判性思维分析,以JSON格式返回:

{
  "mainClaim": "核心主张",
  "evidence": [
    {"text": "论据", "type": "事实/数据/案例", "strength": "strong/moderate/weak"}
  ],
  "assumptions": [
    {"assumption": "假设", "validity": "评估", "impact": "high/medium/low"}
  ],
  "fallacies": [
    {"type": "谬误类型", "description": "说明", "location": "位置", "severity": "major/minor"}
  ]
}

常见逻辑谬误类型:
- 稻草人谬误
- 人身攻击
- 滑坡谬误
- 诉诸权威
- 虚假二分法
- 循环论证
`

// lib/prompts/perspective.ts
export const createPerspectivePrompt = (role: string, topic: string) => `
你现在扮演: ${role}

针对议题: ${topic}

请从你的角色立场出发,生成一段逻辑严密、论据充分的观点陈述。
要求:
1. 保持角色一致性
2. 提供具体论据
3. 逻辑清晰
4. 观点鲜明
5. 尊重多元视角
`
```

## 错误处理规范

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

// 统一错误响应格式
{
  "error": {
    "code": "INVALID_INPUT" | "UNAUTHORIZED" | "AI_SERVICE_ERROR" | ...,
    "message": "人类可读的错误描述",
    "details": {} // 可选的详细信息
  }
}
```

## 速率限制策略

```typescript
// middleware/rate-limit.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁,请稍后再试'
})

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // AI接口限制更严格
  message: 'AI服务请求过于频繁'
})
```

## WebSocket/SSE选择

```typescript
// 使用Server-Sent Events实现流式响应
// app/api/conversations/[id]/messages/route.ts

export async function POST(req: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await aiService.chat(messages, { stream: true })

        for await (const chunk of aiStream) {
          const data = `data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`
          controller.enqueue(encoder.encode(data))
        }

        controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

## 性能优化策略

```yaml
缓存策略:
  - Redis缓存大模型响应 (TTL: 1小时)
  - 对话历史分页加载
  - 静态资源CDN加速

数据库优化:
  - 连接池管理 (Prisma默认)
  - 查询索引优化
  - 批量操作减少往返

大模型调用优化:
  - 流式响应减少延迟感
  - 并行请求处理
  - 超时重试机制
```
