'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

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

interface BarChartPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: BarChartContent
}

export function BarChartPreview({ content }: BarChartPreviewProps) {
  const bars = Array.isArray(content?.bars) ? content.bars : []

  if (!bars.length) {
    return null
  }

  const values = bars.map((bar) => Number(bar.value) || 0)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const roundedMax = Math.ceil(maxValue / 10) * 10
  const startValue = Math.floor(minValue / 10) * 10
  const interval = Math.ceil((roundedMax - startValue) / 3)
  const yTicks = [roundedMax, roundedMax - interval, startValue + interval, startValue]

  return (
    <BasePreview content={content}>
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
            <RechartsBarChart data={bars} margin={{ top: 20, right: 10, bottom: 110, left: 10 }}>
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
              <Bar dataKey="value" fill="#4b5563" radius={[4, 4, 0, 0]} /> {/* theme: secondary-foreground */}
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
    </BasePreview>
  )
}
