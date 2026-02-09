import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      <rect width="100" height="100" fill="#f3f4f6" />
      <rect x="12" y="12" width="76" height="76" rx="6" fill="#e5e7eb" />
      <rect x="20" y="24" width="52" height="8" rx="2" fill="#d1d5db" />
      <rect x="20" y="38" width="60" height="6" rx="2" fill="#d1d5db" />
      <rect x="28" y="50" width="52" height="6" rx="2" fill="#d1d5db" />
      <rect x="36" y="62" width="44" height="6" rx="2" fill="#d1d5db" />
    </svg>
  )
}
