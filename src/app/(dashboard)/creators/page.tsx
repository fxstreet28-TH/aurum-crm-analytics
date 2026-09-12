import { Suspense } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { listCreators } from '@/lib/queries/creators'
import { parseSort } from '@/lib/queries/types'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreatorFilters } from '@/components/dashboard/CreatorFilters'
import { Pagination } from '@/components/dashboard/Pagination'
import { CreatorName } from '@/components/shared/CreatorName'
import { TierBadge } from '@/components/shared/TierBadge'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { hours as fmtHours, number, percent } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{
    q?: string
    tier?: string
    risk?: string
    sort?: string
    order?: string
    page?: string
    show_excluded?: string
  }>
}

export default async function CreatorsPage({ searchParams }: Props) {
  const params = await searchParams

  const { rows, page, pageCount, total } = await listCreators({
    q: params.q,
    tier: params.tier ? Number(params.tier) : undefined,
    risk: params.risk === 'at-risk' || params.risk === 'healthy' ? params.risk : undefined,
    sort: parseSort(params.sort),
    order: params.order === 'asc' ? 'asc' : 'desc',
    page: params.page ? Number(params.page) : 1,
    showExcluded: params.show_excluded === 'true',
  })

  return (
    <div>
      <PageHeader
        title="Creators"
        description="Platform commission earned against the infra cost each creator causes this month."
      />

      <Suspense fallback={<div className="mb-4 h-9" />}>
        <CreatorFilters />
      </Suspense>

      <Card>
        {rows.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Stars</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Live hrs</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.creator_id}>
                    <TableCell>
                      <Link
                        href={`/creators/${row.creator_id}`}
                        className="hover:underline"
                      >
                        <CreatorName
                          handle={row.handle}
                          displayName={row.display_name}
                          creatorId={row.creator_id}
                          excluded={row.excluded_from_analytics}
                          size="sm"
                        />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={row.tier} showPct={row.tier_pct} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-ink-dim">
                      {number(row.stars)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-ink-dim">
                      {number(row.sessions_count)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-ink-dim">
                      {fmtHours(row.live_hours)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={row.platform_thb} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={row.total_cost_thb} className="text-warning" />
                    </TableCell>
                    <TableCell className="text-right">
                      <ThbAmount value={row.profit_thb} signed colored />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-ink-dim">
                      {row.margin_pct == null ? '—' : percent(row.margin_pct)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Suspense fallback={null}>
              <Pagination page={page} pageCount={pageCount} total={total} />
            </Suspense>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No creators match these filters"
            description="Test accounts are hidden by default — turn on “Show excluded” to include them."
          />
        )}
      </Card>
    </div>
  )
}
