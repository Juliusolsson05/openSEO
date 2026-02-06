import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
  /** Light version for dark backgrounds */
  light?: boolean
}

/**
 * Aurora logomark — stylized "A" with three rising light bars.
 * Geometric, clean, enterprise-grade.
 */
export function AuroraLogo({ className, size = 28, light = false }: LogoProps) {
  const color = light ? '#FFFFFF' : '#0078D4'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      {/* Base "A" shape — two angled pillars meeting at the top */}
      <path
        d="M16 3L6 28H10.5L16 14L21.5 28H26L16 3Z"
        fill={color}
      />
      {/* Crossbar */}
      <rect x="10" y="21" width="12" height="2.5" rx="1" fill={color} opacity="0.7" />
      {/* Rising accent bar — right, tallest */}
      <rect x="26" y="8" width="3" height="16" rx="1.5" fill={color} opacity="0.35" />
      {/* Rising accent bar — left */}
      <rect x="3" y="14" width="3" height="10" rx="1.5" fill={color} opacity="0.2" />
    </svg>
  )
}

/**
 * Full Aurora wordmark — logo + text.
 */
export function AuroraWordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <AuroraLogo size={28} light={light} />
      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          'text-[15px] font-semibold tracking-tight',
          light ? 'text-white' : 'text-foreground'
        )}>
          Aurora
        </span>
      </div>
    </div>
  )
}
