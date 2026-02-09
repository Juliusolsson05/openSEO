import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="10" width="60" height="8" rx="2" fill="#e5e7eb"/>
<rect x="10" y="25" width="80" height="15" rx="2" fill="#3182ce"/>
<rect x="33" y="25" width="1" height="15" fill="#ffffff"/>
    <rect x="56" y="25" width="1" height="15" fill="#ffffff"/>
<rect x="10" y="40" width="80" height="12" rx="0" fill="#ffffff"/>
    <rect x="10" y="52" width="80" height="12" rx="0" fill="#f3f4f6"/>
    <rect x="10" y="64" width="80" height="12" rx="0" fill="#ffffff"/>
    <rect x="10" y="76" width="80" height="12" rx="0" fill="#f3f4f6"/>
<rect x="33" y="40" width="1" height="48" fill="#e5e7eb"/>
    <rect x="56" y="40" width="1" height="48" fill="#e5e7eb"/>
<rect x="15" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="38" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="61" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    
    <rect x="15" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="38" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="61" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
  )
}
