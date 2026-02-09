import type { PricingComparisonContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: PricingComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

function PlanCard({
  plan,
  isHighlighted,
}: {
  plan: { name: string; price: string; features: string[] }
  isHighlighted?: boolean
}) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 10,
        border: isHighlighted ? '2px solid #0078D4' : '1px solid #E1E1E1',
        background: '#fff',
        boxShadow: isHighlighted ? '0 2px 12px rgba(0,120,212,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {isHighlighted && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            background: '#0078D4',
            padding: '2px 10px',
            borderRadius: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Popular
        </div>
      )}
      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px' }}>
        {plan.name ?? (plan as any).plan ?? ''}
      </h4>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#0078D4', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        {plan.price}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {plan.features.map((feature, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              color: '#1A1A1A',
              padding: '5px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: '#107C10', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PricingComparison({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
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
            fontSize: 20,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Pricing Comparison
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tool A Plans */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#F0F6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#0078D4',
              }}
            >
              {toolA.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {toolA.name}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {content.tool_a_plans.map((plan, i) => (
              <PlanCard key={i} plan={plan} isHighlighted={i === 1 && content.tool_a_plans.length > 1} />
            ))}
          </div>
        </div>

        {/* Tool B Plans */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#F3F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#6B4FBB',
              }}
            >
              {toolB.name.charAt(0)}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {toolB.name}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {content.tool_b_plans.map((plan, i) => (
              <PlanCard key={i} plan={plan} isHighlighted={i === 1 && content.tool_b_plans.length > 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
