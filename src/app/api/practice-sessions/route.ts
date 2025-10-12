import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';

// GET /api/practice-sessions - 获取练习会话历史
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sessionType = searchParams.get('sessionType');
    const thinkingTypeId = searchParams.get('thinkingTypeId');

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };
    if (sessionType) {
      where.sessionType = sessionType;
    }

    // 获取练习会话
    const sessions = await prisma.practiceSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    // 获取总数
    const total = await prisma.practiceSession.count({ where });

    // 如果指定了思维类型，也获取相关的批判性思维练习
    let criticalThinkingSessions: any[] = [];
    if (thinkingTypeId) {
      criticalThinkingSessions = await prisma.criticalThinkingPracticeSession.findMany({
        where: {
          userId,
          question: {
            thinkingTypeId
          }
        },
        orderBy: { completedAt: 'desc' },
        take: limit,
        include: {
          question: {
            include: {
              thinkingType: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        sessionType: session.sessionType,
        score: session.score,
        questionsCount: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        createdAt: session.createdAt,
        duration: session.duration,
        questions: session.questions.map(q => ({
          id: q.id,
          question: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userAnswer: q.answers[0]?.answer || null,
          isCorrect: q.answers[0]?.isCorrect || false
        }))
      })),
      criticalThinkingSessions: criticalThinkingSessions.map(session => ({
        id: session.id,
        thinkingType: session.question.thinkingType,
        score: session.score,
        questionsCount: 1,
        completedAt: session.completedAt,
        timeSpent: session.timeSpent,
        question: {
          id: session.question.id,
          topic: session.question.topic,
          context: session.question.context,
          question: session.question.question,
          answers: session.answers,
          feedback: session.aiFeedback
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取练习会话失败:', error);
    return NextResponse.json(
      { error: '获取练习会话失败' },
      { status: 500 }
    );
  }
}

// POST /api/practice-sessions - 创建新的练习会话
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const {
      sessionType,
      thinkingTypeId,
      difficulty = 'medium',
      questionsCount = 5,
      topics = []
    } = await request.json();

    const userId = session.user.id;

    if (thinkingTypeId) {
      // 批判性思维练习：从现有题库中随机选择一个问题
      const availableQuestions = await prisma.criticalThinkingQuestion.findMany({
        where: {
          thinkingTypeId,
          difficulty: difficulty === 'easy' ? 'beginner' : difficulty === 'hard' ? 'advanced' : 'intermediate'
        },
        take: 10 // 获取10个候选
      });

      if (availableQuestions.length === 0) {
        return NextResponse.json(
          { error: '没有可用的批判性思维题目' },
          { status: 404 }
        );
      }

      // 随机选择一个问题
      const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

      // 创建批判性思维练习会话（单个问题）
      const practiceSession = await prisma.criticalThinkingPracticeSession.create({
        data: {
          userId,
          questionId: selectedQuestion.id,
          answers: {}, // 初始为空
          timeSpent: 0
        },
        include: {
          question: {
            include: {
              thinkingType: true,
              guidingQuestions: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: practiceSession.id,
          type: 'critical_thinking',
          question: {
            id: selectedQuestion.id,
            topic: selectedQuestion.topic,
            context: selectedQuestion.context,
            question: selectedQuestion.question,
            thinkingFramework: selectedQuestion.thinkingFramework,
            expectedOutcomes: selectedQuestion.expectedOutcomes,
            guidingQuestions: practiceSession.question.guidingQuestions
          },
          thinkingType: practiceSession.question.thinkingType
        }
      });

    } else {
      // 创建普通练习会话
      const practiceSession = await prisma.practiceSession.create({
        data: {
          userId,
          sessionType: sessionType || 'general',
          totalQuestions: questionsCount,
          score: 0,
          correctAnswers: 0
        }
      });

      // 生成AI题目
      const questions = await generatePracticeQuestions(
        sessionType,
        difficulty,
        questionsCount,
        topics
      );

      // 保存题目
      const savedQuestions = await Promise.all(
        questions.map(async (q: any) => {
          return await prisma.practiceQuestion.create({
            data: {
              sessionId: practiceSession.id,
              questionType: q.questionType || 'multiple_choice',
              content: q.content || q.question, // 兼容性
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: typeof q.difficulty === 'number' ? q.difficulty : 3
            }
          });
        })
      );

      return NextResponse.json({
        success: true,
        session: {
          id: practiceSession.id,
          type: 'practice',
          sessionType,
          questions: savedQuestions.map(q => ({
            id: q.id,
            questionType: q.questionType,
            content: q.content,
            options: q.options,
            // 不返回正确答案给前端
            explanation: q.explanation,
            difficulty: q.difficulty
          }))
        }
      });
    }

  } catch (error) {
    console.error('创建练习会话失败:', error);
    return NextResponse.json(
      { error: '创建练习会话失败' },
      { status: 500 }
    );
  }
}

// 生成批判性思维题目
async function generateCriticalThinkingQuestions(
  thinkingTypeId: string,
  difficulty: string,
  count: number,
  topics: string[]
) {
  try {
    // 获取思维类型信息
    const thinkingType = await prisma.thinkingType.findUnique({
      where: { id: thinkingTypeId }
    });

    if (!thinkingType) {
      throw new Error('思维类型不存在');
    }

    const prompt = `
请为"${thinkingType.name}"这个批判性思维维度生成${count}道${difficulty}难度的练习题。

思维维度描述：${thinkingType.description}

要求：
1. 题目应该测试学生在${thinkingType.name}方面的能力
2. 难度等级：${difficulty}
3. 每道题包含4个选项，只有一个正确答案
4. 提供详细的解释说明
5. 题目要有实际应用价值

${topics.length > 0 ? `重点关注以下主题：${topics.join(', ')}` : ''}

请返回JSON格式：
[
  {
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": 0,
    "explanation": "详细解释",
    "difficulty": "${difficulty}",
    "tags": ["标签1", "标签2"]
  }
]
`;

    const response = await aiRouter.chat({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen-plus'
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI生成失败');
    }

    // 解析JSON响应
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanedContent);

    return questions;

  } catch (error) {
    console.error('生成批判性思维题目失败:', error);
    // 返回默认题目
    return [{
      question: `请分析以下情况中体现的${thinkingType?.name || '批判性思维'}问题`,
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctAnswer: 0,
      explanation: '这是一个示例题目，请联系管理员配置AI服务。',
      difficulty,
      tags: ['示例']
    }];
  }
}

// 生成普通练习题目
async function generatePracticeQuestions(
  sessionType: string,
  difficulty: string,
  count: number,
  topics: string[]
) {
  try {
    const prompt = `
请为"${sessionType}"类型的练习生成${count}道${difficulty}难度的题目。

要求：
1. 题目类型：${sessionType}
2. 难度等级：${difficulty}
3. 每道题包含4个选项，只有一个正确答案
4. 提供详细的解释说明

${topics.length > 0 ? `重点关注以下主题：${topics.join(', ')}` : ''}

请返回JSON格式：
[
  {
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": 0,
    "explanation": "详细解释",
    "difficulty": "${difficulty}",
    "category": "${sessionType}"
  }
]
`;

    const response = await aiRouter.chat({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen-plus'
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI生成失败');
    }

    // 解析JSON响应
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanedContent);

    return questions;

  } catch (error) {
    console.error('生成练习题目失败:', error);
    // 返回默认题目
    return [{
      question: `这是一道关于${sessionType}的练习题`,
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctAnswer: 0,
      explanation: '这是一个示例题目，请联系管理员配置AI服务。',
      difficulty,
      category: sessionType
    }];
  }
}