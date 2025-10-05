import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiRouter } from '@/lib/ai/router';
import { createSocraticQuestionsForPerspective } from '@/lib/prompts';

interface SocraticRequest {
  roleName: string;
  analysis: string;
  issue: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body: SocraticRequest = await request.json();
    const { roleName, analysis, issue } = body;

    if (!roleName || !analysis || !issue) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // Generate Socratic questions using AI
    const prompt = createSocraticQuestionsForPerspective(roleName, analysis, issue);

    const response = await aiRouter.chat(
      [
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        stream: false,
        temperature: 0.7,
        maxTokens: 1000
      }
    );

    // Parse JSON response
    let questions;
    if (typeof response === 'string') {
      try {
        // Remove markdown code blocks if present
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        questions = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('[Socratic Questions] JSON解析失败:', parseError);
        return NextResponse.json({ error: 'AI返回格式错误' }, { status: 500 });
      }
    } else {
      // If response is a stream, read it
      const reader = response.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
      }

      try {
        const cleaned = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        questions = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('[Socratic Questions] JSON解析失败:', parseError);
        return NextResponse.json({ error: 'AI返回格式错误' }, { status: 500 });
      }
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('[Socratic Questions] 生成失败:', error);
    return NextResponse.json({ error: '生成提问时发生错误' }, { status: 500 });
  }
}
