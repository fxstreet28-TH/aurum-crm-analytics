'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ViewTrendPoint } from '@/lib/queries/creators'
import { dayLabel, number } from '@/lib/format'

type Props = { data: ViewTrendPoint[] }

/**
 * Daily views for one creator's back catalogue. Same axis/grid/tooltip treatment as
 * the Overview revenue trend so the two read as one chart family; views get the
 * accent violet, since nothing on this chart is money.
 */
export function ViewTrendChart({ data }: Props) {
  const points = data.map((d) => ({
    day: d.day,
    label: dayLabel(d.day),
    views: d.views,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2a2a38" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6a6a80', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a2a38' }}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: '#6a6a80', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          allowDecimals={false}
          tickFormatter={(v) => number(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a28',
            border: '1px solid #2a2a38',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: '#a0a0b0' }}
          formatter={(value) => [number(Number(value)), 'Views']}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#viewsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
