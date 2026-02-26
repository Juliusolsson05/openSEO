'use client'

import { useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Maximize2, X } from 'lucide-react'

import type { AnalyticsBlogTitle } from '@/types/analytics'

interface BlogNetworkPreviewProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'id' | 'title_text' | 'post_linking'>[]
}

interface LayoutNode {
  id: number
  title: string
  x: number
  y: number
  outgoing: number
  incoming: number
}

function buildGraph(
  blogTitles: Pick<AnalyticsBlogTitle, 'id' | 'title_text' | 'post_linking'>[],
  w: number,
  h: number,
  padding = 30,
) {
  const count = blogTitles.length
  if (count === 0) return { nodes: [] as LayoutNode[], edges: [] as Array<{ from: number; to: number }> }

  const cx = w / 2
  const cy = h / 2

  const incomingMap = new Map<number, number>()
  for (const post of blogTitles) {
    for (const linked of post.post_linking || []) {
      incomingMap.set(linked, (incomingMap.get(linked) ?? 0) + 1)
    }
  }

  const localNodes: LayoutNode[] = blogTitles.map((post, i) => {
    const outgoing = post.post_linking?.length ?? 0
    const incoming = incomingMap.get(post.id) ?? 0

    if (count === 1) {
      return { id: post.id, title: post.title_text, x: cx, y: cy, outgoing, incoming }
    }

    // Concentric rings for better distribution
    const rings = Math.ceil(Math.sqrt(count / 4))
    const nodesPerRing = Math.ceil(count / rings)
    const ring = Math.floor(i / nodesPerRing)
    const indexInRing = i % nodesPerRing
    const ringCount = Math.min(nodesPerRing, count - ring * nodesPerRing)

    const maxRadius = Math.min(cx, cy) - padding
    const ringRadius = ((ring + 1) / (rings + 0.5)) * maxRadius
    const angle = (indexInRing / ringCount) * Math.PI * 2 + (ring * Math.PI) / 6

    return {
      id: post.id,
      title: post.title_text,
      x: cx + Math.cos(angle) * ringRadius,
      y: cy + Math.sin(angle) * ringRadius,
      outgoing,
      incoming,
    }
  })

  const idSet = new Set(localNodes.map((n) => n.id))
  const localEdges: Array<{ from: number; to: number }> = []
  for (const post of blogTitles) {
    for (const linked of post.post_linking || []) {
      if (idSet.has(linked)) localEdges.push({ from: post.id, to: linked })
    }
  }

  return { nodes: localNodes, edges: localEdges }
}

function NetworkSvg({
  nodes,
  edges,
  viewBox,
  className,
  showLabels = false,
}: {
  nodes: LayoutNode[]
  edges: Array<{ from: number; to: number }>
  viewBox: string
  className?: string
  showLabels?: boolean
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return (
    <svg viewBox={viewBox} className={className}>
      <defs>
        <marker id="net-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#B0B0B0" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to) return null
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke="#CFCFCF"
            strokeWidth="1"
            markerEnd="url(#net-arrow)"
            opacity={0.6}
          />
        )
      })}
      {nodes.map((node) => {
        const r = Math.max(4, Math.min(10, 4 + node.outgoing + node.incoming * 0.5))
        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={r} fill="#0078D4" opacity={0.85}>
              <title>{node.title} (out: {node.outgoing}, in: {node.incoming})</title>
            </circle>
            {showLabels && (
              <text
                x={node.x}
                y={node.y - r - 3}
                textAnchor="middle"
                fontSize={node.incoming >= 2 || node.outgoing >= 3 ? '8' : '6'}
                fill={node.incoming >= 2 || node.outgoing >= 3 ? '#1A1A1A' : '#888'}
                fontWeight={node.incoming >= 2 || node.outgoing >= 3 ? 'bold' : 'normal'}
                className="pointer-events-none"
              >
                {node.title.length > 35 ? node.title.slice(0, 33) + '…' : node.title}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function BlogNetworkPreview({ blogTitles }: BlogNetworkPreviewProps) {
  const [fullOpen, setFullOpen] = useState(false)

  const preview = useMemo(() => buildGraph(blogTitles, 400, 340), [blogTitles])
  const full = useMemo(() => buildGraph(blogTitles, 900, 700, 50), [blogTitles])

  const rankedPosts = useMemo(() => {
    return [...full.nodes]
      .sort((a, b) => b.incoming - a.incoming || b.outgoing - a.outgoing)
      .slice(0, 10)
  }, [full.nodes])

  return (
    <>
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Network preview</CardTitle>
        </CardHeader>
        <CardContent>
          {preview.nodes.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-muted-foreground">No posts to visualize.</p>
          ) : (
            <NetworkSvg
              nodes={preview.nodes}
              edges={preview.edges}
              viewBox="0 0 400 340"
              className="h-[300px] w-full rounded-sm border border-border bg-white"
            />
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-[#0078D4]" />
                <span>{preview.nodes.length} posts</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-[1px] w-4 bg-[#D0D0D0]" />
                <span>{preview.edges.length} links</span>
              </div>
            </div>
            {preview.nodes.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={() => setFullOpen(true)}>
                <Maximize2 className="h-3.5 w-3.5" />
                View Full Network
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={fullOpen} onOpenChange={setFullOpen}>
        <DialogContent className="h-[90vh] w-[95vw] max-w-[1100px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Blog Post Network</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 gap-4 overflow-hidden">
            <div className="flex-1 overflow-hidden rounded-sm border border-border bg-white">
              <NetworkSvg
                nodes={full.nodes}
                edges={full.edges}
                viewBox="0 0 900 700"
                className="h-full w-full"
                showLabels
              />
            </div>
            <div className="hidden w-[260px] shrink-0 overflow-y-auto md:block">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Most Connected Posts
              </p>
              <div className="space-y-1.5">
                {rankedPosts.map((post, i) => (
                  <div key={post.id} className="flex items-start gap-2 rounded-sm border border-border p-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[11px] font-medium leading-tight">{post.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {post.incoming} incoming · {post.outgoing} outgoing
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
