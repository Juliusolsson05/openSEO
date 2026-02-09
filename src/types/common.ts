import type { SVGProps } from 'react'

/** Shared save-state across auto-save hooks and inline editors. */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** Sort direction used in list views. */
export type SortDir = 'asc' | 'desc'

/** Standard SVG icon props used by all element icons. */
export type IconProps = Pick<SVGProps<SVGSVGElement>, 'className'> & {
  width?: number | string
  height?: number | string
}
