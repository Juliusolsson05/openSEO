import { BookOpen } from 'lucide-react'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

const formatText = (text: string) => {
  let value = text ?? ''
  value = value.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  value = value.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(value)
}

export function IntroductionPreview({ content }: PreviewComponentProps) {
  const parsed = (content ?? {}) as { title?: string; text?: string }
  const titleHtml = renderMarkdownInline(parsed.title ?? 'Introduction')
  const formattedText = formatText(parsed.text ?? '')

  return (
    <BasePreview content={content}>
      <div>
        <h2 className="mt-4 mb-3 text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-600" />
          <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
        </h2>
        <p
          className="my-[15px] text-lg font-light leading-[1.77778] text-foreground [&_em]:font-[450] [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      </div>
    </BasePreview>
  )
}
