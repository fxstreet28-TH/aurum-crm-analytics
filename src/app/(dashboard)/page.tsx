import { Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import {
  getAtRiskCreators,
  getCreatorLeaderboard,
  getPlatformRevenueSummary,
  getRevenueTrend,
} from '@/lib/queries/overview'
import { listExcludedCreators } from '@/lib/queries/creators'
import { parseSort } from '@/lib/queries/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { AtRiskPanel } from '@/components/dashboard/AtRiskPanel'
import { CreatorLeaderboard } from '@/components/dashboard/CreatorLeaderboard'
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart'
import { ExclusionNotice } from '@/components/dashboard/ExclusionNotice'
import { thbAmount, number, monthLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ sort?: string }> }

export default async function OverviewPage({ searchParams }: Props) {
  const { sort: sortParam } = await searchParams
  const sort = parseSort(sortParam)

  const [summary, atRisk, trend, leaderboard, excluded] = await Promise.all([
    getPlatformRevenueSummary(),
    getAtRiskCreators(),
    getRevenueTrend(30),
    getCreatorLeaderboard(sort, 5),
    listExcludedCreators(),
  ])

  const profitable = Number(summary.net_profit_thb) >= 0

  return (
    <div className="flex flex-col gap-6">
      <ExclusionNotice excludedCount={excluded.length} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={thbAmount(summary.total_revenue_thb)}
          hint={`Markup ${thbAmount(summary.star_markup_thb)} + commission ${thbAmount(summary.tier_commission_thb)}`}
          icon={TrendingUp}
          tone="accent"
        />
        <KpiCard
          label="Infra cost"
          value={thbAmount(summary.infra_cost_thb)}
          hint={`Platform budget for ${monthLabel(summary.month)}`}
          icon={TrendingDown}
          tone="warning"
        />
        <KpiCard
          label="Net profit"
          value={thbAmount(summary.net_profit_thb)}
          hint={profitable ? 'Revenue covers infra spend' : 'Infra spend exceeds revenue'}
          icon={Wallet}
          tone={profitable ? 'success' : 'danger'}
        />
        <KpiCard
          label="Stars"
          value={number(summary.gift_stars)}
          hint={`${number(summary.stars_sold)} sold across ${number(summary.orders_count)} orders`}
          icon={Coins}
        />
      </section>

      <AtRiskPanel events={atRisk} />

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs cost — last 30 days</CardTitle>
          <CardDescription>
            Daily platform revenue against infra cost, Bangkok days
          </CardDescription>
        </CardHeader>
        <div className="px-3 pb-5">
          <RevenueTrendChart data={trend} />
        </div>
      </Card>

      <CreatorLeaderboard rows={leaderboard} sort={sort} />
    </div>
  )
}
