'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MindMapBranch {
  topic: string
  subtopics: string[]
  color: string
}

interface MindMapData {
  central: string
  branches: MindMapBranch[]
}

interface MindMapVisualizationProps {
  data: MindMapData
  className?: string
}

/**
 * 思维导图可视化组件
 * 使用纯CSS实现的径向布局思维导图
 */
export default function MindMapVisualization({ data, className = '' }: MindMapVisualizationProps) {
  // Defensive check: ensure data exists and has required structure
  if (!data || !data.central || !data.branches || !Array.isArray(data.branches)) {
    return null // Don't render if data is invalid
  }

  const { central, branches } = data

  // 计算每个分支的角度
  const angleStep = 360 / branches.length
  const radius = 280 // 中心到分支的距离(px)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          思维导图
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full min-h-[800px] bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-8 overflow-hidden">
          {/* 中心节点 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-white">
              <div className="font-bold text-lg text-center max-w-[200px]">
                {central}
              </div>
            </div>
          </div>

          {/* 分支节点 */}
          {branches.map((branch, index) => {
            const angle = angleStep * index - 90 // -90 让第一个分支在顶部
            const radian = (angle * Math.PI) / 180
            const x = Math.cos(radian) * radius
            const y = Math.sin(radian) * radius

            // 连接线路径
            const pathStart = { x: 0, y: 0 }
            const pathEnd = { x, y }
            const controlPoint = {
              x: x * 0.3,
              y: y * 0.3
            }

            return (
              <div key={index}>
                {/* SVG连接线 */}
                <svg
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  style={{
                    width: Math.abs(x) * 2 + 400,
                    height: Math.abs(y) * 2 + 400,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor={branch.color} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${Math.abs(x) + 200} ${Math.abs(y) + 200}
                        Q ${Math.abs(x) + 200 + controlPoint.x} ${Math.abs(y) + 200 + controlPoint.y}
                        ${Math.abs(x) + 200 + pathEnd.x} ${Math.abs(y) + 200 + pathEnd.y}`}
                    stroke={`url(#gradient-${index})`}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* 主分支节点 */}
                <div
                  className="absolute top-1/2 left-1/2 z-10"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <div
                    className="bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-shadow border-l-4 min-w-[220px]"
                    style={{ borderColor: branch.color }}
                  >
                    <div className="font-semibold text-gray-900 mb-3 text-sm">
                      {branch.topic}
                    </div>
                    <div className="space-y-2">
                      {branch.subtopics.map((subtopic, subIndex) => (
                        <Badge
                          key={subIndex}
                          variant="outline"
                          className="block w-full text-left text-xs py-1.5 px-3 border"
                          style={{
                            borderColor: branch.color,
                            color: branch.color,
                            backgroundColor: `${branch.color}10`
                          }}
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-2"
                            style={{ backgroundColor: branch.color }}
                          />
                          {subtopic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 图例 */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {branches.map((branch, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: branch.color }}
              />
              <span className="text-sm text-gray-600">{branch.topic.split('：')[1] || branch.topic}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
