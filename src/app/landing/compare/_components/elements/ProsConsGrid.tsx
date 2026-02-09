import type { ProsConsContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: ProsConsContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

function ProConCard({
  title,
  items,
  type,
}: {
  title: string
  items: string[]
  type: 'pro' | 'con'
}) {
  const isPro = type === 'pro'
  const borderColor = isPro ? '#107C10' : '#D13438'
  const iconColor = isPro ? '#107C10' : '#D13438'
  const icon = isPro ? '✓' : '✗'
  const label = isPro ? 'Pros' : 'Cons'
  const bgTint = isPro ? 'rgba(16,124,16,0.03)' : 'rgba(209,52,56,0.03)'

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 10,
        border: '1px solid #E1E1E1',
        borderLeft: `4px solid ${borderColor}`,
        background: bgTint,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: borderColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 12px' }}>
        {title}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
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
            <span style={{ color: iconColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProsConsGrid({ content, toolA, toolB }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 36,
      }}
    >
      <ProConCard title={toolA.name} items={content.tool_a_pros} type="pro" />
      <ProConCard title={toolB.name} items={content.tool_b_pros} type="pro" />
      <ProConCard title={toolA.name} items={content.tool_a_cons} type="con" />
      <ProConCard title={toolB.name} items={content.tool_b_cons} type="con" />
    </div>
  )
}
