'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight, AlertCircle } from 'lucide-react'

interface CausalNode {
  id: string
  label: string
  type: 'cause' | 'mediator' | 'effect' | 'confound'
  description?: string
}

interface CausalLink {
  from: string
  to: string
  strength: 'strong' | 'moderate' | 'weak'
  label?: string
}

interface CausalChainDiagramProps {
  nodes: CausalNode[]
  links: CausalLink[]
  title?: string
}

const nodeColors = {
  cause: 'bg-blue-100 border-blue-500 text-blue-900',
  mediator: 'bg-purple-100 border-purple-500 text-purple-900',
  effect: 'bg-green-100 border-green-500 text-green-900',
  confound: 'bg-orange-100 border-orange-500 text-orange-900'
}

const nodeLabels = {
  cause: '原因',
  mediator: '中介变量',
  effect: '结果',
  confound: '混淆因素'
}

const linkColors = {
  strong: 'border-green-600',
  moderate: 'border-yellow-600',
  weak: 'border-gray-400'
}

export default function CausalChainDiagram({ nodes, links, title = '因果关系链' }: CausalChainDiagramProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <div className="w-2 h-6 bg-blue-600 mr-3 rounded"></div>
        {title}
      </h3>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        {Object.entries(nodeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border-2 ${nodeColors[type as keyof typeof nodeColors]}`}></div>
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Diagram */}
      <div className="relative space-y-6">
        {nodes.map((node, index) => {
          const nextNode = nodes[index + 1]
          const link = links.find(l => l.from === node.id && l.to === nextNode?.id)

          return (
            <div key={node.id}>
              {/* Node */}
              <div className="flex items-center space-x-4">
                <div className={`flex-1 p-4 rounded-lg border-2 shadow-sm ${nodeColors[node.type]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{node.label}</div>
                      {node.description && (
                        <div className="text-sm opacity-80">{node.description}</div>
                      )}
                    </div>
                    <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded font-medium">
                      {nodeLabels[node.type]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Arrow */}
              {link && nextNode && (
                <div className="flex items-center justify-center my-2">
                  <div className="text-center">
                    <ArrowRight className={`h-8 w-8 ${linkColors[link.strength].replace('border', 'text')}`} />
                    {link.label && (
                      <div className="text-xs text-gray-600 mt-1">{link.label}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {link.strength === 'strong' && '强相关'}
                      {link.strength === 'moderate' && '中等相关'}
                      {link.strength === 'weak' && '弱相关'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <div className="font-semibold text-yellow-800 mb-1">注意：相关性 ≠ 因果性</div>
            <div>即使存在强相关关系，也需要通过实验、纵向研究或理论分析来确认因果关系。</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
