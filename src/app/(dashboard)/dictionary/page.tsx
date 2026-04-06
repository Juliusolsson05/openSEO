'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDictionariesQuery } from '@/hooks/queries/dictionary'
import { useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { DashboardDictionary as Dictionary } from '@/types/dictionary'

const statusLabel = (d: Dictionary, currentId?: number, currentLetter?: string) => {
  if (currentId === d.id) return `Generating (${(currentLetter || 'a').toUpperCase()})`
  if (d.status === 'generating') return `Generating (${(d.current_letter || 'a').toUpperCase()})`
  if (d.status === 'in_progress') return 'In progress'
  if (d.status === 'definition_generation') return 'Definition generation'
  return 'Completed'
}

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const itemsPerPage = 10

  const { data, isLoading } = useDictionariesQuery({ searchQuery, itemsPerPage, page, status: statusFilter })
  const dictionaries = data?.dictionaries ?? []
  const totalDictionaries = data?.total ?? 0
  const inProgress = data?.inProgressTotal ?? 0
  const completed = data?.completedTotal ?? 0

  const currentDictionary = useAppSelector((s) => s.dictionarySession.currentDictionary)
  const isGenerating = useAppSelector((s) => s.dictionarySession.isGenerating)

  const rows = dictionaries
  const totalPages = Math.max(1, Math.ceil(totalDictionaries / itemsPerPage))

  return (
    <div className="space-y-4">
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[22px]">Dictionary</CardTitle>
              <p className="text-sm text-muted-foreground">Command center for generation, review, and maintenance.</p>
            </div>
            <Link href="/dictionary/generate">
              <Button className="rounded-sm">+ New Dictionary</Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search dictionaries..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1)
                setSearchQuery(e.target.value)
              }}
              className="h-8 max-w-sm rounded-sm"
            />

            <div className="ml-auto flex gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => { setPage(1); setStatusFilter('all') }}>All</Button>
              <Button variant={statusFilter === 'active' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => { setPage(1); setStatusFilter('active') }}>In progress</Button>
              <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => { setPage(1); setStatusFilter('completed') }}>Completed</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-semibold">{totalDictionaries}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">In progress</p><p className="text-2xl font-semibold">{inProgress}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-semibold">{completed}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Page</p><p className="text-2xl font-semibold">{page}/{totalPages}</p></CardContent></Card>
          </div>

          {isLoading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-sm" />)}
            </div>
          ) : (
            <div className="rounded-sm border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Lang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell className="text-muted-foreground">{d.subject}</TableCell>
                      <TableCell className="uppercase">{d.language}</TableCell>
                      <TableCell>
                        <Badge variant={['generating', 'in_progress', 'definition_generation'].includes(d.status ?? '') ? 'warning' : 'success'}>
                          {statusLabel(d, currentDictionary?.id, currentDictionary?.current_letter)}
                        </Badge>
                      </TableCell>
                      <TableCell>{d.num_words} / {d.total_words ?? d.num_words * 26}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dictionary/${d.id}`}><Button size="sm" variant="outline" className="h-7 rounded-sm">Open</Button></Link>
                          {['generating', 'in_progress', 'definition_generation'].includes(d.status ?? '') && currentDictionary?.id === d.id ? (
                            <Link href="/dictionary/generate/keywords"><Button size="sm" className="h-7 rounded-sm">Resume</Button></Link>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" className="h-8 rounded-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Page {page} / {totalPages}</span>
            <Button variant="outline" className="h-8 rounded-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
