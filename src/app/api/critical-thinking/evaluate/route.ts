import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiRouter } from '@/lib/ai/router';
import type { ChatMessage } from '@/types';

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

    // Prepare AI evaluation prompt with specific analysis requirements
    const evaluationPrompt = `
你是一位资深的批判性思维导师，正在评估学生对【${question.thinkingType.name}】练习题的回答。请进行深入、具体的分析。

【题目信息】
题目：${question.topic}
情境：${question.context}

【引导问题】
${question.guidingQuestions.map((gq, index) => `${index + 1}. ${gq.question}`).join('\n')}

【学生回答】
${userAnswer}

【评估要求】
作为批判性思维导师，你必须：
1. **引用具体内容**：从学生回答中引用具体的句子或论点进行分析
2. **指出思维问题**：明确指出逻辑漏洞、前提缺陷、论证不足等具体问题
3. **提供可操作建议**：告诉学生"如何改进"，而不是泛泛而谈
4. **避免通用评语**：禁止使用"积极参与"、"认真思考"等空洞表述

【评分维度】（总分100分，各维度权重如下）
- 批判性 (25分满分)：是否质疑前提？是否考虑反例？是否避免了常见谬误？
- 逻辑性 (25分满分)：推理链条是否完整？前提-论证-结论是否清晰？
- 思维深度 (20分满分)：是否触及问题本质？是否有深层分析？
- 完整性 (20分满分)：是否回应了所有引导问题？是否考虑了多个维度？
- 创新性 (10分满分)：是否有独特视角？是否超越了常规思路？

【评分规则】
1. 各维度独立评分，不能超过该维度的最高分
2. 总分 = 批判性得分 + 逻辑性得分 + 思维深度得分 + 完整性得分 + 创新性得分
3. 总分必然在0-100分之间

【输出格式】（必须严格遵循JSON格式）
{
  "scores": {
    "critical": 数字(0-25),
    "logic": 数字(0-25),
    "depth": 数字(0-20),
    "completeness": 数字(0-20),
    "innovation": 数字(0-10)
  },
  "feedback": "【具体分析】引用学生的具体论点，指出其优点和问题所在。必须包含：1) 你注意到...（引用原文） 2) 这里的问题是...（指出具体缺陷） 3) 更好的做法是...（可操作建议）",
  "strengths": [
    "【具体优点1】引用原文，说明为什么好（例如：'你提到的XXX论点，体现了...思维能力，因为...'）",
    "【具体优点2】必须包含具体引用和分析"
  ],
  "improvements": [
    "【具体改进1】指出具体问题+改进方向（例如：'在分析XXX时，你忽略了YYY因素，建议补充ZZZ方面的论证'）",
    "【具体改进2】必须是可操作的具体建议，而非泛泛而谈"
  ],
  "isCorrect": true/false（这道题是否有标准答案？批判性思维题通常没有唯一答案）
}

【示例输出】
{
  "scores": {
    "critical": 12,      // 批判性：25分满分，得12分
    "logic": 18,         // 逻辑性：25分满分，得18分
    "depth": 12,         // 思维深度：20分满分，得12分
    "completeness": 14,  // 完整性：20分满分，得14分
    "innovation": 5      // 创新性：10分满分，得5分
  },
  "feedback": "你提到'社交媒体让人们更容易获取信息'这个观点，但没有质疑'获取信息'与'理解信息'的区别。在论证时，你假设了'信息获取=知识增长'，这是一个需要警惕的前提。建议：1) 区分信息的量与质 2) 考虑信息过载的负面影响 3) 分析算法推荐可能导致的信息茧房效应",
  "strengths": [
    "你明确区分了'相关性'和'因果性'，例如在分析'在线教育普及率上升'与'学生成绩提高'的关系时，指出了可能存在的混淆变量（家庭经济条件），这体现了良好的因果分析能力",
    "你考虑了反例情况，例如提到'并非所有人都能平等使用社交媒体'，这种多角度思考值得肯定"
  ],
  "improvements": [
    "在论证'技术进步带来教育公平'时，你只列举了支持证据（如在线课程普及），但没有考虑反驳观点（如数字鸿沟加剧不平等）。建议补充：技术可及性差异、城乡教育资源分配等维度的分析",
    "你的结论'社交媒体总体上是积极的'过于绝对。批判性思维要求避免非黑即白的判断。建议改为：'在特定条件下（如用户具备媒介素养、平台有效监管），社交媒体的积极作用可能大于消极影响'，并说明这些前提条件"
  ],
  "isCorrect": true
}

现在请严格按照以上要求，对学生回答进行具体、深入的评估：
`;

    try {
      // 使用统一的AI路由接口
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `你是一位资深的批判性思维导师，拥有20年教学经验。你的评估风格是：
1. 具体而非抽象：必须引用学生的原话，指出具体的思维问题
2. 深入而非表面：挖掘逻辑漏洞、前提缺陷、论证不足
3. 可操作而非泛泛：告诉学生"如何改进"，提供明确步骤
4. 严谨而非敷衍：绝不使用"积极参与"、"认真思考"等空洞评语

你的目标是培养学生的批判性思维能力，而非简单地打分或鼓励。每一条反馈都必须有理有据，帮助学生看到自己思维的盲点。`
        },
        {
          role: "user",
          content: evaluationPrompt
        }
      ];

      const aiResponse = await aiRouter.chat(messages, {
        temperature: 0.7,
        maxTokens: 1500
      }) as string;

      if (!aiResponse) {
        throw new Error('AI evaluation failed');
      }

      // Parse AI response
      const aiEvaluation = JSON.parse(aiResponse);

      // 加权百分制：各维度分数直接使用，总分为各维度之和
      const dimensionScores = {
        critical: Math.round(aiEvaluation.scores?.critical || 0),     // 满分25
        logic: Math.round(aiEvaluation.scores?.logic || 0),           // 满分25
        depth: Math.round(aiEvaluation.scores?.depth || 0),           // 满分20
        completeness: Math.round(aiEvaluation.scores?.completeness || 0), // 满分20
        innovation: Math.round(aiEvaluation.scores?.innovation || 0), // 满分10
      };

      // 总分 = 各维度之和（最高100分）
      const overallScore =
        dimensionScores.critical +
        dimensionScores.logic +
        dimensionScores.depth +
        dimensionScores.completeness +
        dimensionScores.innovation;

      const evaluation = {
        score: overallScore, // 百分制总分 (0-100) = 各维度之和
        scores: dimensionScores,
        feedback: aiEvaluation.feedback,
        strengths: Array.isArray(aiEvaluation.strengths)
          ? aiEvaluation.strengths.join('\n')
          : aiEvaluation.strengths || '',
        improvements: Array.isArray(aiEvaluation.improvements)
          ? aiEvaluation.improvements.join('\n')
          : aiEvaluation.improvements || '',
        suggestions: [], // Legacy field, not used
        keyLearnings: '', // Legacy field, not used
      };

      // ✅ 进度更新已移至 /api/critical-thinking/progress/update-level
      // 该API只负责评估答案，不修改进度数据，避免与 update-level 产生冲突

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

      // Fallback evaluation - 加权百分制
      const fallbackEvaluation = {
        score: 61, // 百分制总分 (0-100) = 各维度之和
        scores: {
          critical: 15,      // 满分25，得15分
          logic: 18,         // 满分25，得18分
          depth: 12,         // 满分20，得12分
          completeness: 12,  // 满分20，得12分
          innovation: 4,     // 满分10，得4分
        },
        feedback: `由于技术原因，暂时无法提供详细的AI评估。建议您：
1. 对照引导问题，检查是否全面回应了每一个问题
2. 检查论证的逻辑链条：前提-推理-结论是否完整
3. 考虑是否有反例或其他角度未被考虑
4. 质疑自己的假设前提是否合理

您的回答已被记录，系统恢复后可以重新请求评估。`,
        strengths: `回答了题目要求的主要问题
提供了自己的观点和思考`,
        improvements: `建议重新审视论证的逻辑严密性
可以考虑补充更多具体案例或证据支持论点
尝试从多个角度分析问题（支持、反对、条件限制）`,
        suggestions: [],
        keyLearnings: ''
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