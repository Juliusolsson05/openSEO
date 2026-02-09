'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AnalyticsBlogTitle } from '@/stores/analytics-store'

interface BlogNetworkPreviewProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'id' | 'title_text' | 'post_linking'>[]
}

export function BlogNetworkPreview({ blogTitles }: BlogNetworkPreviewProps) {
  const { nodes, edges } = useMemo(() => {
    const count = blogTitles.length
    if (count === 0) return { nodes: [], edges: [] }

    const W = 400
    const H = 340
    const cx = W / 2
    const cy = H / 2
    const padding = 30

    // Use a spiral layout for better distribution with many nodes
    const localNodes = blogTitles.map((post, i) => {
      if (count === 1) {
        return { id: post.id, title: post.title_text, x: cx, y: cy }
      }

      // Concentric rings: split nodes into rings of increasing size
      const rings = Math.ceil(Math.sqrt(count / 4))
      const nodesPerRing = Math.ceil(count / rings)
      const ring = Math.floor(i / nodesPerRing)
      const indexInRing = i % nodesPerRing
      const ringCount = Math.min(nodesPerRing, count - ring * nodesPerRing)

      const maxRadius = Math.min(cx, cy) - padding
      const ringRadius = ((ring + 1) / (rings + 0.5)) * maxRadius
      const angle = (indexInRing / ringCount) * Math.PI * 2 + (ring * Math.PI) / 6 // offset each ring

      return {
        id: post.id,
        title: post.title_text,
        x: cx + Math.cos(angle) * ringRadius,
        y: cy + Math.sin(angle) * ringRadius,
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
        {nodes.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No posts to visualize.</p>
        ) : (
          <svg viewBox="0 0 400 340" className="h-[300px] w-full rounded-sm border border-border bg-white">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#CFCFCF" />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const from = nodeMap.get(edge.from)
              const to = nodeMap.get(edge.to)
              if (!from || !to) return null
              return (
                <line
                  key={index}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="#D0D0D0"
                  strokeWidth="1"
                  markerEnd="url(#arrowhead)"
                  opacity={0.6}
                />
              )
            })}
            {nodes.map((node) => {
              // Size by connection count
              const outgoing = blogTitles.find((b) => b.id === node.id)?.post_linking?.length ?? 0
              const r = Math.max(4, Math.min(8, 4 + outgoing))
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={r} fill="#0078D4" opacity={0.85}>
                    <title>{node.title} ({outgoing} links)</title>
                  </circle>
                </g>
              )
            })}
          </svg>
        )}
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-[#0078D4]" />
            <span>{nodes.length} posts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[1px] w-4 bg-[#D0D0D0]" />
            <span>{edges.length} links</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
