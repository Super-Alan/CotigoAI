import { NextRequest } from 'next/server';
import { aiRouter } from '@/lib/ai/router';
import { ARGUMENT_ANALYSIS_PROMPT } from '@/lib/prompts';

/**
 * 流式论点分析 API
 * 逐步返回分析结果，提供更好的用户体验
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content } = body;

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: '内容不能为空'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let textToAnalyze = content;

    // 如果是URL类型，先获取网页内容
    if (type === 'url') {
      try {
        const urlResponse = await fetch(content, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CotigoAI/1.0)',
          },
          signal: AbortSignal.timeout(10000) // 10秒超时
        });

        if (!urlResponse.ok) {
          throw new Error('无法访问该网页');
        }

        const html = await urlResponse.text();
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textContent.length < 100) {
          throw new Error('网页内容太少，无法分析');
        }

        textToAnalyze = textContent.substring(0, 10000);
      } catch (error) {
        return new Response(
          JSON.stringify({
            type: 'error',
            error: '无法获取网页内容，请检查URL是否有效'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (textToAnalyze.trim().length < 50) {
      return new Response(
        JSON.stringify({
          type: 'error',
          error: '文本内容太短，至少需要50个字符'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const encoder = new TextEncoder();

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. 发送初始化消息
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'init',
                message: '开始分析论点结构...'
              }) + '\n'
            )
          );

          // 2. 发送文本预处理状态
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'progress',
                stage: 'preprocessing',
                message: '正在预处理文本内容...',
                progress: 10
              }) + '\n'
            )
          );

          await new Promise(resolve => setTimeout(resolve, 300));

          // 3. 调用AI进行分析（使用流式）
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'progress',
                stage: 'analyzing',
                message: '正在进行深度逻辑分析...',
                progress: 20
              }) + '\n'
            )
          );

          const messages = [
            {
              role: 'system' as const,
              content: ARGUMENT_ANALYSIS_PROMPT,
            },
            {
              role: 'user' as const,
              content: `请分析以下文本:\n\n${textToAnalyze}`,
            },
          ];

          const aiResponse = await aiRouter.chat(messages, {
            stream: true,
            temperature: 0.3, // 降低温度以获得更一致的JSON输出
            maxTokens: 3000
          });

          let fullText = '';
          let progress = 30;

          // 处理流式响应 - 实时流式输出AI分析内容
          if (typeof aiResponse === 'string') {
            fullText = aiResponse;
            // 非流式响应，一次性发送
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'stream',
                  content: aiResponse,
                  progress: 90
                }) + '\n'
              )
            );
          } else {
            const reader = aiResponse.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk;

              // 实时发送AI生成的内容块
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'stream',
                    content: chunk,
                    progress: Math.min(90, 30 + (fullText.length / 50))
                  }) + '\n'
                )
              );
            }
          }

          // 4. 解析AI返回的JSON
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'progress',
                stage: 'parsing',
                message: '正在整理分析结果...',
                progress: 95
              }) + '\n'
            )
          );

          let analysis;
          try {
            let cleanedResponse = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleanedResponse);

            // 验证数据结构
            if (
              !analysis.mainClaim ||
              !Array.isArray(analysis.premises) ||
              !Array.isArray(analysis.evidence) ||
              !Array.isArray(analysis.assumptions) ||
              !analysis.logicalStructure ||
              !Array.isArray(analysis.potentialFallacies) ||
              !analysis.strengthAssessment
            ) {
              throw new Error('数据结构不完整');
            }
          } catch (parseError) {
            console.error('[Arguments Stream] 解析错误:', parseError);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'error',
                  error: 'AI返回格式错误，请稍后重试'
                }) + '\n'
              )
            );
            controller.close();
            return;
          }

          // 5. 逐步发送各个分析维度
          const dimensions = [
            { key: 'mainClaim', name: '核心论点', icon: '🎯', progress: 96 },
            { key: 'premises', name: '支撑前提', icon: '📋', progress: 97 },
            { key: 'evidence', name: '证据支撑', icon: '📊', progress: 98 },
            { key: 'assumptions', name: '隐含假设', icon: '🔍', progress: 99 },
            { key: 'logicalStructure', name: '逻辑结构', icon: '🧩', progress: 100 },
            { key: 'potentialFallacies', name: '潜在谬误', icon: '⚠️', progress: 100 },
            { key: 'strengthAssessment', name: '综合评估', icon: '✨', progress: 100 }
          ];

          for (const dim of dimensions) {
            await new Promise(resolve => setTimeout(resolve, 200));

            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'dimension',
                  dimension: dim.key,
                  name: dim.name,
                  icon: dim.icon,
                  data: analysis[dim.key],
                  progress: dim.progress
                }) + '\n'
              )
            );
          }

          // 6. 发送完成消息
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'complete',
                analysis,
                message: '分析完成！'
              }) + '\n'
            )
          );

          controller.close();
        } catch (error) {
          console.error('[Arguments Stream] 错误:', error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                error: '分析失败，请稍后重试'
              }) + '\n'
            )
          );
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
    console.error('[Arguments Stream] 外部错误:', error);
    return new Response(
      JSON.stringify({
        type: 'error',
        error: '服务器错误，请稍后重试'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
