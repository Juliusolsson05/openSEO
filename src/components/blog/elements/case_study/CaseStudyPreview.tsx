'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'
import type { CaseStudyContent } from './CaseStudy'

interface CaseStudyPreviewProps extends Omit<PreviewComponentProps, 'content'> {
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

export function CaseStudyPreview({ content }: CaseStudyPreviewProps) {
  const results = Array.isArray(content?.results) ? content.results : []

  return (
    <BasePreview content={content}>
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-md">
        <div
          className="flex items-center justify-between gap-5 p-8 text-white"
          style={{ backgroundColor: convertToRGBA(content?.headerColor) }}
        >
          <div className="w-[90%] flex-1">
            <h2
              className="mb-2 text-[22px] font-bold leading-[1.5]"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title) }}
            />
            <p className="w-fit bg-white px-[10px] py-[10px] text-xl text-black">
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
            <h3 className="mb-3 text-2xl font-semibold text-gray-900">The Challenge</h3>
            <div
              className="leading-relaxed text-gray-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.challenge) }}
            />
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-2xl font-semibold text-gray-900">The Solution</h3>
            <div
              className="leading-relaxed text-gray-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.solution) }}
            />
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-2xl font-semibold text-gray-900">The Results</h3>
            <ul className="list-none p-0">
              {results.map((result, index) => (
                <li key={index} className="mb-3 flex items-center">
                  <i className="ri-checkbox-circle-fill mr-3 text-xl text-green-500" />
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(result) }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-md bg-slate-50 p-6">
            <blockquote className="mb-3 italic text-gray-600">
              "<span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.testimonial?.quote) }} />"
            </blockquote>
            <p
              className="text-right font-semibold text-gray-800"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.testimonial?.author) }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-6">
          <a
            href={content?.companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800"
          >
            Visit <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.clientName) }} /> Website
          </a>
          <button type="button" className="flex items-center font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800">
            Read Full Case Study <i className="ri-arrow-right-line ml-2" />
          </button>
        </div>
      </div>
    </BasePreview>
  )
}
