'use client'

import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Eye, Save, X } from 'lucide-react'

import '@/components/blog/elements'
import {
  getPreviewComponent,
  getExample,
  type ElementType,
} from '@/components/blog/elements'

type Rarity = 'common' | 'uncommon' | 'rare'

interface ElementSetting {
  type: ElementType
  enabled: boolean
  rarity: Rarity
}

const STORAGE_KEY = 'aurora-element-settings-v1'

const defaultConfig: ElementSetting[] = [
  { type: 'paragraph', enabled: true, rarity: 'common' },
  { type: 'list_paragraph', enabled: true, rarity: 'common' },
  { type: 'numbered_list_paragraph', enabled: true, rarity: 'common' },
  { type: 'image', enabled: true, rarity: 'common' },
  { type: 'introduction', enabled: true, rarity: 'common' },
  { type: 'conclusion', enabled: true, rarity: 'common' },
  { type: 'table', enabled: true, rarity: 'uncommon' },
  { type: 'quote', enabled: true, rarity: 'uncommon' },
  { type: 'featured_snippet_block', enabled: true, rarity: 'uncommon' },
  { type: 'list_featured_snippet_block', enabled: true, rarity: 'uncommon' },
  { type: 'pros_and_cons', enabled: true, rarity: 'uncommon' },
  { type: 'faq', enabled: true, rarity: 'rare' },
  { type: 'timeline', enabled: true, rarity: 'rare' },
  { type: 'versus', enabled: true, rarity: 'rare' },
  { type: 'statistic', enabled: true, rarity: 'rare' },
  { type: 'bar_chart', enabled: true, rarity: 'rare' },
  { type: 'case_study', enabled: true, rarity: 'rare' },
  { type: 'tool_recommendation', enabled: true, rarity: 'rare' },
  { type: 'glossary', enabled: true, rarity: 'rare' },
  { type: 'context', enabled: true, rarity: 'rare' },
  { type: 'code_cluster', enabled: true, rarity: 'rare' },
  { type: 'poll', enabled: true, rarity: 'rare' },
  { type: 'quiz', enabled: true, rarity: 'rare' },
  { type: 'interactive_calculator', enabled: true, rarity: 'rare' },
]

function pretty(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export default function ElementsPage() {
  const [settings, setSettings] = useState<ElementSetting[]>(defaultConfig)
  const [search, setSearch] = useState('')
  const [previewType, setPreviewType] = useState<ElementType | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setSettings(parsed)
      }
    } catch {}
  }, [])

  const grouped = useMemo(() => {
    const by: Record<Rarity, ElementSetting[]> = { common: [], uncommon: [], rare: [] }
    settings.forEach((e) => by[e.rarity].push(e))
    return by
  }, [settings])

  const filter = (arr: ElementSetting[]) => {
    if (!search.trim()) return arr
    const q = search.toLowerCase()
    return arr.filter((e) => e.type.toLowerCase().includes(q) || pretty(e.type).toLowerCase().includes(q))
  }

  const toggle = (type: ElementType) => {
    setSettings((prev) => prev.map((e) => (e.type === type ? { ...e, enabled: !e.enabled } : e)))
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  const PreviewComponent = previewType ? getPreviewComponent(previewType) : null
  const previewExample = previewType ? getExample(previewType) : null

  const Section = ({ rarity, items }: { rarity: Rarity; items: ElementSetting[] }) => {
    const list = filter(items)
    if (list.length === 0) return null
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{rarity}</h2>
          <div className="h-px bg-border flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {list.map((e) => (
            <Card key={e.type} className={!e.enabled ? 'opacity-60' : ''}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-snug">{pretty(e.type)}</span>
                  <Badge variant={e.enabled ? 'success' : 'outline'}>{e.enabled ? 'On' : 'Off'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => setPreviewType(e.type)}>
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input type="checkbox" checked={e.enabled} onChange={() => toggle(e.type)} className="accent-primary" />
                    Enabled
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle>Element Settings</CardTitle>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search elements" className="h-8 w-64" />
            <Button size="sm" className="gap-1.5" onClick={save}>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section rarity="common" items={grouped.common} />
          <Section rarity="uncommon" items={grouped.uncommon} />
          <Section rarity="rare" items={grouped.rare} />
        </CardContent>
      </Card>

      {previewType && PreviewComponent && previewExample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setPreviewType(null)}>
          <Card className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle>{pretty(previewType)} Preview</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewType(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <PreviewComponent content={previewExample as any} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
