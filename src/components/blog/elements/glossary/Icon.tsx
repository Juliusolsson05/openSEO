import type { IconProps } from '@/types/common'

export default function GlossaryIcon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      {/* Background */}
      <rect width="100" height="100" fill="#f3f4f6" />

      {/* Book spine */}
      <rect x="12" y="10" width="6" height="80" rx="1" fill="#d1d5db" />

      {/* Book body */}
      <rect x="18" y="10" width="70" height="80" rx="2" fill="#e5e7eb" />

      {/* Title line */}
      <rect x="26" y="18" width="40" height="6" rx="1" fill="#d1d5db" />

      {/* A */}
      <rect x="26" y="32" width="10" height="5" rx="1" fill="#9ca3af" />
      <rect x="40" y="32" width="40" height="4" rx="1" fill="#d1d5db" />
      <rect x="40" y="39" width="32" height="4" rx="1" fill="#d1d5db" />

      {/* B */}
      <rect x="26" y="50" width="10" height="5" rx="1" fill="#9ca3af" />
      <rect x="40" y="50" width="38" height="4" rx="1" fill="#d1d5db" />
      <rect x="40" y="57" width="28" height="4" rx="1" fill="#d1d5db" />

      {/* C */}
      <rect x="26" y="68" width="10" height="5" rx="1" fill="#9ca3af" />
      <rect x="40" y="68" width="35" height="4" rx="1" fill="#d1d5db" />
      <rect x="40" y="75" width="30" height="4" rx="1" fill="#d1d5db" />
    </svg>
  )
}
