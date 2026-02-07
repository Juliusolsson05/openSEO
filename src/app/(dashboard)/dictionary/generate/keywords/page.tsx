'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionaryStore } from '@/stores/dictionary-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

export default function DictionaryGenerateKeywordsPage() {
  const router = useRouter()
  const {
    currentDictionary,
    currentLetterKeywords,
    removedKeywords,
    isGenerating,
    addRemovedKeyword,
    removeRemovedKeyword,
    acceptCurrentLetterKeywords,
    rejectCurrentLetterKeywords,
  } = useDictionaryStore()

  useEffect(() => {
    if (!currentDictionary) router.push('/dictionary/generate')
  }, [currentDictionary, router])

  if (!currentDictionary) return null

  const currentLetter = currentDictionary.current_letter || 'a'
  const entries = Object.entries(currentLetterKeywords)
  const currentIndex = alphabet.indexOf(currentLetter)

  const parseIndex = (key: string) => {
    const n = Number(key.replace('keyword_', ''))
    return Number.isNaN(n) ? 0 : n
  }

  const toggleKeep = (idx: number, keep: boolean) => {
    if (keep) removeRemovedKeyword(idx)
    else addRemovedKeyword(idx)
  }

  const handleAccept = async () => {
    await acceptCurrentLetterKeywords()
    if (!useDictionaryStore.getState().currentDictionary) router.push('/dictionary')
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle className="text-[22px]">Keyword Review</CardTitle>
          <p className="text-sm text-muted-foreground">{currentDictionary.title} · Letter {currentLetter.toUpperCase()} · Progress {Math.max(1, currentIndex + 1)}/26</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {alphabet.map((letter, idx) => {
              const isCurrent = letter === currentLetter
              const done = idx < currentIndex
              return (
                <Badge key={letter} variant={isCurrent || done ? 'default' : 'outline'} className="rounded-sm">
                  {letter.toUpperCase()}
                </Badge>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAccept} disabled={isGenerating || entries.length === 0} className="rounded-sm">Accept letter & next</Button>
            <Button onClick={rejectCurrentLetterKeywords} disabled={isGenerating || entries.length === 0} variant="outline" className="rounded-sm">Regenerate letter</Button>
            <Button onClick={() => router.push('/dictionary')} variant="outline" className="rounded-sm">Finish later</Button>
          </div>

          <div className="rounded-sm border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keep</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Focus keyword</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(([key, item]) => {
                  const idx = parseIndex(key)
                  const keep = !removedKeywords.includes(idx)

                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <Checkbox checked={keep} onCheckedChange={(v) => toggleKeep(idx, Boolean(v))} />
                      </TableCell>
                      <TableCell className={keep ? 'font-medium' : 'font-medium line-through opacity-50'}>{item.keyword}</TableCell>
                      <TableCell className={keep ? '' : 'line-through opacity-50'}>{item.focus_keyword || '—'}</TableCell>
                      <TableCell className={keep ? 'text-muted-foreground' : 'text-muted-foreground line-through opacity-50'}>{item.description}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground">Removed this letter: {removedKeywords.length}</p>
        </CardContent>
      </Card>
    </div>
  )
}
