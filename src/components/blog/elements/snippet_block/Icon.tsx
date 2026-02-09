import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="10" width="80" height="80" rx="4" fill="#ffffff" stroke="#3182ce" strokeWidth="4"/>
<rect x="20" y="20" width="60" height="8" rx="2" fill="#e5e7eb"/>
<rect x="20" y="38" width="60" height="6" rx="2" fill="#e5e7eb"/>
    <rect x="20" y="50" width="50" height="6" rx="2" fill="#e5e7eb"/>
    <rect x="20" y="62" width="55" height="6" rx="2" fill="#e5e7eb"/>
    <rect x="20" y="74" width="45" height="6" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
