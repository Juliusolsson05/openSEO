'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'

type BlogElement = {
  id: number
  element_type: string
  content?: {
    title?: string
  }
}

type ContextPreviewProps = PreviewComponentProps & {
  elements?: BlogElement[]
}

function buildTableOfContents(elements: BlogElement[]): Array<{ id: number; title: string }> {
  if (!elements?.length) return []

  const toc: Array<{ id: number; title: string }> = []

  toc.push({ id: elements[0].id, title: 'Introduction' })

  if (elements.length > 2) {
    elements.forEach((element, index) => {
      if (
        element &&
        index !== 0 &&
        index !== elements.length - 1 &&
        [
          'paragraph',
          'list_paragraph',
          'numbered_list_paragraph',
          'featured_snippet_block',
          'list_featured_snippet_block',
        ].includes(element.element_type) &&
        element.content?.title
      ) {
        toc.push({
          id: element.id,
          title: element.content.title,
        })
      }
    })
  }

  if (elements.length >= 2) {
    const secondToLast = elements[elements.length - 2]
    if (secondToLast?.element_type === 'faq') {
      toc.push({ id: secondToLast.id, title: 'FAQ' })
    }
  }

  const last = elements[elements.length - 1]
  if (last) toc.push({ id: last.id, title: 'Conclusion' })

  return toc
}

export function ContextPreview({ content, elements }: ContextPreviewProps) {
  const sourceElements = Array.isArray(elements)
    ? elements
    : Array.isArray(content)
      ? (content as BlogElement[])
      : Array.isArray((content as any)?.elements)
        ? ((content as any).elements as BlogElement[])
        : []

  const tableOfContents = buildTableOfContents(sourceElements)

  if (tableOfContents.length === 0) return null

  return (
    <BasePreview content={content}>
      <div className="mb-6 mt-2 border-l-4 border-primary bg-muted p-6">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Table of Contents</h2>
        <hr className="mb-4 border-border" />

        <ol className="m-0 list-decimal space-y-2 pl-8 marker:font-semibold marker:text-primary">
          {tableOfContents.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <a href={`#section-${item.id}`} className="text-base leading-6 text-foreground hover:text-primary hover:underline">
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.title) }} />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </BasePreview>
  )
}
