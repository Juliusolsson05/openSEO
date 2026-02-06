'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api'
import { useDictionaryStore } from '@/stores/dictionary-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface Dictionary {
  id: number
  title: string
  subject: string
  language: string
  num_words: number
  total_words?: number
  status: string
  current_letter?: string
}

export default function DictionaryPage() {
  const { fetchDictionaries, dictionaries, totalDictionaries, isGenerating, currentDictionary, clearStore } = useDictionaryStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchDictionaries({ searchQuery, itemsPerPage, page })
  }, [fetchDictionaries, searchQuery, page])

  const totalPages = Math.max(1, Math.ceil(totalDictionaries / itemsPerPage))

  const getStatusText = (dictionary: Dictionary) => {
    if (currentDictionary?.id === dictionary.id) {
      return `Generating (${(currentDictionary.current_letter || 'a').toUpperCase()})`
    }
    if (dictionary.status === 'generating') return `Generating (${(dictionary.current_letter || 'a').toUpperCase()})`
    if (dictionary.status === 'in_progress') return 'In Progress'
    if (dictionary.status === 'definition_generation') return 'Generating Definitions'
    return 'Complete'
  }

  const isIncomplete = (dictionary: Dictionary) => ['generating', 'in_progress', 'definition_generation'].includes(dictionary.status)

  const handleDelete = async (id: number) => {
    const ok = window.confirm('Delete this dictionary? This cannot be undone.')
    if (!ok) return

    const { error } = await apiPost('/api/aurora/dictionary/dictionary/words/delete', { dictionary_id: id })
    if (error) {
      window.alert(error.message)
      return
    }

    if (currentDictionary?.id === id) clearStore()
    await fetchDictionaries({ searchQuery, itemsPerPage, page })
  }

  const cards = useMemo(() => dictionaries || [], [dictionaries])

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <Card className="border-[#E1E1E1] rounded-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-[20px]">Dictionaries Dashboard</CardTitle>
              <p className="text-muted-foreground">Total {totalDictionaries} dictionaries</p>
            </div>
            <Link href="/dictionary/generate">
              <Button className="rounded-sm bg-[#0078D4] hover:bg-[#106ebe]">Create New Dictionary</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm">
            <Input
              placeholder="Search dictionaries..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1)
                setSearchQuery(e.target.value)
              }}
              className="rounded-sm border-[#E1E1E1]"
            />
          </div>

          {isGenerating && cards.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((dictionary) => (
                <Card key={dictionary.id} className="border rounded-sm bg-white" style={{ borderColor: isIncomplete(dictionary) ? '#f59e0b' : '#E1E1E1' }}>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/dictionary/${dictionary.id}`} className="font-semibold hover:underline">
                        {dictionary.title}
                      </Link>
                      {isIncomplete(dictionary) && <Badge className="rounded-sm bg-amber-500">{getStatusText(dictionary)}</Badge>}
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      <p>Subject: {dictionary.subject}</p>
                      <p>Language: {dictionary.language}</p>
                      <p>
                        Words: {dictionary.num_words} per letter{' '}
                        <span>(Total: {dictionary.total_words ?? dictionary.num_words * 26})</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dictionary/${dictionary.id}`}>
                        <Button variant="outline" className="rounded-sm">View</Button>
                      </Link>
                      <Link href={`/dictionary/${dictionary.id}`}>
                        <Button variant="outline" className="rounded-sm">Edit</Button>
                      </Link>
                      <Button variant="outline" className="rounded-sm" onClick={() => handleDelete(dictionary.id)}>Delete</Button>
                      {isIncomplete(dictionary) && (
                        <Link href="/dictionary/generate/keywords">
                          <Button className="rounded-sm bg-[#0078D4] hover:bg-[#106ebe]">Resume</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" className="rounded-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Previous
            </Button>
            <span className="text-xs uppercase tracking-wide">Page {page} / {totalPages}</span>
            <Button variant="outline" className="rounded-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
