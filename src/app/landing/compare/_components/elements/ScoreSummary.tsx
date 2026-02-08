import type { ScoreSummaryContent, ComparisonToolData } from '../../_lib/types'
import { ScoreBar } from '../ScoreBar'

interface Props {
  content: ScoreSummaryContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function ScoreSummary({ content, toolA, toolB }: Props) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid #E1E1E1',
        background: '#fff',
        marginBottom: 32,
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
        Score Summary
      </h3>

      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 1fr',
          gap: 16,
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid #F0F0F0',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#616161' }}>Category</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#616161' }}>{toolA.name}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#616161' }}>{toolB.name}</span>
      </div>

      {/* Dimension rows */}
      {content.dimensions.map((dim, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr',
            gap: 16,
            alignItems: 'center',
            padding: '8px 0',
          }}
        >
          <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{dim.label}</span>
          <ScoreBar score={dim.tool_a} />
          <ScoreBar score={dim.tool_b} />
        </div>
      ))}
    </div>
  )
}
