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
    const { rounds } = body;

    if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
      return NextResponse.json(
        { error: '对话轮次数据不能为空' },
        { status: 400 }
      );
    }

    const dialogueText = rounds.map((round: DialogueRound) =>
      `## 第 ${round.round} 轮对话\n**你的回答**: ${round.userMessage}\n**AI提问**: ${round.aiQuestion}`
    ).join('\n\n');

    const prompt = `你是一位批判性思维教育专家，需要为学生的苏格拉底式对话提供总结和反馈。

## 完整对话记录
${dialogueText}

## 任务
基于以上${rounds.length}轮对话，生成一份综合总结，包括：

### 1. 思维发展轨迹 (100-150字)
分析学生的思考过程如何逐步深入，从最初的观点到后续的反思。

### 2. 批判性思维亮点 (3-5点)
识别学生展现的优秀批判性思维技能：
- 质疑假设的能力
- 寻求证据的意识
- 多角度思考
- 逻辑推理
- 承认不确定性

### 3. 可改进之处 (2-3点)
温和地指出思维盲区或可以更深入探讨的方向。

### 4. 延伸思考建议
提出1-2个相关的深度问题，供学生继续探索。

请用温暖、鼓励的语气，帮助学生认识到自己的成长。

直接返回总结文本，无需JSON格式。`;

    const response = await aiRouter.chat(
      [{ role: 'user', content: prompt }],
      {
        stream: false,
        temperature: 0.7,
        maxTokens: 1500
      }
    );

    const summary = typeof response === 'string' ? response : '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('生成总结失败:', error);
    return NextResponse.json(
      { error: '生成总结时发生错误' },
      { status: 500 }
    );
  }
}
