'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { startDictionaryGeneration } from '@/store/slices/dictionarySessionSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DictionaryGeneratePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isGenerating = useAppSelector((s) => s.dictionarySession.isGenerating)
  const currentDictionary = useAppSelector((s) => s.dictionarySession.currentDictionary)

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
    const result = await dispatch(startDictionaryGeneration({ title, subject, language, num_words: numWords }))
    if (startDictionaryGeneration.fulfilled.match(result)) {
      router.push('/dictionary/generate/keywords')
    }
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
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="sv">Swedish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={next}>Next</Button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="space-y-1">
                <Label>Keywords per letter (A–Z): {numWords}</Label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={numWords}
                  onChange={(e) => setNumWords(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Estimated total: ~{estimatedTotal} keywords</p>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={back}>Back</Button>
                <Button type="button" onClick={next}>Next</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 rounded-sm border border-border p-4 text-[13px]">
                <p><span className="text-muted-foreground">Name:</span> {title}</p>
                <p><span className="text-muted-foreground">Subject:</span> {subject}</p>
                <p><span className="text-muted-foreground">Language:</span> {language.toUpperCase()}</p>
                <p><span className="text-muted-foreground">Keywords per letter:</span> {numWords}</p>
                <p><span className="text-muted-foreground">Estimated total:</span> ~{estimatedTotal}</p>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={back}>Back</Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? 'Starting...' : 'Start Generation'}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
