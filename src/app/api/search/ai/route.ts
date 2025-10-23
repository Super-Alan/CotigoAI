import { NextRequest, NextResponse } from 'next/server'
import { aiRouter } from '@/lib/ai/router'
import { ChatMessage } from '@/types'

/**
 * POST /api/search/ai
 * AI智能搜索 - 当数据库搜索无结果时的智能回答
 * 仅回复学习和批判性思维相关问题
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '搜索问题不能为空' },
        { status: 400 }
      )

    }

    // 构建系统提示词 - 使用 Few-Shot 示例
    const systemPrompt = `你是Cogito AI的批判性思维学习助手。你的职责是帮助用户理解和学习批判性思维相关知识。

**核心原则**：
1. 只回答与学习、批判性思维、逻辑推理、思维方法相关的问题
2. 如果问题与学习无关，礼貌地告知用户并引导回学习话题
3. 回答要专业、准确、有深度，但保持易懂
4. 使用清晰的结构：核心观点 → 详细解释 → 实际应用
5. 回答长度控制在300-500字

**五大核心思维维度**：
1. 多维归因与利弊权衡 - 区分相关性与因果性、识别混淆因素
2. 前提质疑与方法批判 - 识别隐含前提、质疑其合理性
3. 谬误检测 - 识别常见逻辑谬误
4. 迭代反思 - 培养元认知能力
5. 知识迁移 - 识别深层结构相似性

**输出格式（严格遵守,一字不差）**：

你必须完全按照以下示例的格式输出。注意每个标题、空行、缩进都必须完全一致：

---示例输出开始---

## 核心观点

这是核心观点的简要总结,用2-3句话说明问题的本质和关键洞察。

## 详细分析

1. **第一个关键维度**

   这里是对第一个维度的详细解释。保持段落简洁,每个列表项聚焦一个核心要点。

2. **第二个关键维度**

   这里是对第二个维度的分析。使用清晰的逻辑和例子支撑观点。

3. **第三个关键维度**

   这里是对第三个维度的补充说明。确保内容与前面的分析形成完整体系。

## 实践建议

1. **具体行动建议一**

   提供可操作的指导和方法,帮助用户将理论应用到实践。

2. **具体行动建议二**

   结合实际场景,给出注意事项和实施要点。

---示例输出结束---

**关键格式要求（违反将被视为错误）**：
1. 必须使用 "## " 开头的二级标题（## 后有一个空格）
2. 标题后必须空一行
3. 列表项格式：数字 + 点 + 空格 + 两个星号 + 标题 + 两个星号（如："1. **标题**"）
4. 粗体标题行后必须空一行
5. 内容段落前有3个空格缩进
6. 列表项之间必须空一行
7. 禁止使用 "### " 或将标题和数字连写（如 "## 详细分析1."）

现在请按照上述格式回答用户问题。记住：格式必须与示例完全一致。`

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ]

    // 调用AI服务获取流式响应
    const response = await aiRouter.chat(messages, {
      stream: true,
      temperature: 0.7,
      maxTokens: 1000
    })

    // 如果不是流式响应，直接返回文本
    if (typeof response === 'string') {
      return new NextResponse(
        createSSEStream(response),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      )
    }

    // 处理流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = (response as ReadableStream).getReader()
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              break
            }

            // 解码chunk并转发
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.trim() === '') continue

              // 处理SSE格式
              if (line.startsWith('data: ')) {
                const data = line.slice(6)

                // 跳过[DONE]标记，稍后统一发送
                if (data === '[DONE]') continue

                try {
                  // 尝试解析JSON
                  const parsed = JSON.parse(data)

                  // Deepseek格式
                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content
                    controller.enqueue(new TextEncoder().encode(`data: ${content}\n\n`))
                  }
                  // Qwen格式
                  else if (parsed.output && parsed.output.text) {
                    const content = parsed.output.text
                    controller.enqueue(new TextEncoder().encode(`data: ${content}\n\n`))
                  }
                } catch (e) {
                  // 如果不是JSON，直接转发
                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                }
              } else {
                // 非SSE格式，直接作为数据发送
                controller.enqueue(new TextEncoder().encode(`data: ${line}\n\n`))
              }
            }
          }
        } catch (error) {
          console.error('AI search streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { success: false, error: 'AI搜索失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 格式化 AI 输出 - 确保符合 Markdown 标准
 */
function formatAIResponse(text: string): string {
  // 1. 清理混乱的 ### 标记和数字序号
  text = text.replace(/###\s*详细分析\s*(\d+)\./g, '## 详细分析\n\n$1.');
  text = text.replace(/##\s*详细分析\s*(\d+)\./g, '## 详细分析\n\n$1.');

  // 2. 确保数字列表项格式正确: "1. **标题**"
  text = text.replace(/(\d+)\.\s*([^*\n]+?)(?=\n|$)/g, '$1. **$2**');

  // 3. 确保 ## 标题前后有空行
  text = text.replace(/([^\n])\n(##\s)/g, '$1\n\n$2');
  text = text.replace(/(##\s[^\n]+)\n([^#\n])/g, '$1\n\n$2');

  // 4. 清理多余空行（保留最多2个连续空行）
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * 创建简单的SSE流（用于非流式响应）
 */
function createSSEStream(text: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // 将文本按字符分割，模拟流式输出
      const chars = text.split('')
      let index = 0

      const interval = setInterval(() => {
        if (index < chars.length) {
          const char = chars[index]
          controller.enqueue(new TextEncoder().encode(`data: ${char}\n\n`))
          index++
        } else {
          clearInterval(interval)
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      }, 20) // 每20ms发送一个字符
    }
  })
}
