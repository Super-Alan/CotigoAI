import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiRouter } from '@/lib/ai/router'
import { TeachingEngine, UserProfileManager, type UserProfile, type ConversationState } from '@/lib/ai-tutor/teaching-engine'

/**
 * AI 导师聊天 API
 * POST /api/ai-tutor/chat
 *
 * 功能：
 * - 接收用户问题和对话历史
 * - 分析问题类型和难度
 * - 动态生成教学策略
 * - 调用 AI 服务并返回流式响应
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: '请先登录'
      }, { status: 401 })
    }

    const body = await request.json()
    const {
      questionId,         // 来自每日问题或用户自定义
      questionContent,    // 问题内容
      userMessage,        // 用户当前的回复
      conversationHistory = [], // 对话历史 [{role, content}]
      tags = [],          // 问题标签
      thinkingDimension,  // 指定的思维维度（可选）
      requestedAction     // 快捷操作：hint, mindmap, summary等
    } = body

    // 验证必填字段
    if (!questionContent || !userMessage) {
      return NextResponse.json({
        success: false,
        message: '缺少必填字段: questionContent, userMessage'
      }, { status: 400 })
    }

    // 1. 获取或创建用户画像
    const userProfile = await getUserProfile(session.user.id)

    // 2. 分析问题特征
    const questionAnalysis = TeachingEngine.analyzeQuestion(
      questionContent,
      tags
    )

    // 如果指定了思维维度，覆盖分析结果
    if (thinkingDimension) {
      questionAnalysis.type = thinkingDimension
    }

    // 3. 获取或创建对话状态
    const conversationState: ConversationState = {
      sessionId: questionId || `session_${Date.now()}`,
      questionId: questionId || '',
      currentTurn: conversationHistory.length,
      totalTurns: 10, // 预估总轮次
      teachingPhase: 'exploration',
      userEngagement: 0.7,
      userStuckCount: 0,
      userConfidenceLevel: 0.5,
      keyPoints: [],
      unresolvedQuestions: []
    }

    // 4. 处理快捷操作
    if (requestedAction) {
      return handleQuickAction(
        requestedAction,
        userMessage,
        conversationHistory,
        questionContent
      )
    }

    // 5. 评估用户回答（用于动态调整策略）
    const evaluation = TeachingEngine.evaluateResponse(userMessage)

    // 更新对话状态
    const updatedState = {
      ...conversationState,
      userStuckCount: evaluation.quality < 0.3 ? conversationState.userStuckCount + 1 : 0,
      userConfidenceLevel: evaluation.quality
    }

    // 6. 生成教学策略和 System Prompt
    const systemPrompt = TeachingEngine.generateSystemPrompt(
      userProfile,
      questionAnalysis,
      updatedState,
      questionContent,
      formatConversationHistory(conversationHistory)
    )

    // 7. 构建完整的消息历史
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ]

    // 8. 调用 AI 服务（流式响应）
    const stream = await aiRouter.chat(messages, {
      stream: true,
      model: (process.env.ACTIVE_AI_MODEL as 'deepseek-v3.1' | 'qwen3-max') || 'deepseek-v3.1',
      temperature: 0.7,  // 略微提高创造性
      maxTokens: 800     // 控制回复长度
    })

    // 9. 创建 SSE 流式响应
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // aiRouter.chat() 返回 ReadableStream，需要转换为可读流
          if (stream instanceof ReadableStream) {
            const reader = stream.getReader()
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              // 解码并发送数据块
              const chunk = decoder.decode(value, { stream: true })
              const data = `data: ${JSON.stringify({ content: chunk })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }

          // 发送完成信号（包含元数据）
          const doneData = `data: ${JSON.stringify({
            done: true,
            metadata: {
              questionAnalysis: {
                type: questionAnalysis.type,
                difficulty: questionAnalysis.difficulty.cognitiveLoad,
                tags: questionAnalysis.tags
              },
              userEvaluation: evaluation,
              teachingPhase: updatedState.teachingPhase,
              guidanceLevel: userProfile.currentLevel
            }
          })}\n\n`
          controller.enqueue(encoder.encode(doneData))

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('AI Tutor Chat Error:', error)
    return NextResponse.json({
      success: false,
      message: '处理请求失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * 获取用户画像（简化版，实际应该从数据库获取）
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // TODO: 从数据库获取用户画像
  // 这里暂时返回默认画像
  return UserProfileManager.createDefaultProfile(userId)
}

/**
 * 格式化对话历史
 */
function formatConversationHistory(history: any[]): string {
  if (!history || history.length === 0) {
    return '这是对话的开始'
  }

  return history
    .map((msg, idx) => {
      const speaker = msg.role === 'user' ? '学习者' : 'AI导师'
      return `${speaker}: ${msg.content}`
    })
    .join('\n\n')
}

/**
 * 处理快捷操作
 */
async function handleQuickAction(
  action: string,
  userMessage: string,
  conversationHistory: any[],
  questionContent: string
): Promise<Response> {
  const { HINT_GENERATION_PROMPT, MINDMAP_GENERATION_PROMPT, SUMMARY_GENERATION_PROMPT } = await import('@/lib/prompts/ai-tutor-prompts')

  let systemPrompt = ''
  let userPrompt = ''

  switch (action) {
    case 'hint':
      systemPrompt = HINT_GENERATION_PROMPT
      userPrompt = `问题：${questionContent}\n\n对话历史：\n${formatConversationHistory(conversationHistory)}\n\n用户当前困惑：${userMessage}`
      break

    case 'mindmap':
      systemPrompt = MINDMAP_GENERATION_PROMPT
      userPrompt = `问题：${questionContent}\n\n对话历史：\n${formatConversationHistory(conversationHistory)}`
      break

    case 'summary':
      systemPrompt = SUMMARY_GENERATION_PROMPT
      userPrompt = `问题：${questionContent}\n\n对话历史：\n${formatConversationHistory(conversationHistory)}`
      break

    case 'reframe':
      systemPrompt = '从一个完全不同的角度重新框定这个问题，提供一个新的思考视角。'
      userPrompt = `原问题：${questionContent}\n\n当前思路：${userMessage}`
      break

    case 'validate':
      systemPrompt = '作为批判性思维专家，评估用户的思路：指出亮点和需要改进的地方，但不直接给出答案。'
      userPrompt = `问题：${questionContent}\n\n用户思路：${userMessage}`
      break

    case 'resources':
      systemPrompt = '推荐与当前讨论相关的学习资源和知识点，帮助深入理解。'
      userPrompt = `问题：${questionContent}\n\n已讨论内容：\n${formatConversationHistory(conversationHistory)}`
      break

    default:
      return NextResponse.json({ success: false, message: '未知的操作类型' }, { status: 400 })
  }

  // 调用 AI 获取快捷操作结果（非流式）
  try {
    const result = await aiRouter.analyze(userPrompt, systemPrompt, {
      model: (process.env.ACTIVE_AI_MODEL as 'deepseek-v3.1' | 'qwen3-max') || 'deepseek-v3.1'
    })

    // 确保返回字符串而不是对象
    const resultText = typeof result === 'string'
      ? result
      : result?.raw || JSON.stringify(result, null, 2)

    return NextResponse.json({
      success: true,
      action,
      result: resultText
    })
  } catch (error) {
    console.error('Quick action error:', error)
    return NextResponse.json({
      success: false,
      message: '快捷操作失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
