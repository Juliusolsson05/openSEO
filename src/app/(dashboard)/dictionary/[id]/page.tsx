'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  useDictionaryQuery,
  useGenerateDefinitionsMutation,
  useUpdateWordMutation,
  useDeleteWordMutation,
  usePublishDictionaryMutation,
  useExportDictionaryMutation,
} from '@/hooks/queries/dictionary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface Word {
  id: number
  keyword: string
  description: string
  priority: number
  letter: string
  has_definition?: boolean
}

import type { DashboardDictionary } from '@/types/dictionary'
interface Dictionary extends DashboardDictionary { words: Word[] }

export default function DictionaryDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: rawDict, isLoading: dictLoading } = useDictionaryQuery(params.id)
  const dictionary = rawDict as Dictionary | undefined
  const generateDefinitions = useGenerateDefinitionsMutation()
  const updateWord = useUpdateWordMutation()
  const deleteWordMutation = useDeleteWordMutation()
  const publishDict = usePublishDictionaryMutation()
  const exportDict = useExportDictionaryMutation()

  const [search, setSearch] = useState('')
  const [definitionFilter, setDefinitionFilter] = useState<'all' | 'missing' | 'ready'>('all')
  const [loadingWordId, setLoadingWordId] = useState<number | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [editing, setEditing] = useState<Record<number, Partial<Word>>>({})
  const [publishing, setPublishing] = useState(false)

  const words = useMemo(() => {
    if (!dictionary) return []

    return dictionary.words.filter((w) => {
      const qMatch = `${w.keyword} ${w.description}`.toLowerCase().includes(search.toLowerCase())
      if (!qMatch) return false
      if (definitionFilter === 'all') return true
      if (definitionFilter === 'missing') return !w.has_definition
      return Boolean(w.has_definition)
    })
  }, [dictionary, search, definitionFilter])

  const stats = useMemo(() => {
    if (!dictionary) return { total: 0, withDef: 0, withoutDef: 0, highPriority: 0 }
    const withDef = dictionary.words.filter((w) => w.has_definition).length
    const highPriority = dictionary.words.filter((w) => w.priority === 1).length
    return {
      total: dictionary.words.length,
      withDef,
      withoutDef: dictionary.words.length - withDef,
      highPriority,
    }
  }, [dictionary])

  const generateDefinition = async (word: Word) => {
    setLoadingWordId(word.id)
    try {
      await generateDefinitions.mutateAsync({
        dictionary_id: Number(params.id),
        word_ids: [word.id],
      })
    } catch {
    } finally {
      setLoadingWordId(null)
    }
  }

  const generateMissing = async () => {
    setGeneratingAll(true)
    try {
      await generateDefinitions.mutateAsync({ dictionary_id: Number(params.id) })
    } catch {
    } finally {
      setGeneratingAll(false)
    }
  }

  const saveWord = async (id: number) => {
    const patch = editing[id]
    if (!patch) return
    try {
      await updateWord.mutateAsync({ wordId: id, dictionaryId: Number(params.id), patch })
      setEditing((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.success('Word saved')
    } catch {
    }
  }

  const publishDictionary = async () => {
    setPublishing(true)
    try {
      await publishDict.mutateAsync({ dictionaryId: Number(params.id) })
    } catch {
    } finally {
      setPublishing(false)
    }
  }

  const exportDictionary = async () => {
    try {
      const data = await exportDict.mutateAsync({ dictionaryId: Number(params.id) })
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dictionary-${params.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Dictionary exported')
    } catch {
    }
  }

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const deleteWord = async (id: number) => {
    try {
      await deleteWordMutation.mutateAsync({ wordId: id, dictionaryId: Number(params.id) })
    } catch {
    }
  }

  if (!dictionary) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[22px]">{dictionary.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{dictionary.subject} · {dictionary.language.toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-sm" onClick={generateMissing} disabled={generatingAll}>
                {generatingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate missing definitions'
                )}
              </Button>
              <Button variant="outline" className="rounded-sm" onClick={exportDictionary}>Export JSON</Button>
              <Button className="rounded-sm gap-1.5" onClick={publishDictionary} disabled={publishing}>
                {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Publish
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">Total words: {stats.total}</Badge>
            <Badge variant="success">Ready: {stats.withDef}</Badge>
            <Badge variant="warning">Missing: {stats.withoutDef}</Badge>
            <Badge variant="outline">High priority: {stats.highPriority}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search words..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-sm rounded-sm"
            />

            <div className="ml-auto flex gap-2">
              <Button variant={definitionFilter === 'all' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => setDefinitionFilter('all')}>All</Button>
              <Button variant={definitionFilter === 'missing' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => setDefinitionFilter('missing')}>Missing definitions</Button>
              <Button variant={definitionFilter === 'ready' ? 'default' : 'outline'} className="h-8 rounded-sm" onClick={() => setDefinitionFilter('ready')}>Ready</Button>
            </div>
          </div>

          <div className="rounded-sm border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Definition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => {
                  const edit = editing[word.id]
                  return (
                    <TableRow key={word.id}>
                      <TableCell className="w-56">
                        <Input
                          className="h-8 rounded-sm"
                          value={edit?.keyword ?? word.keyword}
                          onChange={(e) => setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), keyword: e.target.value } }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 rounded-sm"
                          value={edit?.description ?? word.description}
                          onChange={(e) => setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), description: e.target.value } }))}
                        />
                      </TableCell>
                      <TableCell className="w-28">
                        <Input
                          className="h-8 rounded-sm"
                          type="number"
                          value={edit?.priority ?? word.priority}
                          onChange={(e) => setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), priority: Number(e.target.value) } }))}
                        />
                      </TableCell>
                      <TableCell className="w-36">{word.has_definition ? <Badge variant="success">Ready</Badge> : <Badge variant="warning">Missing</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {word.has_definition ? (
                            <Link href={`/dictionary/${dictionary.id}/${word.id}`}>
                              <Button size="sm" variant="outline" className="h-7 rounded-sm">View</Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 rounded-sm" onClick={() => generateDefinition(word)} disabled={loadingWordId !== null}>
                              {loadingWordId === word.id ? 'Generating...' : 'Generate'}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 rounded-sm" onClick={() => saveWord(word.id)}>Save</Button>
                          <Button size="sm" variant="outline" className="h-7 rounded-sm" onClick={() => setPendingDeleteId(word.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Word</DialogTitle>
            <DialogDescription>Are you sure you want to delete this word? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (pendingDeleteId) { deleteWord(pendingDeleteId); setPendingDeleteId(null) } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
