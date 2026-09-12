import { Coins, ShoppingCart } from 'lucide-react'
import { getPlatformRevenueSummary } from '@/lib/queries/overview'
import { getStarPurchaseSlotPerformance, listStarPurchases } from '@/lib/queries/revenue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { EmptyState } from '@/components/shared/EmptyState'
import { ExportCsvButton } from '@/components/shared/ExportCsvButton'
import { dateTime, number, thbAmount } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ show_excluded?: string }> }

export default async function PurchasesPage({ searchParams }: Props) {
  const { show_excluded } = await searchParams
  const includeExcluded = show_excluded === 'true'

  const [summary, slots, purchases] = await Promise.all([
    getPlatformRevenueSummary(),
    getStarPurchaseSlotPerformance(),
    listStarPurchases(200, includeExcluded),
  ])

  const exportRows = purchases.map((p) => ({
    completed_at: p.completedAt ?? '',
    buyer_email: p.buyerEmail ?? '',
    stars: p.starsAmount,
    thb_paid: p.thbAmount,
    retail_per_star: p.retailThbPerStar,
    payment_method: p.paymentMethod ?? '',
    excluded_from_analytics: p.excluded,
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Star Purchases"
        description="Completed star orders. Admin-credited grants (฿ 0) are recorded but never counted as revenue."
        actions={
          <ExportCsvButton rows={exportRows} filename="aurum-star-purchases.csv" />
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Gross star sales"
          value={thbAmount(summary.star_gross_thb)}
          hint={`${number(summary.orders_count)} paid orders this month`}
          icon={ShoppingCart}
        />
        <KpiCard
          label="Markup profit"
          value={thbAmount(summary.star_markup_thb)}
          hint="Retail paid minus internal star value"
          icon={Coins}
          tone="success"
        />
        <KpiCard
          label="Stars sold"
          value={number(summary.stars_sold)}
          hint={`Across ${slots.length} slot size${slots.length === 1 ? '' : 's'}`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent purchases</CardTitle>
          <CardDescription>
            {includeExcluded
              ? 'Including purchases by excluded test accounts.'
              : 'Purchases by excluded test accounts are hidden.'}
          </CardDescription>
        </CardHeader>

        {purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Completed</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">฿ / star</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="text-xs text-ink-faint">
                    {dateTime(purchase.completedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-ink-dim">
                        {purchase.buyerEmail ?? '—'}
                      </span>
                      {purchase.excluded && <Badge variant="outline">excluded</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {number(purchase.starsAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.thbAmount > 0 ? (
                      <ThbAmount value={purchase.thbAmount} />
                    ) : (
                      <Badge variant="outline">admin credit</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {purchase.retailThbPerStar > 0
                      ? thbAmount(purchase.retailThbPerStar)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-ink-faint">
                    {purchase.paymentMethod ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No purchases to show"
            description="No completed star purchases from non-excluded accounts yet."
          />
        )}
      </Card>
    </div>
  )
}
