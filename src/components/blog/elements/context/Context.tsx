'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { Separator } from '@/components/ui/separator'

type BlogElement = {
  id: number
  element_type: string
  content?: Record<string, unknown>
}

type ContextProps = ElementComponentProps & {
  elements?: BlogElement[]
}

function getTitle(content?: Record<string, unknown>) {
  if (!content) return ''
  const candidates = [content.title, content.heading, content.label, content.question]
  const first = candidates.find((v) => typeof v === 'string' && v.trim().length > 0)
  return typeof first === 'string' ? first : ''
}

function buildTableOfContents(elements: BlogElement[]): Array<{ id: number; title: string }> {
  if (!elements?.length) return []

  const normalized = elements.filter((e) => String(e.element_type).toLowerCase() !== 'context')
  if (!normalized.length) return []

  const toc: Array<{ id: number; title: string }> = []

  const intro = normalized.find((e) => String(e.element_type).toLowerCase() === 'introduction') ?? normalized[0]
  toc.push({ id: intro.id, title: getTitle(intro.content) || 'Introduction' })

  for (const element of normalized) {
    const type = String(element.element_type).toLowerCase()
    if (element.id === intro.id) continue
    if (type === 'conclusion') continue

    if (type === 'faq') {
      toc.push({ id: element.id, title: 'FAQ' })
      continue
    }

    const title = getTitle(element.content)
    if (!title) continue

    if (['paragraph', 'list_paragraph', 'numbered_list_paragraph', 'featured_snippet_block', 'list_featured_snippet_block', 'table', 'timeline', 'pros_and_cons', 'versus', 'checklist', 'snippet_block', 'statistic', 'case_study', 'tool_recommendation', 'product_recommendations', 'affiliate_recommendations'].includes(type)) {
      toc.push({ id: element.id, title })
    }
  }

  const conclusion = [...normalized].reverse().find((e) => String(e.element_type).toLowerCase() === 'conclusion') ?? normalized[normalized.length - 1]
  if (!toc.some((i) => i.id === conclusion.id)) {
    toc.push({ id: conclusion.id, title: getTitle(conclusion.content) || 'Conclusion' })
  }

  return toc
}

export function Context({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
  elements,
}: ContextProps) {
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
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      <div className="rounded-lg border-l-4 border-primary bg-secondary/50 p-5">
        <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground">Table of Contents</h2>
        <Separator className="mb-4" />

        <ol className="m-0 list-decimal space-y-2 pl-8 marker:font-semibold marker:text-primary">
          {tableOfContents.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById(`section-${item.id}`)
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    window.history.replaceState(null, '', `#section-${item.id}`)
                  }
                }}
                className="bg-transparent p-0 text-left text-[17px] font-light leading-[1.8] text-foreground hover:text-primary hover:underline"
              >
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.title) }} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </BaseElement>
  )
}
