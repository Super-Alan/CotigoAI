import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/router';
import { ARGUMENT_ANALYSIS_PROMPT } from '@/lib/prompts';

// POST /api/arguments/analyze - 分析论点
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '内容不能为空' },
        },
        { status: 400 }
      );
    }

    let textToAnalyze = content;

    // 如果是URL类型,先获取网页内容
    if (type === 'url') {
      try {
        // 使用WebFetch工具获取网页内容
        const urlResponse = await fetch(content, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CotigoAI/1.0)',
          },
        });

        if (!urlResponse.ok) {
          throw new Error('无法访问该网页');
        }

        const html = await urlResponse.text();

        // 简单的文本提取(移除HTML标签)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textContent.length < 100) {
          throw new Error('网页内容太少,无法分析');
        }

        // 限制文本长度
        textToAnalyze = textContent.substring(0, 10000);
      } catch (error) {
        console.error('Fetch URL error:', error);
        return NextResponse.json(
          {
            success: false,
            error: { code: 'FETCH_ERROR', message: '无法获取网页内容,请检查URL是否有效' },
          },
          { status: 400 }
        );
      }
    }

    // 验证文本长度
    if (textToAnalyze.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: '文本内容太短,至少需要50个字符' },
        },
        { status: 400 }
      );
    }

    // 构建AI分析请求
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

    // 调用AI进行分析
    const aiResponse = await aiRouter.chat(messages, { stream: false });

    // 解析AI返回的JSON
    let analysis;
    try {
      // 清理可能的markdown代码块标记
      let cleanedResponse = aiResponse as string;
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      analysis = JSON.parse(cleanedResponse);

      // 验证返回的数据结构
      if (
        !analysis.mainClaim ||
        !Array.isArray(analysis.premises) ||
        !Array.isArray(analysis.evidence) ||
        !Array.isArray(analysis.assumptions) ||
        !analysis.logicalStructure ||
        !Array.isArray(analysis.potentialFallacies) ||
        !analysis.strengthAssessment
      ) {
        throw new Error('AI返回的数据结构不完整');
      }
    } catch (parseError) {
      console.error('Parse AI response error:', parseError);
      console.error('AI Response:', aiResponse);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PARSE_ERROR', message: 'AI返回格式错误,请稍后重试' },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Argument analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '分析失败,请稍后重试' },
      },
      { status: 500 }
    );
  }
}
