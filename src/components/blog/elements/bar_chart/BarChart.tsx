'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface BarItem {
  label: string
  value: number
}

interface BarChartContent {
  title: string
  text_before?: string
  text_after?: string
  bars: BarItem[]
}

interface BarChartProps extends Omit<ElementComponentProps, 'content'> {
  content: BarChartContent
  baseColor?: string
}

const hexToHSL = (hex: string) => {
  const normalized = hex.replace(/^#/, '')
  const r = parseInt(normalized.substring(0, 2), 16) / 255
  const g = parseInt(normalized.substring(2, 4), 16) / 255
  const b = parseInt(normalized.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

const calculateLighterColor = (baseHue: number, baseSaturation: number, baseLightness: number, value: number) => {
  const hueShift = 50
  const lightHue = (baseHue - hueShift + 360) % 360
  const hue = lightHue + value * hueShift
  const saturation = Math.max(60, baseSaturation - 20 * (1 - value))
  const lightness = Math.min(85, baseLightness + 15 * (1 - value))

  return { hue, saturation, lightness }
}

export function BarChart({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementDeleted,
  baseColor = '#00008B', // theme: primary (customizable)
}: BarChartProps) {
  const bars = Array.isArray(content?.bars) ? content.bars : []

  if (!bars.length) {
    return null
  }

  const values = bars.map((bar) => Number(bar.value) || 0)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const roundedMax = Math.ceil(maxValue / 10) * 10
  const startValue = minValue - 5
  const denominator = Math.max(1, maxValue - startValue)
  const baseHSL = hexToHSL(baseColor)

  const data = [...bars]
    .sort((a, b) => b.value - a.value)
    .map((bar) => {
      const normalizedValue = (bar.value - startValue) / denominator
      const color = calculateLighterColor(baseHSL.h, baseHSL.s, baseHSL.l, normalizedValue)

      return {
        ...bar,
        fill: `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`,
      }
    })

  const interval = Math.ceil((roundedMax - startValue) / 3)
  const yTicks = [roundedMax, roundedMax - interval, startValue + interval, startValue]

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div className="rounded-lg bg-secondary p-8">
        <h2
          className="mb-6 text-2xl font-semibold leading-[1.5] text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
        />

        {content.text_before ? (
          <p
            className="mb-6 text-[1.125rem] leading-[1.77] text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
          />
        ) : null}

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 20, right: 10, bottom: 110, left: 10 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
                tick={{ fill: '#213343' /* theme: foreground */, fontWeight: 700, fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' /* theme: border */ }}
                tickLine={false}
              />
              <YAxis
                ticks={yTicks}
                domain={[startValue, roundedMax]}
                tick={{ fill: '#213343' /* theme: foreground */, fontWeight: 700, fontSize: 14 }}
                axisLine={{ stroke: '#e2e8f0' /* theme: border */ }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(2, 6, 23, 0.06)' }}
                formatter={((value: number) => [`${value}%`, 'Value']) as any}
                contentStyle={{
                  backgroundColor: '#00008B', // theme: primary
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff', // theme: text-white
                }}
                labelStyle={{ color: '#fff', fontWeight: 600 }} // theme: text-white
                itemStyle={{ color: '#fff' }} // theme: text-white
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {content.text_after ? (
          <p
            className="mt-6 text-[1.125rem] leading-[1.77] text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
          />
        ) : null}

        <span className="block w-full text-center text-[1.125rem] font-bold leading-[1.77] text-foreground">(Max 100%)</span>
      </div>
    </BaseElement>
  )
}
