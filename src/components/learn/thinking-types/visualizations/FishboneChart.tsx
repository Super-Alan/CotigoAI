'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface FishboneNode {
  category: string
  factors: string[]
  color: string
}

interface FishboneChartProps {
  title: string
  problem: string
  nodes: FishboneNode[]
}

export default function FishboneChart({ title, problem, nodes }: FishboneChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (category: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedNodes(newExpanded)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          {/* SVG 鱼骨图 */}
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-64 md:h-80 border rounded-lg bg-gray-50"
            style={{ minWidth: '600px' }}
          >
            {/* 主干线 */}
            <line 
              x1="100" y1="200" 
              x2="700" y2="200" 
              stroke="#374151" 
              strokeWidth="3"
            />
            
            {/* 问题头部 */}
            <rect 
              x="680" y="180" 
              width="100" height="40" 
              fill="#3B82F6" 
              rx="5"
            />
            <text 
              x="730" y="205" 
              textAnchor="middle" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold"
            >
              核心问题
            </text>

            {/* 分支线和节点 */}
            {nodes.map((node, index) => {
              const isTop = index % 2 === 0
              const x = 150 + (index * 120)
              const y1 = 200
              const y2 = isTop ? 120 : 280
              const textY = isTop ? 110 : 295

              return (
                <g key={node.category}>
                  {/* 分支线 */}
                  <line 
                    x1={x} y1={y1} 
                    x2={x} y2={y2} 
                    stroke="#6B7280" 
                    strokeWidth="2"
                  />
                  <line 
                    x1={x} y1={y2} 
                    x2={x + 60} y2={y2} 
                    stroke="#6B7280" 
                    strokeWidth="2"
                  />
                  
                  {/* 分类节点 */}
                  <rect 
                    x={x + 60} y={y2 - 15} 
                    width="80" height="30" 
                    fill={node.color} 
                    rx="15"
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => toggleNode(node.category)}
                  />
                  <text 
                    x={x + 100} y={y2 + 5} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="10" 
                    fontWeight="bold"
                    className="cursor-pointer"
                    onClick={() => toggleNode(node.category)}
                  >
                    {node.category}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* 问题描述 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-1">核心问题</h4>
            <p className="text-blue-800 text-sm">{problem}</p>
          </div>

          {/* 详细因素列表 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div key={node.category} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  style={{ backgroundColor: `${node.color}20` }}
                  onClick={() => toggleNode(node.category)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: node.color }}
                    ></div>
                    <span className="font-medium">{node.category}</span>
                    <Badge variant="secondary" className="ml-2">
                      {node.factors.length}
                    </Badge>
                  </div>
                  {expandedNodes.has(node.category) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
                
                {expandedNodes.has(node.category) && (
                  <div className="p-3 border-t bg-white">
                    <ul className="space-y-2">
                      {node.factors.map((factor, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 mr-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}