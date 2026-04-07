'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Send,
  Linkedin,
  Facebook,
  Copy,
  Eye,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useQuilloChatSendMutation, useConvertToFacebookMutation, useConvertToLinkedInMutation } from '@/hooks/queries/quillo'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Message {
  sender: 'user' | 'quillo'
  text: string
  type?: 'facebook' | 'linkedin'
}

interface LinkedInData {
  json: any
  html: string
}

interface Props {
  isOpen: boolean
  blogPostId: number
  onClose: () => void
}

export default function QuilloChatInterface({ isOpen, blogPostId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'quillo', text: '' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [linkedInLoading, setLinkedInLoading] = useState(false)
  const [linkedInProgress, setLinkedInProgress] = useState(0)
  const [linkedInPost, setLinkedInPost] = useState<LinkedInData | null>(null)
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatSend = useQuilloChatSendMutation()
  const convertFacebook = useConvertToFacebookMutation()
  const convertLinkedIn = useConvertToLinkedInMutation()

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, loading, scrollToBottom])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input
    setInput('')
    setMessages((m) => [...m, { sender: 'user', text }])
    setLoading(true)

    try {
      const response = await chatSend.mutateAsync({ blogPostId, question: text })
      setMessages((m) => [...m, { sender: 'quillo', text: response }])
    } catch {
      setMessages((m) => [...m, { sender: 'quillo', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const convertToLinkedIn = async () => {
    setLinkedInLoading(true)
    setLinkedInProgress(0)
    setLinkedInPost(null)

    const interval = setInterval(() => {
      setLinkedInProgress((p) => Math.min(p + 3.3, 99))
    }, 1000)

    try {
      const data = await convertLinkedIn.mutateAsync({ blogPostId })
      if (data?.json && data?.html) {
        setLinkedInPost({ json: data.json, html: data.html.replace(/\n/g, '') })
      }
    } catch {
      setMessages((m) => [...m, { sender: 'quillo', text: 'Error converting to LinkedIn post.' }])
    } finally {
      clearInterval(interval)
      setLinkedInLoading(false)
      setLinkedInProgress(100)
    }
  }

  const convertToFacebook = async () => {
    setLoading(true)
    try {
      const data = await convertFacebook.mutateAsync({ blogPostId })
      if (data?.facebook_post) {
        setMessages((m) => [...m, { sender: 'quillo', text: data.facebook_post ?? '', type: 'facebook' }])
      }
    } catch {
      setMessages((m) => [...m, { sender: 'quillo', text: 'Error converting to Facebook post.' }])
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string) => {
    let clean = text
    let prev = ''
    while (clean !== prev) {
      prev = clean
      clean = clean.replace(/<[^>]+>/g, '')
    }
    navigator.clipboard.writeText(clean)
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full max-w-3xl h-[80vh] p-0">
          <Card className="h-full border-0 shadow-none flex flex-col">
            <CardHeader className="flex-row items-center justify-between bg-sidebar text-white rounded-t-sm px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogHeader className="p-0">
                  <DialogTitle asChild><CardTitle className="text-white text-[16px]">Chat with Quillo</CardTitle></DialogTitle>
                </DialogHeader>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" ref={chatRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[80%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                {msg.sender === 'quillo' && i === 0 ? (
                  <div className="bg-info-light border-l-[3px] border-primary p-4 rounded-sm">
                    <p className="text-[14px] font-semibold mb-2">Hello, I&apos;m Quillo! 👋</p>
                    <p className="text-[13px] text-muted-foreground mb-2">I can help you with your content:</p>
                    <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Content analysis and suggestions</li>
                      <li>SEO optimization</li>
                      <li>Readability and engagement improvements</li>
                      <li>Convert to LinkedIn or Facebook formats</li>
                      <li>Writing style recommendations</li>
                    </ul>
                  </div>
                ) : msg.type === 'facebook' ? (
                  <div className="bg-info-light border-l-[3px] border-primary p-4 rounded-sm">
                    <p className="text-[13px] font-semibold mb-2">Facebook Post 📘</p>
                    <div className="bg-white border border-border rounded-sm p-3 text-[13px] whitespace-pre-wrap">{msg.text}</div>
                    <Button variant="outline" size="sm" className="mt-2 gap-1 text-[11px]" onClick={() => copyText(msg.text)}>
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                ) : (
                  <div className={`rounded-sm p-3 text-[13px] leading-relaxed ${
                    msg.sender === 'user' ? 'bg-info-light text-foreground' : 'bg-secondary text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-auto bg-secondary rounded-sm p-3 flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Quillo is thinking...
              </div>
            )}

            {linkedInLoading && (
              <div className="w-full bg-secondary rounded-sm p-3">
                <div className="w-full h-[6px] rounded-full bg-border overflow-hidden mb-2">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${linkedInProgress}%` }} />
                </div>
                <span className="text-[12px] text-muted-foreground">Converting to LinkedIn post...</span>
              </div>
            )}

            {linkedInPost && (
              <div className="w-full bg-info-light border-l-[3px] border-primary p-4 rounded-sm">
                <p className="text-[13px] font-semibold mb-2">LinkedIn Post 🔗</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={() => copyText(linkedInPost.html)}>
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={() => setShowLinkedInPreview(true)}>
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <div className="border-t border-border px-4 py-3 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 h-9 rounded-sm border border-border bg-white px-3 text-[13px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <Button size="sm" onClick={sendMessage} disabled={!input.trim() || loading} className="gap-1">
              <Send className="h-3.5 w-3.5" /> Send
            </Button>
          </div>

          <div className="border-t border-border px-4 py-2 flex items-center justify-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={convertToLinkedIn} disabled={loading || linkedInLoading}>
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={convertToFacebook} disabled={loading || linkedInLoading}>
              <Facebook className="h-3.5 w-3.5" /> Facebook
            </Button>
          </div>
        </Card>
      </DialogContent>
      </Dialog>

      <Dialog open={showLinkedInPreview && !!linkedInPost} onOpenChange={(open) => !open && setShowLinkedInPreview(false)}>
        <DialogContent className="w-full max-w-xl p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <DialogHeader className="p-0">
                <DialogTitle asChild><CardTitle>LinkedIn Post Preview</CardTitle></DialogTitle>
              </DialogHeader>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLinkedInPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {linkedInPost ? <div className="prose text-[13px]" dangerouslySetInnerHTML={{ __html: linkedInPost.html }} /> : null}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>,
    document.body
  )
}
