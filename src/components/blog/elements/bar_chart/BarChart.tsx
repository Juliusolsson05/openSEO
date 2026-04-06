'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { BarItem, BarChartContent } from '@/types/content-elements'
import { computeChartData } from './shared'

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
}: BarChartProps) {
  const chart = computeChartData(content)
  if (!chart) return null
  const { data, domain, yTicks } = chart

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div className="rounded-lg bg-secondary/50 p-5">
        <h2
          className="mb-4 text-center text-[22px] font-semibold leading-tight tracking-tight text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
        />

        {content.text_before ? (
          <p
            className="text-center text-[17px] font-light text-foreground"
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
                tick={{ fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                ticks={yTicks}
                domain={domain}
                tick={{ fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: 14 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                formatter={((value: number) => [`${value}%`, 'Value']) as any}
                contentStyle={{
                  backgroundColor: 'hsl(var(--primary))',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'hsl(var(--primary-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--primary-foreground))', fontWeight: 600 }}
                itemStyle={{ color: 'hsl(var(--primary-foreground))' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {content.text_after ? (
          <p
            className="text-center text-[17px] font-light text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
          />
        ) : null}

        <span className="block w-full text-center text-[13px] text-muted-foreground">(Max 100%)</span>
      </div>
    </BaseElement>
  )
}
