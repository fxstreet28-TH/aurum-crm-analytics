import { Badge } from '@/components/ui/badge'

const TIER_VARIANT = {
  1: 'default',
  2: 'info',
  3: 'accent',
  4: 'success',
} as const

type Props = { tier: number | null | undefined; showPct?: number | null }

export function TierBadge({ tier, showPct }: Props) {
  if (!tier) {
    return <Badge variant="outline">excluded</Badge>
  }

  const variant = TIER_VARIANT[tier as keyof typeof TIER_VARIANT] ?? 'default'

  return (
    <Badge variant={variant}>
      T{tier}
      {showPct != null && (
        <span className="opacity-70">· {(Number(showPct) * 100).toFixed(0)}%</span>
      )}
    </Badge>
  )
}
