import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="15" width="80" height="10" rx="2" fill="#e5e7eb"/>
<circle cx="15" cy="40" r="2.5" fill="#3182ce"/>
    <rect x="25" y="36" width="65" height="8" rx="2" fill="#e5e7eb"/>
    
    <circle cx="15" cy="55" r="2.5" fill="#3182ce"/>
    <rect x="25" y="51" width="60" height="8" rx="2" fill="#e5e7eb"/>
    
    <circle cx="15" cy="70" r="2.5" fill="#3182ce"/>
    <rect x="25" y="66" width="70" height="8" rx="2" fill="#e5e7eb"/>
    
    <circle cx="15" cy="85" r="2.5" fill="#3182ce"/>
    <rect x="25" y="81" width="55" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
