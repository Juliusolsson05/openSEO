'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Eye, Save, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGenerationSettingsQuery, useUpdateGenerationSettingsMutation } from '@/hooks/queries/settings'

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

/** Default config — matches Django INITIAL_GENERATION_ELEMENTS + all known types */
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

/** Convert settings array → Record<string, boolean> for the API */
function toRecord(settings: ElementSetting[]): Record<string, boolean> {
  const rec: Record<string, boolean> = {}
  for (const s of settings) rec[s.type] = s.enabled
  return rec
}

/** Merge a Record<string, boolean> from the API into our default config */
function mergeFromApi(saved: Record<string, boolean>): ElementSetting[] {
  return defaultConfig.map((def) => ({
    ...def,
    enabled: saved[def.type] !== undefined ? saved[def.type] : def.enabled,
  }))
}

export default function ElementsPage() {
  const [settings, setSettings] = useState<ElementSetting[]>(defaultConfig)
  const [search, setSearch] = useState('')
  const [previewType, setPreviewType] = useState<ElementType | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [settingsSynced, setSettingsSynced] = useState(false)

  const { data: genSettings, isLoading: loading } = useGenerationSettingsQuery()
  const updateGenSettings = useUpdateGenerationSettingsMutation()

  // Seed local element toggles from the server once the generation settings arrive.
  useEffect(() => {
    if (!genSettings || settingsSynced) return
    const saved = genSettings.initial_generation_elements
    if (saved && typeof saved === 'object') {
      setSettings(mergeFromApi(saved as Record<string, boolean>))
    }
    setSettingsSynced(true)
  }, [genSettings, settingsSynced])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

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
    setDirty(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateGenSettings.mutateAsync({ initial_generation_elements: toRecord(settings) })
      setDirty(false)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = settings.filter((s) => s.enabled).length

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
                  <Label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <Checkbox checked={e.enabled} onCheckedChange={() => toggle(e.type)} className="accent-primary" />
                    Enabled
                  </Label>
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
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-[13px] font-medium shadow-lg ${toast.variant === 'success' ? 'bg-[#DFF6DD] text-[#107C10]' : 'bg-[#FDE7E9] text-[#D13438]'}`}>
          {toast.message}
        </div>,
        document.body
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle>Element Settings</CardTitle>
            <p className="text-[12px] text-muted-foreground">
              {enabledCount} of {settings.length} elements enabled for generation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search elements" className="h-8 w-64" />
            <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading settings…
            </div>
          ) : (
            <>
              <Section rarity="common" items={grouped.common} />
              <Section rarity="uncommon" items={grouped.uncommon} />
              <Section rarity="rare" items={grouped.rare} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewType && !!PreviewComponent && !!previewExample} onOpenChange={(open) => !open && setPreviewType(null)}>
        <DialogContent className="w-full max-w-3xl p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <DialogHeader className="p-0">
                <DialogTitle asChild><CardTitle>{previewType ? `${pretty(previewType)} Preview` : 'Element Preview'}</CardTitle></DialogTitle>
              </DialogHeader>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewType(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {PreviewComponent && previewExample ? <PreviewComponent content={previewExample as any} /> : null}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
