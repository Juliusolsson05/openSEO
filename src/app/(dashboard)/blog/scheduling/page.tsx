'use client'

import { Label } from '@/components/ui/label'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  X,
  Search,
} from 'lucide-react'
import { api, apiPost, apiPut } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ScheduledPost {
  id: number
  title_text: string
  status: number
  scheduled_date: string | null
  bulk_schedule: { id: number; name: string } | null
  categories: { id: number; name: string }[]
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getCalendarWeeks(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const weeks: Date[][] = []
  let current = new Date(start)
  while (current <= last || weeks.length < 5) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length >= 6) break
  }
  return weeks
}

export default function BlogSchedulingPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [bulkName, setBulkName] = useState('')
  const [bulkInterval, setBulkInterval] = useState('7')
  const [bulkStart, setBulkStart] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await api<any>('/api/aurora/blog/titles/')
    if (data) {
      const items = Array.isArray(data) ? data : data?.data ?? data?.results ?? []
      setPosts(items.filter((p: any) => p.status === 4 || p.scheduled_date))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const today = new Date()
  today.setHours(0,0,0,0)
  const weeks = getCalendarWeeks(year, month)

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {}
    posts.forEach((p) => {
      if (!p.scheduled_date) return
      const key = p.scheduled_date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [posts])

  const unscheduled = useMemo(() => {
    let items = posts.filter((p) => !p.scheduled_date)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((p) => p.title_text.toLowerCase().includes(q))
    }
    return items
  }, [posts, search])

  const scheduled = posts.filter((p) => p.scheduled_date)

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }
  const goToday = () => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()) }

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const handleBulkSchedule = async () => {
    if (!bulkName || !bulkStart) return
    const { data } = await apiPost('/api/aurora/blog/schedule/bulk/create/', {
      name: bulkName,
      interval_days: parseInt(bulkInterval) || 7,
      start_date: new Date(bulkStart).toISOString(),
    })
    if (data?.id) {
      await apiPost('/api/aurora/blog/schedule/bulk/assign/', {
        title_ids: [...selected],
        bulk_schedule_id: data.id,
      })
      setSelected(new Set())
      setShowBulk(false)
      setBulkName(''); setBulkInterval('7'); setBulkStart('')
      fetchPosts()
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-0">
          <CardTitle className="text-[16px]">{MONTHS[month]} {year}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-7 text-[12px]" onClick={goToday}>Today</Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {loading ? (
            <div className="p-6"><Skeleton className="h-72 w-full" /></div>
          ) : (
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow>
                  {DAYS.map((d) => (
                    <TableHead key={d} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide pb-2 text-center w-[14.28%]">{d}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((week, wi) => (
                  <TableRow key={wi}>
                    {week.map((day, di) => {
                      const key = day.toISOString().slice(0, 10)
                      const dayPosts = postsByDate[key] || []
                      const isCurrent = day.getMonth() === month
                      const isToday = day.getTime() === today.getTime()
                      return (
                        <TableCell key={di} className={`border border-border/60 p-1 align-top h-20 ${!isCurrent ? 'bg-secondary/30' : ''} ${isToday ? 'bg-info-light' : ''}`}>
                          <span className={`text-[11px] font-semibold ${isToday ? 'text-primary' : isCurrent ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                            {day.getDate()}
                          </span>
                          {dayPosts.slice(0, 2).map((p) => (
                            <div key={p.id} className={`text-[10px] px-1 py-0.5 mt-0.5 rounded-sm truncate ${p.bulk_schedule ? 'bg-success-light text-success' : 'bg-info-light text-primary'}`} title={p.title_text}>
                              {p.title_text}
                            </div>
                          ))}
                          {dayPosts.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 2}</span>}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unscheduled */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-[14px]">Unscheduled ({unscheduled.length})</CardTitle>
            {selected.size > 0 && (
              <Button size="sm" className="gap-1.5" onClick={() => setShowBulk(true)}>
                <CalendarDays className="h-3 w-3" /> Schedule ({selected.size})
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 w-full rounded-sm border border-border bg-white pl-7 pr-3 text-[12px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : unscheduled.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-muted-foreground pb-6">
                {search ? 'No matches.' : 'All posts are scheduled.'}
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                {unscheduled.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-muted">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} className="accent-primary" />
                    <span className="text-[13px] truncate flex-1">{p.title_text}</span>
                    {p.categories?.[0] && <Badge variant="outline" className="text-[10px] shrink-0">{p.categories[0].name}</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">Scheduled ({scheduled.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : scheduled.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-muted-foreground pb-6">No posts scheduled yet.</div>
            ) : (
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                {scheduled.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-muted">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[13px] truncate flex-1">{p.title_text}</span>
                    {p.bulk_schedule && <Badge variant="success" className="text-[10px] shrink-0">{p.bulk_schedule.name}</Badge>}
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {p.scheduled_date ? new Date(p.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk schedule modal */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="w-full max-w-sm p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <DialogHeader className="p-0">
                <DialogTitle asChild><CardTitle>Bulk Schedule</CardTitle></DialogTitle>
              </DialogHeader>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowBulk(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-[13px] font-semibold mb-1 block">Name</Label>
                <Input value={bulkName} onChange={(e) => setBulkName(e.target.value)} placeholder="e.g. Weekly Content" className="h-8" />
              </div>
              <div>
                <Label className="text-[13px] font-semibold mb-1 block">Interval (days)</Label>
                <Input type="number" value={bulkInterval} onChange={(e) => setBulkInterval(e.target.value)} className="h-8" />
              </div>
              <div>
                <Label className="text-[13px] font-semibold mb-1 block">Start Date</Label>
                <Input type="date" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} className="h-8" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => setShowBulk(false)}>Cancel</Button>
                <Button size="sm" onClick={handleBulkSchedule} disabled={!bulkName || !bulkStart}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
