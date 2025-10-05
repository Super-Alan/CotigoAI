import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface SynthesizeRequest {
  issue: string;
  perspectives: Array<{
    roleId: string;
    roleName: string;
    analysis: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '未授权访问' })),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body: SynthesizeRequest = await request.json();
    const { issue, perspectives } = body;

    if (!issue || !issue.trim()) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '请提供议题描述' })),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!perspectives || perspectives.length < 2) {
      const encoder = new TextEncoder();
      return new Response(
        encoder.encode(JSON.stringify({ error: '至少需要2个视角进行综合分析' })),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { aiRouter } = await import('@/lib/ai/router');

          const roleNames = perspectives.map(p => p.roleName).join('、');

          // Build comprehensive analysis from all perspectives
          const allAnalyses = perspectives.map(p =>
            `## ${p.roleName}的视角\n${p.analysis}`
          ).join('\n\n---\n\n');

          const systemPrompt = `你是一位批判性思维教育专家，擅长元认知分析、认知框架解构和认知偏见识别。

你的任务是分析来自${perspectives.length}位专家（${roleNames}）的观点，进行**深度批判性综合分析**。

请严格按照以下 Markdown 格式提供分析：

## 认知偏见检测
识别各视角中可能存在的认知偏见（2-3个最显著的）：

- 🧠 **[偏见名称]** (出现在[角色名])
  - 具体表现：如何在分析中体现
  - 影响评估：可能导致什么误判
  - 缓解建议：如何减轻该偏见

常见偏见类型：确认偏见、锚定效应、可得性启发、损失厌恶、框架效应、沉没成本谬误、乐观偏见、群体思维等

## 视角冲突
识别2-3个核心分歧，深入分析**为什么**会产生分歧：

- **[角色A] vs [角色B]**：具体分歧描述
  - 🧠 **认知框架差异**：他们基于不同的思维模型或价值观
  - 📊 **证据解读分歧**：对同一证据的不同诠释
  - ⚖️ **权衡取舍**：优先级和评估标准的差异

## 跨视角洞察
综合多个视角后的**元认知发现**（3-5个）：

- 💡 **[洞察标题]**：具体内容
  - 涉及角色：[列出相关角色]
  - 批判性价值：为什么这个洞察重要

## 集体盲区
所有角色都**未充分考虑**的维度：

- 🔍 **盲区1**：描述 + 为什么这很重要
- 🔍 **盲区2**：描述 + 可能的影响

## 假设检验
关键假设的质疑：

- ❓ **假设1**：如果[改变某个前提]，结论会如何变化？
- ❓ **假设2**：这个论证依赖什么未验证的假设？

## 行动建议
基于批判性分析的建议（包含不确定性说明）：

### 近期行动（3-6个月）
1. [行动] - 证据强度：🔴/🟡/⚪️
2. [行动] - 需要验证的假设：[...]

### 中期规划（6-18个月）
1. [规划] - 关键风险：[...]

### 长期愿景（18个月以上）
1. [愿景] - 不确定性：[...]

**批判性思维要求**：
- 区分描述性(what)和规范性(should)陈述
- 标注证据强度和不确定性
- 揭示隐藏的价值判断
- 承认分析的局限性`;

          const userPrompt = `议题：${issue}

以下是${perspectives.length}位专家的分析：

${allAnalyses}

请提供综合分析。`;

          // Send init message
          const initData = {
            type: 'init',
            issue
          };
          controller.enqueue(encoder.encode(JSON.stringify(initData) + '\n'));

          const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ];

          const response = await aiRouter.chat(messages, {
            stream: true,
            temperature: 0.7,
            maxTokens: 3500  // 增加以容纳6个分析部分
          });

          let fullText = '';

          if (typeof response === 'string') {
            // Non-streaming fallback
            fullText = response;
            const chunkData = {
              type: 'chunk',
              chunk: response
            };
            controller.enqueue(encoder.encode(JSON.stringify(chunkData) + '\n'));
          } else {
            // Streaming response
            const reader = response.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk;

              // Send chunk to client
              const chunkData = {
                type: 'chunk',
                chunk
              };
              controller.enqueue(encoder.encode(JSON.stringify(chunkData) + '\n'));
            }
          }

          // Send complete signal - 不再需要解析
          console.log('[Synthesis] 生成完成，全文长度:', fullText.length);

          const completeData = {
            type: 'complete',
            fullText,
            generatedAt: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(JSON.stringify(completeData) + '\n'));

          controller.close();
        } catch (error) {
          console.error('[Synthesis Stream] 错误:', error);
          const errorData = {
            type: 'error',
            error: '生成综合分析时发生错误'
          };
          controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('综合分析失败:', error);
    const encoder = new TextEncoder();
    return new Response(
      encoder.encode(JSON.stringify({ error: '生成综合分析时发生错误' })),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 解析函数已移除 - 改为直接显示完整 Markdown
