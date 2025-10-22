import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai/router';
import { createPracticePrompt } from '@/lib/prompts';

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { sessionType, preferredTopics } = await request.json(); // difficulty removed

    // 验证输入参数 - 支持5大核心思维维度
    const validSessionTypes = [
      'causal_analysis',        // 多维归因与利弊权衡
      'premise_challenge',      // 前提质疑与方法批判
      'fallacy_detection',      // 谬误检测
      'iterative_reflection',   // 迭代反思
      'connection_transfer',    // 知识迁移
      'mixed',                  // 综合思维
      // 兼容旧类型（逐步废弃）
      'fallacies', 'arguments', 'methodology', 'topics'
    ];
    // difficulty validation removed

    if (!validSessionTypes.includes(sessionType)) {
      return NextResponse.json({ error: '无效的练习类型' }, { status: 400 });
    }

    // difficulty validation removed

    // 获取用户学习数据
    // TODO: Re-enable when userLessonProgress table is created
    const userProgress: any[] = []; // await prisma.userLessonProgress.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { updatedAt: 'desc' },
    //   take: 10
    // });

    // 获取用户最近的练习记录
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    // 分析用户水平和薄弱环节
    const totalSessions = await prisma.practiceSession.count({
      where: { userId: session.user.id }
    });

    let userLevel = 'beginner';
    if (totalSessions > 20) userLevel = 'advanced';
    else if (totalSessions > 5) userLevel = 'intermediate';

    // 分析最近练习的主题
    const recentTopics = recentSessions
      .map(session => session.sessionType)
      .filter((type, index, arr) => arr.indexOf(type) === index)
      .slice(0, 3);

    // 分析薄弱环节（正确率低的类型）
    const weakAreas: string[] = [];
    const sessionTypeStats = recentSessions.reduce((acc, session) => {
      if (!acc[session.sessionType]) {
        acc[session.sessionType] = { correct: 0, total: 0 };
      }
      
      session.questions.forEach(question => {
        acc[session.sessionType].total++;
        if (question.answers.length > 0 && question.answers[0].isCorrect) {
          acc[session.sessionType].correct++;
        }
      });
      
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    Object.entries(sessionTypeStats).forEach(([type, stats]) => {
      if (stats.total > 0 && stats.correct / stats.total < 0.7) {
        weakAreas.push(type);
      }
    });

    // 生成练习题目的提示词
    const prompt = createPracticePrompt(
      sessionType,
      userLevel, // Use userLevel instead of difficulty
      userLevel,
      recentTopics,
      weakAreas
    );

    // 调用AI生成题目
    const aiResponse = await aiRouter.chat([
      {
        role: 'system',
        content: '你是一位专业的批判性思维教育专家。请以JSON格式返回练习题目。'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.7,
      maxTokens: 2000
    });

    let practiceData;
    try {
      const responseText = typeof aiResponse === 'string' ? aiResponse : '';
      practiceData = JSON.parse(responseText);
    } catch (error) {
      console.error('AI响应解析失败:', error);
      return NextResponse.json({ error: 'AI生成题目失败' }, { status: 500 });
    }

    // 创建练习会话
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        sessionType,
        duration: practiceData.estimatedTime || 600,
        totalQuestions: practiceData.questions?.length || 5,
        metadata: JSON.stringify({
          // difficulty removed
          learningObjectives: practiceData.learningObjectives || []
        })
      }
    });

    // 创建练习题目
    const questions = await Promise.all(
      practiceData.questions.map(async (questionData: any, index: number) => {
        return await prisma.practiceQuestion.create({
          data: {
            sessionId: practiceSession.id,
            questionType: questionData.type || 'multiple_choice',
            content: questionData.content || {},
            options: questionData.options || null,
            correctAnswer: questionData.correctAnswer || '',
            explanation: questionData.explanation || {},
            difficulty: questionData.difficulty || 3,
            sourceContent: questionData.sourceContent || null
          }
        });
      })
    );

    // 返回生成的练习数据
    const metadata = practiceSession.metadata as any || {};
    return NextResponse.json({
      sessionId: practiceSession.id,
      sessionType: practiceSession.sessionType,
      // difficulty removed from metadata
      estimatedTime: practiceSession.duration,
      learningObjectives: metadata.learningObjectives || [],
      questions: questions.map(q => ({
        id: q.id,
        type: q.questionType,
        content: q.content,
        options: q.options,
        difficulty: q.difficulty // Note: This is PracticeQuestion difficulty (numeric), not CriticalThinkingQuestion difficulty
      })),
      nextSteps: practiceData.nextSteps || ''
    });

  } catch (error: any) {
    console.error('生成练习题目失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}