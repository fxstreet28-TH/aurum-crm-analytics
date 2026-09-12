import { ThbAmount } from '@/components/shared/ThbAmount'
import { gigabytes, hours as fmtHours, number } from '@/lib/format'
import type { CostBreakdown } from '@/lib/queries/types'

type Props = { breakdown: CostBreakdown }

const CATEGORIES = [
  { key: 'live', label: 'Live', color: 'bg-accent' },
  { key: 'storage', label: 'Storage', color: 'bg-info' },
  { key: 'playback', label: 'Playback', color: 'bg-warning' },
  { key: 'chat', label: 'Chat', color: 'bg-success' },
] as const

export function CostBreakdownBar({ breakdown }: Props) {
  const total = Number(breakdown.total_cost_thb)

  const parts = CATEGORIES.map((category) => {
    const cost = Number(breakdown[category.key].cost_thb)
    return {
      ...category,
      cost,
      pct: total > 0 ? (cost / total) * 100 : 0,
    }
  })

  const detail: Record<string, string> = {
    live: `${fmtHours(breakdown.live.hours)} across ${number(breakdown.live.sessions)} sessions`,
    storage: `${gigabytes(breakdown.storage.gb_stored)} over ${number(breakdown.storage.clips)} clips`,
    playback: `${number(breakdown.playback.views)} views`,
    chat: `${number(breakdown.chat.messages)} messages · Realtime free tier`,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-hover">
        {total > 0 ? (
          parts
            .filter((part) => part.pct > 0)
            .map((part) => (
              <div
                key={part.key}
                className={part.color}
                style={{ width: `${part.pct}%` }}
                title={`${part.label}: ${part.pct.toFixed(1)}%`}
              />
            ))
        ) : (
          <div className="w-full bg-hover" />
        )}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {parts.map((part) => (
          <li
            key={part.key}
            className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2.5"
          >
            <div className="flex items-start gap-2.5">
              <span className={`mt-1 size-2.5 shrink-0 rounded-full ${part.color}`} />
              <div>
                <div className="text-sm text-ink">{part.label}</div>
                <div className="text-xs text-ink-faint">{detail[part.key]}</div>
              </div>
            </div>
            <div className="text-right">
              <ThbAmount value={part.cost} className="text-sm" />
              <div className="text-xs text-ink-faint">{part.pct.toFixed(0)}%</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
