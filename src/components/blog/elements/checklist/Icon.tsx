import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
      <rect width="100" height="100" fill="#f3f4f6" />
      <rect x="10" y="12" width="80" height="12" rx="2" fill="#e5e7eb" />
      <rect x="12" y="33" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="25" y="33" width="60" height="8" rx="2" fill="#e5e7eb" />
      <rect x="12" y="49" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="25" y="49" width="52" height="8" rx="2" fill="#e5e7eb" />
      <rect x="12" y="65" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="25" y="65" width="56" height="8" rx="2" fill="#e5e7eb" />
    </svg>
  )
}
