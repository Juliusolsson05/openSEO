import type { BarChartContent, BarItem } from '@/types/content-elements'

export interface ChartData {
  data: BarItem[]
  domain: [number, number]
  yTicks: number[]
}

/**
 * Canonical bar-chart derivation used by both the live and preview renderers.
 * - sorts bars descending by value (so the post always shows ranked order)
 * - pads the lower bound by 5 to keep bars visually above the axis
 * - rounds the upper bound up to the next multiple of 10
 * - emits 4 y-axis ticks evenly spaced across the domain
 */
export const computeChartData = (content: BarChartContent): ChartData | null => {
  const bars = Array.isArray(content?.bars) ? content.bars : []
  if (!bars.length) return null

  const values = bars.map((bar) => Number(bar.value) || 0)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const roundedMax = Math.ceil(maxValue / 10) * 10
  const startValue = minValue - 5

  const data = [...bars].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
  const interval = Math.ceil((roundedMax - startValue) / 3)
  const yTicks = [roundedMax, roundedMax - interval, startValue + interval, startValue]

  return {
    data,
    domain: [startValue, roundedMax],
    yTicks,
  }
}
