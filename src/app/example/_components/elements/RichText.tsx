import { SafeHtml } from '@/components/SafeHtml'

type RichTextProps = { html: string; className?: string }

export function RichText({ html, className = '' }: RichTextProps) {
  return <SafeHtml html={html} className={`prose prose-neutral max-w-none ${className}`} />
}
