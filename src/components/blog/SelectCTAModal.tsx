'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCtaStore } from '@/stores/cta-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SelectCTAModalProps {
  modelValue: boolean
  onOpenChange: (open: boolean) => void
  onCtaSelected: (ctaId: number) => void
}

export default function SelectCTAModal({ modelValue, onOpenChange, onCtaSelected }: SelectCTAModalProps) {
  const { campaigns, isLoading, errorMessage, fetchCTAs } = useCtaStore()
  const [selectedCTA, setSelectedCTA] = useState<number | null>(null)

  const flatCtas = useMemo(() => campaigns.flatMap((campaign) => campaign.ctas), [campaigns])

  useEffect(() => {
    if (modelValue && campaigns.length === 0) {
      fetchCTAs()
    }
  }, [modelValue, campaigns.length, fetchCTAs])

  const close = () => {
    setSelectedCTA(null)
    onOpenChange(false)
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  const fullImage = (url: string) => (url?.startsWith('http') ? url : `${baseUrl}${url}`)

  if (!modelValue) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[4px] border-[#E1E1E1] bg-white">
        <CardHeader className="flex-row items-center justify-between rounded-t-[4px] bg-[#0078D4] py-3 text-white">
          <CardTitle>Choose a CTA</CardTitle>
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={close}>✕</Button>
        </CardHeader>
        <CardContent className="bg-[#F2F2F2] pt-5 text-[13px]">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="rounded-[3px] border-[#E1E1E1] p-3">
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
                  className={`cursor-pointer overflow-hidden rounded-[3px] border-2 ${selectedCTA === cta.id ? 'border-[#0078D4]' : 'border-[#E1E1E1]'}`}
                  onClick={() => setSelectedCTA(cta.id)}
                >
                  <img src={fullImage(cta.image)} alt={cta.title} className="h-44 w-full object-cover" />
                  <CardContent className="p-3">
                    <p className="text-[13px] font-semibold">{cta.title}</p>
                    <p className="line-clamp-2 text-[12px] text-[#616161]">{cta.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {errorMessage ? <p className="mt-4 text-[12px] text-red-600">Failed to load CTAs. Please try again.</p> : null}

          <div className="mt-4 flex justify-end">
            <Button disabled={!selectedCTA || isLoading} onClick={() => selectedCTA && (onCtaSelected(selectedCTA), close())}>
              Confirm Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
