import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      <rect width="100" height="100" fill="#f3f4f6" />
      <rect x="10" y="12" width="80" height="12" rx="2" fill="#e5e7eb" />
      <rect x="10" y="30" width="24" height="24" rx="3" fill="#d1d5db" />
      <rect x="40" y="32" width="45" height="8" rx="2" fill="#e5e7eb" />
      <rect x="40" y="45" width="35" height="6" rx="2" fill="#e5e7eb" />
      <rect x="10" y="60" width="24" height="24" rx="3" fill="#d1d5db" />
      <rect x="40" y="62" width="45" height="8" rx="2" fill="#e5e7eb" />
      <rect x="40" y="75" width="35" height="6" rx="2" fill="#e5e7eb" />
    </svg>
  )
}
