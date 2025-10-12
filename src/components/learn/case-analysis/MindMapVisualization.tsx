'use client'

import { Card } from '@/components/ui/card'
import { Brain } from 'lucide-react'

interface MindMapNode {
  id: string
  label: string
  level: number
  children?: MindMapNode[]
  color?: string
}

interface MindMapVisualizationProps {
  title: string
  rootNode: MindMapNode
}

export default function MindMapVisualization({ title, rootNode }: MindMapVisualizationProps) {
  const renderNode = (node: MindMapNode, depth: number = 0) => {
    const levelColors = [
      'bg-blue-500 text-white',
      'bg-purple-400 text-white',
      'bg-green-400 text-white',
      'bg-yellow-400 text-gray-900',
      'bg-pink-400 text-white'
    ]

    const color = node.color || levelColors[Math.min(depth, levelColors.length - 1)]
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node */}
        <div className={`px-4 py-2 rounded-lg shadow-md ${color} font-semibold text-center max-w-xs`}>
          {node.label}
        </div>

        {/* Children */}
        {hasChildren && (
          <>
            {/* Connector Line */}
            <div className="h-8 w-0.5 bg-gray-300"></div>

            {/* Children Container */}
            <div className="flex space-x-6">
              {node.children!.map((child, index) => (
                <div key={child.id} className="relative">
                  {/* Horizontal line */}
                  {index > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
                  )}

                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-x-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      <div className="min-w-max py-4">
        {renderNode(rootNode)}
      </div>

      <div className="mt-6 text-sm text-gray-600 bg-white bg-opacity-60 p-3 rounded">
        💡 提示：思维导图帮助你从整体到局部理解问题结构，每个分支代表一个思考维度。
      </div>
    </Card>
  )
}
