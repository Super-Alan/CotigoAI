/**
 * AI 导师教学引擎
 * 基于认知科学和个性化学习理论
 */

import { UserLevel, GuidanceLevel, TeachingStrategy, selectTeachingStrategy, generateTutorSystemPrompt } from '../prompts/ai-tutor-prompts'

// ============ 用户画像 ============

export interface UserProfile {
  userId: string

  // 当前水平
  currentLevel: UserLevel

  // 5大维度掌握度 (0-1)
  dimensionMastery: {
    causal_analysis: number
    premise_challenge: number
    fallacy_detection: number
    iterative_reflection: number
    connection_transfer: number
  }

  // 学习偏好
  preferences: {
    pace: 'slow' | 'moderate' | 'fast'
    guidanceLevel: 'high' | 'medium' | 'low'
    topicInterests: string[]
  }

  // 认知特征
  cognitiveProfile: {
    averageResponseTime: number     // 平均回答时间（秒）
    stuckFrequency: number          // 卡住频率 (0-1)
    commonMistakePatterns: string[] // 常见错误模式
    preferredExampleTypes: string[] // 偏好的例子类型
  }

  // 学习历史
  learningHistory: {
    totalSessions: number
    totalQuestions: number
    averagePerformance: number
    lastSessionDate: Date | null
  }
}

// ============ 问题分析 ============

export interface QuestionAnalysis {
  // 问题类型
  type: 'causal_analysis' | 'premise_challenge' | 'fallacy_detection' |
        'iterative_reflection' | 'connection_transfer' | 'mixed'

  // 难度评估
  difficulty: {
    conceptualDepth: number      // 概念深度 1-5
    reasoningSteps: number       // 推理步骤数
    domainKnowledge: string[]    // 需要的领域知识
    cognitiveLoad: number        // 认知负荷评分 0-1
  }

  // 用户意图
  intent: 'learning' | 'clarification' | 'challenge' | 'stuck'

  // 相关标签
  tags: string[]

  // 关联的批判性思维维度
  thinkingDimensions: string[]
}

// ============ 对话状态 ============

export interface ConversationState {
  sessionId: string
  questionId: string

  // 当前进度
  currentTurn: number
  totalTurns: number

  // 教学状态
  teachingPhase: 'introduction' | 'exploration' | 'challenge' | 'consolidation' | 'reflection'

  // 用户状态
  userEngagement: number        // 参与度 0-1
  userStuckCount: number        // 连续卡住次数
  userConfidenceLevel: number   // 自信程度 0-1

  // 对话历史摘要
  keyPoints: string[]           // 已讨论的关键点
  unresolvedQuestions: string[] // 尚未解决的问题
}

// ============ 教学引擎核心类 ============

export class TeachingEngine {
  /**
   * 分析问题特征
   */
  static analyzeQuestion(questionContent: string, tags: string[]): QuestionAnalysis {
    // 基于关键词和标签识别问题类型
    const typeKeywords = {
      causal_analysis: ['因果', '导致', '原因', '结果', '影响', '相关性', '因果关系'],
      premise_challenge: ['前提', '假设', '基于', '前提条件', '隐含', '默认'],
      fallacy_detection: ['谬误', '逻辑错误', '论证漏洞', '推理', '谬论'],
      iterative_reflection: ['反思', '改进', '回顾', '元认知', '思维模式'],
      connection_transfer: ['类比', '迁移', '应用', '相似', '借鉴']
    }

    let type: QuestionAnalysis['type'] = 'mixed'
    let maxScore = 0

    for (const [key, keywords] of Object.entries(typeKeywords)) {
      const score = keywords.filter(kw =>
        questionContent.includes(kw) || tags.some(tag => tag.includes(kw))
      ).length

      if (score > maxScore) {
        maxScore = score
        type = key as QuestionAnalysis['type']
      }
    }

    // 评估难度
    const wordCount = questionContent.length
    const complexity = this.estimateComplexity(questionContent)

    return {
      type,
      difficulty: {
        conceptualDepth: complexity.depth,
        reasoningSteps: complexity.steps,
        domainKnowledge: this.extractDomainKnowledge(questionContent, tags),
        cognitiveLoad: complexity.load
      },
      intent: this.inferIntent(questionContent),
      tags,
      thinkingDimensions: type === 'mixed' ? Object.keys(typeKeywords) : [type]
    }
  }

  /**
   * 估算问题复杂度
   */
  private static estimateComplexity(content: string): {
    depth: number
    steps: number
    load: number
  } {
    // 简化的复杂度估算算法
    const length = content.length
    const hasMultipleQuestions = (content.match(/[？?]/g) || []).length > 1
    const hasConditionals = /如果|假设|假定|若|倘若/.test(content)
    const hasComparisons = /比较|对比|相比|而/.test(content)

    let depth = 2 // 基础深度
    let steps = 2 // 基础步骤

    if (length > 200) depth += 1
    if (hasMultipleQuestions) steps += 1
    if (hasConditionals) { depth += 1; steps += 1 }
    if (hasComparisons) steps += 1

    depth = Math.min(5, depth)
    steps = Math.min(6, steps)

    const load = (depth / 5) * 0.6 + (steps / 6) * 0.4

    return { depth, steps, load }
  }

  /**
   * 提取领域知识
   */
  private static extractDomainKnowledge(content: string, tags: string[]): string[] {
    const domains: string[] = []

    const domainKeywords = {
      '经济学': ['经济', '市场', '供需', '价格', 'GDP'],
      '政治学': ['政策', '政府', '民主', '权力', '法律'],
      '科技': ['技术', '人工智能', 'AI', '算法', '数据'],
      '环境': ['环境', '气候', '生态', '污染', '可持续'],
      '教育': ['教育', '学习', '学校', '教师', '学生'],
      '伦理': ['伦理', '道德', '价值', '公平', '正义']
    }

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => content.includes(kw) || tags.includes(kw))) {
        domains.push(domain)
      }
    }

    return domains
  }

  /**
   * 推断用户意图
   */
  private static inferIntent(content: string): QuestionAnalysis['intent'] {
    if (/不懂|不明白|什么意思|解释/.test(content)) return 'clarification'
    if (/挑战|质疑|反驳|不同意/.test(content)) return 'challenge'
    if (/卡住|困惑|不知道/.test(content)) return 'stuck'
    return 'learning'
  }

  /**
   * 生成教学策略
   */
  static generateStrategy(
    userProfile: UserProfile,
    questionAnalysis: QuestionAnalysis,
    conversationState: ConversationState
  ): TeachingStrategy {
    const strategy = selectTeachingStrategy(
      userProfile.currentLevel,
      questionAnalysis.difficulty.cognitiveLoad,
      conversationState.userStuckCount
    )

    // 根据用户偏好微调
    if (userProfile.preferences.guidanceLevel === 'high' && strategy.guidanceLevel > 1) {
      strategy.guidanceLevel = (strategy.guidanceLevel - 1) as GuidanceLevel
      strategy.hintAvailable = true
    }

    return strategy
  }

  /**
   * 生成完整的 System Prompt
   */
  static generateSystemPrompt(
    userProfile: UserProfile,
    questionAnalysis: QuestionAnalysis,
    conversationState: ConversationState,
    questionContent: string,
    conversationHistory?: string
  ): string {
    const strategy = this.generateStrategy(userProfile, questionAnalysis, conversationState)

    return generateTutorSystemPrompt(
      userProfile.currentLevel,
      questionAnalysis.type,
      questionContent,
      strategy,
      conversationHistory
    )
  }

  /**
   * 评估用户回答质量（简化版）
   */
  static evaluateResponse(userResponse: string): {
    quality: number // 0-1
    indicators: {
      depth: number
      reasoning: boolean
      examples: boolean
      criticalThinking: boolean
    }
  } {
    const length = userResponse.length
    const hasReasoning = /因为|所以|由于|因此|假设|如果/.test(userResponse)
    const hasExamples = /例如|比如|就像|类似/.test(userResponse)
    const hasCriticalThinking = /但是|然而|不过|另一方面|质疑|假设/.test(userResponse)

    let quality = 0.5 // 基础分

    if (length > 50) quality += 0.1
    if (length > 150) quality += 0.1
    if (hasReasoning) quality += 0.15
    if (hasExamples) quality += 0.1
    if (hasCriticalThinking) quality += 0.15

    quality = Math.min(1, quality)

    return {
      quality,
      indicators: {
        depth: Math.min(5, Math.floor(length / 50)),
        reasoning: hasReasoning,
        examples: hasExamples,
        criticalThinking: hasCriticalThinking
      }
    }
  }

  /**
   * 更新对话状态
   */
  static updateConversationState(
    currentState: ConversationState,
    userResponse: string,
    aiResponse: string
  ): ConversationState {
    const evaluation = this.evaluateResponse(userResponse)

    // 判断是否卡住
    const isStuck = userResponse.length < 20 || evaluation.quality < 0.3

    return {
      ...currentState,
      currentTurn: currentState.currentTurn + 1,
      userStuckCount: isStuck ? currentState.userStuckCount + 1 : 0,
      userEngagement: this.calculateEngagement(currentState, userResponse),
      userConfidenceLevel: evaluation.quality,
      teachingPhase: this.determinePhase(currentState.currentTurn, currentState.totalTurns)
    }
  }

  /**
   * 计算用户参与度
   */
  private static calculateEngagement(
    state: ConversationState,
    response: string
  ): number {
    const baseEngagement = state.userEngagement || 0.7
    const responseLength = response.length

    let engagement = baseEngagement

    if (responseLength > 100) engagement += 0.1
    else if (responseLength < 20) engagement -= 0.1

    return Math.max(0, Math.min(1, engagement))
  }

  /**
   * 确定教学阶段
   */
  private static determinePhase(
    currentTurn: number,
    totalTurns: number
  ): ConversationState['teachingPhase'] {
    const progress = currentTurn / (totalTurns || 10)

    if (progress < 0.2) return 'introduction'
    if (progress < 0.5) return 'exploration'
    if (progress < 0.75) return 'challenge'
    if (progress < 0.9) return 'consolidation'
    return 'reflection'
  }
}

// ============ 用户画像管理器 ============

export class UserProfileManager {
  /**
   * 创建新用户画像
   */
  static createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      currentLevel: 'intermediate', // 默认中级
      dimensionMastery: {
        causal_analysis: 0.5,
        premise_challenge: 0.5,
        fallacy_detection: 0.5,
        iterative_reflection: 0.5,
        connection_transfer: 0.5
      },
      preferences: {
        pace: 'moderate',
        guidanceLevel: 'medium',
        topicInterests: []
      },
      cognitiveProfile: {
        averageResponseTime: 60,
        stuckFrequency: 0.3,
        commonMistakePatterns: [],
        preferredExampleTypes: ['daily_life', 'current_events']
      },
      learningHistory: {
        totalSessions: 0,
        totalQuestions: 0,
        averagePerformance: 0.5,
        lastSessionDate: null
      }
    }
  }

  /**
   * 基于历史数据更新用户画像
   */
  static updateProfile(
    profile: UserProfile,
    sessionData: {
      dimension: string
      performance: number
      responseTime: number
      wasStuck: boolean
    }
  ): UserProfile {
    const updated = { ...profile }

    // 更新维度掌握度 (加权平均)
    if (sessionData.dimension in updated.dimensionMastery) {
      const dim = sessionData.dimension as keyof typeof updated.dimensionMastery
      updated.dimensionMastery[dim] =
        updated.dimensionMastery[dim] * 0.7 + sessionData.performance * 0.3
    }

    // 更新认知特征
    updated.cognitiveProfile.averageResponseTime =
      updated.cognitiveProfile.averageResponseTime * 0.8 + sessionData.responseTime * 0.2

    // 更新学习历史
    updated.learningHistory.totalSessions += 1
    updated.learningHistory.totalQuestions += 1
    updated.learningHistory.averagePerformance =
      updated.learningHistory.averagePerformance * 0.8 + sessionData.performance * 0.2
    updated.learningHistory.lastSessionDate = new Date()

    // 动态调整用户水平
    updated.currentLevel = this.assessLevel(updated)

    return updated
  }

  /**
   * 评估用户水平
   */
  private static assessLevel(profile: UserProfile): UserLevel {
    const avgMastery = Object.values(profile.dimensionMastery)
      .reduce((sum, val) => sum + val, 0) / 5

    if (avgMastery >= 0.7) return 'advanced'
    if (avgMastery >= 0.4) return 'intermediate'
    return 'beginner'
  }
}
