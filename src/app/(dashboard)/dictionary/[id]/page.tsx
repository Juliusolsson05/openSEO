'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api, apiDelete, apiPost, apiPut } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface Dictionary {
  id: number
  title: string
  subject: string
  language: string
  num_words: number
  words: Word[]
}

export default function DictionaryDetailPage() {
  const params = useParams<{ id: string }>()
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [search, setSearch] = useState('')
  const [loadingWordId, setLoadingWordId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Record<number, Partial<Word>>>({})

  const fetchDictionary = async () => {
    const { data, error } = await api<Dictionary>(`/api/aurora/dictionary/dictionary/${params.id}`)
    if (error) {
      window.alert(error.message)
      return
    }
    setDictionary(data)
  }

  useEffect(() => {
    fetchDictionary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const filtered = useMemo(() => {
    if (!dictionary) return []
    return dictionary.words.filter((w) =>
      `${w.keyword} ${w.description}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [dictionary, search])

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Word[]>>((acc, word) => {
      const letter = (word.letter || word.keyword[0] || '').toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(word)
      return acc
    }, {})
  }, [filtered])

  const generateDefinition = async (word: Word) => {
    setLoadingWordId(word.id)
    const { error } = await apiPost('/api/aurora/dictionary/generation/definition/generate/', {
      session_id: Number(params.id),
      word: word.keyword,
    })
    setLoadingWordId(null)
    if (error) return window.alert(error.message)
    fetchDictionary()
  }

  const saveWord = async (id: number) => {
    const patch = editing[id]
    if (!patch) return
    const { error } = await apiPut(`/api/aurora/dictionary/modify/word/${id}`, patch)
    if (error) return window.alert(error.message)
    setEditing((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    fetchDictionary()
  }

  const deleteWord = async (id: number) => {
    if (!window.confirm('Delete word?')) return
    const { error } = await apiDelete(`/api/aurora/dictionary/modify/word/${id}`)
    if (error) return window.alert(error.message)
    fetchDictionary()
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
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <Card className="rounded-sm border-border">
        <CardHeader>
          <CardTitle className="text-[20px]">{dictionary.title}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge className="rounded-sm">Subject: {dictionary.subject}</Badge>
            <Badge className="rounded-sm" variant="outline">Language: {dictionary.language}</Badge>
            <Badge className="rounded-sm" variant="outline">Total Words: {dictionary.num_words}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm rounded-sm"
          />

          {Object.keys(grouped)
            .sort()
            .map((letter) => (
              <div key={letter} className="space-y-2">
                <h3 className="font-semibold">Words starting with “{letter}”</h3>
                <div className="border border-border rounded-sm overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-background text-left">
                      <TableRow>
                        <TableHead className="p-2">Keyword</TableHead>
                        <TableHead className="p-2">Description</TableHead>
                        <TableHead className="p-2">Priority</TableHead>
                        <TableHead className="p-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped[letter].map((word) => {
                        const edit = editing[word.id]
                        return (
                          <TableRow key={word.id} className="border-t border-border">
                            <TableCell className="p-2">
                              <Input
                                className="rounded-sm"
                                value={edit?.keyword ?? word.keyword}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), keyword: e.target.value } }))
                                }
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                className="rounded-sm"
                                value={edit?.description ?? word.description}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), description: e.target.value } }))
                                }
                              />
                            </TableCell>
                            <TableCell className="p-2 w-24">
                              <Input
                                className="rounded-sm"
                                type="number"
                                value={edit?.priority ?? word.priority}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [word.id]: { ...(prev[word.id] || {}), priority: Number(e.target.value) } }))
                                }
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="flex flex-wrap gap-2">
                                {word.has_definition ? (
                                  <Link href={`/dictionary/${dictionary.id}/${word.id}`}>
                                    <Button variant="outline" className="rounded-sm h-8">View</Button>
                                  </Link>
                                ) : (
                                  <Button variant="outline" className="rounded-sm h-8" onClick={() => generateDefinition(word)} disabled={loadingWordId !== null}>
                                    {loadingWordId === word.id ? 'Generating...' : 'Generate'}
                                  </Button>
                                )}
                                <Button variant="outline" className="rounded-sm h-8" onClick={() => saveWord(word.id)}>Save</Button>
                                <Button variant="outline" className="rounded-sm h-8" onClick={() => deleteWord(word.id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
