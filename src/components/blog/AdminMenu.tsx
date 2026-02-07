'use client'

import { Label } from '@/components/ui/label'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, apiPost, apiDelete } from '@/lib/api'
import { generateImages } from '@/components/blog/actions/generateImages'
import { useBlogStore } from '@/stores/blog-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface InputField {
  type: 'text' | 'number' | 'select' | 'switch' | 'hidden'
  label: string
  key: string
  options?: { title: string; value: any }[]
  default?: any
  required?: boolean
}

interface AdminActionSchema {
  label: string
  action: string
  description: string
  longDescription: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  inputs: InputField[]
  blocked?: boolean
}

const adminActions: AdminActionSchema[] = [
  {
    label: 'Generate Images',
    action: 'generateImages',
    description: 'Create new images for blog posts',
    longDescription: 'This action generates new images for your blog post using AI.',
    endpoint: '/api/aurora/blog/images/generate/',
    method: 'POST',
    inputs: [
      { type: 'hidden', label: 'Post ID', key: 'post_id', required: true },
      { type: 'select', label: 'Quality', key: 'version', options: [{ title: 'Low', value: 1 }, { title: 'Medium', value: 2 }, { title: 'High', value: 3 }], default: 2 },
      { type: 'hidden', label: 'Force Update', key: 'force', default: false },
      { type: 'switch', label: 'Use Magic Prompt', key: 'magic_prompt', default: true },
      { type: 'switch', label: 'Use GPT Prompt', key: 'gpt_prompt', default: true },
      { type: 'switch', label: 'Quality Thumbnail', key: 'quality_thumbnail', default: false },
    ],
  },
  {
    label: 'Generate Product Recommendations',
    action: 'generateProductRecommendations',
    description: 'Generate product suggestions',
    longDescription: 'Populate product recommendations for your blog post.',
    endpoint: '/api/aurora/ecommerce/blog/populate-product-recommendations/',
    method: 'GET',
    blocked: true,
    inputs: [{ type: 'hidden', label: 'Blog Post ID', key: 'blog_post_id', required: true }],
  },
  {
    label: 'Sync Recommended Posts',
    action: 'syncRecommendedPosts',
    description: 'Synchronize recommended posts',
    longDescription: 'Synchronize recommended posts based on AI recommendations.',
    endpoint: '/api/aurora/blog/posts/sync/recommended/',
    method: 'POST',
    inputs: [],
  },
  {
    label: 'Sync Keywords',
    action: 'syncKeywords',
    description: 'Sync keywords for this blog post',
    longDescription: 'Match post content against dictionary words and store element hyperlinks.',
    endpoint: '/api/aurora/blog/posts/sync/keywords/',
    method: 'POST',
    inputs: [
      { type: 'hidden', label: 'Post ID', key: 'post_id', required: true },
      { type: 'number', label: 'Dictionary ID', key: 'dictionary_id', required: true },
    ],
  },
]

interface Props {
  postId: string | number
  onRefreshPost?: () => void
}

export default function AdminMenu({ postId, onRefreshPost }: Props) {
  const router = useRouter()
  const { fetchPost } = useBlogStore()

  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState<AdminActionSchema | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false)
  const [showPublishDetailsDialog, setShowPublishDetailsDialog] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPostDeletedModal, setShowPostDeletedModal] = useState(false)

  const [regenerateConfirmationText, setRegenerateConfirmationText] = useState('')
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

  const [availableDictionaries, setAvailableDictionaries] = useState<any[]>([])
  const [loadingDictionaries, setLoadingDictionaries] = useState(false)
  const [publishDetails, setPublishDetails] = useState({ dictionaryId: '', exportMethod: 'elementor' })

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)

  const isPublishDetailsValid = useMemo(() => !!publishDetails.dictionaryId && !!publishDetails.exportMethod && !loadingDictionaries, [publishDetails, loadingDictionaries])

  const fetchDictionaries = async () => {
    setLoadingDictionaries(true)
    const { data, error } = await api<{ dictionaries: any[] }>('/api/aurora/dictionary/dictionaries/', { method: 'GET' })
    if (error) {
      setMessage({ type: 'error', text: 'Failed to fetch dictionaries. Please try again.' })
    } else {
      setAvailableDictionaries(Array.isArray(data?.dictionaries) ? data!.dictionaries : [])
    }
    setLoadingDictionaries(false)
  }

  useEffect(() => {
    fetchDictionaries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openModal = (action: AdminActionSchema) => {
    if (action.blocked) return
    const nextFormData: Record<string, any> = {}
    action.inputs.forEach((input) => {
      if (input.key === 'post_id' || input.key === 'blog_post_id') nextFormData[input.key] = Number(postId)
      else if (input.type === 'number') nextFormData[input.key] = input.default !== undefined ? Number(input.default) : ''
      else nextFormData[input.key] = input.default !== undefined ? input.default : ''
    })
    if (action.action === 'syncRecommendedPosts') nextFormData.post_id = Number(postId)
    setFormData(nextFormData)
    setSelectedAction(action)
    setShowActionModal(true)
  }

  const handleAction = async () => {
    if (!selectedAction) return
    setIsLoading(true)
    try {
      const payload = { ...formData }
      selectedAction.inputs.forEach((input) => {
        if (input.type === 'number' && payload[input.key] !== '') payload[input.key] = Number(payload[input.key])
      })
      const request = selectedAction.action === 'generateImages'
        ? generateImages({
            post_id: Number(payload.post_id),
            version: Number(payload.version) as 1 | 2 | 3,
            force: Boolean(payload.force),
            magic_prompt: Boolean(payload.magic_prompt),
            gpt_prompt: Boolean(payload.gpt_prompt),
            quality_thumbnail: Boolean(payload.quality_thumbnail),
          })
        : selectedAction.method === 'POST'
          ? apiPost(selectedAction.endpoint, payload)
          : api(selectedAction.endpoint, { method: selectedAction.method, params: selectedAction.method === 'GET' ? payload : undefined, body: selectedAction.method === 'GET' ? undefined : JSON.stringify(payload) })
      const { error } = await request
      if (error) throw error

      setMessage({ type: 'success', text: `Action "${selectedAction.label}" executed successfully` })
      setShowActionModal(false)
      onRefreshPost?.()
      await fetchPost(postId, true)
    } catch (e: any) {
      const txt = String(e?.message || '')
      setMessage({ type: txt.includes('401') ? 'warning' : 'error', text: txt.includes('401') ? 'Action failed: Invalid credentials.' : `Failed to execute action "${selectedAction.label}".` })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    setShowPublishDetailsDialog(false)
    setIsLoading(true)
    const { error } = await apiPost('/api/aurora/blog/posts/upload/', {
      post_id: Number(postId),
      dictionary_id: Number(publishDetails.dictionaryId),
      export_method: publishDetails.exportMethod,
    })
    if (error) {
      setMessage({ type: 'error', text: 'Failed to publish blog post. Please try again.' })
    } else {
      setMessage({ type: 'success', text: 'Blog post published successfully!' })
      onRefreshPost?.()
      await fetchPost(postId, true)
    }
    setIsLoading(false)
    setPublishDetails({ dictionaryId: '', exportMethod: 'elementor' })
  }

  const handleRegenerate = async () => {
    setIsLoading(true)
    const { error } = await apiPost('/api/aurora/blog/posts/regenerate/', { post_id: Number(postId) })
    if (error) setMessage({ type: 'error', text: 'Failed to regenerate blog post. Please try again.' })
    else {
      setMessage({ type: 'success', text: 'Blog post regenerated successfully!' })
      onRefreshPost?.()
      await fetchPost(postId, true)
    }
    setIsLoading(false)
    setShowRegenerateModal(false)
    setRegenerateConfirmationText('')
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const { error } = await apiDelete(`/api/aurora/blog/posts/delete/${postId}/`)
    if (error) setMessage({ type: 'error', text: 'Failed to delete blog post. Please try again.' })
    else setShowPostDeletedModal(true)
    setIsLoading(false)
    setShowDeleteModal(false)
    setDeleteConfirmationText('')
  }

  const modalShell = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
  const modalCard = 'w-full max-w-xl rounded border border-border bg-white p-4 text-[13px]'

  return (
    <Card className="mb-4 rounded border-border bg-white">
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 bg-background text-[13px]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</p>
        {adminActions.map((action) => (
          <Button
            key={action.action}
            type="button"
            variant="outline"
            onClick={() => openModal(action)}
            disabled={!!action.blocked}
            className="flex h-auto w-full items-center justify-between rounded-sm bg-white px-3 py-2 text-left font-normal disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{action.label}</span>
            {action.blocked ? <Badge variant="warning">BLOCKED</Badge> : null}
          </Button>
        ))}

        <div className="my-3 border-t border-border" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Post Actions</p>
        <Button variant="outline" className="w-full justify-start rounded-sm" onClick={() => setShowRegenerateModal(true)}>Regenerate Post</Button>
        <Button variant="outline" className="w-full justify-start rounded-sm" onClick={() => setShowDeleteModal(true)}>Delete Post</Button>

        <Button className="mt-4 w-full bg-primary hover:bg-primary-hover" onClick={() => router.push(`/blog/${postId}/preview`)}>Preview</Button>
        <Button className="w-full" onClick={() => setShowPublishConfirmation(true)}>Publish</Button>

        {message ? <p className={`text-[12px] ${message.type === 'success' ? 'text-green-700' : message.type === 'warning' ? 'text-amber-700' : 'text-red-700'}`}>{message.text}</p> : null}
      </CardContent>

      {showActionModal && selectedAction ? (
        <div className={modalShell}>
          <div className={modalCard}>
            <h3 className="mb-2 text-[14px] font-semibold">{selectedAction.label}</h3>
            <p className="mb-3 text-[13px] text-muted-foreground">{selectedAction.longDescription}</p>
            <div className="space-y-3">
              {selectedAction.inputs.filter((i) => i.type !== 'hidden').map((input) => (
                <div key={input.key}>
                  <Label className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground">{input.label}</Label>
                  {input.type === 'select' ? (
                    <Select value={String(formData[input.key] ?? "")} onValueChange={(value) => setFormData((p) => ({ ...p, [input.key]: value }))}>
                      <SelectTrigger className="h-8 w-full rounded-sm border border-border bg-white px-2 text-[13px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{(input.options ?? []).map((o) => <SelectItem key={String(o.value)} value={String(o.value)}>{o.title}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : input.type === 'switch' ? (
                    <Checkbox checked={!!formData[input.key]} onCheckedChange={(checked) => setFormData((p) => ({ ...p, [input.key]: checked === true }))} />
                  ) : (
                    <Input type={input.type === 'number' ? 'number' : 'text'} value={formData[input.key] ?? ''} onChange={(e) => setFormData((p) => ({ ...p, [input.key]: e.target.value }))} className="rounded-sm border-border" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(false)} disabled={isLoading}>Close</Button>
              <Button onClick={handleAction} disabled={isLoading}>Execute</Button>
            </div>
          </div>
        </div>
      ) : null}

      {showPublishConfirmation ? (
        <div className={modalShell}><div className={modalCard}><h3 className="mb-2 text-[14px] font-semibold">Confirm Publication</h3><p className="mb-4">Publishing the blog post will make it accessible to the whole world.</p><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowPublishConfirmation(false)}>Cancel</Button><Button onClick={async () => { setShowPublishConfirmation(false); if (!availableDictionaries.length) await fetchDictionaries(); setShowPublishDetailsDialog(true) }}>Publish</Button></div></div></div>
      ) : null}

      {showPublishDetailsDialog ? (
        <div className={modalShell}>
          <div className={modalCard}>
            <h3 className="mb-2 text-[14px] font-semibold">Publish Details</h3>
            <Label className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground">Select Dictionary</Label>
            <Select value={publishDetails.dictionaryId} onValueChange={(value) => setPublishDetails((p) => ({ ...p, dictionaryId: value }))} disabled={loadingDictionaries}>
              <SelectTrigger className="mb-3 h-8 w-full rounded-sm border border-border bg-white px-2 text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {availableDictionaries.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground">Export Method</Label>
            <Select value={publishDetails.exportMethod} onValueChange={(value) => setPublishDetails((p) => ({ ...p, exportMethod: value }))}>
              <SelectTrigger className="h-8 w-full rounded-sm border border-border bg-white px-2 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="elementor">Elementor</SelectItem></SelectContent>
            </Select>
            <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowPublishDetailsDialog(false)}>Cancel</Button><Button onClick={handlePublish} disabled={!isPublishDetailsValid || loadingDictionaries}>Publish</Button></div>
          </div>
        </div>
      ) : null}

      {showRegenerateModal ? (
        <div className={modalShell}><div className={modalCard}><h3 className="mb-2 text-[14px] font-semibold">Confirm Regeneration</h3><p className="mb-2">Type <strong>REGENERATE</strong> to confirm.</p><Input value={regenerateConfirmationText} onChange={(e) => setRegenerateConfirmationText(e.target.value)} /><div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowRegenerateModal(false)}>Cancel</Button><Button onClick={handleRegenerate} disabled={regenerateConfirmationText !== 'REGENERATE'}>Regenerate</Button></div></div></div>
      ) : null}

      {showDeleteModal ? (
        <div className={modalShell}><div className={modalCard}><h3 className="mb-2 text-[14px] font-semibold">Confirm Deletion</h3><p className="mb-2">Type <strong>DELETE</strong> to confirm.</p><Input value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} /><div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={deleteConfirmationText !== 'DELETE'}>Delete</Button></div></div></div>
      ) : null}

      {showPostDeletedModal ? (
        <div className={modalShell}><div className={modalCard}><h3 className="mb-2 text-[14px] font-semibold">Post Deleted</h3><p className="mb-4">The blog post has been deleted successfully.</p><div className="flex justify-end"><Button onClick={() => router.push('/blog')}>Return to Archive</Button></div></div></div>
      ) : null}
    </Card>
  )
}
