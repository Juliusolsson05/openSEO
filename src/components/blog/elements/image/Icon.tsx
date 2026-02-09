import type { IconProps } from '@/types/common'


export default function Icon({ width = 120, height = 120, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height} className={className}>
<rect width="100" height="100" fill="#ffffff" rx="4"/>
<rect x="10" y="10" width="80" height="80" fill="#EFF1F3" rx="4"/>
<path fillRule="evenodd" clipRule="evenodd" 
      d="M27.7 32.4C27.71 31.21 28.68 30.24 29.87 30.23H69.13C70.32 30.23 71.29 31.2 71.29 32.4V66.6C71.28 67.79 70.31 68.76 69.13 68.77H29.87C28.68 68.77 27.7 67.8 27.7 66.6V32.4ZM67 34.6H32V64.4L52.41 44C53.26 43.14 54.65 43.14 55.5 44L67 55.6V34.6ZM36.46 43.3C36.46 45.69 38.41 47.64 40.8 47.64C43.19 47.64 45.14 45.69 45.14 43.3C45.14 40.91 43.19 38.96 40.8 38.96C38.41 38.96 36.46 40.91 36.46 43.3Z" 
      fill="#687787"/>
<rect x="20" y="92" width="60" height="4" rx="2" fill="#e5e7eb"/>
  </svg>
  )
}
