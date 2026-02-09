'use client'

import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

import type { ProductRecommendationsContent } from '@/types/content-elements'

const splitProductTitle = (title: string) => title.split('|').map((part) => part.trim())

export function ProductRecommendationsPreview({ content }: PreviewComponentProps) {
  const typedContent = (content ?? {}) as ProductRecommendationsContent
  const products = Array.isArray(typedContent?.products) ? typedContent.products : []

  return (
    <BasePreview content={typedContent}>
      <h3
        className="mb-3 text-2xl font-semibold custom-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(typedContent?.title ?? '') }}
      />

      <p
        className="mb-6 text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(typedContent?.introduction ?? '') }}
      />

      {products.length > 0 ? (
        <div className="space-y-8">
          {products.map((product, index) => {
            const titleParts = splitProductTitle(product?.title ?? '')
            const displayTitle = titleParts.length > 1 ? titleParts[0] : product?.title ?? ''

            return (
              <div key={index} className="w-full border-b border-border/40 pb-8 last:border-b-0 last:pb-0">
                <div className="flex w-full flex-col gap-4 md:flex-row">
                  <div className="w-full md:w-1/2">
                    <img
                      src={product?.image || 'https://via.placeholder.com/150'}
                      alt="Product"
                      className="h-[200px] w-full rounded-md object-contain"
                    />
                  </div>

                  <div className="w-full md:w-1/2">
                    <h4
                      className="mb-2 text-xl font-semibold custom-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownInline(displayTitle) }}
                    />

                    <div
                      className="custom-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(product?.motivation ?? '') }}
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm"><strong>Price:</strong> ${product?.price ?? ''}</p>
                      <Button variant="outline" size="sm" disabled>
                        See product
                      </Button>
                    </div>
                  </div>
                </div>

                {Array.isArray(product?.tags) && product.tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.tags.slice(0, 5).map((tag, tagIndex) => (
                      <span
                        key={`${index}-${tagIndex}`}
                        className="inline-flex rounded-full border border-secondary/40 px-3 py-1 text-sm"
                        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(tag) }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-md border-l-4 border-red-600 bg-red-500 p-4 text-white">
          This product recommendations component has not been populated yet. To do this, navigate to
          the eCommerce section by clicking <span className="underline text-blue-200">here</span> and follow
          the instructions given.
        </div>
      )}
    </BasePreview>
  )
}
