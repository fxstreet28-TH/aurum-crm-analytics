'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { gigabytes } from '@/lib/format'

type Props = { data: { tier: string; gb: number; clips: number }[] }

export function StorageByTierChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-xs text-ink-faint">No stored clips.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid stroke="#2a2a38" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="tier"
          tick={{ fill: '#6a6a80', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a2a38' }}
        />
        <YAxis
          tick={{ fill: '#6a6a80', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => gigabytes(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a28',
            border: '1px solid #2a2a38',
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: '#22222e' }}
          formatter={(value) => [gigabytes(Number(value)), 'Stored']}
        />
        <Bar dataKey="gb" fill="#06b6d4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
