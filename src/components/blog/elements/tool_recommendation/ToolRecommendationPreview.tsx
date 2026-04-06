'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { ExternalLink, Check, Star } from 'lucide-react'
import type { PreviewComponentProps } from '../registry'

import type { ToolRecommendationContent } from '@/types/content-elements'
import { extractDomain } from '@/lib/media'

interface ToolRecommendationPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: ToolRecommendationContent
}

export function ToolRecommendationPreview({ content }: ToolRecommendationPreviewProps) {
  const features = Array.isArray(content?.features) ? content.features : []
  const websiteUrl = content?.companyUrl || content?.companyWebsite || ''
  const brandColor = content?.headerColor && /^#[0-9a-fA-F]{6}$/.test(content.headerColor) ? content.headerColor : null

  return (
    <BasePreview content={content}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm" style={{ borderColor: brandColor || undefined }}>
        <div className="flex items-center gap-5 border-b px-6 py-5" style={{ borderColor: brandColor || undefined, backgroundColor: brandColor ? `${brandColor}08` : undefined }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${extractDomain(websiteUrl)}&sz=128`}
            alt={`${content?.title || 'Tool'} Logo`}
            className="h-12 w-12 shrink-0 rounded-lg border border-border bg-white object-contain p-1.5"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title || '') }} />
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
            </div>
            <p className="mt-0.5 text-[14px] font-medium text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.pricing || '') }} />
          </div>
          {websiteUrl && (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium text-white transition-colors" style={{ backgroundColor: brandColor || '#0078D4' }}>
              Visit Site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="text-[16px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.productDescription || '') }} />
        </div>

        {features.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Key Features</h3>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={`feature-${index}`} className="flex items-start gap-2.5 rounded-md px-3 py-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-[14px] leading-snug text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(feature) }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BasePreview>
  )
}
