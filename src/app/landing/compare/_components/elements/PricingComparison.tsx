import type { PricingComparisonContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: PricingComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

function PlanCard({ plan }: { plan: { name: string; price: string; features: string[] } }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 8,
        border: '1px solid #E1E1E1',
        background: '#fff',
      }}
    >
      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
        {plan.name}
      </h4>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#0078D4', margin: '0 0 12px' }}>
        {plan.price}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {plan.features.map((feature, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              color: '#1A1A1A',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ color: '#0078D4', fontSize: 14, lineHeight: '1.4' }}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PricingComparison({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tool A Plans */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
            {toolA.name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.tool_a_plans.map((plan, i) => (
              <PlanCard key={i} plan={plan} />
            ))}
          </div>
        </div>

        {/* Tool B Plans */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
            {toolB.name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.tool_b_plans.map((plan, i) => (
              <PlanCard key={i} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
