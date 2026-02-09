import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#ffffff" rx="4"/>
<rect x="20" y="10" width="60" height="6" rx="2" fill="#e5e7eb"/>
<rect x="10" y="25" width="35" height="5" rx="1" fill="#28a745"/>
    <line x1="10" y1="32" x2="45" y2="32" stroke="#28a745" strokeWidth="2"/>
<circle cx="15" cy="42" r="3" fill="#28a745"/>
    <rect x="22" y="40" width="30" height="4" rx="1" fill="#e5e7eb"/>
    
    <circle cx="15" cy="52" r="3" fill="#28a745"/>
    <rect x="22" y="50" width="25" height="4" rx="1" fill="#e5e7eb"/>
    
    <circle cx="15" cy="62" r="3" fill="#28a745"/>
    <rect x="22" y="60" width="28" height="4" rx="1" fill="#e5e7eb"/>
<rect x="55" y="25" width="35" height="5" rx="1" fill="#dc3545"/>
    <line x1="55" y1="32" x2="90" y2="32" stroke="#dc3545" strokeWidth="2"/>
<rect x="55" y="38" width="6" height="6" rx="1" transform="rotate(45 58 41)" fill="#dc3545"/>
    <rect x="67" y="40" width="30" height="4" rx="1" fill="#e5e7eb"/>
    
    <rect x="55" y="48" width="6" height="6" rx="1" transform="rotate(45 58 51)" fill="#dc3545"/>
    <rect x="67" y="50" width="25" height="4" rx="1" fill="#e5e7eb"/>
    
    <rect x="55" y="58" width="6" height="6" rx="1" transform="rotate(45 58 61)" fill="#dc3545"/>
    <rect x="67" y="60" width="28" height="4" rx="1" fill="#e5e7eb"/>
<rect x="20" y="80" width="60" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="30" y="88" width="40" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
  )
}
