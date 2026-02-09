import type { ParagraphContent } from '../../_lib/types'

interface Props {
  content: ParagraphContent
}

export function Paragraph({ content }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      {content.title && (
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {content.title}
        </h2>
      )}
      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#616161', margin: 0 }}>
        {content.text}
      </p>
    </div>
  )
}
