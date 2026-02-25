'use client'

import { useMemo, useState } from 'react'
import { useCampaignsQuery } from '@/hooks/queries/cta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SelectCTAModalProps {
  modelValue: boolean
  onOpenChange: (open: boolean) => void
  onCtaSelected: (ctaId: number) => void
}

export default function SelectCTAModal({ modelValue, onOpenChange, onCtaSelected }: SelectCTAModalProps) {
  const { data: campaigns = [], isLoading, isError } = useCampaignsQuery({ enabled: modelValue })
  const [selectedCTA, setSelectedCTA] = useState<number | null>(null)

  const flatCtas = useMemo(() => campaigns.flatMap((campaign) => campaign.ctas), [campaigns])

  const close = () => {
    setSelectedCTA(null)
    onOpenChange(false)
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const fullImage = (url?: string) => (!url ? '' : url.startsWith('http') ? url : `${baseUrl}${url}`)

  return (
    <Dialog open={modelValue} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded border-border bg-white p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex-row items-center justify-between rounded-t-[4px] bg-primary py-3 text-white">
            <DialogHeader className="p-0">
              <DialogTitle asChild><CardTitle>Choose a CTA</CardTitle></DialogTitle>
            </DialogHeader>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={close}>✕</Button>
          </CardHeader>
          <CardContent className="bg-background pt-5 text-[13px]">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="rounded-sm border-border p-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {flatCtas.map((cta) => (
                  <Card
                    key={cta.id}
                    className={`cursor-pointer overflow-hidden rounded-sm border-2 ${selectedCTA === cta.id ? 'border-primary' : 'border-border'}`}
                    onClick={() => setSelectedCTA(cta.id)}
                  >
                    <img src={fullImage(cta.image ?? cta.image_url)} alt={cta.title} className="h-44 w-full object-cover" />
                    <CardContent className="p-3">
                      <p className="text-[13px] font-semibold">{cta.title}</p>
                      <p className="line-clamp-2 text-[12px] text-muted-foreground">{cta.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isError ? <p className="mt-4 text-[12px] text-red-600">Failed to load CTAs. Please try again.</p> : null}

            <div className="mt-4 flex justify-end">
              <Button disabled={!selectedCTA || isLoading} onClick={() => selectedCTA && (onCtaSelected(selectedCTA), close())}>
                Confirm Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
