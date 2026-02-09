import type { FeatureComparisonContent, ComparisonToolData } from '../../_lib/types'
import { ScoreBar } from '../ScoreBar'

interface Props {
  content: FeatureComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function FeatureComparison({ content, toolA, toolB }: Props) {
  const noteA = content.tool_a_note ?? (content as any).tool_a_notes ?? ''
  const noteB = content.tool_b_note ?? (content as any).tool_b_notes ?? ''
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid #E1E1E1',
        marginBottom: 24,
        background: '#fff',
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '0 0 20px',
        }}
      >
        {content.category}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tool A */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#616161', margin: '0 0 8px' }}>
            {toolA.name}
          </p>
          <ScoreBar score={content.tool_a_score} />
          <p style={{ fontSize: 13, color: '#616161', margin: '8px 0 0', lineHeight: 1.5 }}>
            {noteA}
          </p>
        </div>

        {/* Tool B */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#616161', margin: '0 0 8px' }}>
            {toolB.name}
          </p>
          <ScoreBar score={content.tool_b_score} />
          <p style={{ fontSize: 13, color: '#616161', margin: '8px 0 0', lineHeight: 1.5 }}>
            {noteB}
          </p>
        </div>
      </div>
    </div>
  )
}
