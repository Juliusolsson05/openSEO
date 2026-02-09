import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f3f4f6"/>
<rect x="10" y="15" width="50" height="12" rx="2" fill="#3182ce"/>
    <text x="15" y="24.5" fontSize="9" fill="#ffffff" fontFamily="system-ui">INTRO</text>
<rect x="10" y="32" width="20" height="2" fill="#3182ce" opacity="0.6"/>
<rect x="10" y="40" width="80" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="53" width="75" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="66" width="70" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="79" width="80" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
