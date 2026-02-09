import type { FeatureComparisonContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: FeatureComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function FeatureComparison({ content, toolA, toolB }: Props) {
  const noteA = content.tool_a_note ?? (content as any).tool_a_notes ?? ''
  const noteB = content.tool_b_note ?? (content as any).tool_b_notes ?? ''
  const aWins = content.tool_a_score > content.tool_b_score
  const bWins = content.tool_b_score > content.tool_a_score

  return (
    <div style={{ marginBottom: 24, border: '1px solid #E1E1E1', borderRadius: 2, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#F5F5F5', borderBottom: '1px solid #E1E1E1' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{content.category}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Tool A */}
        <div style={{ padding: 16, borderRight: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{toolA.name}</span>
            {aWins && <span style={{ fontSize: 10, fontWeight: 600, color: '#107C10', background: '#DFF6DD', padding: '1px 6px', borderRadius: 2 }}>Winner</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 6, background: '#E8ECF0', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${(content.tool_a_score / 5) * 100}%`, height: '100%', background: '#0078D4', borderRadius: 1 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{content.tool_a_score}/5</span>
          </div>
          {noteA && <p style={{ fontSize: 12, color: '#616161', margin: 0, lineHeight: 1.6 }}>{noteA}</p>}
        </div>

        {/* Tool B */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{toolB.name}</span>
            {bWins && <span style={{ fontSize: 10, fontWeight: 600, color: '#107C10', background: '#DFF6DD', padding: '1px 6px', borderRadius: 2 }}>Winner</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 6, background: '#E8ECF0', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${(content.tool_b_score / 5) * 100}%`, height: '100%', background: '#616161', borderRadius: 1 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{content.tool_b_score}/5</span>
          </div>
          {noteB && <p style={{ fontSize: 12, color: '#616161', margin: 0, lineHeight: 1.6 }}>{noteB}</p>}
        </div>
      </div>
    </div>
  )
}
