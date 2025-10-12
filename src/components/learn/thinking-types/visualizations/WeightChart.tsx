'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, PieChart } from 'lucide-react'

interface WeightItem {
  label: string
  weight: number
  color: string
  description?: string
}

interface WeightChartProps {
  title: string
  items: WeightItem[]
  type?: 'bar' | 'pie'
}

export default function WeightChart({ title, items, type = 'bar' }: WeightChartProps) {
  const maxWeight = Math.max(...items.map(item => item.weight))

  const renderBarChart = () => (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <Badge variant="secondary">{item.weight}%</Badge>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(item.weight / maxWeight) * 100}%`,
                  backgroundColor: item.color 
                }}
              ></div>
            </div>
          </div>
          
          {item.description && (
            <p className="text-xs text-gray-600 ml-7">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    let cumulativePercentage = 0
    const radius = 80
    const centerX = 100
    const centerY = 100

    return (
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {items.map((item, index) => {
              const strokeDasharray = `${(item.weight / 100) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`
              const strokeDashoffset = -cumulativePercentage * (2 * Math.PI * radius) / 100
              cumulativePercentage += item.weight
              
              return (
                <circle
                  key={index}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">100%</div>
              <div className="text-xs text-gray-600">总权重</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.label}</span>
                  <Badge variant="secondary">{item.weight}%</Badge>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          {type === 'pie' ? (
            <PieChart className="h-5 w-5 mr-2 text-purple-600" />
          ) : (
            <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'pie' ? renderPieChart() : renderBarChart()}
        
        {/* 总结信息 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">权重分配合理性</span>
            <span className="font-medium text-green-600">
              {items.reduce((sum, item) => sum + item.weight, 0) === 100 ? '✓ 平衡' : '⚠ 需调整'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">最重要因素</span>
            <span className="font-medium">
              {items.reduce((max, item) => item.weight > max.weight ? item : max, items[0])?.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}