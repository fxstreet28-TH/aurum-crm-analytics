import { Info } from 'lucide-react'

type Props = { excludedCount: number }

/**
 * Standing explanation for why the numbers can read ฿ 0: every analytics figure
 * is computed with excluded (test) creators filtered out at the database level.
 */
export function ExclusionNotice({ excludedCount }: Props) {
  if (excludedCount === 0) return null

  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-card border border-info/30 bg-info/10 px-4 py-3 text-xs text-ink-dim">
      <Info className="mt-0.5 size-4 shrink-0 text-info" />
      <p>
        {excludedCount} creator{excludedCount === 1 ? ' is' : 's are'} excluded from analytics,
        so their stars, sessions and purchases are left out of every figure on this dashboard.{' '}
        <a href="/settings" className="text-accent-light underline-offset-2 hover:underline">
          Manage the exclusion list
        </a>
        .
      </p>
    </div>
  )
}
