'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionaryStore } from '@/stores/dictionary-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  const keywordEntries = Object.entries(currentLetterKeywords)

  const toggleRemove = (idx: number) => {
    if (removedKeywords.includes(idx)) removeRemovedKeyword(idx)
    else addRemovedKeyword(idx)
  }

  const parseIndex = (key: string) => {
    const n = Number(key.replace('keyword_', ''))
    return Number.isNaN(n) ? 0 : n
  }

  const handleAccept = async () => {
    await acceptCurrentLetterKeywords()
    if (!useDictionaryStore.getState().currentDictionary) router.push('/dictionary')
  }

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle className="text-[20px]">Review Keywords</CardTitle>
          <p className="text-muted-foreground">Review and approve generated keywords for each letter</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {alphabet.map((letter) => {
              const isCurrent = letter === currentLetter
              const done = letter < currentLetter
              return (
                <Badge key={letter} className="rounded-sm" variant={isCurrent || done ? 'default' : 'outline'}>
                  {letter.toUpperCase()}
                </Badge>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAccept} disabled={isGenerating || keywordEntries.length === 0} className="rounded-sm bg-primary hover:bg-primary-hover">
              Accept & Continue
            </Button>
            <Button onClick={rejectCurrentLetterKeywords} disabled={isGenerating || keywordEntries.length === 0} variant="outline" className="rounded-sm">
              Regenerate
            </Button>
            <Button onClick={() => router.push('/dictionary')} variant="outline" className="rounded-sm">Exit</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keywordEntries.map(([key, item]) => {
              const i = parseIndex(key)
              const removed = removedKeywords.includes(i)
              return (
                <Card key={key} className="rounded-sm border-border">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={removed ? 'line-through opacity-50 font-semibold' : 'font-semibold'}>{item.keyword}</h3>
                      <Button variant="outline" className="rounded-sm h-7" onClick={() => toggleRemove(i)}>
                        {removed ? 'Undo' : 'Remove'}
                      </Button>
                    </div>
                    <p className={removed ? 'opacity-50' : 'text-muted-foreground'}>{item.description}</p>
                    {item.focus_keyword ? <Badge className="rounded-sm">Focus: {item.focus_keyword}</Badge> : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
