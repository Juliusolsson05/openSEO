import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

const formatQuote = (text: string) => {
  let value = text ?? ''
  value = value.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  value = value.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(value)
}

export function QuotePreview({ content }: PreviewComponentProps) {
  const quoteHtml = formatQuote(content?.quote ?? '')
  const personHtml = renderMarkdownInline(content?.person ?? '')
  const descriptionHtml = renderMarkdownInline(content?.description ?? '')

  return (
    <BasePreview content={content}>
      <div className="rounded-lg bg-muted/60 p-6">
        <div className="flex items-start">
          <span className="relative -top-2 mr-3 text-6xl font-bold leading-none text-primary">&#8220;</span>
          <div className="min-w-0 flex-1">
            <div
              className="ml-2 text-3xl font-normal leading-tight [&_a]:underline [&_a]:decoration-dotted hover:[&_a]:decoration-solid [&_em]:italic [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: quoteHtml }}
            />
            <p className="mt-4 text-2xl">
              —{' '}
              <span className="underline" dangerouslySetInnerHTML={{ __html: personHtml }} />,
              <span className="ml-1 text-base font-light" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            </p>
          </div>
        </div>
      </div>
    </BasePreview>
  )
}
