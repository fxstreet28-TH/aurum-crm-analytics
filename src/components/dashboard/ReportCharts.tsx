'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { thbAmount } from '@/lib/format'
import type { CategorySlice, TierBucket, WeeklyBucket } from '@/lib/queries/reports'

const TOOLTIP_STYLE = {
  background: '#1a1a28',
  border: '1px solid #2a2a38',
  borderRadius: 12,
  fontSize: 12,
}

const AXIS_TICK = { fill: '#6a6a80', fontSize: 11 }

/** Category colours stay stable across charts so Live is always purple, etc. */
const CATEGORY_COLORS: Record<string, string> = {
  Live: '#8b5cf6',
  Storage: '#06b6d4',
  Playback: '#f59e0b',
  Chat: '#10b981',
}

export function RevenueVsCostChart({ data }: { data: WeeklyBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid stroke="#2a2a38" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: '#2a2a38' }}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => thbAmount(v)}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: '#a0a0b0' }}
          cursor={{ fill: '#22222e' }}
          formatter={(value, name) => [
            thbAmount(Number(value)),
            name === 'revenueThb' ? 'Revenue' : 'Cost',
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#a0a0b0' }}
          formatter={(value) => (value === 'revenueThb' ? 'Revenue' : 'Cost')}
        />
        <Bar dataKey="revenueThb" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="costThb" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CostCategoryChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-xs text-ink-faint">
        No infra cost recorded for creators in analytics scope.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={CATEGORY_COLORS[slice.name] ?? '#6a6a80'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [thbAmount(Number(value)), String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#a0a0b0' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TierDistributionChart({ data }: { data: TierBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="#2a2a38" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="tier"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: '#2a2a38' }}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: '#22222e' }}
          formatter={(value) => [`${Number(value)} creators`, 'Creators']}
        />
        <Bar dataKey="creators" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
