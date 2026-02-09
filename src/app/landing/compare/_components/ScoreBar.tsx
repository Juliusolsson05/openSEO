interface Props {
  score: number
  maxScore?: number
  color?: string
}

export function ScoreBar({ score, maxScore = 5, color = '#0078D4' }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#E8ECF0', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ width: `${(score / maxScore) * 100}%`, height: '100%', background: color, borderRadius: 1 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', minWidth: 24, textAlign: 'right' }}>{score}/{maxScore}</span>
    </div>
  )
}
