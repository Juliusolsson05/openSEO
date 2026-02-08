import type { ParagraphContent } from '../../_lib/types'

interface Props {
  content: ParagraphContent
}

export function Paragraph({ content }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      {content.title && (
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          {content.title}
        </h2>
      )}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: '#1A1A1A',
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {content.text}
      </p>
    </div>
  )
}
