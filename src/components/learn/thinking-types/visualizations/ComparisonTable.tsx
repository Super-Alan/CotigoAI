'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Scale } from 'lucide-react'

interface ComparisonItem {
  aspect: string
  option1: {
    value: string
    score: number // 1-5 分数
    description?: string
  }
  option2: {
    value: string
    score: number // 1-5 分数
    description?: string
  }
  weight: number // 权重百分比
}

interface ComparisonTableProps {
  title: string
  option1Name: string
  option2Name: string
  items: ComparisonItem[]
}

export default function ComparisonTable({ 
  title, 
  option1Name, 
  option2Name, 
  items 
}: ComparisonTableProps) {
  
  // 计算加权总分
  const calculateWeightedScore = (optionKey: 'option1' | 'option2') => {
    return items.reduce((total, item) => {
      return total + (item[optionKey].score * item.weight / 100)
    }, 0)
  }

  const option1Score = calculateWeightedScore('option1')
  const option2Score = calculateWeightedScore('option2')

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (score >= 3) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50'
    if (score >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getBetterOption = (item: ComparisonItem) => {
    if (item.option1.score > item.option2.score) return 'option1'
    if (item.option2.score > item.option1.score) return 'option2'
    return 'tie'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Scale className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 对比表格 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-medium text-gray-900">评估维度</th>
                <th className="text-center p-3 font-medium text-gray-900">权重</th>
                <th className="text-center p-3 font-medium text-blue-600">{option1Name}</th>
                <th className="text-center p-3 font-medium text-purple-600">{option2Name}</th>
                <th className="text-center p-3 font-medium text-gray-900">优势方</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const betterOption = getBetterOption(item)
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-sm">{item.aspect}</div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{item.weight}%</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                          {getScoreIcon(item.option1.score)}
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(item.option1.score)}`}>
                            {item.option1.score}/5
                          </span>
                        </div>
                        <div className="text-xs text-center text-gray-600">
                          {item.option1.value}
                        </div>
                        {item.option1.description && (
                          <div className="text-xs text-gray-500 text-center">
                            {item.option1.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2">
                          {getScoreIcon(item.option2.score)}
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(item.option2.score)}`}>
                            {item.option2.score}/5
                          </span>
                        </div>
                        <div className="text-xs text-center text-gray-600">
                          {item.option2.value}
                        </div>
                        {item.option2.description && (
                          <div className="text-xs text-gray-500 text-center">
                            {item.option2.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {betterOption === 'option1' && (
                        <Badge className="bg-blue-100 text-blue-800">{option1Name}</Badge>
                      )}
                      {betterOption === 'option2' && (
                        <Badge className="bg-purple-100 text-purple-800">{option2Name}</Badge>
                      )}
                      {betterOption === 'tie' && (
                        <Badge variant="outline">平手</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 总结分析 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{option1Name}</h4>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {option1Score.toFixed(1)}/5.0
            </div>
            <div className="text-sm text-blue-700">
              加权总分
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">{option2Name}</h4>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {option2Score.toFixed(1)}/5.0
            </div>
            <div className="text-sm text-purple-700">
              加权总分
            </div>
          </div>
        </div>

        {/* 推荐结论 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">分析结论</h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">推荐选择：</span>
            {option1Score > option2Score ? (
              <Badge className="bg-blue-100 text-blue-800">{option1Name}</Badge>
            ) : option2Score > option1Score ? (
              <Badge className="bg-purple-100 text-purple-800">{option2Name}</Badge>
            ) : (
              <Badge variant="outline">两者相当，需进一步考虑</Badge>
            )}
            <span className="text-sm text-gray-600">
              (分差: {Math.abs(option1Score - option2Score).toFixed(1)})
            </span>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>评分说明：</strong>
            5分=优秀，4分=良好，3分=一般，2分=较差，1分=很差
          </div>
        </div>
      </CardContent>
    </Card>
  )
}