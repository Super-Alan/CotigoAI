'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Eye, 
  Search, 
  Lightbulb, 
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  BarChart3
} from 'lucide-react'
import { ThinkingType, ThinkingTypeProgress } from '@/types'

const thinkingTypes = [
  {
    id: 'analytical',
    name: '分析性思维',
    description: '分解复杂问题，识别关键要素和逻辑关系',
    icon: Search,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    features: ['问题分解', '要素识别', '逻辑分析', '结构梳理'],
    examples: ['数据分析', '论证评估', '因果关系', '系统思考']
  },
  {
    id: 'creative',
    name: '创造性思维',
    description: '突破常规思维模式，产生新颖独特的解决方案',
    icon: Lightbulb,
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    iconColor: 'text-yellow-600',
    features: ['发散思维', '创新方案', '跨界联想', '突破常规'],
    examples: ['头脑风暴', '创意设计', '问题重构', '替代方案']
  },
  {
    id: 'practical',
    name: '实用性思维',
    description: '关注现实可行性，寻找最优的实施路径',
    icon: Target,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600',
    features: ['可行性评估', '资源配置', '风险控制', '执行策略'],
    examples: ['项目规划', '决策制定', '资源优化', '风险管理']
  },
  {
    id: 'caring',
    name: '关怀性思维',
    description: '考虑他人感受和社会影响，体现人文关怀',
    icon: Brain,
    color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    iconColor: 'text-pink-600',
    features: ['同理心', '社会责任', '伦理考量', '人文关怀'],
    examples: ['道德判断', '社会影响', '利益相关者', '价值观念']
  },
  {
    id: 'systematic',
    name: '系统性思维',
    description: '从整体视角思考，理解各部分间的相互关系',
    icon: Eye,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    features: ['整体视角', '关系网络', '动态平衡', '系统优化'],
    examples: ['系统设计', '生态思维', '全局规划', '协调统筹']
  }
]

interface CriticalThinkingProps {
  userProgress?: ThinkingTypeProgress[]
}

export default function CriticalThinking({ userProgress = [] }: CriticalThinkingProps) {
  const [progress, setProgress] = useState<ThinkingTypeProgress[]>(userProgress)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/critical-thinking/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProgress(data.data.abilityScores || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressForType = (typeId: string) => {
    return progress.find(p => p.thinkingTypeId === typeId) || {
      thinkingTypeId: typeId,
      name: '',
      score: 0,
      level: 1
    }
  }

  const overallProgress = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
    : 0

  const totalSessions = progress.reduce((sum, p) => sum + (p.level - 1) * 10, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            批判性思维训练
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            通过五大核心思维类型的系统化训练，全面提升你的批判性思维能力。
            每种思维类型都配备专门的练习题目和AI智能评估系统。
          </p>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border mb-6 sm:mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                  {overallProgress}%
                </div>
                <div className="text-sm text-gray-600">整体进度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {totalSessions}
                </div>
                <div className="text-sm text-gray-600">练习次数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                  {progress.filter(p => p.score >= 80).length}/5
                </div>
                <div className="text-sm text-gray-600">精通类型</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">总体掌握度</span>
                <span className="text-sm font-medium text-gray-900">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Thinking Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {thinkingTypes.map((type) => {
            const IconComponent = type.icon
            const typeProgress = getProgressForType(type.id)
            
            return (
              <Card key={type.id} className={`${type.color} transition-all duration-300 hover:shadow-lg`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${type.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                          {type.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            等级 {typeProgress.level}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              typeProgress.score >= 80 
                                ? 'bg-green-100 text-green-800' 
                                : typeProgress.score >= 60 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {typeProgress.score}% 掌握
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
                    {type.description}
                  </CardDescription>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">掌握程度</span>
                      <span className="text-sm font-medium text-gray-900">{typeProgress.score}%</span>
                    </div>
                    <Progress value={typeProgress.score} className="h-2" />
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">应用场景：</div>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map((example, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded text-gray-700"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/learn/critical-thinking/${type.id}`} className="block">
                      <Button variant="outline" className="w-full h-10 text-sm">
                        学习理论
                      </Button>
                    </Link>
                    <Link href={`/learn/critical-thinking/${type.id}/practice`} className="block">
                      <Button className="w-full h-10 text-sm group">
                        开始练习
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="font-semibold text-gray-900">能力雷达图</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                查看五维能力分析，了解你的思维优势和待提升领域
              </p>
              <Link href="/learn/critical-thinking/progress">
                <Button variant="outline" className="w-full">
                  查看详情
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <Clock className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="font-semibold text-gray-900">每日练习</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                坚持每日练习，通过持续训练提升批判性思维能力
              </p>
              <Link href="/daily-practice">
                <Button variant="outline" className="w-full">
                  开始练习
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <Award className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="font-semibold text-gray-900">成就系统</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                解锁各种成就徽章，记录你的学习里程碑
              </p>
              <Link href="/achievements">
                <Button variant="outline" className="w-full">
                  查看成就
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Learning Tips */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
            学习建议
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🎯 学习策略</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 建议每天练习15-30分钟，保持学习连续性</li>
                <li>• 先从分析性思维开始，逐步扩展到其他类型</li>
                <li>• 结合实际生活场景，将理论应用到实践中</li>
                <li>• 定期回顾错题，总结思维模式和改进方向</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📈 进阶路径</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 初级：掌握基本概念和识别方法</li>
                <li>• 中级：能够独立分析和评估复杂问题</li>
                <li>• 高级：形成个人思维风格，指导他人学习</li>
                <li>• 专家：在实际工作中灵活运用各种思维类型</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}