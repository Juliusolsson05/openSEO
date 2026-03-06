import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
  light?: boolean
}

export function OpenSeoLogo({ className, size = 28, light = false }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <path
        d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
        fill={light ? '#FFFFFF' : '#0078D4'}
        fillRule="evenodd"
      />
    </svg>
  )
}

export function OpenSeoWordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <OpenSeoLogo size={28} light={light} />
      <span className={cn(
        'text-[15px] font-semibold tracking-tight',
        light ? 'text-white' : 'text-foreground'
      )}>
        OpenSEO
      </span>
    </div>
  )
}
