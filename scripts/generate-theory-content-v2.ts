#!/usr/bin/env tsx
/**
 * AI驱动的批判性思维理论体系内容生成器 V2
 * 
 * 改进功能：
 * - 内容质量验证机制
 * - 批量生成和错误处理
 * - 进度跟踪和日志记录
 * - 自动重试机制
 * - 数据安全保护
 * 
 * 使用：npx tsx scripts/generate-theory-content-v2.ts
 */

import { PrismaClient } from '@prisma/client'
import { aiRouter } from '../src/lib/ai/router'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// 五大思维维度配置（基于新的TheoryContent模型）
const THINKING_DIMENSIONS = [
  {
    id: 'causal_analysis',
    name: '多维归因与利弊权衡',
    description: '识别复杂问题的多重原因，权衡不同方案的利弊得失',
    focus: '系统性思维、因果关系、多角度分析'
  },
  {
    id: 'premise_challenge',
    name: '前提质疑与方法批判',
    description: '识别论证中的隐含前提，质疑其合理性，并重新框定问题',
    focus: '隐含假设、前提识别、批判性质疑'
  },
  {
    id: 'fallacy_detection',
    name: '谬误检测',
    description: '识别常见逻辑谬误，理解其危害，并学会避免这些思维陷阱',
    focus: '逻辑谬误、认知偏差、论证缺陷'
  },
  {
    id: 'iterative_reflection',
    name: '迭代反思',
    description: '培养元认知能力，识别思维模式，并持续改进思维质量',
    focus: '元认知、自我反思、思维模式'
  },
  {
    id: 'connection_transfer',
    name: '知识迁移',
    description: '识别深层结构相似性，实现知识和技能的跨领域迁移',
    focus: '结构相似性、类比推理、跨领域应用'
  }
]

// 每个维度特定的Level配置
const DIMENSION_LEVELS = {
  causal_analysis: [
    {
      level: 1,
      title: '基础识别',
      difficulty: 'beginner',
      cognitiveLoad: '低',
      description: '识别单一原因和简单利弊关系',
      learningGoals: '掌握基本的因果识别方法，能够识别问题的主要原因和基本利弊',
      objectives: [
        '理解因果关系的基本概念',
        '识别问题的主要原因',
        '掌握简单的利弊分析方法'
      ]
    },
    {
      level: 2,
      title: '变量控制',
      difficulty: 'beginner',
      cognitiveLoad: '中等',
      description: '控制变量分析因果关系，理解单一变量的影响',
      learningGoals: '学会控制变量的方法，能够分析单一因素对结果的影响',
      objectives: [
        '掌握控制变量的基本方法',
        '分析单一因素的影响',
        '理解变量间的基本关系'
      ]
    },
    {
      level: 3,
      title: '多因素归因',
      difficulty: 'intermediate',
      cognitiveLoad: '中高',
      description: '分析多重原因的相互作用和复合影响',
      learningGoals: '掌握多因素分析方法，理解因素间的相互作用和权重分配',
      objectives: [
        '分析多个因素的相互作用',
        '理解因素间的权重关系',
        '掌握复合影响的分析方法'
      ]
    },
    {
      level: 4,
      title: '因果网络构建',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '构建复杂的因果关系网络，理解系统性影响',
      learningGoals: '能够构建完整的因果网络图，进行系统性的影响分析',
      objectives: [
        '构建复杂的因果关系网络',
        '进行系统性影响分析',
        '理解网络效应和反馈循环'
      ]
    },
    {
      level: 5,
      title: '创新应用',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '跨领域应用因果分析，创新性解决复杂问题',
      learningGoals: '能够将因果分析方法迁移到新领域，创造性地解决复杂问题',
      objectives: [
        '实现因果分析的跨领域迁移',
        '创新性解决复杂问题',
        '开发新的分析框架'
      ]
    }
  ],
  premise_challenge: [
    {
      level: 1,
      title: '前提识别',
      difficulty: 'beginner',
      cognitiveLoad: '低',
      description: '识别论证中明显的前提假设和基本假定',
      learningGoals: '能够识别论证中的显性前提，理解前提在论证中的作用',
      objectives: [
        '识别论证中的显性前提',
        '理解前提的基本概念',
        '掌握前提识别的基本方法'
      ]
    },
    {
      level: 2,
      title: '隐含前提发现',
      difficulty: 'beginner',
      cognitiveLoad: '中等',
      description: '发现论证中隐藏的假设和未明说的前提',
      learningGoals: '掌握发现隐含前提的方法，能够识别论证中的隐性假设',
      objectives: [
        '发现隐藏的假设',
        '识别未明说的前提',
        '理解隐含前提的作用'
      ]
    },
    {
      level: 3,
      title: '前提合理性评估',
      difficulty: 'intermediate',
      cognitiveLoad: '中高',
      description: '评估前提假设的合理性和可靠性',
      learningGoals: '能够系统性地评估前提的合理性，判断假设的可信度',
      objectives: [
        '评估前提的合理性',
        '判断假设的可信度',
        '掌握前提评估的标准'
      ]
    },
    {
      level: 4,
      title: '方法论批判',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '质疑分析方法本身，批判思维框架的局限性',
      learningGoals: '能够批判性地审视分析方法，识别方法论的局限性',
      objectives: [
        '批判分析方法的局限性',
        '识别思维框架的盲点',
        '掌握方法论批判的技巧'
      ]
    },
    {
      level: 5,
      title: '重新框定问题',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '从根本上重新定义问题，突破原有思维框架',
      learningGoals: '能够重新构建问题框架，从全新角度理解和解决问题',
      objectives: [
        '重新构建问题框架',
        '突破原有思维限制',
        '创新性地定义问题'
      ]
    }
  ],
  fallacy_detection: [
    {
      level: 1,
      title: '基础谬误识别',
      difficulty: 'beginner',
      cognitiveLoad: '低',
      description: '识别常见的逻辑谬误类型和基本错误模式',
      learningGoals: '能够识别基础的逻辑谬误，理解谬误的基本特征',
      objectives: [
        '识别常见的逻辑谬误',
        '理解谬误的基本特征',
        '掌握谬误识别的基本方法'
      ]
    },
    {
      level: 2,
      title: '谬误分类',
      difficulty: 'beginner',
      cognitiveLoad: '中等',
      description: '理解不同类型谬误的特点和分类体系',
      learningGoals: '掌握谬误分类方法，能够准确归类不同类型的谬误',
      objectives: [
        '理解谬误的分类体系',
        '掌握不同类型谬误的特点',
        '能够准确归类谬误'
      ]
    },
    {
      level: 3,
      title: '复合谬误分析',
      difficulty: 'intermediate',
      cognitiveLoad: '中高',
      description: '分析复杂的谬误组合和多重错误推理',
      learningGoals: '能够分析复合谬误，理解多重错误推理的复杂性',
      objectives: [
        '分析复合谬误的结构',
        '理解多重错误推理',
        '掌握复杂谬误的识别方法'
      ]
    },
    {
      level: 4,
      title: '谬误预防',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '主动避免思维陷阱，建立防范谬误的思维习惯',
      learningGoals: '能够主动预防谬误，建立严谨的思维习惯和检查机制',
      objectives: [
        '建立谬误预防机制',
        '培养严谨的思维习惯',
        '掌握自我检查的方法'
      ]
    },
    {
      level: 5,
      title: '谬误纠正',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '帮助他人识别和纠正谬误，进行建设性的思维指导',
      learningGoals: '能够指导他人识别谬误，提供有效的思维纠正建议',
      objectives: [
        '指导他人识别谬误',
        '提供建设性的纠正建议',
        '培养思维教练能力'
      ]
    }
  ],
  iterative_reflection: [
    {
      level: 1,
      title: '思维觉察',
      difficulty: 'beginner',
      cognitiveLoad: '低',
      description: '意识到自己的思维过程，开始关注思维活动',
      learningGoals: '能够意识到自己的思维过程，开始进行基础的思维观察',
      objectives: [
        '意识到自己的思维过程',
        '开始关注思维活动',
        '培养思维观察的习惯'
      ]
    },
    {
      level: 2,
      title: '思维模式识别',
      difficulty: 'beginner',
      cognitiveLoad: '中等',
      description: '识别个人思维习惯和常用的思维模式',
      learningGoals: '能够识别自己的思维习惯，理解个人思维模式的特点',
      objectives: [
        '识别个人思维习惯',
        '理解思维模式的特点',
        '掌握模式识别的方法'
      ]
    },
    {
      level: 3,
      title: '思维质量评估',
      difficulty: 'intermediate',
      cognitiveLoad: '中高',
      description: '评估思维过程的有效性和思维结果的质量',
      learningGoals: '能够客观评估思维质量，识别思维过程中的优缺点',
      objectives: [
        '评估思维过程的有效性',
        '识别思维的优缺点',
        '掌握质量评估的标准'
      ]
    },
    {
      level: 4,
      title: '思维策略调整',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '根据反思结果改进思维方法和策略',
      learningGoals: '能够基于反思调整思维策略，持续改进思维方法',
      objectives: [
        '调整思维策略',
        '改进思维方法',
        '建立持续改进机制'
      ]
    },
    {
      level: 5,
      title: '元认知掌控',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '熟练运用元认知技能，实现思维的自主调控',
      learningGoals: '能够熟练运用元认知技能，实现思维的高效自主管理',
      objectives: [
        '熟练运用元认知技能',
        '实现思维自主调控',
        '掌握高效思维管理'
      ]
    }
  ],
  connection_transfer: [
    {
      level: 1,
      title: '表面相似性识别',
      difficulty: 'beginner',
      cognitiveLoad: '低',
      description: '识别不同情境中表面的相似特征和共同点',
      learningGoals: '能够识别表面相似性，发现不同情境的共同特征',
      objectives: [
        '识别表面相似特征',
        '发现情境的共同点',
        '掌握相似性识别方法'
      ]
    },
    {
      level: 2,
      title: '结构相似性发现',
      difficulty: 'beginner',
      cognitiveLoad: '中等',
      description: '发现不同领域间深层的结构相似性',
      learningGoals: '能够识别深层结构相似性，理解抽象的共同模式',
      objectives: [
        '发现深层结构相似性',
        '理解抽象的共同模式',
        '掌握结构分析方法'
      ]
    },
    {
      level: 3,
      title: '类比推理',
      difficulty: 'intermediate',
      cognitiveLoad: '中高',
      description: '运用类比方法进行推理和问题解决',
      learningGoals: '能够运用类比推理，通过相似性进行有效推理',
      objectives: [
        '运用类比方法推理',
        '通过相似性解决问题',
        '掌握类比推理技巧'
      ]
    },
    {
      level: 4,
      title: '跨领域应用',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '将已有知识和技能应用到全新的领域',
      learningGoals: '能够实现知识的跨领域迁移，在新领域中应用已有技能',
      objectives: [
        '实现知识跨领域迁移',
        '在新领域应用已有技能',
        '掌握迁移应用方法'
      ]
    },
    {
      level: 5,
      title: '创新性迁移',
      difficulty: 'advanced',
      cognitiveLoad: '高',
      description: '创造性地组合和迁移知识，产生创新解决方案',
      learningGoals: '能够创新性地组合知识，产生原创性的解决方案',
      objectives: [
        '创新性组合知识',
        '产生原创解决方案',
        '掌握创新迁移技能'
      ]
    }
  ]
}

// 获取特定维度的Level配置
function getDimensionLevels(dimensionId: string) {
  return DIMENSION_LEVELS[dimensionId as keyof typeof DIMENSION_LEVELS] || DIMENSION_LEVELS.causal_analysis
}

// 获取特定维度和Level的配置
function getLevelInfo(dimensionId: string, level: number) {
  const levels = getDimensionLevels(dimensionId)
  return levels.find(l => l.level === level) || levels[0]
}

// 内容生成配置
const GENERATION_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  batchSize: 1, // 一次处理一个内容，确保质量
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  backupEnabled: true,
  validationEnabled: true
}

// 日志记录器
class Logger {
  private logFile: string
  
  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.logFile = path.join(process.cwd(), 'logs', `theory-generation-${timestamp}.log`)
    
    // 确保日志目录存在
    const logDir = path.dirname(this.logFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }
  
  private writeLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    }
    
    const logLine = JSON.stringify(logEntry) + '\n'
    fs.appendFileSync(this.logFile, logLine)
    
    // 同时输出到控制台
    if (level === 'error') {
      console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '')
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '')
    } else if (GENERATION_CONFIG.logLevel === 'debug' || level === 'info') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '')
    }
  }
  
  debug(message: string, data?: any) { this.writeLog('debug', message, data) }
  info(message: string, data?: any) { this.writeLog('info', message, data) }
  warn(message: string, data?: any) { this.writeLog('warn', message, data) }
  error(message: string, data?: any) { this.writeLog('error', message, data) }
}

const logger = new Logger()

// 内容质量验证器和字数统计器
class ContentValidator {
  static validateConceptsContent(content: any): { isValid: boolean; errors: string[]; stats: any } {
    const errors: string[] = []
    
    // 结构性验证（保留）
    if (!content.title) {
      errors.push('标题缺失')
    }
    
    if (!content.introduction) {
      errors.push('引言缺失')
    }
    
    if (!content.sections || !Array.isArray(content.sections) || content.sections.length < 2) {
      errors.push('章节数量不足（需要至少2个章节）')
    }
    
    content.sections?.forEach((section: any, index: number) => {
      if (!section.heading) {
        errors.push(`第${index + 1}个章节标题缺失`)
      }
      if (!section.content) {
        errors.push(`第${index + 1}个章节内容缺失`)
      }
      if (!section.keyPoints || section.keyPoints.length < 2) {
        errors.push(`第${index + 1}个章节要点不足（需要至少2个要点）`)
      }
    })
    
    if (!content.summary) {
      errors.push('总结缺失')
    }
    
    // 字数统计
    const stats = this.getConceptsStats(content)
    
    return { isValid: errors.length === 0, errors, stats }
  }
  
  static validateModelsContent(content: any): { isValid: boolean; errors: string[]; stats: any } {
    const errors: string[] = []
    
    // 结构性验证（保留）
    if (!content.frameworkName) {
      errors.push('框架名称缺失')
    }
    
    if (!content.introduction) {
      errors.push('框架介绍缺失')
    }
    
    if (!content.steps || !Array.isArray(content.steps) || content.steps.length < 4) {
      errors.push('步骤数量不足（需要4-6个步骤）')
    }
    
    if (content.steps && content.steps.length > 6) {
      errors.push('步骤数量过多（最多6个步骤）')
    }
    
    content.steps?.forEach((step: any, index: number) => {
      if (!step.description) {
        errors.push(`第${index + 1}个步骤描述缺失`)
      }
      if (!step.tips) {
        errors.push(`第${index + 1}个步骤缺少实用技巧`)
      }
      if (!step.commonMistakes) {
        errors.push(`第${index + 1}个步骤缺少常见错误说明`)
      }
    })
    
    if (!content.applicationExample) {
      errors.push('应用示例缺失')
    }
    
    // 字数统计
    const stats = this.getModelsStats(content)
    
    return { isValid: errors.length === 0, errors, stats }
  }
  
  static validateDemonstrationsContent(content: any): { isValid: boolean; errors: string[]; stats: any } {
    const errors: string[] = []
    
    // 结构性验证（保留）
    if (!content.scenario) {
      errors.push('情境描述缺失')
    }
    
    if (!content.goodAnalysis?.content) {
      errors.push('优秀分析示例缺失')
    }
    
    if (!content.poorAnalysis?.content) {
      errors.push('错误分析示例缺失')
    }
    
    if (!content.expertCommentary) {
      errors.push('专家点评缺失')
    }
    
    if (!content.keyLessons || content.keyLessons.length < 3) {
      errors.push('关键启示不足（需要至少3个启示）')
    }
    
    // 字数统计
    const stats = this.getDemonstrationsStats(content)
    
    return { isValid: errors.length === 0, errors, stats }
  }
  
  // 字数统计方法
  static getConceptsStats(content: any) {
    const stats: any = {
      title: content.title?.length || 0,
      introduction: content.introduction?.length || 0,
      sections: content.sections?.map((section: any, index: number) => ({
        index: index + 1,
        heading: section.heading?.length || 0,
        content: section.content?.length || 0,
        keyPointsCount: section.keyPoints?.length || 0,
        examplesCount: section.examples?.length || 0
      })) || [],
      summary: content.summary?.length || 0,
      nextSteps: content.nextSteps?.length || 0,
      totalSections: content.sections?.length || 0
    }
    
    const totalContentLength = stats.sections.reduce((sum: number, section: any) => sum + section.content, 0)
    stats.totalContentLength = totalContentLength
    
    return stats
  }
  
  static getModelsStats(content: any) {
    const stats: any = {
      frameworkName: content.frameworkName?.length || 0,
      introduction: content.introduction?.length || 0,
      steps: content.steps?.map((step: any, index: number) => ({
        index: index + 1,
        step: step.step?.length || 0,
        description: step.description?.length || 0,
        tips: step.tips?.length || 0,
        commonMistakes: step.commonMistakes?.length || 0,
        example: step.example?.length || 0
      })) || [],
      applicationExample: content.applicationExample?.length || 0,
      whenToUse: content.whenToUse?.length || 0,
      totalSteps: content.steps?.length || 0
    }
    
    const totalStepDescriptions = stats.steps.reduce((sum: number, step: any) => sum + step.description, 0)
    stats.totalStepDescriptions = totalStepDescriptions
    
    return stats
  }
  
  static getDemonstrationsStats(content: any) {
    const stats = {
      scenario: content.scenario?.length || 0,
      question: content.question?.length || 0,
      goodAnalysis: {
        title: content.goodAnalysis?.title?.length || 0,
        content: content.goodAnalysis?.content?.length || 0,
        strengthsCount: content.goodAnalysis?.strengths?.length || 0,
        appliedConceptsCount: content.goodAnalysis?.appliedConcepts?.length || 0
      },
      poorAnalysis: {
        title: content.poorAnalysis?.title?.length || 0,
        content: content.poorAnalysis?.content?.length || 0,
        problemsCount: content.poorAnalysis?.problems?.length || 0,
        missedPointsCount: content.poorAnalysis?.missedPoints?.length || 0
      },
      expertCommentary: content.expertCommentary?.length || 0,
      keyLessonsCount: content.keyLessons?.length || 0,
      reflectionQuestionsCount: content.reflectionQuestions?.length || 0
    }
    
    return stats
  }
  
  static validateContent(contentType: string, content: any): { isValid: boolean; errors: string[]; stats?: any } {
    switch (contentType) {
      case 'concepts':
        return this.validateConceptsContent(content)
      case 'models':
        return this.validateModelsContent(content)
      case 'demonstrations':
        return this.validateDemonstrationsContent(content)
      default:
        return { isValid: false, errors: ['未知内容类型'] }
    }
  }
}

// AI内容生成提示词
const PROMPTS = {
  concepts: (dimension: typeof THINKING_DIMENSIONS[0], levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0]) => `
你是一位资深的批判性思维教育专家和课程设计师，擅长将复杂的思维理论转化为易于理解的学习内容。

请为以下批判性思维维度和Level设计详细的概念讲解内容：

**思维维度**: ${dimension.name}
**维度描述**: ${dimension.description}
**核心关注**: ${dimension.focus}

**Level**: ${levelInfo.level} - ${levelInfo.title}
**难度**: ${levelInfo.difficulty}
**Level描述**: ${levelInfo.description}
**学习目标**: ${levelInfo.learningGoals}

请严格按照以下JSON格式输出（不要包含其他文字说明）：

{
  "title": "概念标题（简洁明确）",
  "introduction": "引言（200-300字，激发学习兴趣）",
  "sections": [
    {
      "heading": "核心概念1",
      "content": "详细解释（500-800字）",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "examples": ["简短示例1", "简短示例2"]
    },
    {
      "heading": "核心概念2",
      "content": "详细解释",
      "keyPoints": ["要点"],
      "examples": ["示例"]
    }
  ],
  "summary": "总结（150-200字，强化关键学习点）",
  "nextSteps": "下一步学习建议（指向下一个Level或相关内容）"
}

要求：
1. 语言通俗易懂，适合高中生及以上水平
2. 概念解释要准确、深入但不过于学术化
3. 提供具体的生活化例子帮助理解
4. 层次清晰，逻辑连贯
5. 紧扣当前Level的认知负荷和学习目标
6. 中文表达自然流畅
`.trim(),

  models: (dimension: typeof THINKING_DIMENSIONS[0], levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0]) => `
你是一位批判性思维方法论专家，擅长设计实用的思维分析工具和框架。

请为以下维度和Level设计结构化的分析框架：

**思维维度**: ${dimension.name}
**核心关注**: ${dimension.focus}
**Level**: ${levelInfo.level} - ${levelInfo.title}
**难度**: ${levelInfo.difficulty}

**严格要求（必须遵守）**：
- 必须包含4-6个完整的操作步骤（绝对不能少于4个步骤）
- 每个步骤的description字段必须达到300-400字（约150-200个汉字）
- 框架introduction必须达到250-300字（约125-150个汉字）
- applicationExample必须达到600-800字（约300-400个汉字）
- 步骤之间要有清晰的逻辑递进关系
- 每个步骤都要包含具体的操作指导和实例

**字数检查标准**：
- introduction: 最少250字，建议280字左右
- 每个步骤description: 最少300字，建议350字左右
- applicationExample: 最少600字，建议700字左右

请严格按照以下JSON格式输出：

{
  "frameworkName": "框架名称（简洁、好记）",
  "frameworkType": "框架类型（如：矩阵分析、流程图、检查清单等）",
  "introduction": "框架介绍（250-300字，详细说明框架的用途、适用场景和核心价值）",
  "steps": [
    {
      "step": "步骤1：[具体步骤名称]",
      "description": "详细操作说明（300-400字，包含：具体做什么、如何做、为什么这样做、预期结果是什么）",
      "tips": "实用技巧和注意事项（具体可操作的建议）",
      "commonMistakes": "常见错误和避免方法（具体的错误类型和纠正方式）",
      "example": "简短示例（展示该步骤的具体应用）"
    },
    {
      "step": "步骤2：[具体步骤名称]",
      "description": "详细操作说明（300-400字）",
      "tips": "实用技巧和注意事项",
      "commonMistakes": "常见错误和避免方法",
      "example": "简短示例"
    },
    {
      "step": "步骤3：[具体步骤名称]",
      "description": "详细操作说明（300-400字）",
      "tips": "实用技巧和注意事项",
      "commonMistakes": "常见错误和避免方法",
      "example": "简短示例"
    },
    {
      "step": "步骤4：[具体步骤名称]",
      "description": "详细操作说明（300-400字）",
      "tips": "实用技巧和注意事项",
      "commonMistakes": "常见错误和避免方法",
      "example": "简短示例"
    }
  ],
  "visualization": {
    "type": "图表类型（flowchart/mindmap/matrix/checklist）",
    "description": "可视化描述（详细说明如何绘制图表，包含具体的元素和连接关系）"
  },
  "applicationExample": "完整应用示例（600-800字，展示框架的完整使用过程，包含每个步骤的具体应用）",
  "whenToUse": "适用场景说明（具体的使用条件和情境）",
  "relatedFrameworks": ["相关框架1", "相关框架2"]
}

**质量检查要点**：
1. 【字数要求】确保包含4-6个步骤，每个步骤description达到300-400字
2. 【字数要求】introduction达到250-300字，applicationExample达到600-800字
3. 【内容要求】框架要实用、易操作，不能过于抽象
4. 【逻辑要求】步骤清晰，逻辑严密，有明确的递进关系
5. 【实用性】提供具体的使用技巧和注意事项
6. 【适用性】应用示例要贴近学生生活或学习场景
7. 【复杂度】符合当前Level的复杂度要求
8. 【表达】语言表达清晰、准确、易懂

**特别提醒**：AI模型必须严格按照字数要求生成内容，不得偷工减料！
`.trim(),

  demonstrations: (dimension: typeof THINKING_DIMENSIONS[0], levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0]) => `
你是一位批判性思维案例分析专家，擅长通过对比展示来帮助学习者理解概念。

请为以下维度和Level设计典型的对比案例：

**思维维度**: ${dimension.name}
**核心关注**: ${dimension.focus}
**Level**: ${levelInfo.level} - ${levelInfo.title}

**严格要求（必须遵守）**：
- scenario字段必须达到500-600字（约250-300个汉字）
- goodAnalysis.content字段必须达到700-900字（约350-450个汉字）
- poorAnalysis.content字段必须达到600-800字（约300-400个汉字）
- expertCommentary字段必须达到500-600字（约250-300个汉字）
- 必须包含具体的人物、场景、冲突和细节描述
- 错误分析要展示完整的错误推理链条和具体问题点

**字数检查标准**：
- scenario: 最少500字，建议550字左右
- goodAnalysis.content: 最少700字，建议800字左右
- poorAnalysis.content: 最少600字，建议700字左右
- expertCommentary: 最少500字，建议550字左右

请严格按照以下JSON格式输出：

{
  "scenario": "情境描述（500-600字，必须包含：具体的人物背景、详细的场景设置、明确的问题冲突、相关的背景信息、具体的时间地点等要素，使读者能够完全理解情境的复杂性）",
  "question": "核心思考问题（明确、具体、有挑战性）",
  "goodAnalysis": {
    "title": "优秀分析示例",
    "content": "详细分析过程（700-900字，展示完整的思维过程，包含每个分析步骤的具体推理）",
    "strengths": ["优点1：具体说明为什么这是优点", "优点2：具体说明", "优点3：具体说明"],
    "appliedConcepts": ["应用的概念1：说明如何应用", "应用的概念2：说明如何应用"]
  },
  "poorAnalysis": {
    "title": "常见错误分析",
    "content": "错误的分析过程（600-800字，必须详细展示：错误的思维起点、错误的推理步骤、错误的结论、为什么会犯这些错误、错误思维的具体表现）",
    "problems": ["问题1：具体的错误类型和表现", "问题2：具体说明", "问题3：具体说明"],
    "missedPoints": ["遗漏的要点1：说明为什么重要", "遗漏的要点2：说明影响"]
  },
  "expertCommentary": "专家点评（500-600字，深入对比两种分析的差异，指出关键的思维差别，解释为什么好的分析更有效）",
  "keyLessons": [
    "启示1：具体的可操作建议和方法",
    "启示2：具体的思维改进策略",
    "启示3：具体的实践指导"
  ],
  "reflectionQuestions": [
    "反思问题1：引导深度思考的问题",
    "反思问题2：促进自我检视的问题"
  ]
}

**质量检查要点**：
1. 【字数要求】scenario必须达到500-600字，内容丰富、具体、有代入感
2. 【字数要求】goodAnalysis.content必须达到700-900字，展示完整思维过程
3. 【字数要求】poorAnalysis.content必须达到600-800字，展示错误思维过程
4. 【字数要求】expertCommentary必须达到500-600字，深度对比分析
5. 【对比要求】好坏对比要明显，但不刻意夸张，要符合实际情况
6. 【深度要求】专家点评要有深度，指出关键差异和深层原因
7. 【实用性】启示要具体、可操作，能够指导实际应用
8. 【适用性】符合当前Level的复杂程度和认知要求
9. 【表达】语言表达自然流畅，逻辑清晰
10. 【贴近性】案例要贴近学生的实际经验和生活场景

**特别提醒**：AI模型必须严格按照字数要求生成内容，绝不能偷工减料！
`.trim()
}

// 内容生成器
class ContentGenerator {
  private retryCount = new Map<string, number>()
  
  async generateWithRetry(
    contentType: 'concepts' | 'models' | 'demonstrations',
    dimension: typeof THINKING_DIMENSIONS[0],
    levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0]
  ): Promise<any> {
    const key = `${dimension.id}-${levelInfo.level}-${contentType}`
    const currentRetries = this.retryCount.get(key) || 0
    
    try {
      logger.info(`开始生成内容`, { 
        dimension: dimension.name, 
        level: levelInfo.level, 
        contentType,
        attempt: currentRetries + 1 
      })
      
      const content = await this.generateContent(contentType, dimension, levelInfo)
      
      if (GENERATION_CONFIG.validationEnabled) {
        const validation = ContentValidator.validateContent(contentType, content)
        if (!validation.isValid) {
          throw new Error(`内容质量验证失败: ${validation.errors.join(', ')}`)
        }
        
        // 输出字数统计信息
        if (validation.stats) {
          logger.info(`内容字数统计`, {
            dimension: dimension.name,
            level: levelInfo.level,
            contentType,
            stats: validation.stats
          })
        }
      }
      
      logger.info(`内容生成成功`, { dimension: dimension.name, level: levelInfo.level, contentType })
      this.retryCount.delete(key)
      return content
      
    } catch (error) {
      const newRetryCount = currentRetries + 1
      this.retryCount.set(key, newRetryCount)
      
      logger.error(`内容生成失败 (尝试 ${newRetryCount}/${GENERATION_CONFIG.maxRetries})`, {
        dimension: dimension.name,
        level: levelInfo.level,
        contentType,
        error: error instanceof Error ? error.message : String(error)
      })
      
      if (newRetryCount >= GENERATION_CONFIG.maxRetries) {
        this.retryCount.delete(key)
        throw new Error(`内容生成最终失败，已重试 ${GENERATION_CONFIG.maxRetries} 次: ${error}`)
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, GENERATION_CONFIG.retryDelay))
      return this.generateWithRetry(contentType, dimension, levelInfo)
    }
  }
  
  private async generateContent(
    contentType: 'concepts' | 'models' | 'demonstrations',
    dimension: typeof THINKING_DIMENSIONS[0],
    levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0]
  ): Promise<any> {
    const prompt = PROMPTS[contentType](dimension, levelInfo)
    
    const response = await aiRouter.chat([
      { role: 'user', content: prompt }
    ], {
      model: 'deepseek-v3.1',
      temperature: 0.7,
      stream: false
    })
    
    // 确保response是字符串
    const responseText = typeof response === 'string' ? response : await this.streamToString(response as ReadableStream)
    
    try {
      // 尝试解析JSON
      const content = JSON.parse(responseText)
      return content
    } catch (parseError) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch {
          throw new Error('AI返回的内容不是有效的JSON格式')
        }
      }
      throw new Error('无法从AI响应中提取有效的JSON内容')
    }
  }
  
  private async streamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let result = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += decoder.decode(value, { stream: true })
    }
    
    return result
  }
}

// 数据库操作器
class DatabaseManager {
  async contentExists(thinkingTypeId: string, level: number): Promise<boolean> {
    const existing = await prisma.theoryContent.findFirst({
      where: {
        thinkingTypeId,
        level,
        isPublished: true
      }
    })
    return !!existing
  }
  
  async saveTheoryContent(
    dimension: typeof THINKING_DIMENSIONS[0],
    levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0],
    conceptsContent: any,
    modelsContent: any,
    demonstrationsContent: any
  ) {
    // 创建备份（如果启用）
    if (GENERATION_CONFIG.backupEnabled) {
      await this.createBackup(dimension, levelInfo, {
        concepts: conceptsContent,
        models: modelsContent,
        demonstrations: demonstrationsContent
      })
    }
    
    const estimatedTime = this.calculateEstimatedTime(levelInfo.level)
    
    const theoryContent = await prisma.theoryContent.create({
      data: {
        thinkingTypeId: dimension.id,
        level: levelInfo.level,
        title: `Level ${levelInfo.level}: ${levelInfo.title}`,
        subtitle: `${dimension.name}的${levelInfo.title}阶段`,
        description: levelInfo.description,
        learningObjectives: levelInfo.objectives,
        
        // 核心概念章节
        conceptsIntro: conceptsContent.introduction,
        conceptsContent: conceptsContent,
        
        // 思维模型章节
        modelsIntro: modelsContent.introduction,
        modelsContent: modelsContent,
        
        // 实例演示章节
        demonstrationsIntro: demonstrationsContent.scenario,
        demonstrationsContent: demonstrationsContent,
        
        // 元数据
        estimatedTime,
        difficulty: levelInfo.difficulty,
        tags: [dimension.id, `level-${levelInfo.level}`, levelInfo.difficulty],
        keywords: this.extractKeywords(conceptsContent, modelsContent, demonstrationsContent),
        prerequisites: levelInfo.level > 1 ? [`level-${levelInfo.level - 1}`] : [],
        relatedTopics: [],
        
        // 版本和发布状态
        version: '1.0.0',
        isPublished: true,
        publishedAt: new Date(),
        
        // 质量指标
        qualityScore: 0.8, // 初始质量分数
        viewCount: 0,
        completionRate: null,
        userRating: null
      }
    })
    
    logger.info('理论内容保存成功', {
      id: theoryContent.id,
      dimension: dimension.name,
      level: levelInfo.level
    })
    
    return theoryContent
  }
  
  private async createBackup(
    dimension: typeof THINKING_DIMENSIONS[0],
    levelInfo: typeof DIMENSION_LEVELS.causal_analysis[0],
    content: any
  ) {
    const backupDir = path.join(process.cwd(), 'backups', 'theory-content')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${dimension.id}-level-${levelInfo.level}-${timestamp}.json`
    const backupPath = path.join(backupDir, filename)
    
    fs.writeFileSync(backupPath, JSON.stringify({
      dimension,
      level: levelInfo,
      content,
      timestamp: new Date().toISOString()
    }, null, 2))
    
    logger.debug('内容备份已创建', { backupPath })
  }
  
  private calculateEstimatedTime(level: number): number {
    // 基础时间：概念(15分钟) + 模型(20分钟) + 演示(10分钟) = 45分钟
    const baseTime = 45
    const levelMultiplier = 1 + (level - 1) * 0.3 // Level越高越复杂
    return Math.round(baseTime * levelMultiplier)
  }
  
  private extractKeywords(conceptsContent: any, modelsContent: any, demonstrationsContent: any): string[] {
    const keywords = new Set<string>()
    
    // 从概念内容提取关键词
    if (conceptsContent.sections) {
      conceptsContent.sections.forEach((section: any) => {
        if (section.keyPoints) {
          section.keyPoints.forEach((point: string) => {
            const words = point.split(/[，。、\s]+/).filter((w: string) => w.length > 1)
            words.forEach((word: string) => keywords.add(word))
          })
        }
      })
    }
    
    // 从框架名称提取关键词
    if (modelsContent.frameworkName) {
      const words = modelsContent.frameworkName.split(/[，。、\s]+/).filter((w: string) => w.length > 1)
      words.forEach((word: string) => keywords.add(word))
    }
    
    return Array.from(keywords).slice(0, 10) // 限制关键词数量
  }
}

// 进度跟踪器
class ProgressTracker {
  private totalTasks = 0
  private completedTasks = 0
  private startTime = Date.now()
  
  constructor(totalTasks: number) {
    this.totalTasks = totalTasks
  }
  
  updateProgress(completed: number) {
    this.completedTasks = completed
    const percentage = Math.round((completed / this.totalTasks) * 100)
    const elapsed = Date.now() - this.startTime
    const estimatedTotal = elapsed / (completed / this.totalTasks)
    const remaining = estimatedTotal - elapsed
    
    logger.info('生成进度更新', {
      completed,
      total: this.totalTasks,
      percentage: `${percentage}%`,
      elapsed: `${Math.round(elapsed / 1000)}秒`,
      estimated: `${Math.round(remaining / 1000)}秒`
    })
  }
  
  complete() {
    const totalTime = Date.now() - this.startTime
    logger.info('生成任务完成', {
      totalTasks: this.totalTasks,
      totalTime: `${Math.round(totalTime / 1000)}秒`,
      averageTime: `${Math.round(totalTime / this.totalTasks / 1000)}秒/任务`
    })
  }
}

// 主生成函数
async function generateTheoryContent(
  targetDimensions: string[] = [],
  targetLevels: number[] = [1, 2, 3, 4, 5],
  skipExisting = true
) {
  logger.info('开始理论内容生成', {
    targetDimensions: targetDimensions.length > 0 ? targetDimensions : '全部',
    targetLevels,
    skipExisting,
    config: GENERATION_CONFIG
  })
  
  const dimensions = targetDimensions.length > 0 
    ? THINKING_DIMENSIONS.filter(d => targetDimensions.includes(d.id))
    : THINKING_DIMENSIONS
  
  const levels = targetLevels.map(level => ({ level }))
  
  const totalTasks = dimensions.length * levels.length
  const progressTracker = new ProgressTracker(totalTasks)
  
  const generator = new ContentGenerator()
  const dbManager = new DatabaseManager()
  
  let completedCount = 0
  let skippedCount = 0
  let errorCount = 0
  
  for (const dimension of dimensions) {
    logger.info(`开始处理维度: ${dimension.name}`)
    
    for (const levelData of levels) {
      try {
        // 获取维度特定的Level配置
        const levelInfo = getLevelInfo(dimension.id, levelData.level)
        
        // 检查是否已存在
        if (skipExisting && await dbManager.contentExists(dimension.id, levelInfo.level)) {
          logger.info(`跳过已存在的内容`, { 
            dimension: dimension.name, 
            level: levelInfo.level 
          })
          skippedCount++
          progressTracker.updateProgress(++completedCount)
          continue
        }
        
        logger.info(`生成Level内容`, { 
          dimension: dimension.name, 
          level: levelInfo.level 
        })
        
        // 并行生成三个章节内容
        const [conceptsContent, modelsContent, demonstrationsContent] = await Promise.all([
          generator.generateWithRetry('concepts', dimension, levelInfo),
          generator.generateWithRetry('models', dimension, levelInfo),
          generator.generateWithRetry('demonstrations', dimension, levelInfo)
        ])
        
        // 保存到数据库
        await dbManager.saveTheoryContent(
          dimension,
          levelInfo,
          conceptsContent,
          modelsContent,
          demonstrationsContent
        )
        
        logger.info(`Level内容生成完成`, { 
          dimension: dimension.name, 
          level: levelInfo.level 
        })
        
        progressTracker.updateProgress(++completedCount)
        
        // API限流控制
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        errorCount++
        logger.error(`Level内容生成失败`, {
          dimension: dimension.name,
          level: levelData.level,
          error: error instanceof Error ? error.message : String(error)
        })
        
        progressTracker.updateProgress(++completedCount)
      }
    }
  }
  
  progressTracker.complete()
  
  // 最终统计
  const finalStats = await getFinalStats()
  
  logger.info('理论内容生成完成', {
    处理任务: totalTasks,
    成功生成: totalTasks - skippedCount - errorCount,
    跳过已存在: skippedCount,
    生成失败: errorCount,
    数据库总内容: finalStats.totalContent,
    完成度: `${Math.round((finalStats.totalContent / (5 * 5)) * 100)}%`
  })
  
  return {
    totalTasks,
    completed: totalTasks - skippedCount - errorCount,
    skipped: skippedCount,
    errors: errorCount,
    finalStats
  }
}

async function getFinalStats() {
  const totalContent = await prisma.theoryContent.count({
    where: { isPublished: true }
  })
  
  const byDimension = await prisma.theoryContent.groupBy({
    by: ['thinkingTypeId'],
    where: { isPublished: true },
    _count: { id: true }
  })
  
  const byLevel = await prisma.theoryContent.groupBy({
    by: ['level'],
    where: { isPublished: true },
    _count: { id: true }
  })
  
  return {
    totalContent,
    byDimension,
    byLevel
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 批判性思维理论体系内容生成器 V2')
    console.log('=' .repeat(60))
    
    // 解析命令行参数
    const args = process.argv.slice(2)
    const dimensionArg = args.find(arg => arg.startsWith('--dimensions='))
    const levelArg = args.find(arg => arg.startsWith('--levels='))
    const skipExistingArg = args.includes('--no-skip-existing')
    
    const targetDimensions = dimensionArg 
      ? dimensionArg.split('=')[1].split(',')
      : []
    
    const targetLevels = levelArg
      ? levelArg.split('=')[1].split(',').map(Number)
      : [1, 2, 3, 4, 5]
    
    const skipExisting = !skipExistingArg
    
    // 显示当前配置
    logger.info('生成配置', {
      目标维度: targetDimensions.length > 0 ? targetDimensions : '全部',
      目标Level: targetLevels,
      跳过已存在: skipExisting,
      最大重试次数: GENERATION_CONFIG.maxRetries,
      批量大小: GENERATION_CONFIG.batchSize,
      启用验证: GENERATION_CONFIG.validationEnabled,
      启用备份: GENERATION_CONFIG.backupEnabled
    })
    
    // 执行生成
    const result = await generateTheoryContent(targetDimensions, targetLevels, skipExisting)
    
    console.log('\n✅ 理论内容生成任务完成!')
    console.log(`📊 统计结果:`)
    console.log(`   - 处理任务: ${result.totalTasks}`)
    console.log(`   - 成功生成: ${result.completed}`)
    console.log(`   - 跳过已存在: ${result.skipped}`)
    console.log(`   - 生成失败: ${result.errors}`)
    console.log(`   - 数据库总内容: ${result.finalStats.totalContent}`)
    console.log(`   - 完成度: ${Math.round((result.finalStats.totalContent / 25) * 100)}%`)
    
  } catch (error) {
    logger.error('生成任务失败', { error: error instanceof Error ? error.message : String(error) })
    console.error('❌ 生成任务失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { generateTheoryContent, ContentValidator, Logger }