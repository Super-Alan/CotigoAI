import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';

// 思维类型对应的提示词映射
const THINKING_TYPE_PROMPTS = {
  analytical: `# 分析性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计分析性思维训练题目。

## 核心要求
生成一个分析性思维练习题目，要求学生能够：
1. 识别问题的核心要素和关键信息
2. 运用逻辑推理分析因果关系
3. 从多个角度拆解复杂问题
4. 基于证据得出合理结论

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含具体情境和需要分析的问题）",
  "scenario": "背景情境描述（100-200字，提供分析所需的具体信息）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（帮助学生理解问题）",
      "purpose": "理解与识别"
    },
    {
      "question": "引导问题2（帮助学生分析关系）", 
      "purpose": "分析与推理"
    },
    {
      "question": "引导问题3（帮助学生得出结论）",
      "purpose": "综合与评估"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2", 
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 单一变量分析，明确的因果关系
- intermediate: 多变量分析，需要权衡不同因素
- advanced: 复杂系统分析，涉及多层次相互作用

请生成一个符合中文语境的分析性思维练习题目。`,

  creative: `# 创造性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计创造性思维训练题目。

## 核心要求
生成一个创造性思维练习题目，要求学生能够：
1. 跳出常规思维模式
2. 产生多样化的解决方案
3. 运用想象力和创新思维
4. 整合不同领域的知识和经验

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要创新解决的挑战）",
  "scenario": "背景情境描述（100-200字，提供创新的具体场景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（激发创意思考）",
      "purpose": "发散思维"
    },
    {
      "question": "引导问题2（探索可能性）",
      "purpose": "创新探索"
    },
    {
      "question": "引导问题3（整合方案）",
      "purpose": "方案整合"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 日常生活中的创新改进
- intermediate: 跨领域的创新应用
- advanced: 系统性的创新设计

请生成一个符合中文语境的创造性思维练习题目。`,

  practical: `# 实用性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计实用性思维训练题目。

## 核心要求
生成一个实用性思维练习题目，要求学生能够：
1. 识别现实问题的实际需求
2. 考虑资源限制和实施可行性
3. 制定具体可行的行动方案
4. 评估方案的实际效果和成本

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要解决的实际问题）",
  "scenario": "背景情境描述（100-200字，提供具体的实施环境）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别实际需求）",
      "purpose": "需求分析"
    },
    {
      "question": "引导问题2（评估可行性）",
      "purpose": "可行性评估"
    },
    {
      "question": "引导问题3（制定行动方案）",
      "purpose": "方案制定"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 个人层面的实际问题解决
- intermediate: 团队或组织层面的问题解决
- advanced: 社会或系统层面的复杂问题解决

请生成一个符合中文语境的实用性思维练习题目。`,

  caring: `# 关怀性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计关怀性思维训练题目。

## 核心要求
生成一个关怀性思维练习题目，要求学生能够：
1. 理解和关注他人的感受和需求
2. 考虑决策对不同群体的影响
3. 平衡个人利益与集体福祉
4. 体现同理心和社会责任感

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含涉及关怀和道德考量的情境）",
  "scenario": "背景情境描述（100-200字，提供具体的人际或社会背景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（理解他人感受）",
      "purpose": "同理心培养"
    },
    {
      "question": "引导问题2（分析影响）",
      "purpose": "影响评估"
    },
    {
      "question": "引导问题3（寻求平衡）",
      "purpose": "价值平衡"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 人际关系中的关怀考量
- intermediate: 社区或组织中的关怀决策
- advanced: 社会政策中的关怀伦理

请生成一个符合中文语境的关怀性思维练习题目。`,

  systematic: `# 系统性思维练习题目生成

你是一位专业的批判性思维教育专家，专门为中国学生设计系统性思维训练题目。

## 核心要求
生成一个系统性思维练习题目，要求学生能够：
1. 识别系统中的各个组成部分
2. 理解部分之间的相互关系和影响
3. 从整体角度分析问题
4. 考虑系统的动态变化和反馈机制

## 题目结构要求
请严格按照以下JSON格式返回：

\`\`\`json
{
  "topic": "题目主题（简短描述，50字以内）",
  "content": "题目主要内容（200-400字，包含需要系统性分析的复杂问题）",
  "scenario": "背景情境描述（100-200字，提供系统的具体背景）",
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["标签1", "标签2", "标签3"],
  "guidingQuestions": [
    {
      "question": "引导问题1（识别系统要素）",
      "purpose": "要素识别"
    },
    {
      "question": "引导问题2（分析关系）",
      "purpose": "关系分析"
    },
    {
      "question": "引导问题3（整体思考）",
      "purpose": "整体优化"
    }
  ],
  "expectedOutcomes": [
    "学习成果1",
    "学习成果2",
    "学习成果3"
  ]
}
\`\`\`

## 难度要求
- beginner: 简单系统的基本分析
- intermediate: 复杂系统的多层次分析
- advanced: 动态系统的深度分析

请生成一个符合中文语境的系统性思维练习题目。`
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { difficulty = 'intermediate' } = await request.json();
    const thinkingTypeId = params.id;

    // 验证思维类型
    if (!THINKING_TYPE_PROMPTS[thinkingTypeId as keyof typeof THINKING_TYPE_PROMPTS]) {
      return NextResponse.json({ error: '不支持的思维类型' }, { status: 400 });
    }

    // 获取对应的提示词
    const prompt = THINKING_TYPE_PROMPTS[thinkingTypeId as keyof typeof THINKING_TYPE_PROMPTS];
    
    // 添加难度要求到提示词
    const fullPrompt = `${prompt}\n\n请生成一个难度为 ${difficulty} 的题目。`;

    // 调用AI生成题目
    const aiResponse = await aiRouter.chat(
      [
        {
          role: 'system',
          content: fullPrompt
        },
        {
          role: 'user',
          content: `请为${thinkingTypeId}思维类型生成一个${difficulty}难度的练习题目。`
        }
      ],
      { stream: false }
    );

    if (!aiResponse || typeof aiResponse !== 'string') {
      return NextResponse.json({ error: 'AI生成失败' }, { status: 500 });
    }

    let questionData;
    try {
      // 尝试解析AI响应中的JSON
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[1]);
      } else {
        questionData = JSON.parse(aiResponse);
      }
    } catch (error) {
      console.error('AI响应解析失败:', error);
      return NextResponse.json({ error: 'AI生成题目格式错误' }, { status: 500 });
    }

    // 创建批判性思维题目记录
    const question = await prisma.criticalThinkingQuestion.create({
      data: {
        thinkingTypeId,
        difficulty: questionData.difficulty || difficulty,
        topic: questionData.topic || questionData.content?.substring(0, 100) || '批判性思维练习',
        context: questionData.scenario || questionData.content || '请根据题目要求进行思考和分析',
        question: questionData.question || questionData.content || '请分析这个批判性思维问题',
        tags: questionData.tags || [],
        thinkingFramework: {
          content: questionData.content,
          scenario: questionData.scenario,
          tags: questionData.tags || [],
          guidingQuestions: questionData.guidingQuestions || []
        },
        expectedOutcomes: questionData.expectedOutcomes || []
      }
    });

    // 创建引导问题
    if (questionData.guidingQuestions && questionData.guidingQuestions.length > 0) {
      await prisma.criticalThinkingGuidingQuestion.createMany({
        data: questionData.guidingQuestions.map((gq: any, index: number) => ({
          questionId: question.id,
          level: questionData.difficulty || difficulty,
          stage: gq.purpose || 'general',
          question: gq.question,
          orderIndex: index
        }))
      });
    }

    // 重新获取完整的题目数据（包含引导问题）
    const completeQuestion = await prisma.criticalThinkingQuestion.findUnique({
      where: { id: question.id },
      include: {
        guidingQuestions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { question: completeQuestion }
    });

  } catch (error) {
    console.error('生成批判性思维题目失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}