'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react'

interface MindMapNode {
  topic: string
  color: string
  subtopics: string[]
}

interface EnhancedMindMapData {
  central: string
  branches: MindMapNode[]
}

interface EnhancedMindMapProps {
  data: EnhancedMindMapData
  showControls?: boolean
}

export default function EnhancedMindMap({ data, showControls = true }: EnhancedMindMapProps) {
  const [zoom, setZoom] = useState(1)
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const colorMap: Record<string, {
    bg: string;
    border: string;
    text: string;
    gradient: string;
    shadow: string;
  }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-900',
      gradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-200'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-900',
      gradient: 'from-red-400 to-red-600',
      shadow: 'shadow-red-200'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-900',
      gradient: 'from-green-400 to-green-600',
      shadow: 'shadow-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-400',
      text: 'text-purple-900',
      gradient: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-400',
      text: 'text-orange-900',
      gradient: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-200'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-400',
      text: 'text-pink-900',
      gradient: 'from-pink-400 to-pink-600',
      shadow: 'shadow-pink-200'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-400',
      text: 'text-indigo-900',
      gradient: 'from-indigo-400 to-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-900',
      gradient: 'from-yellow-400 to-yellow-600',
      shadow: 'shadow-yellow-200'
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setSelectedBranch(null)
    setPanOffset({ x: 0, y: 0 })
  }

  // Pan 功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // 计算分支位置（圆形布局）
  const getBranchPosition = (index: number, total: number) => {
    const angle = (360 / total) * index - 90 // 从顶部开始
    const radius = 200 // 增大半径
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y, angle: angle + 90 }
  }

  // 获取连接线颜色
  const getStrokeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: '#60a5fa',
      red: '#f87171',
      green: '#4ade80',
      purple: '#a78bfa',
      orange: '#fb923c',
      pink: '#f472b6',
      indigo: '#818cf8',
      yellow: '#facc15'
    }
    return colorMap[color] || '#60a5fa'
  }

  return (
    <div className="relative">
      {/* 控制面板 */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="hover:bg-blue-50"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="hover:bg-blue-50"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="hover:bg-blue-50"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-2 border-l">
            <Move className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">{isPanning ? '拖动中...' : '拖动画布'}</span>
          </div>
        </div>
      )}

      {/* 思维导图画布 */}
      <div
        ref={canvasRef}
        className={`relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl p-8 overflow-hidden min-h-[700px] flex items-center justify-center ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative transition-all duration-300 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`
          }}
        >
          {/* 中心节点 */}
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 text-white rounded-2xl px-10 py-7 shadow-2xl border-4 border-white">
                  <div className="text-center font-bold text-xl whitespace-nowrap">
                    {data.central}
                  </div>
                </div>
              </div>
            </div>

            {/* 分支节点 */}
            <div className="relative w-[900px] h-[900px]">
              {data.branches.map((branch, index) => {
                const position = getBranchPosition(index, data.branches.length)
                const colors = colorMap[branch.color] || colorMap.blue
                const isSelected = selectedBranch === index
                const isHovered = hoveredBranch === index

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                      zIndex: isSelected ? 15 : isHovered ? 12 : 10
                    }}
                  >
                    {/* 增强的连接线 */}
                    <svg
                      className="absolute top-1/2 left-1/2 pointer-events-none"
                      style={{
                        width: Math.abs(position.x) + 100,
                        height: Math.abs(position.y) + 100,
                        transform: `translate(${position.x > 0 ? '-100%' : '0'}, ${position.y > 0 ? '-100%' : '0'})`
                      }}
                    >
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={getStrokeColor(branch.color)} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={getStrokeColor(branch.color)} stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <line
                        x1={position.x > 0 ? '100%' : '0'}
                        y1={position.y > 0 ? '100%' : '0'}
                        x2={position.x > 0 ? '0' : '100%'}
                        y2={position.y > 0 ? '0' : '100%'}
                        stroke={`url(#gradient-${index})`}
                        strokeWidth={isSelected || isHovered ? '4' : '3'}
                        strokeDasharray={isSelected ? '0' : '8,4'}
                        className="transition-all duration-300"
                      />
                    </svg>

                    {/* 主分支节点 - 增强版 */}
                    <div
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'scale-115 -translate-y-2'
                          : isHovered
                          ? 'scale-110 -translate-y-1'
                          : 'hover:scale-105'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedBranch(isSelected ? null : index)
                      }}
                      onMouseEnter={() => setHoveredBranch(index)}
                      onMouseLeave={() => setHoveredBranch(null)}
                    >
                      <div className="relative group">
                        {/* 悬浮光晕效果 */}
                        {(isSelected || isHovered) && (
                          <div className={`absolute -inset-2 bg-gradient-to-r ${colors.gradient} opacity-30 blur-lg rounded-xl transition-opacity duration-300`}></div>
                        )}

                        <Card className={`relative ${colors.bg} border-3 ${colors.border} p-5 min-w-[180px] shadow-xl ${colors.shadow} backdrop-blur-sm transition-all duration-300`}>
                          <div className={`font-bold text-center ${colors.text} mb-3 text-base`}>
                            {branch.topic}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`w-full justify-center text-xs font-semibold bg-gradient-to-r ${colors.gradient} text-white border-0`}
                          >
                            {branch.subtopics.length} 个要点
                          </Badge>
                        </Card>
                      </div>
                    </div>

                    {/* 子主题展开 - 增强版 */}
                    {isSelected && (
                      <div
                        className="absolute mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 ease-out"
                        style={{
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          minWidth: '240px',
                          maxWidth: '320px'
                        }}
                      >
                        {branch.subtopics.map((subtopic, subIndex) => (
                          <div
                            key={subIndex}
                            className={`${colors.bg} border-2 ${colors.border} rounded-xl px-4 py-3 text-sm ${colors.text} shadow-lg ${colors.shadow} backdrop-blur-md bg-opacity-95 hover:bg-opacity-100 transition-all duration-200 hover:scale-105`}
                            style={{
                              animationDelay: `${subIndex * 50}ms`
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center text-xs font-bold`}>
                                {subIndex + 1}
                              </div>
                              <span className="flex-1 leading-relaxed">{subtopic}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 图例 - 增强版 */}
      <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
        <div className="flex flex-wrap gap-3 justify-center">
          {data.branches.map((branch, index) => {
            const colors = colorMap[branch.color] || colorMap.blue
            const isActive = selectedBranch === index
            return (
              <button
                key={index}
                onClick={() => setSelectedBranch(isActive ? null : index)}
                onMouseEnter={() => setHoveredBranch(index)}
                onMouseLeave={() => setHoveredBranch(null)}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all duration-300 ${
                  isActive
                    ? `${colors.bg} ${colors.border} scale-105 shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${colors.gradient} shadow-sm transition-transform duration-300 ${
                    isActive ? 'scale-125' : 'group-hover:scale-110'
                  }`} />
                  {isActive && (
                    <div className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br ${colors.gradient} animate-ping opacity-50`} />
                  )}
                </div>
                <span className={`text-sm font-semibold transition-colors ${
                  isActive ? colors.text : 'text-gray-700'
                }`}>
                  {branch.topic}
                </span>
                <Badge variant="outline" className={`text-xs ${isActive ? colors.text : 'text-gray-500'}`}>
                  {branch.subtopics.length}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* 使用提示 - 增强版 */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>点击分支查看详细内容</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center gap-2">
          <Move className="h-3.5 w-3.5" />
          <span>拖动画布平移视图</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center gap-2">
          <ZoomIn className="h-3.5 w-3.5" />
          <span>缩放查看细节</span>
        </div>
      </div>
    </div>
  )
}
