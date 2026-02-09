import type { ParagraphContent } from '../../_lib/types'

interface Props {
  content: ParagraphContent
}

export function Paragraph({ content }: Props) {
  return (
    <div style={{ marginBottom: 36 }}>
      {content.title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 4,
              height: 22,
              borderRadius: 2,
              background: '#0078D4',
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#1A1A1A',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {content.title}
          </h2>
        </div>
      )}
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.75,
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
