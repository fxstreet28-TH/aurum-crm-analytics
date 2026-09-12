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
import type { TrendPoint } from '@/lib/queries/types'
import { dayLabel, thbAmount } from '@/lib/format'

type Props = { data: TrendPoint[] }

export function RevenueTrendChart({ data }: Props) {
  const points = data.map((d) => ({
    day: d.day,
    label: dayLabel(d.day),
    revenue: Number(d.revenue_thb),
    cost: Number(d.cost_thb),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
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
          width={64}
          tickFormatter={(v) => thbAmount(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a28',
            border: '1px solid #2a2a38',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: '#a0a0b0' }}
          formatter={(value, name) => [
            thbAmount(Number(value)),
            name === 'revenue' ? 'Revenue' : 'Cost',
          ]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#costFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
