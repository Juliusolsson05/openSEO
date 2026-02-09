import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      <rect width="100" height="100" fill="#f3f4f6" />
      <rect x="10" y="12" width="80" height="12" rx="2" fill="#e5e7eb" />
      <rect x="10" y="30" width="80" height="52" rx="4" fill="#e5e7eb" />
      <rect x="18" y="40" width="20" height="6" rx="2" fill="#d1d5db" />
      <rect x="44" y="40" width="30" height="6" rx="2" fill="#d1d5db" />
      <rect x="18" y="54" width="10" height="6" rx="2" fill="#d1d5db" />
      <rect x="32" y="54" width="42" height="6" rx="2" fill="#d1d5db" />
      <rect x="18" y="68" width="28" height="6" rx="2" fill="#d1d5db" />
    </svg>
  )
}
