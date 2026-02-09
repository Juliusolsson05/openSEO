import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#ffffff" rx="4"/>
<rect x="0" y="0" width="100" height="30" fill="#e5e7eb" rx="4"/>
<rect x="70" y="5" width="20" height="20" fill="#f3f4f6" rx="2"/>
<rect x="10" y="8" width="50" height="6" fill="#f3f4f6" rx="1"/>
    <rect x="10" y="18" width="40" height="4" fill="#f3f4f6" rx="1"/>
<rect x="10" y="35" width="25" height="4" fill="#4b5563" rx="1"/>
    <rect x="10" y="42" width="80" height="3" fill="#e5e7eb" rx="1"/>
<rect x="10" y="50" width="25" height="4" fill="#4b5563" rx="1"/>
    <rect x="10" y="57" width="80" height="3" fill="#e5e7eb" rx="1"/>
<rect x="10" y="65" width="25" height="4" fill="#4b5563" rx="1"/>
    <circle cx="15" cy="74" r="2" fill="#48bb78"/>
    <rect x="20" y="72" width="70" height="3" fill="#e5e7eb" rx="1"/>
    <circle cx="15" cy="81" r="2" fill="#48bb78"/>
    <rect x="20" y="79" width="60" height="3" fill="#e5e7eb" rx="1"/>
<rect x="0" y="88" width="100" height="12" fill="#f3f4f6" rx="2"/>
    <rect x="10" y="92" width="30" height="4" fill="#3182ce" rx="1"/>
    <rect x="60" y="92" width="30" height="4" fill="#3182ce" rx="1"/>
  </svg>
  )
}
