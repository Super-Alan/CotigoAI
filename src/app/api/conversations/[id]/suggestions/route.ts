import { NextRequest, NextResponse } from 'next/server';
import { aiRouter } from '@/lib/ai/router';

interface DialogueRound {
  round: number;
  userMessage: string;
  aiQuestion: string;
  timestamp: Date;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { question, conversationHistory } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: '问题内容不能为空' },
        { status: 400 }
      );
    }

    const historyContext = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((round: DialogueRound) =>
          `轮次${round.round}:\n用户: ${round.userMessage}\nAI: ${round.aiQuestion}`
        ).join('\n\n')
      : '这是对话的开始';

    const prompt = `你是一位批判性思维教练，正在辅导学生进行苏格拉底式对话。

## 对话历史
${historyContext}

## 当前AI提问
${question}

## 任务
为这个AI提问生成2-3个高质量的参考答案，帮助学生理解如何回应。每个答案应该：
1. 展示不同的思考角度
2. 体现批判性思维
3. 引导更深入的探讨

同时，简要说明每个答案的意图（如：探索假设、提供证据、换位思考等）。

请以JSON格式返回：
{
  "suggestions": [
    {
      "id": "1",
      "text": "答案内容",
      "intent": "这个答案的意图说明"
    }
  ]
}`;

    const response = await aiRouter.chat(
      [{ role: 'user', content: prompt }],
      {
        stream: false,
        temperature: 0.8,
        maxTokens: 1000
      }
    );

    let suggestions;
    if (typeof response === 'string') {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleaned);
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('生成建议答案失败:', error);
    return NextResponse.json(
      { error: '生成建议答案时发生错误' },
      { status: 500 }
    );
  }
}
