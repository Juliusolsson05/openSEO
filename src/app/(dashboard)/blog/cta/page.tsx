'use client'

import { Label } from '@/components/ui/label'

/**
 * CTA Management — ported from aurora_dashboard/pages/apps/blog/cta.vue
 * Campaigns with nested CTAs. CRUD for both.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useCampaignsQuery,
  useCreateCampaignMutation,
  useEditCampaignMutation,
  useDeleteCampaignMutation,
  useCreateCTAMutation,
  useEditCTAMutation,
  useDeleteCTAMutation,
} from '@/hooks/queries/cta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Target,
  Info,
  Loader2,
} from 'lucide-react'

interface ModalState {
  type: 'campaign-create' | 'campaign-edit' | 'cta-create' | 'cta-edit' | 'cta-detail' | null
  data?: any
}

export default function BlogCtaPage() {
  const { data: campaigns = [], isLoading } = useCampaignsQuery()
  const createCampaignMutation = useCreateCampaignMutation()
  const editCampaignMutation = useEditCampaignMutation()
  const deleteCampaignMutation = useDeleteCampaignMutation()
  const createCTAMutation = useCreateCTAMutation()
  const editCTAMutation = useEditCTAMutation()
  const deleteCTAMutation = useDeleteCTAMutation()

  const isMutating =
    createCampaignMutation.isPending ||
    editCampaignMutation.isPending ||
    createCTAMutation.isPending ||
    editCTAMutation.isPending

  const [modal, setModal] = useState<ModalState>({ type: null })
  const [campaignName, setCampaignName] = useState('')
  const [ctaForm, setCtaForm] = useState({
    campaignId: 0,
    title: '',
    description: '',
    link: '',
    generateImage: false,
    image: null as File | null,
  })
  const [pendingDelete, setPendingDelete] = useState<{ type: 'campaign' | 'cta'; id: number } | null>(null)

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return
    try {
      await createCampaignMutation.mutateAsync({ name: campaignName.trim() })
      setCampaignName('')
      setModal({ type: null })
    } catch {
    }
  }

  const handleEditCampaign = async () => {
    if (!campaignName.trim() || !modal.data?.id) return
    try {
      await editCampaignMutation.mutateAsync({ id: modal.data.id, name: campaignName.trim() })
      setCampaignName('')
      setModal({ type: null })
    } catch {
    }
  }

  const handleCreateCTA = async () => {
    if (!ctaForm.title || !ctaForm.campaignId) return
    try {
      await createCTAMutation.mutateAsync(ctaForm)
      resetCtaForm()
      setModal({ type: null })
    } catch {
    }
  }

  const handleEditCTA = async () => {
    if (!ctaForm.title || !modal.data?.id) return
    try {
      await editCTAMutation.mutateAsync({ ctaId: modal.data.id, ...ctaForm })
      resetCtaForm()
      setModal({ type: null })
    } catch {
    }
  }

  const resetCtaForm = () => {
    setCtaForm({ campaignId: 0, title: '', description: '', link: '', generateImage: false, image: null })
  }

  const openEditCampaign = (campaign: any) => {
    setCampaignName(campaign.name)
    setModal({ type: 'campaign-edit', data: campaign })
  }

  const openCreateCTA = () => {
    resetCtaForm()
    if (campaigns.length > 0) {
      setCtaForm((f) => ({ ...f, campaignId: campaigns[0].id }))
    }
    setModal({ type: 'cta-create' })
  }

  const openEditCTA = (cta: any, campaignId: number) => {
    setCtaForm({
      campaignId,
      title: cta.title,
      description: cta.description,
      link: cta.link || '',
      generateImage: false,
      image: null,
    })
    setModal({ type: 'cta-edit', data: cta })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {isLoading && campaigns.length === 0 ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[14px] font-semibold">No campaigns yet</p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Create your first campaign to start adding CTAs.
                </p>
                <Button className="mt-4 gap-1.5" onClick={() => { setCampaignName(''); setModal({ type: 'campaign-create' }) }}>
                  <Plus className="h-3.5 w-3.5" /> Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle>{campaign.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCampaign(campaign)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setPendingDelete({ type: 'campaign', id: campaign.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {campaign.ctas.length === 0 ? (
                    <div className="rounded-sm border border-border bg-warning-light px-3 py-2 text-[12px] text-warning-foreground">
                      No CTAs under <strong>{campaign.name}</strong> yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {campaign.ctas.map((cta) => (
                        <Card key={cta.id} className="overflow-hidden">
                          {cta.image && (
                            <div className="h-32 bg-secondary overflow-hidden">
                              <img src={cta.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <CardContent className="p-3">
                            <h4 className="text-[13px] font-semibold">{cta.title}</h4>
                            <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{cta.description}</p>
                            <div className="flex gap-1 mt-3">
                              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => setModal({ type: 'cta-detail', data: cta })}>
                                Details
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCTA(cta, campaign.id)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setPendingDelete({ type: 'cta', id: cta.id })}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          <Card>
            <CardContent className="p-4 flex gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-[12px] text-muted-foreground">
                <strong className="text-foreground">What is a CTA?</strong>
                <p className="mt-1 leading-relaxed">
                  A Call to Action (CTA) is a strategic component designed to convert visitors into customers.
                  CTAs guide users to perform specific actions like making a purchase or contacting your team.
                  They can be seamlessly integrated throughout your blog posts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-56 shrink-0 hidden lg:block">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-1.5" size="sm" onClick={() => { setCampaignName(''); setModal({ type: 'campaign-create' }) }} disabled={isMutating}>
                <Plus className="h-3 w-3" /> New Campaign
              </Button>
              <Button variant="outline" className="w-full gap-1.5" size="sm" onClick={openCreateCTA} disabled={campaigns.length === 0 || isMutating}>
                <Plus className="h-3 w-3" /> New CTA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!modal.type} onOpenChange={(open) => !open && setModal({ type: null })}>
        <DialogContent className="w-full max-w-md p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <DialogHeader className="p-0">
                <DialogTitle asChild>
                  <CardTitle>
                    {modal.type === 'campaign-create' && 'Create Campaign'}
                    {modal.type === 'campaign-edit' && 'Edit Campaign'}
                    {modal.type === 'cta-create' && 'Create CTA'}
                    {modal.type === 'cta-edit' && 'Edit CTA'}
                    {modal.type === 'cta-detail' && modal.data?.title}
                  </CardTitle>
                </DialogTitle>
              </DialogHeader>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModal({ type: null })}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(modal.type === 'campaign-create' || modal.type === 'campaign-edit') && (
                <>
                  <div>
                    <Label className="text-[13px] font-semibold mb-1 block">Campaign Name</Label>
                    <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. Summer Sale" className="h-9" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setModal({ type: null })} disabled={isMutating}>Cancel</Button>
                    <Button onClick={modal.type === 'campaign-create' ? handleCreateCampaign : handleEditCampaign} disabled={isMutating}>
                      {isMutating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : modal.type === 'campaign-create' ? 'Create' : 'Save'}
                    </Button>
                  </div>
                </>
              )}

              {(modal.type === 'cta-create' || modal.type === 'cta-edit') && (
                <>
                  {modal.type === 'cta-create' && (
                    <div>
                      <Label className="text-[13px] font-semibold mb-1 block">Campaign</Label>
                      <Select value={String(ctaForm.campaignId)} onValueChange={(value) => setCtaForm((f) => ({ ...f, campaignId: Number(value) }))}>
                        <SelectTrigger className="h-9 w-full rounded-sm border border-border bg-white px-3 text-[13px] focus:border-primary focus:outline-none">
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-[13px] font-semibold mb-1 block">Title</Label>
                    <Input value={ctaForm.title} onChange={(e) => setCtaForm((f) => ({ ...f, title: e.target.value }))} className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[13px] font-semibold mb-1 block">Description</Label>
                    <Textarea
                      value={ctaForm.description}
                      onChange={(e) => setCtaForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-sm border border-border bg-white px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-semibold mb-1 block">Link URL</Label>
                    <Input value={ctaForm.link} onChange={(e) => setCtaForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://..." className="h-9" />
                  </div>
                  <Label className="flex items-center gap-2 text-[13px]">
                    <Checkbox
                      checked={ctaForm.generateImage}
                      onCheckedChange={(checked) => setCtaForm((f) => ({ ...f, generateImage: checked === true }))}
                    />
                    {modal.type === 'cta-edit' ? 'Generate a new image with AI' : 'Generate image with AI'}
                  </Label>
                  {!ctaForm.generateImage && (
                    <div>
                      <Label className="text-[13px] font-semibold mb-1 block">Upload Image</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCtaForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                        className="text-[12px]"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setModal({ type: null })} disabled={isMutating}>Cancel</Button>
                    <Button onClick={modal.type === 'cta-create' ? handleCreateCTA : handleEditCTA} disabled={isMutating}>
                      {isMutating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : modal.type === 'cta-create' ? 'Create' : 'Save'}
                    </Button>
                  </div>
                </>
              )}

              {modal.type === 'cta-detail' && modal.data && (
                <div className="space-y-3">
                  {modal.data.image && (
                    <img src={modal.data.image} alt="" className="w-full rounded-sm border border-border" />
                  )}
                  <p className="text-[13px]">{modal.data.description}</p>
                  {modal.data.link && (
                    <a
                      href={modal.data.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> {modal.data.link}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingDelete?.type === 'campaign' ? 'Delete Campaign' : 'Delete CTA'}
            </DialogTitle>
            <DialogDescription>
              {pendingDelete?.type === 'campaign'
                ? 'This will delete the campaign and all its CTAs. This cannot be undone.'
                : 'Are you sure you want to delete this CTA? This cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!pendingDelete) return
                try {
                  if (pendingDelete.type === 'campaign') {
                    await deleteCampaignMutation.mutateAsync(pendingDelete.id)
                  } else {
                    await deleteCTAMutation.mutateAsync(pendingDelete.id)
                  }
                } catch {
                }
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
