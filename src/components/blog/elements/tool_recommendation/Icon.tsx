import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#ffffff" rx="4"/>
    <rect x="5" y="5" width="90" height="90" fill="#ffffff" rx="3" stroke="#e0e0e0" strokeWidth="2"/>
<rect x="5" y="5" width="90" height="25" fill="rgba(0,0,0,0.05)" rx="3"/>
<rect x="12" y="10" width="40" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="12" y="18" width="20" height="4" rx="1" fill="#e5e7eb"/>
<rect x="65" y="8" width="20" height="20" rx="2" fill="#e5e7eb"/>
<rect x="12" y="38" width="76" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="12" y="46" width="70" height="4" rx="1" fill="#e5e7eb"/>
<rect x="12" y="58" width="30" height="4" rx="1" fill="#e5e7eb"/>
<rect x="12" y="66" width="35" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="52" y="66" width="35" height="4" rx="1" fill="#e5e7eb"/>
    
    <rect x="12" y="74" width="35" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="52" y="74" width="35" height="4" rx="1" fill="#e5e7eb"/>
<rect x="5" y="85" width="90" height="10" fill="#f7fafc" rx="2"/>
    <rect x="12" y="88" width="25" height="4" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
