import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="10" width="40" height="12" rx="2" fill="#3182ce"/>
    <text x="16" y="20" fontSize="10" fill="#ffffff" fontWeight="bold">FAQ</text>
<rect x="10" y="30" width="80" height="15" rx="2" fill="#e5e7eb"/>
    <circle cx="80" cy="37.5" r="6" fill="#3182ce"/>
<rect x="76" y="36.5" width="8" height="2" fill="#ffffff"/>
<rect x="15" y="50" width="70" height="6" rx="2" fill="#e5e7eb" opacity="0.7"/>
    <rect x="15" y="60" width="60" height="6" rx="2" fill="#e5e7eb" opacity="0.7"/>
<rect x="10" y="75" width="80" height="15" rx="2" fill="#e5e7eb"/>
    <circle cx="80" cy="82.5" r="6" fill="#3182ce"/>
<rect x="76" y="81.5" width="8" height="2" fill="#ffffff"/>
    <rect x="79" y="78.5" width="2" height="8" fill="#ffffff"/>
  </svg>
  )
}
