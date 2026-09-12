'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { CreatorName } from '@/components/shared/CreatorName'
import { TierBadge } from '@/components/shared/TierBadge'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { hours as fmtHours, number, percent } from '@/lib/format'
import { LEADERBOARD_SORTS, type LeaderboardRow, type LeaderboardSort } from '@/lib/queries/types'

type Props = { rows: LeaderboardRow[]; sort: LeaderboardSort }

const SORT_LABEL: Record<LeaderboardSort, string> = {
  profit: 'Profit',
  margin: 'Margin',
  hours: 'Live hours',
  stars: 'Stars',
}

export function CreatorLeaderboard({ rows, sort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <Card className={pending ? 'opacity-70' : undefined}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Creator leaderboard</CardTitle>
          <CardDescription>Platform commission earned against infra cost caused</CardDescription>
        </div>
        <Tabs value={sort} onValueChange={setSort}>
          <TabsList>
            {LEADERBOARD_SORTS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {SORT_LABEL[value]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Stars</TableHead>
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
                  <Link href={`/creators/${row.creator_id}`} className="hover:underline">
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
      ) : (
        <EmptyState
          icon={Users}
          title="No creators in scope"
          description="Every creator is either excluded from analytics or has no activity this month."
        />
      )}
    </Card>
  )
}
