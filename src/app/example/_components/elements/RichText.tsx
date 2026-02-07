type RichTextProps = { html: string; className?: string }

export function RichText({ html, className = '' }: RichTextProps) {
  return <div className={`prose prose-neutral max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
