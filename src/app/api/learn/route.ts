import { NextRequest, NextResponse } from 'next/server'

// 学习中心总览数据
const learningOverview = {
  modules: [
    {
      id: 'fallacies',
      title: '逻辑谬误与偏差库',
      description: '学习识别和应对各种逻辑谬误与认知偏差',
      icon: 'brain',
      itemCount: 7,
      categories: ['logical', 'cognitive', 'statistical'],
      difficulty: 'beginner',
      estimatedTime: '30分钟',
      path: '/learn/fallacies'
    },
    {
      id: 'templates',
      title: '论证结构与写作模板',
      description: '掌握PEEL、CER等论证结构和写作模板',
      icon: 'file-text',
      itemCount: 5,
      categories: ['argument', 'scientific', 'analysis', 'decision', 'debate'],
      difficulty: 'intermediate',
      estimatedTime: '45分钟',
      path: '/learn/templates'
    },
    {
      id: 'methodology',
      title: '方法论微课',
      description: '学习批判性思维方法论，包含交互式任务与自测',
      icon: 'graduation-cap',
      itemCount: 4,
      categories: ['statistics', 'methodology', 'ethics'],
      difficulty: 'advanced',
      estimatedTime: '60分钟',
      path: '/learn/methodology'
    },
    {
      id: 'topics',
      title: '话题包',
      description: '探索复杂话题的多视角分析与可视化解构',
      icon: 'users',
      itemCount: 3,
      categories: ['policy', 'technology', 'social'],
      difficulty: 'advanced',
      estimatedTime: '90分钟',
      path: '/learn/topics'
    }
  ],
  stats: {
    totalLessons: 19,
    totalCategories: 12,
    averageCompletionTime: '3.5小时',
    userProgress: 0
  },
  featuredContent: [
    {
      type: 'fallacy',
      id: 'confirmation-bias',
      title: '确认偏误',
      description: '了解如何识别和克服确认偏误',
      category: 'cognitive'
    },
    {
      type: 'template',
      id: 'peel',
      title: 'PEEL 结构',
      description: '掌握经典的论证写作结构',
      category: 'argument'
    },
    {
      type: 'lesson',
      id: 'statistics-causation',
      title: '统计与因果',
      description: '学会区分相关性和因果性',
      category: 'statistics'
    }
  ],
  learningPaths: [
    {
      id: 'beginner-path',
      title: '批判性思维入门',
      description: '适合初学者的学习路径',
      modules: ['fallacies', 'templates'],
      estimatedTime: '2小时',
      difficulty: 'beginner'
    },
    {
      id: 'advanced-path',
      title: '深度分析技能',
      description: '提升分析和评估能力',
      modules: ['methodology', 'topics'],
      estimatedTime: '3小时',
      difficulty: 'advanced'
    },
    {
      id: 'complete-path',
      title: '完整学习体系',
      description: '全面掌握批判性思维技能',
      modules: ['fallacies', 'templates', 'methodology', 'topics'],
      estimatedTime: '4小时',
      difficulty: 'comprehensive'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return NextResponse.json({
          success: true,
          data: learningOverview
        })

      case 'modules':
        return NextResponse.json({
          success: true,
          data: learningOverview.modules
        })

      case 'stats':
        return NextResponse.json({
          success: true,
          data: learningOverview.stats
        })

      case 'featured':
        return NextResponse.json({
          success: true,
          data: learningOverview.featuredContent
        })

      case 'paths':
        return NextResponse.json({
          success: true,
          data: learningOverview.learningPaths
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching learning overview:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 更新学习进度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, moduleId, itemId, progress } = body

    if (action === 'updateProgress') {
      // 在实际应用中，这里应该更新数据库中的用户进度
      // 现在只是返回成功响应
      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        data: {
          moduleId,
          itemId,
          progress,
          timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'getProgress') {
      // 在实际应用中，这里应该从数据库获取用户进度
      // 现在返回模拟数据
      return NextResponse.json({
        success: true,
        data: {
          fallacies: { completed: 3, total: 7, progress: 43 },
          templates: { completed: 2, total: 5, progress: 40 },
          methodology: { completed: 1, total: 4, progress: 25 },
          topics: { completed: 0, total: 3, progress: 0 },
          overall: { completed: 6, total: 19, progress: 32 }
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing learning request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}