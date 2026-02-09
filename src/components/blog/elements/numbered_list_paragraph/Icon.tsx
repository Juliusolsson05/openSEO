import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="15" width="80" height="10" rx="2" fill="#e5e7eb"/>
<text x="15" y="45" fontSize="12" fill="#3182ce" fontWeight="bold">1</text>
    <rect x="30" y="38" width="60" height="8" rx="2" fill="#e5e7eb"/>
    
    <text x="15" y="65" fontSize="12" fill="#3182ce" fontWeight="bold">2</text>
    <rect x="30" y="58" width="60" height="8" rx="2" fill="#e5e7eb"/>
    
    <text x="15" y="85" fontSize="12" fill="#3182ce" fontWeight="bold">3</text>
    <rect x="30" y="78" width="60" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
