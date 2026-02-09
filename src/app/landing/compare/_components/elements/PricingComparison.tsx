import type { PricingComparisonContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: PricingComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function PricingComparison({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0078D4', marginBottom: 8 }}>Pricing</p>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Pricing Comparison</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tool A */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>{toolA.name}</p>
          {content.tool_a_plans.map((plan: any, i: number) => (
            <div key={i} style={{ padding: 16, border: '1px solid #E1E1E1', borderRadius: 2, marginBottom: 8, background: '#FFFFFF' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#616161', margin: '0 0 4px' }}>{plan.name ?? plan.plan ?? ''}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#0078D4', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{plan.price}</p>
              {plan.features.map((f: string, j: number) => (
                <div key={j} style={{ display: 'flex', gap: 6, padding: '2px 0', fontSize: 12, color: '#616161' }}>
                  <span style={{ color: '#107C10', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tool B */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>{toolB.name}</p>
          {content.tool_b_plans.map((plan: any, i: number) => (
            <div key={i} style={{ padding: 16, border: '1px solid #E1E1E1', borderRadius: 2, marginBottom: 8, background: '#FFFFFF' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#616161', margin: '0 0 4px' }}>{plan.name ?? plan.plan ?? ''}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#0078D4', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{plan.price}</p>
              {plan.features.map((f: string, j: number) => (
                <div key={j} style={{ display: 'flex', gap: 6, padding: '2px 0', fontSize: 12, color: '#616161' }}>
                  <span style={{ color: '#107C10', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
