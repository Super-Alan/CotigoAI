'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react'

interface MindMapBranch {
  label: string
  nodes: string[]
}

interface MindMapJSON {
  central: string
  branches: MindMapBranch[]
}

interface MindMapMessageProps {
  data: MindMapJSON
}

// 颜色方案
const BRANCH_COLORS = [
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#EF4444', // 红色
  '#8B5CF6', // 紫色
  '#3B82F6', // 蓝色
  '#EC4899', // 粉色
  '#14B8A6', // 青色
  '#F97316', // 深橙
]

/**
 * 思维导图消息组件（紧凑版适配聊天界面）
 * 将AI返回的JSON格式思维导图渲染为可视化图形
 */
export default function MindMapMessage({ data }: MindMapMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // 转换分支数据
  const branches = data.branches.map((branch, index) => ({
    topic: branch.label,
    subtopics: branch.nodes,
    color: BRANCH_COLORS[index % BRANCH_COLORS.length]
  }))

  // 渲染思维导图核心内容
  const renderMindMap = (radius: number, isFullscreen: boolean = false) => {
    const angleStep = 360 / branches.length

    return (
      <div className={`relative w-full bg-white rounded-lg overflow-auto ${isFullscreen ? 'h-screen' : 'h-[480px]'}`}>
        <div className={`absolute inset-0 ${isFullscreen ? 'min-w-[1400px] min-h-screen' : 'min-w-[800px] min-h-[480px]'} p-8`}>
          {/* 中心节点 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className={`bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg border-2 border-white ${isFullscreen ? 'px-10 py-6' : 'px-6 py-4'}`}>
              <div className={`font-bold text-center ${isFullscreen ? 'text-xl max-w-[280px]' : 'text-sm max-w-[160px]'} leading-tight`}>
                {data.central}
              </div>
            </div>
          </div>

          {/* 分支节点 */}
          {branches.map((branch, index) => {
            const angle = angleStep * index - 90
            const radian = (angle * Math.PI) / 180
            const x = Math.cos(radian) * radius
            const y = Math.sin(radian) * radius

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
                    <linearGradient id={`gradient-${isFullscreen ? 'fs-' : ''}${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor={branch.color} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${Math.abs(x) + 200} ${Math.abs(y) + 200}
                        Q ${Math.abs(x) + 200 + controlPoint.x} ${Math.abs(y) + 200 + controlPoint.y}
                        ${Math.abs(x) + 200 + x} ${Math.abs(y) + 200 + y}`}
                    stroke={`url(#gradient-${isFullscreen ? 'fs-' : ''}${index})`}
                    strokeWidth={isFullscreen ? "3" : "2"}
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
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 ${isFullscreen ? 'px-6 py-4' : 'px-4 py-3'}`}
                    style={{
                      borderColor: branch.color,
                      minWidth: isFullscreen ? '260px' : '180px'
                    }}
                  >
                    <div className={`font-semibold text-gray-900 mb-2 ${isFullscreen ? 'text-base' : 'text-xs'}`}>
                      {branch.topic}
                    </div>
                    <div className={`${isFullscreen ? 'space-y-2' : 'space-y-1.5'}`}>
                      {branch.subtopics.map((subtopic, subIndex) => (
                        <Badge
                          key={subIndex}
                          variant="outline"
                          className={`block w-full text-left border ${isFullscreen ? 'text-xs py-1.5 px-3' : 'text-[10px] py-1 px-2'}`}
                          style={{
                            borderColor: branch.color,
                            color: branch.color,
                            backgroundColor: `${branch.color}10`
                          }}
                        >
                          <span
                            className={`inline-block rounded-full mr-1.5 ${isFullscreen ? 'w-1.5 h-1.5' : 'w-1 h-1'}`}
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
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 w-full">
        {/* 思维导图可视化 */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 overflow-hidden w-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-purple-700 font-semibold text-sm">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                思维导图
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullScreen(true)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                全屏展开
              </Button>
            </div>

            {/* 思维导图容器 - 紧凑模式 */}
            {renderMindMap(160, false)}

            {/* 图例 */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {branches.map((branch, index) => (
                <div key={index} className="flex items-center space-x-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: branch.color }}
                  />
                  <span className="text-xs text-gray-600">{branch.topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* JSON原始数据（可折叠） */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-gray-600 hover:text-gray-700 justify-between"
            >
              <span className="text-xs">原始JSON数据</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>

            {isExpanded && (
              <pre className="mt-2 bg-white rounded p-2 text-[10px] text-gray-700 overflow-x-auto border border-gray-200 max-h-[200px] overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 全屏模态框 */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 bg-gradient-to-br from-slate-50 to-gray-50">
          {/* 自定义关闭按钮 */}
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute right-6 top-6 z-50 rounded-full p-2 bg-white shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* 标题 */}
          <div className="absolute left-6 top-6 z-40 bg-white px-4 py-2 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {data.central}
            </h2>
          </div>

          {/* 全屏思维导图 */}
          <div className="w-full h-full pt-20">
            {renderMindMap(320, true)}
          </div>

          {/* 底部图例 */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex flex-wrap gap-4 justify-center">
              {branches.map((branch, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: branch.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{branch.topic}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
