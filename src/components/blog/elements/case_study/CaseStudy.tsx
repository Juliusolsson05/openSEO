'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import type { ElementComponentProps } from '../registry'

export interface CaseStudyContent {
  title: string
  clientName: string
  industry: string
  companyWebsite: string
  headerColor: string
  challenge: string
  solution: string
  results: string[]
  testimonial: {
    quote: string
    author: string
  }
}

interface CaseStudyProps extends Omit<ElementComponentProps, 'content'> {
  content: CaseStudyContent
}

const extractDomain = (url: string): string => {
  return String(url || '')
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
}

const convertToRGBA = (hexColor: string): string => {
  const value = String(hexColor || '').trim()
  const fallback = 'rgba(0, 0, 0, 0.05)'

  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return fallback

  const r = parseInt(value.slice(1, 3), 16)
  const g = parseInt(value.slice(3, 5), 16)
  const b = parseInt(value.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, 0.3)`
}

export function CaseStudy({ content, blogId, elementId, onContentUpdated, onElementDeleted }: CaseStudyProps) {
  const results = Array.isArray(content?.results) ? content.results : []
  const quote = content?.testimonial?.quote ? `\"${content.testimonial.quote}\"` : ''

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-card shadow-md">
        <div
          className="flex items-center justify-between gap-5 p-8 text-primary-foreground"
          style={{ backgroundColor: convertToRGBA(content?.headerColor) }}
        >
          <div className="w-[90%] flex-1">
            <h2
              className="mb-2 text-[22px] font-semibold leading-tight tracking-tight text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title) }}
            />
            <p className="w-fit bg-card px-[5px] py-[5px] text-[15px] text-foreground">
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.clientName) }} /> |{' '}
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.industry) }} />
            </p>
          </div>

          <img
            src={`https://img.logo.dev/${extractDomain(content?.companyWebsite)}?token=pk_PJnue9akRVmT-qo6GmYjhA`}
            alt={`${content?.clientName || 'Company'} Logo`}
            className="h-20 w-auto rounded-md shadow-sm"
          />
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h3 className="mb-3 text-[17px] font-semibold leading-snug text-foreground">The Challenge</h3>
            <div
              className="text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450] [&_a]:border-b [&_a]:border-dotted [&_a]:border-current [&_a]:text-primary [&_li]:mb-2 [&_ol]:my-4 [&_ol]:pl-6 [&_ul]:my-4 [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.challenge) }}
            />
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-[17px] font-semibold leading-snug text-foreground">The Solution</h3>
            <div
              className="text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450] [&_a]:border-b [&_a]:border-dotted [&_a]:border-current [&_a]:text-primary [&_li]:mb-2 [&_ol]:my-4 [&_ol]:pl-6 [&_ul]:my-4 [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.solution) }}
            />
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-[17px] font-semibold leading-snug text-foreground">The Results</h3>
            <ul className="list-none p-0">
              {results.map((result, index) => (
                <li key={index} className="mb-3 flex items-center">
                  <i className="ri-checkbox-circle-fill mr-3 text-xl text-emerald-600" />
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(result) }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-lg bg-secondary/50 p-5">
            <blockquote
              className="mb-3 text-[20px] font-light italic leading-[1.7] text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(quote) }}
            />
            <p
              className="text-right text-[15px] font-medium text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.testimonial?.author) }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-secondary/50 p-5">
          <a
            href={content?.companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary transition-colors duration-200 hover:text-primary"
          >
            Visit <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.clientName) }} /> Website
          </a>
          <Button type="button" variant="link" className="flex items-center p-0 font-medium text-primary transition-colors duration-200 hover:text-primary">
            Read Full Case Study <i className="ri-arrow-right-line ml-2" />
          </Button>
        </div>
      </div>
    </BaseElement>
  )
}
