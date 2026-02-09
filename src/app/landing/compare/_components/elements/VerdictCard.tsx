import type { VerdictContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: VerdictContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function VerdictCard({ content, toolA, toolB }: Props) {
  const aBullets = Array.isArray(content.tool_a_verdict)
    ? content.tool_a_verdict
    : content.tool_a_verdict.split('\n').filter(Boolean)
  const bBullets = Array.isArray(content.tool_b_verdict)
    ? content.tool_b_verdict
    : content.tool_b_verdict.split('\n').filter(Boolean)

  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0078D4', marginBottom: 8 }}>Verdict</p>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Our Recommendation</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E1E1E1', borderRadius: 2, overflow: 'hidden' }}>
        {/* Tool A */}
        <div style={{ padding: 20, background: '#F0F6FF' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0078D4', margin: '0 0 4px' }}>{toolA.name}</p>
          <p style={{ fontSize: 11, color: '#616161', margin: '0 0 12px' }}>Choose {toolA.name} if…</p>
          {aBullets.map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 13, color: '#1A1A1A', lineHeight: 1.5 }}>
              <span style={{ color: '#0078D4', fontWeight: 700, flexShrink: 0 }}>→</span>
              <span>{item.replace(/^[-•]\s*/, '')}</span>
            </div>
          ))}
        </div>

        {/* Tool B */}
        <div style={{ padding: 20, background: '#FFFFFF' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>{toolB.name}</p>
          <p style={{ fontSize: 11, color: '#616161', margin: '0 0 12px' }}>Choose {toolB.name} if…</p>
          {bBullets.map((item: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 13, color: '#1A1A1A', lineHeight: 1.5 }}>
              <span style={{ color: '#616161', fontWeight: 700, flexShrink: 0 }}>→</span>
              <span>{item.replace(/^[-•]\s*/, '')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
