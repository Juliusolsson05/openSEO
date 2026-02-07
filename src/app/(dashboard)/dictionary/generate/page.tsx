'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionaryStore } from '@/stores/dictionary-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DictionaryGeneratePage() {
  const router = useRouter()
  const { startGeneration, isGenerating } = useDictionaryStore()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState('en')
  const [numWords, setNumWords] = useState(20)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { session_id } = (await startGeneration({ title, subject, language, num_words: numWords })) || {}
    if (session_id) router.push('/dictionary/generate/keywords')
  }

  return (
    <Card className="rounded-sm border-border bg-white" style={{ fontSize: 13 }}>
      <CardHeader>
        <CardTitle className="text-[20px]">Generate New Dictionary</CardTitle>
        <p className="text-muted-foreground">Create a new dictionary by configuring its basic settings</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wide">Dictionary Title</Label>
            <Input className="rounded-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wide">Subject</Label>
            <Textarea
              className="w-full min-h-24 rounded-sm border border-border px-3 py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wide">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full rounded-sm border border-border px-3 py-2 bg-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wide">Words per Letter</Label>
            <Input
              type="number"
              min={5}
              max={50}
              value={numWords}
              onChange={(e) => setNumWords(Math.max(5, Math.min(50, Number(e.target.value) || 5)))}
              className="rounded-sm max-w-40"
            />
            <p className="text-muted-foreground">Total words: {numWords * 26}</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isGenerating} className="rounded-sm bg-primary hover:bg-primary-hover">
              {isGenerating ? 'Starting...' : 'Start Generation'}
            </Button>
            <Button type="button" variant="outline" className="rounded-sm" onClick={() => router.push('/dictionary')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
