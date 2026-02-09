import type { ProsConsContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: ProsConsContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function ProsConsGrid({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0078D4', marginBottom: 8 }}>Analysis</p>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Pros & Cons</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E1E1E1', borderRadius: 2, overflow: 'hidden' }}>
        {/* Tool A Pros */}
        <div style={{ padding: 16, background: '#FFFFFF' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{toolA.name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#107C10', background: '#DFF6DD', padding: '1px 6px', borderRadius: 2, marginLeft: 8 }}>Pros</span>
          </div>
          {content.tool_a_pros.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 12, color: '#1A1A1A', lineHeight: 1.5 }}>
              <span style={{ color: '#107C10', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Tool B Pros */}
        <div style={{ padding: 16, background: '#FFFFFF' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{toolB.name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#107C10', background: '#DFF6DD', padding: '1px 6px', borderRadius: 2, marginLeft: 8 }}>Pros</span>
          </div>
          {content.tool_b_pros.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 12, color: '#1A1A1A', lineHeight: 1.5 }}>
              <span style={{ color: '#107C10', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Tool A Cons */}
        <div style={{ padding: 16, background: '#FFFFFF' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{toolA.name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#D13438', background: '#FDE7E9', padding: '1px 6px', borderRadius: 2, marginLeft: 8 }}>Cons</span>
          </div>
          {content.tool_a_cons.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 12, color: '#616161', lineHeight: 1.5 }}>
              <span style={{ color: '#D13438', fontWeight: 700, flexShrink: 0 }}>✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Tool B Cons */}
        <div style={{ padding: 16, background: '#FFFFFF' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{toolB.name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#D13438', background: '#FDE7E9', padding: '1px 6px', borderRadius: 2, marginLeft: 8 }}>Cons</span>
          </div>
          {content.tool_b_cons.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 12, color: '#616161', lineHeight: 1.5 }}>
              <span style={{ color: '#D13438', fontWeight: 700, flexShrink: 0 }}>✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
