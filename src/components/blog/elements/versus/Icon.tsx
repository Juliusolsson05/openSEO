import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="10" width="25" height="20" rx="2" fill="#3182ce"/>
    <rect x="65" y="10" width="25" height="20" rx="2" fill="#3182ce"/>
    <text x="50" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3182ce">VS</text>
<rect x="10" y="40" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <rect x="55" y="40" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <circle cx="85" cy="46" r="3" fill="#3182ce"/>
<rect x="10" y="57" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <rect x="55" y="57" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <circle cx="40" cy="63" r="3" fill="#3182ce"/>
<rect x="10" y="74" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <rect x="55" y="74" width="35" height="12" rx="2" fill="#e5e7eb"/>
    <circle cx="85" cy="80" r="3" fill="#3182ce"/>
</svg>
  )
}
