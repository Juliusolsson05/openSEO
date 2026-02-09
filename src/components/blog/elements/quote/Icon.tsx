import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<text x="12" y="40" fontSize="45" fill="#3182ce" fontFamily="Georgia, serif">&quot;</text>
<rect x="15" y="45" width="70" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="15" y="58" width="60" height="8" rx="2" fill="#e5e7eb"/>
<rect x="15" y="78" width="3" height="3" rx="1.5" fill="#3182ce"/>
    <rect x="25" y="75" width="35" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="65" y="75" width="20" height="8" rx="2" fill="#e5e7eb" opacity="0.7"/>
  </svg>
  )
}
