import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6" rx="4"/>
<rect x="10" y="10" width="60" height="8" fill="#e5e7eb" rx="2"/>
<line x1="20" y1="25" x2="20" y2="80" stroke="#e5e7eb" strokeWidth="2"/>
<line x1="20" y1="80" x2="90" y2="80" stroke="#e5e7eb" strokeWidth="2"/>
<rect x="30" y="40" width="8" height="40" fill="#00008B" rx="1"/>
    <rect x="45" y="50" width="8" height="30" fill="#00008B" rx="1"/>
    <rect x="60" y="35" width="8" height="45" fill="#00008B" rx="1"/>
    <rect x="75" y="60" width="8" height="20" fill="#00008B" rx="1"/>
<rect x="5" y="30" width="10" height="4" fill="#9ca3af" rx="1"/>
    <rect x="5" y="50" width="10" height="4" fill="#9ca3af" rx="1"/>
    <rect x="5" y="70" width="10" height="4" fill="#9ca3af" rx="1"/>
<rect x="28" y="85" width="12" height="4" fill="#9ca3af" rx="1"/>
    <rect x="43" y="85" width="12" height="4" fill="#9ca3af" rx="1"/>
    <rect x="58" y="85" width="12" height="4" fill="#9ca3af" rx="1"/>
    <rect x="73" y="85" width="12" height="4" fill="#9ca3af" rx="1"/>
  </svg>
  )
}
