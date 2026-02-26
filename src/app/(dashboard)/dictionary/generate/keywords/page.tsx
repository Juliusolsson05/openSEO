'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addRemovedKeyword,
  removeRemovedKeyword,
  acceptLetterKeywords,
  rejectLetterKeywords,
} from '@/store/slices/dictionarySessionSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

export default function DictionaryGenerateKeywordsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const currentDictionary = useAppSelector((s) => s.dictionarySession.currentDictionary)
  const currentLetterKeywords = useAppSelector((s) => s.dictionarySession.currentLetterKeywords)
  const removedKeywords = useAppSelector((s) => s.dictionarySession.removedKeywords)
  const isGenerating = useAppSelector((s) => s.dictionarySession.isGenerating)

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
    if (keep) dispatch(removeRemovedKeyword(idx))
    else dispatch(addRemovedKeyword(idx))
  }

  const handleAccept = async () => {
    const result = await dispatch(acceptLetterKeywords())
    if (acceptLetterKeywords.fulfilled.match(result)) {
      const updatedDict = result.payload?.data
      if (!updatedDict?.letter) {
        router.push('/dictionary')
      }
    }
  }

  const handleReject = async () => {
    await dispatch(rejectLetterKeywords())
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle className="text-[22px]">Keyword Review</CardTitle>
          <p className="text-sm text-muted-foreground">{currentDictionary.title} · Letter {currentLetter.toUpperCase()} · Progress {Math.max(1, currentIndex + 1)}/26</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {alphabet.map((l) => (
              <div
                key={l}
                className={`flex h-7 w-7 items-center justify-center rounded-sm text-[12px] font-semibold uppercase ${
                  l === currentLetter
                    ? 'bg-primary text-white'
                    : currentIndex > alphabet.indexOf(l)
                    ? 'bg-success-light text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {l}
              </div>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Keep</TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(([key, value]) => {
                const idx = parseIndex(key)
                const kept = !removedKeywords.includes(idx)
                return (
                  <TableRow key={key} className={!kept ? 'opacity-40' : ''}>
                    <TableCell>
                      <Checkbox checked={kept} onCheckedChange={(v) => toggleKeep(idx, v === true)} />
                    </TableCell>
                    <TableCell className="font-medium">{value.keyword}</TableCell>
                    <TableCell className="text-muted-foreground text-[12px]">{value.description}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Badge variant="outline">{removedKeywords.length} removed</Badge>
              <Badge variant="outline">{entries.length - removedKeywords.length} kept</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReject} disabled={isGenerating}>
                Regenerate ({currentLetter.toUpperCase()})
              </Button>
              <Button onClick={handleAccept} disabled={isGenerating}>
                {isGenerating ? 'Processing...' : currentIndex < 25 ? `Accept & next (${alphabet[currentIndex + 1]?.toUpperCase()})` : 'Accept & finish'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
