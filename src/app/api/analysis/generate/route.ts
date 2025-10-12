import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiRouter } from '@/lib/ai/router'
import { ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topic, dimension, visualizationType } = body

    if (!topic || !dimension || !visualizationType) {
      return NextResponse.json({ 
        error: 'Missing required parameters: topic, dimension, visualizationType' 
      }, { status: 400 })
    }

    // 验证维度是否有效
    const validDimensions = [
      'causal_analysis',
      'premise_challenge', 
      'fallacy_detection',
      'iterative_reflection',
      'connection_transfer'
    ]

    if (!validDimensions.includes(dimension)) {
      return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 })
    }

    // 验证可视化类型
    const validVisualizations = ['FishboneChart', 'MindMap', 'WeightChart', 'ComparisonTable']
    if (!validVisualizations.includes(visualizationType)) {
      return NextResponse.json({ error: 'Invalid visualization type' }, { status: 400 })
    }

    // 构建AI分析提示词
    const analysisPrompt = buildAnalysisPrompt(topic, dimension, visualizationType)

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一位专业的批判性思维分析师，擅长为学习中心生成高质量的实例分析内容。你需要根据给定的题目、思维维度和可视化类型，生成详细的分析内容。

分析要求：
1. 内容必须与指定的可视化组件完全匹配
2. 分析深度适中，既有理论框架又有实际应用
3. 语言清晰易懂，适合学习者理解
4. 结构化输出，便于前端展示
5. 包含具体的数据和案例支撑`
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ]

    // 调用AI生成分析内容
    const analysisResult = await aiRouter.chat(messages, {
      temperature: 0.7,
      maxTokens: 4000
    })

    // 如果是流式响应，转换为字符串
    let analysisContent: string
    if (typeof analysisResult === 'string') {
      analysisContent = analysisResult
    } else {
      // 处理流式响应
      const reader = analysisResult.getReader()
      const chunks: string[] = []
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(new TextDecoder().decode(value))
      }
      
      analysisContent = chunks.join('')
    }

    // 解析AI生成的内容
    const parsedAnalysis = parseAnalysisContent(analysisContent, visualizationType)

    return NextResponse.json({
      success: true,
      data: {
        topic,
        dimension,
        visualizationType,
        analysis: parsedAnalysis,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}

function buildAnalysisPrompt(topic: any, dimension: string, visualizationType: string): string {
  const dimensionDescriptions = {
    causal_analysis: '多维归因与利弊权衡',
    premise_challenge: '前提质疑与逻辑判断',
    fallacy_detection: '谬误识别与证据评估',
    iterative_reflection: '观点迭代与反思',
    connection_transfer: '关联迁移'
  }

  const visualizationRequirements = {
    FishboneChart: `
请生成适合鱼骨图展示的分析内容，包括：
- 主要问题（鱼头）
- 4-6个主要原因类别（主骨）
- 每个类别下的2-4个具体因素（子骨）
- 每个因素的简要说明

输出格式：
{
  "mainProblem": "核心问题描述",
  "categories": [
    {
      "name": "类别名称",
      "factors": [
        {
          "name": "因素名称",
          "description": "因素描述"
        }
      ]
    }
  ]
}`,
    MindMap: `
请生成适合思维导图展示的分析内容，包括：
- 中心主题
- 3-5个主要分支
- 每个分支下的2-4个子节点
- 关键词和简要描述

输出格式：
{
  "centralTopic": "中心主题",
  "branches": [
    {
      "name": "分支名称",
      "nodes": [
        {
          "name": "节点名称",
          "description": "节点描述"
        }
      ]
    }
  ]
}`,
    WeightChart: `
请生成适合权重图表展示的分析内容，包括：
- 评估维度
- 各维度的权重百分比
- 权重分配的理由
- 综合评分

输出格式：
{
  "title": "权重分析标题",
  "dimensions": [
    {
      "name": "维度名称",
      "weight": 权重百分比,
      "score": 得分,
      "reasoning": "权重理由"
    }
  ],
  "totalScore": 总分
}`,
    ComparisonTable: `
请生成适合对比表格展示的分析内容，包括：
- 对比项目
- 评估维度
- 各项目在各维度的表现
- 优缺点分析

输出格式：
{
  "title": "对比分析标题",
  "items": ["项目1", "项目2", "项目3"],
  "dimensions": ["维度1", "维度2", "维度3"],
  "data": [
    {
      "item": "项目名称",
      "scores": [分数1, 分数2, 分数3],
      "pros": ["优点1", "优点2"],
      "cons": ["缺点1", "缺点2"]
    }
  ]
}`
  }

  return `
请基于以下信息生成详细的批判性思维分析：

**题目信息：**
- 标题：${topic.title}
- 描述：${topic.description}
- 场景：${topic.scenario}
- 背景：${topic.context}
- 难度：${topic.difficulty}
- 类别：${topic.category}

**分析维度：** ${dimensionDescriptions[dimension as keyof typeof dimensionDescriptions]}

**可视化要求：** ${visualizationRequirements[visualizationType as keyof typeof visualizationRequirements]}

请确保分析内容：
1. 紧密结合题目场景和背景
2. 体现${dimensionDescriptions[dimension as keyof typeof dimensionDescriptions]}的核心思维方法
3. 数据结构完全符合${visualizationType}的展示需求
4. 内容深度适中，既有理论支撑又有实践指导
5. 语言表达清晰，适合学习者理解

请直接输出JSON格式的分析结果，不要包含其他说明文字。
`
}

function parseAnalysisContent(content: string, visualizationType: string): any {
  try {
    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // 如果无法解析JSON，返回备用内容
    return generateFallbackContent(visualizationType)
  } catch (error) {
    console.error('Failed to parse AI analysis content:', error)
    return generateFallbackContent(visualizationType)
  }
}

function generateFallbackContent(visualizationType: string): any {
  const fallbackContent = {
    FishboneChart: {
      mainProblem: "复杂问题的多维分析",
      categories: [
        {
          name: "内部因素",
          factors: [
            { name: "资源配置", description: "人力、物力、财力的合理分配" },
            { name: "管理机制", description: "组织结构和决策流程" }
          ]
        },
        {
          name: "外部环境",
          factors: [
            { name: "市场变化", description: "外部市场环境的影响" },
            { name: "政策法规", description: "相关政策和法规的约束" }
          ]
        }
      ]
    },
    MindMap: {
      centralTopic: "批判性思维分析",
      branches: [
        {
          name: "问题识别",
          nodes: [
            { name: "核心问题", description: "识别关键问题" },
            { name: "相关因素", description: "分析影响因素" }
          ]
        },
        {
          name: "解决方案",
          nodes: [
            { name: "可行性分析", description: "评估方案可行性" },
            { name: "风险评估", description: "识别潜在风险" }
          ]
        }
      ]
    },
    WeightChart: {
      title: "多维度权重分析",
      dimensions: [
        { name: "重要性", weight: 30, score: 8, reasoning: "对整体目标的影响程度" },
        { name: "可行性", weight: 25, score: 7, reasoning: "实施的难易程度" },
        { name: "成本效益", weight: 25, score: 6, reasoning: "投入产出比" },
        { name: "风险程度", weight: 20, score: 5, reasoning: "潜在风险的大小" }
      ],
      totalScore: 6.7
    },
    ComparisonTable: {
      title: "方案对比分析",
      items: ["方案A", "方案B", "方案C"],
      dimensions: ["效果", "成本", "风险"],
      data: [
        { item: "方案A", scores: [8, 6, 7], pros: ["效果显著", "实施简单"], cons: ["成本较高"] },
        { item: "方案B", scores: [7, 8, 6], pros: ["成本低", "风险小"], cons: ["效果一般"] },
        { item: "方案C", scores: [9, 5, 5], pros: ["效果最佳"], cons: ["成本高", "风险大"] }
      ]
    }
  }

  return fallbackContent[visualizationType as keyof typeof fallbackContent] || {}
}