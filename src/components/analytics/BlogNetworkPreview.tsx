'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BlogTitle {
  id: number
  title_text: string
  post_linking: number[]
}

interface BlogNetworkPreviewProps {
  blogTitles: BlogTitle[]
}

export function BlogNetworkPreview({ blogTitles }: BlogNetworkPreviewProps) {
  const { nodes, edges } = useMemo(() => {
    const count = blogTitles.length
    const radius = 120
    const centerX = 170
    const centerY = 150

    const localNodes = blogTitles.map((post, i) => {
      const angle = (i / Math.max(1, count)) * Math.PI * 2
      return {
        id: post.id,
        title: post.title_text,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })

    const nodeMap = new Map(localNodes.map((n) => [n.id, n]))
    const localEdges: Array<{ from: number; to: number }> = []
    for (const post of blogTitles) {
      for (const linked of post.post_linking || []) {
        if (nodeMap.has(linked)) localEdges.push({ from: post.id, to: linked })
      }
    }

    return { nodes: localNodes, edges: localEdges }
  }, [blogTitles])

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Network preview</CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 340 300" className="h-[300px] w-full rounded-sm border border-border bg-white">
          {edges.map((edge, index) => {
            const from = nodeMap.get(edge.from)
            const to = nodeMap.get(edge.to)
            if (!from || !to) return null
            return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#CFCFCF" strokeWidth="1" />
          })}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="5" fill="#0078D4">
                <title>{node.title}</title>
              </circle>
            </g>
          ))}
        </svg>
        <div className="mt-3">
          <Button variant="outline" size="sm">View Full Network</Button>
        </div>
      </CardContent>
    </Card>
  )
}
