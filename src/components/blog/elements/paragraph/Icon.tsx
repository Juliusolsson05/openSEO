import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="15" width="80" height="12" rx="2" fill="#e5e7eb"/>
<rect x="10" y="35" width="80" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="50" width="65" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="65" width="75" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="80" width="45" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
