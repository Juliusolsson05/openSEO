import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

export function SnippetBlockPreview({ content }: PreviewComponentProps) {
  const titleHtml = renderMarkdownInline(content?.title ?? '')
  const textHtml = renderMarkdown(content?.text ?? '')

  return (
    <BasePreview content={content}>
      <div className="my-[30px] border-[10px] border-primary bg-[rgba(211,211,211,0.44)] p-[45px]">
        <h2
          className="mb-5 text-[28px] font-medium leading-[40px]"
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
        <p
          className="text-[18px] leading-[32px] [&_a]:underline [&_a]:decoration-dotted hover:[&_a]:decoration-solid [&_em]:italic [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />
      </div>
    </BasePreview>
  )
}
