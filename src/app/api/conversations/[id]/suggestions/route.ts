import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { aiRouter } from '@/lib/ai/router';
import { prisma } from '@/lib/prisma';

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
    // 支持 Web (NextAuth) 和移动端 (JWT)
    const auth = await requireAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
    }

    const body = await req.json();
    const { question, conversationHistory, roundIndex } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: '问题内容不能为空' },
        { status: 400 }
      );
    }

    // TODO: Enable caching after creating ConversationSuggestedAnswerSet table in schema
    // const existing = await prisma.conversationSuggestedAnswerSet.findFirst({
    //   where: {
    //     conversationId: params.id,
    //     userId: auth.userId!,
    //     question,
    //   },
    // });

    // if (existing) {
    //   return NextResponse.json(existing.suggestions);
    // }

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
为这个AI提问生成2-3个高质量的参考答案，帮助学生理解如何回应。

### 参考答案设计原则：
1. **由浅入深**：从简单直接的回答到更深入的思考
2. **展示不同角度**：提供多元思考路径（如：个人经验、理论分析、反例思考）
3. **体现批判性思维**：质疑假设、寻求证据、换位思考
4. **适配不同水平**：
   - 第1个答案：简单直接，适合初学者，提供思考方向
   - 第2个答案：中等深度，结合例证和分析
   - 第3个答案：深度思考，挑战假设或提出反思

### 答案类型示例：
- **思考方向型**："我觉得可以从...角度来思考这个问题"（适合困惑时）
- **证据探索型**："根据我的观察/经验/了解..."（提供具体依据）
- **假设质疑型**："这个问题背后似乎假设了...，但实际上..."（批判性思维）
- **视角转换型**："如果从另一个角度看..."（多元思维）

请以JSON格式返回：
{
  "suggestions": [
    {
      "id": "1",
      "text": "答案内容",
      "intent": "答案意图说明",
      "difficulty": "simple|moderate|deep"
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

    // TODO: Save to database after creating ConversationSuggestedAnswerSet table
    // await prisma.conversationSuggestedAnswerSet.create({
    //   data: {
    //     conversationId: params.id,
    //     userId: auth.userId!,
    //     question,
    //     suggestions,
    //     roundIndex: typeof roundIndex === 'number' ? roundIndex : null,
    //   },
    // });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('生成建议答案失败:', error);
    return NextResponse.json(
      { error: '生成建议答案时发生错误' },
      { status: 500 }
    );
  }
}
