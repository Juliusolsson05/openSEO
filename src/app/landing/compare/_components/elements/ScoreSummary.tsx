import type { ScoreSummaryContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: ScoreSummaryContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function ScoreSummary({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0078D4', marginBottom: 8 }}>Scores</p>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Overall Scores</h3>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: '#0078D4', borderRadius: 1 }} />
          <span style={{ fontSize: 12, color: '#616161' }}>{toolA.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: '#616161', borderRadius: 1 }} />
          <span style={{ fontSize: 12, color: '#616161' }}>{toolB.name}</span>
        </div>
      </div>

      <div style={{ border: '1px solid #E1E1E1', borderRadius: 2, overflow: 'hidden' }}>
        {content.dimensions.map((dim: any, i: number) => {
          const label = dim.label ?? dim.name ?? ''
          const scoreA = dim.tool_a ?? dim.tool_a_score ?? 0
          const scoreB = dim.tool_b ?? dim.tool_b_score ?? 0

          return (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i < content.dimensions.length - 1 ? '1px solid #F0F0F0' : 'none', background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>{label}</div>
              {/* Tool A */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ flex: 1, height: 6, background: '#E8ECF0', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ width: `${(scoreA / 5) * 100}%`, height: '100%', background: '#0078D4', borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: scoreA >= scoreB ? '#0078D4' : '#A0A0A0', minWidth: 20, textAlign: 'right' }}>{scoreA}</span>
              </div>
              {/* Tool B */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: '#E8ECF0', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ width: `${(scoreB / 5) * 100}%`, height: '100%', background: '#616161', borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: scoreB > scoreA ? '#1A1A1A' : '#A0A0A0', minWidth: 20, textAlign: 'right' }}>{scoreB}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
