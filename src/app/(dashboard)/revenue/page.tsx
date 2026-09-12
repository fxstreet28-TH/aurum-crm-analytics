import { Coins, Sparkles, TrendingUp, Users } from 'lucide-react'
import { getCreatorLeaderboard, getPlatformRevenueSummary } from '@/lib/queries/overview'
import {
  getActivePricingConfig,
  getStarPurchaseSlotPerformance,
} from '@/lib/queries/revenue'
import { parseSort } from '@/lib/queries/types'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PricingConfigDialog } from '@/components/dashboard/PricingConfigDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { CreatorName } from '@/components/shared/CreatorName'
import { TierBadge } from '@/components/shared/TierBadge'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { EmptyState } from '@/components/shared/EmptyState'
import { monthLabel, number, thbAmount } from '@/lib/format'
import { TIERS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ sort?: string }> }

export default async function RevenuePage({ searchParams }: Props) {
  const { sort: sortParam } = await searchParams
  const sort = parseSort(sortParam)

  const [summary, slots, creators, pricing] = await Promise.all([
    getPlatformRevenueSummary(),
    getStarPurchaseSlotPerformance(),
    getCreatorLeaderboard(sort === 'profit' ? 'stars' : sort, 1000),
    getActivePricingConfig(),
  ])

  // The "POPULAR" ribbon follows real order volume rather than a hardcoded slot.
  const topSlotStars = slots.reduce<number | null>(
    (top, slot) =>
      top === null ||
      Number(slot.orders_count) >
        Number(slots.find((s) => s.stars_per_slot === top)?.orders_count ?? 0)
        ? Number(slot.stars_per_slot)
        : top,
    null,
  )

  const commissionTotal = creators.reduce((sum, c) => sum + Number(c.platform_thb), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Revenue & Tier"
        description={`Star markup profit and creator tier commission for ${monthLabel(summary.month)}.`}
        actions={<PricingConfigDialog config={pricing} />}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          label="Star markup"
          value={thbAmount(summary.star_markup_thb)}
          hint={`${number(summary.stars_sold)} stars across ${number(summary.orders_count)} paid orders`}
          icon={Sparkles}
          tone="accent"
        />
        <KpiCard
          label="Tier commission"
          value={thbAmount(summary.tier_commission_thb)}
          hint={`Creators keep ${thbAmount(summary.creator_payout_thb)}`}
          icon={Users}
        />
        <KpiCard
          label="Total platform revenue"
          value={thbAmount(summary.total_revenue_thb)}
          hint="Markup + commission, excluded creators removed"
          icon={TrendingUp}
          tone="success"
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">Star purchase slots</h2>
        {slots.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot) => (
              <Card key={slot.stars_per_slot} className="relative overflow-hidden p-5">
                {Number(slot.stars_per_slot) === topSlotStars && (
                  <span className="absolute right-0 top-0 rounded-bl-lg bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
                <div className="text-xs uppercase tracking-wide text-ink-faint">
                  {slot.slot_label}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-ink">
                    {number(slot.stars_per_slot)}
                  </span>
                  <span className="text-xs text-ink-faint">stars</span>
                </div>
                <dl className="mt-4 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Retail</dt>
                    <dd>
                      <ThbAmount value={slot.retail_thb} />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Internal</dt>
                    <dd>
                      <ThbAmount value={slot.internal_thb} className="text-ink-dim" />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Markup / order</dt>
                    <dd>
                      <ThbAmount value={slot.markup_per_order} className="text-success" />
                    </dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-line pt-2">
                    <dt className="text-ink-faint">
                      {number(slot.orders_count)} order
                      {Number(slot.orders_count) === 1 ? '' : 's'}
                    </dt>
                    <dd className="font-medium">
                      <ThbAmount value={slot.total_profit_thb} className="text-success" />
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={Coins}
              title="No paid star purchases this month"
              description="Slots appear once non-excluded customers buy stars. Admin-credited grants are not counted as sales."
            />
          </Card>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Creator tier commission</CardTitle>
          <CardDescription>
            Sums to {thbAmount(commissionTotal)} — the “Tier commission” KPI above. Excluded
            creators never appear here.
          </CardDescription>
        </CardHeader>

        {creators.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="w-56">Progress to next tier</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead className="text-right">Star value</TableHead>
                <TableHead className="text-right">Platform</TableHead>
                <TableHead className="text-right">Creator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map((row) => {
                const tierDef = TIERS.find((t) => t.tier === Number(row.tier))
                const next = TIERS.find((t) => t.tier === Number(row.tier) + 1)
                const stars = Number(row.stars)
                const starValue = Number(row.platform_thb) + Number(row.creator_thb)
                const progress = next
                  ? Math.min((stars / next.min) * 100, 100)
                  : 100

                return (
                  <TableRow key={row.creator_id}>
                    <TableCell>
                      <CreatorName
                        handle={row.handle}
                        displayName={row.display_name}
                        creatorId={row.creator_id}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={row.tier} showPct={row.tier_pct} />
                    </TableCell>
                    <TableCell>
                      {next ? (
                        <div>
                          <Progress value={progress} />
                          <div className="mt-1 text-[11px] text-ink-faint">
                            {number(Math.max(next.min - stars, 0))} stars to {next.label}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="success">Max tier</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-ink-dim">
                      {number(stars)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={starValue} className="text-ink-dim" />
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={row.platform_thb} className="text-accent-light" />
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={row.creator_thb} className="text-ink-dim" />
                      {tierDef && (
                        <div className="text-[11px] text-ink-faint">
                          {((1 - tierDef.platformPct) * 100).toFixed(0)}% share
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Users}
            title="No creators in analytics scope"
            description="Every creator is currently excluded from analytics."
          />
        )}
      </Card>
    </div>
  )
}
