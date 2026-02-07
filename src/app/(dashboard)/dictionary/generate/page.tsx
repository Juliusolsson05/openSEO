'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionaryStore } from '@/stores/dictionary-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DictionaryGeneratePage() {
  const router = useRouter()
  const { startGeneration, isGenerating } = useDictionaryStore()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState('en')
  const [numWords, setNumWords] = useState(20)

  const estimatedTotal = useMemo(() => numWords * 26, [numWords])

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const start = async (e: FormEvent) => {
    e.preventDefault()
    const data = await startGeneration({ title, subject, language, num_words: numWords })
    if (data?.session_id) router.push('/dictionary/generate/keywords')
  }

  return (
    <Card className="rounded-sm border-border bg-white">
      <CardHeader>
        <CardTitle className="text-[22px]">New Dictionary</CardTitle>
        <p className="text-sm text-muted-foreground">Step {step}/3</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={start} className="space-y-5 max-w-2xl">
          {step === 1 ? (
            <>
              <div className="space-y-1">
                <Label>Dictionary Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-sm" />
              </div>
              <div className="space-y-1">
                <Label>Subject / Context</Label>
                <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} required className="min-h-24 rounded-sm" />
              </div>
              <div className="space-y-1">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-1">
                <Label>Words per letter</Label>
                <Input
                  type="number"
                  min={5}
                  max={50}
                  value={numWords}
                  onChange={(e) => setNumWords(Math.max(5, Math.min(50, Number(e.target.value) || 5)))}
                  className="max-w-40 rounded-sm"
                />
                <p className="text-sm text-muted-foreground">Estimated total words: {estimatedTotal}</p>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <div className="rounded-sm border border-border p-4 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {title}</p>
              <p><span className="text-muted-foreground">Language:</span> {language.toUpperCase()}</p>
              <p><span className="text-muted-foreground">Words per letter:</span> {numWords}</p>
              <p><span className="text-muted-foreground">Estimated total:</span> {estimatedTotal}</p>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-sm" onClick={() => router.push('/dictionary')}>Cancel</Button>
            {step > 1 ? <Button type="button" variant="outline" className="rounded-sm" onClick={back}>Back</Button> : null}
            {step < 3 ? (
              <Button
                type="button"
                className="rounded-sm"
                onClick={next}
                disabled={(step === 1 && (!title.trim() || !subject.trim()))}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-sm" disabled={isGenerating}>{isGenerating ? 'Starting...' : 'Start Generation'}</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
