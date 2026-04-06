'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import type { BarChartContent } from '@/types/content-elements'
import { computeChartData } from './shared'

interface BarChartPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: BarChartContent
}

export function BarChartPreview({ content }: BarChartPreviewProps) {
  const chart = computeChartData(content)
  if (!chart) return null
  const { data, domain, yTicks } = chart

  return (
    <BasePreview content={content}>
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
    </BasePreview>
  )
}
