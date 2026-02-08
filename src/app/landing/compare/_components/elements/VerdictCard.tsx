import type { VerdictContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: VerdictContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function VerdictCard({ content, toolA, toolB }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        padding: 24,
        borderRadius: 8,
        background: '#F0F6FF',
        marginBottom: 32,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#0078D4',
            margin: '0 0 12px',
          }}
        >
          Choose {toolA.name} if…
        </h3>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#1A1A1A',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {content.tool_a_verdict}
        </p>
      </div>
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#0078D4',
            margin: '0 0 12px',
          }}
        >
          Choose {toolB.name} if…
        </h3>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#1A1A1A',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {content.tool_b_verdict}
        </p>
      </div>
    </div>
  )
}
