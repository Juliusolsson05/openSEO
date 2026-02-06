'use client'

/**
 * Blog Scheduling — ported from aurora_dashboard/pages/blog-scheduling.vue
 * Calendar view + data table of scheduled posts with bulk scheduling.
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
  Clock,
  Tag,
  Pencil,
} from 'lucide-react'
import { api, apiPost, apiPut } from '@/lib/api'

interface ScheduledPost {
  id: number
  title_text: string
  status: number
  scheduled_date: string | null
  bulk_schedule: { id: number; name: string } | null
  categories: { id: number; name: string }[]
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: ScheduledPost[]
}

function getCalendarDays(year: number, month: number, posts: ScheduledPost[]): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Start from Sunday

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: CalendarDay[] = []
  const current = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const dateStr = current.toISOString().split('T')[0]
    const dayPosts = posts.filter((p) => {
      if (!p.scheduled_date) return false
      return p.scheduled_date.startsWith(dateStr)
    })

    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.getTime() === today.getTime(),
      posts: dayPosts,
    })
    current.setDate(current.getDate() + 1)
  }
  return days
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function BlogSchedulingPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkName, setBulkName] = useState('')
  const [bulkInterval, setBulkInterval] = useState('')
  const [bulkStartDate, setBulkStartDate] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await api<any>('/api/aurora/blog/titles', { params: { status: '4' } })
    if (data) {
      const items = Array.isArray(data) ? data : data?.data ?? data?.results ?? []
      setPosts(items.filter((p: ScheduledPost) => p.status === 4))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const calendarDays = getCalendarDays(currentYear, currentMonth, posts)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  const toggleSelect = (id: number) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleCreateBulk = async () => {
    if (!bulkName || !bulkStartDate) return
    const { data } = await apiPost('/api/aurora/blog/schedule/bulk/create/', {
      name: bulkName,
      interval_days: bulkInterval ? parseInt(bulkInterval) : null,
      start_date: new Date(bulkStartDate).toISOString(),
    })
    if (data?.id) {
      await apiPost('/api/aurora/blog/schedule/bulk/assign/', {
        title_ids: selectedPosts,
        bulk_schedule_id: data.id,
      })
      setSelectedPosts([])
      setShowBulkForm(false)
      setBulkName('')
      setBulkInterval('')
      setBulkStartDate('')
      fetchPosts()
    }
  }

  const unscheduledPosts = posts.filter((p) => !p.scheduled_date && !p.bulk_schedule)
  const scheduledPosts = posts.filter((p) => p.scheduled_date || p.bulk_schedule)

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle>{MONTH_NAMES[currentMonth]} {currentYear}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()) }}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`min-h-[90px] border-b border-r border-border/60 p-1.5 ${
                      !day.isCurrentMonth ? 'bg-secondary/30' : ''
                    } ${day.isToday ? 'bg-[#EBF3FC]' : ''}`}
                  >
                    <span className={`text-[12px] font-semibold ${
                      day.isToday ? 'text-primary' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {day.posts.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate cursor-pointer ${
                            p.bulk_schedule
                              ? 'bg-success-light text-success'
                              : 'bg-info-light text-primary'
                          }`}
                          title={p.title_text}
                        >
                          {p.title_text}
                        </div>
                      ))}
                      {day.posts.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{day.posts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Unscheduled posts */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Unscheduled Posts ({unscheduledPosts.length})</CardTitle>
                {selectedPosts.length > 0 && (
                  <Button size="sm" className="gap-1.5" onClick={() => setShowBulkForm(true)}>
                    <Plus className="h-3 w-3" /> Bulk Schedule ({selectedPosts.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : unscheduledPosts.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-muted-foreground">
                  All posts are scheduled.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {unscheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F8F8]">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        className="rounded-sm border-border accent-primary"
                      />
                      <span className="text-[13px] truncate flex-1">{post.title_text}</span>
                      {post.categories.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {post.categories[0].name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scheduled posts list */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Scheduled Posts ({scheduledPosts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : scheduledPosts.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-muted-foreground">
                  No posts scheduled yet.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F8F8]">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[13px] truncate flex-1">{post.title_text}</span>
                      {post.bulk_schedule && (
                        <Badge variant="success" className="text-[10px]">{post.bulk_schedule.name}</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {post.scheduled_date
                          ? new Date(post.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk schedule modal */}
      {showBulkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowBulkForm(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create Bulk Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold mb-1 block">Schedule Name</label>
                <Input value={bulkName} onChange={(e) => setBulkName(e.target.value)} placeholder="e.g. Weekly Content" className="h-9" />
              </div>
              <div>
                <label className="text-[13px] font-semibold mb-1 block">Interval (days)</label>
                <Input type="number" value={bulkInterval} onChange={(e) => setBulkInterval(e.target.value)} placeholder="e.g. 7" className="h-9" />
              </div>
              <div>
                <label className="text-[13px] font-semibold mb-1 block">Start Date</label>
                <Input type="date" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} className="h-9" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowBulkForm(false)}>Cancel</Button>
                <Button onClick={handleCreateBulk} disabled={!bulkName || !bulkStartDate}>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
