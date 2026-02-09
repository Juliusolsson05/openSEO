import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<line x1="50" y1="10" x2="50" y2="90" stroke="#e5e7eb" strokeWidth="4"/>

<circle cx="50" cy="25" r="4" fill="#1976D2"/>
    <rect x="10" y="15" width="35" height="20" rx="2" fill="#e5e7eb"/>
<circle cx="50" cy="50" r="4" fill="#1976D2"/>
    <rect x="55" y="40" width="35" height="20" rx="2" fill="#e5e7eb"/>
<circle cx="50" cy="75" r="4" fill="#1976D2"/>
    <rect x="10" y="65" width="35" height="20" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
