import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      <rect width="100" height="100" fill="#f3f4f6" />
      <rect x="10" y="12" width="80" height="12" rx="2" fill="#e5e7eb" />
      <rect x="10" y="30" width="62" height="8" rx="2" fill="#e5e7eb" />
      <rect x="10" y="42" width="72" height="8" rx="2" fill="#e5e7eb" />
      <rect x="10" y="58" width="80" height="24" rx="4" fill="#d1d5db" />
      <rect x="28" y="66" width="44" height="8" rx="2" fill="#9ca3af" />
    </svg>
  )
}
