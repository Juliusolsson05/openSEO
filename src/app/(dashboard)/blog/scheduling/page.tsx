'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventDropArg } from '@fullcalendar/core'
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useAllTitlesQuery, useSchedulePostMutation, useReschedulePostMutation, useBulkCreateScheduleMutation, useBulkAssignScheduleMutation } from '@/hooks/queries/titles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'


import type { Category } from '@/types/blog'

type BulkSchedule = { id: number; name: string }

interface SchedulingTitle {
  id: number
  title_text: string
  status: number | string
  scheduled_date: string | null
  bulk_schedule: BulkSchedule | null
  categories: Category[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const generateColor = (index: number) => {
  const hue = (index * 137.508) % 360
  return `hsl(${hue}, 70%, 45%)`
}

function buildMiniCalendarWeeks(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - start.getDay())
  const weeks: Date[][] = []

  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      week.push(date)
    }
    weeks.push(week)
  }

  return weeks
}

export default function BlogSchedulingPage() {
  const calendarRef = useRef<FullCalendar>(null)

  const { data: rawTitles = [], isLoading: loading } = useAllTitlesQuery()
  const scheduleReschedule = useReschedulePostMutation()
  const schedulePost_ = useSchedulePostMutation()
  const bulkCreate = useBulkCreateScheduleMutation()
  const bulkAssign = useBulkAssignScheduleMutation()
  const posts: SchedulingTitle[] = (rawTitles as any[]).filter(
    (t: any) => t.status === 'GENERATED' || t.status === 2 || Boolean(t.scheduled_date)
  ) as SchedulingTitle[]
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [showScheduled, setShowScheduled] = useState(true)
  const [showBulk, setShowBulk] = useState(true)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [schedulePost, setSchedulePost] = useState<SchedulingTitle | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkName, setBulkName] = useState('')
  const [bulkInterval, setBulkInterval] = useState('')
  const [bulkStartDate, setBulkStartDate] = useState('')

  const [eventInfoOpen, setEventInfoOpen] = useState(false)
  const [selectedEventPost, setSelectedEventPost] = useState<SchedulingTitle | null>(null)

  const [rescheduleConfirmOpen, setRescheduleConfirmOpen] = useState(false)
  const [pendingDropInfo, setPendingDropInfo] = useState<EventDropArg | null>(null)

  const [miniYear, setMiniYear] = useState(new Date().getFullYear())
  const [miniMonth, setMiniMonth] = useState(new Date().getMonth())



  const allCategories = useMemo(() => {
    const names = new Set(posts.flatMap((p) => p.categories.map((c) => c.name)))
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [posts])

  const categoryColorByName = useMemo(() => {
    const map = new Map<string, string>()
    allCategories.forEach((name, index) => map.set(name, generateColor(index)))
    return map
  }, [allCategories])

  const viewAll = showScheduled && showBulk

  const filteredEvents = useMemo(() => {
    return posts
      .filter((p) => p.scheduled_date)
      .filter((p) => {
        if (p.bulk_schedule && !showBulk) return false
        if (!p.bulk_schedule && !showScheduled) return false
        return true
      })
      .map((p) => ({
        id: String(p.id),
        title: p.title_text,
        start: p.scheduled_date!,
        allDay: true,
        backgroundColor: p.bulk_schedule ? '#107C10' : '#0078D4',
        borderColor: 'transparent',
        extendedProps: { post: p },
      }))
  }, [posts, showBulk, showScheduled])

  const miniWeeks = useMemo(() => buildMiniCalendarWeeks(miniYear, miniMonth), [miniYear, miniMonth])

  const openScheduleDialog = (post: SchedulingTitle) => {
    setSchedulePost(post)
    setScheduleDate('')
    setScheduleDialogOpen(true)
  }

  const onEventClick = useCallback((info: EventClickArg) => {
    setSelectedEventPost(info.event.extendedProps.post as SchedulingTitle)
    setEventInfoOpen(true)
  }, [setSelectedEventPost, setEventInfoOpen])

  const onEventDrop = useCallback((info: EventDropArg) => {
    setPendingDropInfo(info)
    setRescheduleConfirmOpen(true)
  }, [setPendingDropInfo, setRescheduleConfirmOpen])

  const handleConfirmReschedule = async () => {
    if (!pendingDropInfo?.event.start) return
    try {
      await scheduleReschedule.mutateAsync({
        postId: pendingDropInfo.event.id,
        date: pendingDropInfo.event.start.toISOString(),
      })
    } catch {
      pendingDropInfo.revert()
    }
    setRescheduleConfirmOpen(false)
    setPendingDropInfo(null)
  }

  const handleCancelReschedule = () => {
    pendingDropInfo?.revert()
    setRescheduleConfirmOpen(false)
    setPendingDropInfo(null)
  }

  const handleScheduleSingle = async () => {
    if (!schedulePost || !scheduleDate) return
    try {
      await schedulePost_.mutateAsync({ postId: schedulePost.id, scheduledDate: scheduleDate })
      setScheduleDialogOpen(false)
      setSchedulePost(null)
      setScheduleDate('')
    } catch {
    }
  }

  const toggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const allSelected = posts.length > 0 && selectedIds.size === posts.length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(posts.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleCreateBulk = async () => {
    if (!bulkName || !bulkStartDate || selectedIds.size === 0) return
    const intervalValue = bulkInterval.trim() === '' ? null : Number(bulkInterval)
    try {
      const result = await bulkCreate.mutateAsync({
        name: bulkName,
        interval_days: Number.isFinite(intervalValue) ? intervalValue : null,
        start_date: new Date(bulkStartDate).toISOString(),
      })
      if (result?.id) {
        await bulkAssign.mutateAsync({
          title_ids: Array.from(selectedIds),
          bulk_schedule_id: result.id,
        })
        setBulkDialogOpen(false)
        setBulkName('')
        setBulkInterval('')
        setBulkStartDate('')
        setSelectedIds(new Set())
      }
    } catch {
    }
  }

  const selectedDateText = pendingDropInfo?.event.start?.toLocaleDateString()

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Blog Scheduling</h1>
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          <span className="ml-2">{sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
        </Button>
      </div>

      <div className="flex gap-4">
        {sidebarOpen && (
          <Card className="h-fit w-[280px] shrink-0">
            <CardContent className="space-y-4 p-4">
              <Button asChild className="w-full bg-[#0078D4] hover:bg-[#106EBE]">
                <Link href="/blog">Back to Blog</Link>
              </Button>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (miniMonth === 0) {
                        setMiniMonth(11)
                        setMiniYear((y) => y - 1)
                      } else {
                        setMiniMonth((m) => m - 1)
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    {new Date(miniYear, miniMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (miniMonth === 11) {
                        setMiniMonth(0)
                        setMiniYear((y) => y + 1)
                      } else {
                        setMiniMonth((m) => m + 1)
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {DAYS.map((d) => (
                    <div key={d}>{d[0]}</div>
                  ))}
                </div>

                <div className="space-y-1">
                  {miniWeeks.map((week, i) => (
                    <div key={i} className="grid grid-cols-7 gap-1">
                      {week.map((day) => {
                        const inMonth = day.getMonth() === miniMonth
                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => calendarRef.current?.getApi().gotoDate(day)}
                            className={`rounded px-1 py-1 text-xs transition hover:bg-muted ${
                              inMonth ? 'text-foreground' : 'text-muted-foreground/40'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Filters</h3>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={viewAll}
                    onCheckedChange={(checked) => {
                      const value = Boolean(checked)
                      setShowScheduled(value)
                      setShowBulk(value)
                    }}
                  />
                  <span>View All</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showScheduled} onCheckedChange={(checked) => setShowScheduled(Boolean(checked))} />
                  <span>Scheduled Posts</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showBulk} onCheckedChange={(checked) => setShowBulk(Boolean(checked))} />
                  <span>Bulk Posts</span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="min-w-0 flex-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                editable
                dayMaxEvents
                events={filteredEvents}
                eventDrop={onEventDrop}
                eventClick={onEventClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Post List</CardTitle>
              <Button
                className="bg-[#0078D4] hover:bg-[#106EBE]"
                disabled={selectedIds.size === 0}
                onClick={() => setBulkDialogOpen(true)}
              >
                Create Bulk Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))} />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Bulk Schedule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Loading posts...
                      </TableCell>
                    </TableRow>
                  ) : posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No posts available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow
                        key={post.id}
                        className={!post.scheduled_date ? 'cursor-pointer' : ''}
                        onClick={() => {
                          if (!post.scheduled_date) openScheduleDialog(post)
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(post.id)}
                            onCheckedChange={(checked) => toggleSelected(post.id, Boolean(checked))}
                          />
                        </TableCell>
                        <TableCell className="max-w-[360px] truncate" title={post.title_text}>
                          {post.title_text}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {post.categories?.length ? (
                              post.categories.map((category) => (
                                <Badge
                                  key={category.id}
                                  className="text-white"
                                  style={{ backgroundColor: categoryColorByName.get(category.name) }}
                                >
                                  {category.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.scheduled_date ? new Date(post.scheduled_date).toLocaleString() : 'Not scheduled'}
                        </TableCell>
                        <TableCell>
                          {post.bulk_schedule ? (
                            <Badge className="bg-[#107C10] text-white hover:bg-[#107C10]">{post.bulk_schedule.name}</Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>Choose a date for &quot;{schedulePost?.title_text}&quot;.</DialogDescription>
          </DialogHeader>
          <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#0078D4] hover:bg-[#106EBE]" disabled={!scheduleDate} onClick={handleScheduleSingle}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bulk Schedule</DialogTitle>
            <DialogDescription>Assign {selectedIds.size} selected post(s) to a bulk schedule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Schedule Name" value={bulkName} onChange={(e) => setBulkName(e.target.value)} />
            <Input
              type="number"
              placeholder="Interval Days (optional)"
              value={bulkInterval}
              onChange={(e) => setBulkInterval(e.target.value)}
            />
            <Input type="datetime-local" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0078D4] hover:bg-[#106EBE]"
              disabled={!bulkName || !bulkStartDate || selectedIds.size === 0}
              onClick={handleCreateBulk}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventInfoOpen} onOpenChange={setEventInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedEventPost && (
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {selectedEventPost.title_text}</p>
              <p>
                <strong>Date:</strong>{' '}
                {selectedEventPost.scheduled_date ? new Date(selectedEventPost.scheduled_date).toLocaleString() : 'Not scheduled'}
              </p>
              <p><strong>Type:</strong> {selectedEventPost.bulk_schedule ? 'Bulk Posts' : 'Scheduled Posts'}</p>
              <p><strong>Bulk schedule:</strong> {selectedEventPost.bulk_schedule?.name ?? '—'}</p>
              <p>
                <strong>Categories:</strong>{' '}
                {selectedEventPost.categories.length
                  ? selectedEventPost.categories.map((c) => c.name).join(', ')
                  : '—'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleConfirmOpen} onOpenChange={setRescheduleConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Post</DialogTitle>
            <DialogDescription>
              Reschedule &quot;{pendingDropInfo?.event.title}&quot; to {selectedDateText}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelReschedule}>Cancel</Button>
            <Button className="bg-[#0078D4] hover:bg-[#106EBE]" onClick={handleConfirmReschedule}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .fc .fc-button-primary {
          background-color: #0078d4;
          border-color: #0078d4;
        }
        .fc .fc-button-primary:hover {
          background-color: #106ebe;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #005a9e;
        }
        .fc .fc-daygrid-event {
          border: none;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 12px;
        }
        .fc .fc-day-today {
          background-color: #deecf9 !important;
        }
      `}</style>
    </div>
  )
}
