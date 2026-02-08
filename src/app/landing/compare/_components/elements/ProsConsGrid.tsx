import type { ProsConsContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: ProsConsContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

function ItemList({ items, type }: { items: string[]; type: 'pro' | 'con' }) {
  const icon = type === 'pro' ? '✓' : '✗'
  const color = type === 'pro' ? '#107C10' : '#D13438'

  return (
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
          <span style={{ color, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ProsConsGrid({ content, toolA, toolB }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginBottom: 32,
      }}
    >
      {/* Tool A */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px' }}>
          {toolA.name}
        </h3>
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #E1E1E1',
            background: '#fff',
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#107C10', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pros
          </p>
          <ItemList items={content.tool_a_pros} type="pro" />
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #E1E1E1',
            background: '#fff',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#D13438', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cons
          </p>
          <ItemList items={content.tool_a_cons} type="con" />
        </div>
      </div>

      {/* Tool B */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px' }}>
          {toolB.name}
        </h3>
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #E1E1E1',
            background: '#fff',
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#107C10', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pros
          </p>
          <ItemList items={content.tool_b_pros} type="pro" />
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #E1E1E1',
            background: '#fff',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#D13438', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cons
          </p>
          <ItemList items={content.tool_b_cons} type="con" />
        </div>
      </div>
    </div>
  )
}
