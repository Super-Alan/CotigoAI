import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, userAnswer, thinkingTypeId } = body;

    // Get question details
    const question = await prisma.criticalThinkingQuestion.findUnique({
      where: { id: questionId },
      include: {
        guidingQuestions: true,
        thinkingType: true
      }
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '题目不存在'
          }
        },
        { status: 404 }
      );
    }

    // Prepare AI evaluation prompt
    const evaluationPrompt = `
作为批判性思维专家，请评估用户对以下${question.thinkingType.name}练习题的回答：

题目内容：${question.topic}
情境描述：${question.context}

引导问题：
${question.guidingQuestions.map((gq, index) => `${index + 1}. ${gq.question}`).join('\n')}

用户回答：${userAnswer}

请从以下维度进行评估：
1. 思维深度 (1-10分)：回答是否深入分析了问题的本质
2. 逻辑性 (1-10分)：推理过程是否清晰、连贯
3. 批判性 (1-10分)：是否体现了批判性思维的特点
4. 完整性 (1-10分)：是否全面回应了题目要求
5. 创新性 (1-10分)：是否提出了独特的见解或解决方案

请以JSON格式返回评估结果：
{
  "scores": {
    "depth": 数字,
    "logic": 数字,
    "critical": 数字,
    "completeness": 数字,
    "innovation": 数字
  },
  "overallScore": 数字,
  "feedback": "详细的反馈意见",
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"],
  "isCorrect": true/false
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "你是一位专业的批判性思维教育专家，擅长评估和指导学生的思维能力发展。请提供建设性和鼓励性的反馈。"
          },
          {
            role: "user",
            content: evaluationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('AI evaluation failed');
      }

      // Parse AI response
      const evaluation = JSON.parse(aiResponse);

      // Update user progress
      const currentProgress = await prisma.criticalThinkingProgress.findUnique({
        where: {
          userId_thinkingTypeId: {
            userId: session.user.id,
            thinkingTypeId
          }
        }
      });

      const newQuestionsCompleted = (currentProgress?.questionsCompleted || 0) + 1;
      const newTotalScore = (currentProgress?.averageScore || 0) * (currentProgress?.questionsCompleted || 0) + evaluation.overallScore;
      const newAverageScore = newTotalScore / newQuestionsCompleted;

      await prisma.criticalThinkingProgress.upsert({
        where: {
          userId_thinkingTypeId: {
            userId: session.user.id,
            thinkingTypeId
          }
        },
        update: {
          questionsCompleted: { increment: 1 },
          averageScore: newAverageScore,
          lastUpdated: new Date()
        },
        create: {
          userId: session.user.id,
          thinkingTypeId,
          questionsCompleted: 1,
          averageScore: evaluation.overallScore,
          progressPercentage: 0,
          lastUpdated: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          evaluation,
          question: {
            id: question.id,
            topic: question.topic,
            thinkingType: question.thinkingType.name
          }
        }
      });

    } catch (aiError) {
      console.error('AI evaluation error:', aiError);
      
      // Fallback evaluation
      const fallbackEvaluation = {
        scores: {
          depth: 7,
          logic: 7,
          critical: 7,
          completeness: 7,
          innovation: 6
        },
        overallScore: 68,
        feedback: "感谢您的回答！由于技术原因，暂时无法提供详细的AI评估，但您的思考过程已被记录。请继续练习以提升批判性思维能力。",
        strengths: ["积极参与练习", "认真思考问题"],
        improvements: ["可以尝试从多个角度分析问题", "加强逻辑推理的严密性"],
        isCorrect: true
      };

      return NextResponse.json({
        success: true,
        data: {
          evaluation: fallbackEvaluation,
          question: {
            id: question.id,
            topic: question.topic,
            thinkingType: question.thinkingType.name
          }
        }
      });
    }

  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EVALUATION_ERROR',
          message: '评估回答失败'
        }
      },
      { status: 500 }
    );
  }
}