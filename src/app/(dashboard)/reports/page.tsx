import { getReportsData } from '@/lib/queries/reports'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CostCategoryChart,
  RevenueVsCostChart,
  TierDistributionChart,
} from '@/components/dashboard/ReportCharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { ExportCsvButton } from '@/components/shared/ExportCsvButton'
import { monthLabel, number } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const { weekly, categories, tiers, monthly } = await getReportsData()

  const exportRows = monthly.map(({ month, summary }) => ({
    month,
    star_markup_thb: summary.star_markup_thb,
    tier_commission_thb: summary.tier_commission_thb,
    total_revenue_thb: summary.total_revenue_thb,
    infra_cost_thb: summary.infra_cost_thb,
    net_profit_thb: summary.net_profit_thb,
    stars_sold: summary.stars_sold,
    gift_stars: summary.gift_stars,
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Revenue against cost, where the money goes, and how months compare."
        actions={
          <ExportCsvButton rows={exportRows} filename="aurum-monthly-report.csv" />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs cost — weekly</CardTitle>
          <CardDescription>Last 6 weeks, Bangkok days</CardDescription>
        </CardHeader>
        <div className="px-3 pb-5">
          <RevenueVsCostChart data={weekly} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost by category</CardTitle>
            <CardDescription>This month, excluded creators removed</CardDescription>
          </CardHeader>
          <div className="px-3 pb-5">
            <CostCategoryChart data={categories} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier distribution</CardTitle>
            <CardDescription>Creators per tier this month</CardDescription>
          </CardHeader>
          <div className="px-3 pb-5">
            <TierDistributionChart data={tiers} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month-on-month</CardTitle>
          <CardDescription>Last 6 Bangkok calendar months</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Markup</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Infra cost</TableHead>
              <TableHead className="text-right">Net profit</TableHead>
              <TableHead className="text-right">Stars sold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthly.map(({ month, summary }) => (
              <TableRow key={month}>
                <TableCell className="font-medium">{monthLabel(month)}</TableCell>
                <TableCell className="text-right">
                  <ThbAmount value={summary.star_markup_thb} />
                </TableCell>
                <TableCell className="text-right">
                  <ThbAmount value={summary.tier_commission_thb} />
                </TableCell>
                <TableCell className="text-right">
                  <ThbAmount value={summary.total_revenue_thb} className="text-accent-light" />
                </TableCell>
                <TableCell className="text-right">
                  <ThbAmount value={summary.infra_cost_thb} className="text-warning" />
                </TableCell>
                <TableCell className="text-right">
                  <ThbAmount value={summary.net_profit_thb} signed colored />
                </TableCell>
                <TableCell className="text-right tabular-nums text-ink-dim">
                  {number(summary.stars_sold)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
