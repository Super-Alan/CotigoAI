'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Target } from 'lucide-react'

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
  color: string
  description?: string
}

interface MindMapProps {
  title: string
  centerNode: MindMapNode
}

export default function MindMap({ title, centerNode }: MindMapProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([centerNode.id]))

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: MindMapNode, level: number = 0, angle: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    
    return (
      <div key={node.id} className={`mind-map-node level-${level}`}>
        <div 
          className={`
            node-content p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${level === 0 ? 'bg-blue-500 text-white border-blue-600' : 'bg-white border-gray-300 hover:border-gray-400'}
            ${level === 1 ? 'shadow-md' : 'shadow-sm'}
          `}
          style={{ 
            backgroundColor: level > 0 ? `${node.color}20` : node.color,
            borderColor: node.color,
            minWidth: level === 0 ? '120px' : '100px'
          }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium text-sm ${level === 0 ? 'text-white' : 'text-gray-800'}`}>
              {node.label}
            </span>
            {hasChildren && (
              <div className={`ml-2 ${level === 0 ? 'text-white' : 'text-gray-600'}`}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            )}
          </div>
          {node.description && (
            <p className={`text-xs mt-1 ${level === 0 ? 'text-blue-100' : 'text-gray-600'}`}>
              {node.description}
            </p>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className={`children-container mt-4 ${level === 0 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'ml-6 space-y-2'}`}>
            {node.children!.map((child, index) => (
              <div key={child.id} className="relative">
                {level === 0 && (
                  <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-gray-300"></div>
                )}
                {renderNode(child, level + 1, (index * 360) / node.children!.length)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mind-map-container p-6">
          <div className="flex justify-center">
            {renderNode(centerNode)}
          </div>
        </div>
        
        {/* 图例说明 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">使用说明</h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>中心节点</span>
            </div>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 mr-1" />
              <span>点击展开/收起</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-gray-400 rounded mr-2"></div>
              <span>分支节点</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}