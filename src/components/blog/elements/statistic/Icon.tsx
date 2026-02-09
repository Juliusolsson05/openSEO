import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#f5f5f5" rx="4"/>
<rect x="20" y="10" width="60" height="8" rx="2" fill="#e5e7eb"/>
<circle cx="50" cy="50" r="25" fill="none" stroke="#e6e6e6" strokeWidth="6"/>
<path 
      d="M 50 25 A 25 25 0 1 1 25 50"
      fill="none" 
      stroke="#00008B" 
      strokeWidth="6"
      strokeLinecap="round"
    />
<rect x="40" y="45" width="20" height="10" rx="2" fill="#f5f5f5"/>
    <text x="50" y="52" 
      textAnchor="middle" 
      fontSize="10"
      fontWeight="bold"
      fill="#000000">75%</text>
<rect x="15" y="85" width="70" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="25" y="92" width="50" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
  )
}
