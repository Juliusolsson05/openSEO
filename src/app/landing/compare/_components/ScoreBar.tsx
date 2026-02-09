interface ScoreBarProps {
  score: number
  max?: number
  label?: string
  color?: string
}

export function ScoreBar({ score, max = 5, label, color = '#0078D4' }: ScoreBarProps) {
  const percentage = Math.min((score / max) * 100, 100)
  const displayScore = Number.isInteger(score) ? `${score}` : score.toFixed(1)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && (
        <span style={{ fontSize: 13, color: '#616161', minWidth: 60 }}>{label}</span>
      )}
      <div
        style={{
          flex: 1,
          minWidth: 120,
          height: 8,
          borderRadius: 4,
          background: '#E8ECF0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: 4,
            background: color,
            transition: 'width 0.4s ease-out',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          minWidth: 32,
          textAlign: 'right',
        }}
      >
        {displayScore}/{max}
      </span>
    </div>
  )
}
