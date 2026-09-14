import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Coins,
  Eye,
  Film,
  HardDrive,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import {
  getCreatorClips,
  getCreatorProfile,
  getCreatorSessions,
  getCreatorViewTrend,
} from '@/lib/queries/creators'
import { getCreatorCostBreakdown, getCreatorTier } from '@/lib/queries/overview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreatorAvatar } from '@/components/shared/CreatorAvatar'
import { TierBadge } from '@/components/shared/TierBadge'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { EmptyState } from '@/components/shared/EmptyState'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { CostBreakdownBar } from '@/components/dashboard/CostBreakdownBar'
import { ViewTrendChart } from '@/components/dashboard/ViewTrendChart'
import { ExclusionToggle } from '@/components/dashboard/ExclusionToggle'
import {
  date,
  dateTime,
  gigabytes,
  hours as fmtHours,
  number,
  thbAmount,
} from '@/lib/format'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ creatorId: string }> }

export default async function CreatorDetailPage({ params }: Props) {
  const { creatorId } = await params

  const profile = await getCreatorProfile(creatorId)
  if (!profile) notFound()

  const [tier, cost, clips, sessions, viewTrend] = await Promise.all([
    getCreatorTier(creatorId),
    getCreatorCostBreakdown(creatorId),
    getCreatorClips(creatorId, 10),
    getCreatorSessions(creatorId, 10),
    getCreatorViewTrend(creatorId, 30),
  ])

  // Days before the snapshot table shipped were never captured and plot as zero.
  const firstRecordedDay = viewTrend.points.find((point) => point.hasHistory)?.day ?? null

  const commission = Number(tier.platform_thb)
  const totalCost = Number(cost.total_cost_thb)
  const profit = commission - totalCost

  const tierProgress =
    tier.next_threshold && tier.next_threshold > 0
      ? Math.min((Number(tier.stars_this_month) / tier.next_threshold) * 100, 100)
      : 100

  const reclaimable = clips
    .filter((clip) => clip.views === 0)
    .reduce((sum, clip) => sum + clip.storageCostThb, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/creators">
            <ArrowLeft /> Back to creators
          </Link>
        </Button>

        {profile.excludedFromAnalytics && (
          <div className="mb-4 flex items-start gap-2.5 rounded-card border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-ink-dim">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              This creator is <strong className="text-ink">excluded from analytics</strong>.
              Their stars, sessions and purchases are left out of every platform KPI, chart
              and leaderboard. Tier and commission below read zero by design; the cost
              figures are still real.
            </p>
          </div>
        )}

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <CreatorAvatar
                handle={profile.handle}
                displayName={profile.displayName}
                size="lg"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">
                    {profile.displayName || profile.handle || `${profile.id.slice(0, 8)}…`}
                  </h2>
                  <TierBadge tier={tier.excluded ? null : tier.tier} showPct={tier.tier_pct} />
                  {profile.kycStatus && (
                    <Badge variant="outline">KYC {profile.kycStatus}</Badge>
                  )}
                  {profile.contentTier && (
                    <Badge variant="info">{profile.contentTier}</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {profile.handle ? `@${profile.handle} · ` : ''}
                  {profile.email ?? 'no email on file'} · joined {date(profile.createdAt)}
                </p>
                {profile.bio && (
                  <p className="mt-2 max-w-xl text-xs text-ink-dim">{profile.bio}</p>
                )}
              </div>
            </div>

            <ExclusionToggle
              creatorId={profile.id}
              excluded={profile.excludedFromAnalytics}
            />
          </div>
        </Card>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Stars this month"
          value={number(tier.stars_this_month)}
          hint={`Internal value ${thbAmount(tier.internal_value_thb)}`}
          icon={Coins}
        />
        <KpiCard
          label="Platform commission"
          value={thbAmount(commission)}
          hint={
            tier.excluded
              ? 'Excluded from analytics'
              : `Tier ${tier.tier} · ${(Number(tier.tier_pct) * 100).toFixed(0)}% of star value`
          }
          icon={Wallet}
          tone="accent"
        />
        <KpiCard
          label="Infra cost"
          value={thbAmount(totalCost)}
          hint={`${fmtHours(cost.live.hours)} live · ${gigabytes(cost.storage.gb_stored)} stored`}
          icon={HardDrive}
          tone="warning"
        />
        <KpiCard
          label="Profit"
          value={thbAmount(profit)}
          hint={profit >= 0 ? 'Commission covers cost' : 'Costs more than they earn'}
          icon={Clock}
          tone={profit >= 0 ? 'success' : 'danger'}
        />
      </section>

      {!tier.excluded && (
        <Card>
          <CardHeader>
            <CardTitle>Tier progress</CardTitle>
            <CardDescription>
              {tier.next_threshold
                ? `${number(tier.to_next_stars)} more stars to reach T${Number(tier.tier) + 1}`
                : 'Maximum tier reached'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={tierProgress} />
            <div className="mt-2 flex justify-between text-xs text-ink-faint">
              <span>{number(tier.stars_this_month)} stars</span>
              <span>{tier.next_threshold ? number(tier.next_threshold) : 'Max tier'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cost breakdown</CardTitle>
          <CardDescription>Where this creator&apos;s infra spend goes this month</CardDescription>
        </CardHeader>
        <CardContent>
          <CostBreakdownBar breakdown={cost} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Views trend</CardTitle>
          <CardDescription>
            Daily views across this creator&apos;s ready clips, last 30 days
          </CardDescription>
        </CardHeader>
        {viewTrend.capturedDays > 0 ? (
          <CardContent>
            <ViewTrendChart data={viewTrend.points} />
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-ink-faint">
              <span>
                {number(viewTrend.totalViews)} views over {viewTrend.capturedDays}{' '}
                recorded day{viewTrend.capturedDays === 1 ? '' : 's'}
              </span>
              {viewTrend.capturedDays < viewTrend.points.length && firstRecordedDay && (
                <span>
                  History starts {date(firstRecordedDay)} — earlier days were never
                  recorded, not watched zero times
                </span>
              )}
            </div>
          </CardContent>
        ) : (
          <EmptyState
            icon={Eye}
            title="No view history yet"
            description="The daily snapshot has not run for this creator's clips yet. The first row lands on the next nightly capture."
          />
        )}
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Largest stored clips</CardTitle>
            <CardDescription>
              Top {clips.length} by file size · {thbAmount(reclaimable)}/month reclaimable from
              never-viewed clips
            </CardDescription>
          </div>
        </CardHeader>
        {clips.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clip</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Storage / mo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clips.map((clip) => (
                <TableRow key={clip.id}>
                  <TableCell className="max-w-xs truncate">
                    {clip.title || <span className="text-ink-faint">Untitled</span>}
                  </TableCell>
                  <TableCell className="text-xs text-ink-faint">
                    {date(clip.publishedAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {gigabytes(clip.sizeBytes / 1e9)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {clip.views === 0 ? (
                      <Badge variant="warning">no views</Badge>
                    ) : (
                      number(clip.views)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ThbAmount value={clip.storageCostThb} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Film}
            title="No stored clips"
            description="This creator has no feed posts with a ready video."
          />
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent live sessions</CardTitle>
          <CardDescription>Most recent {sessions.length} broadcasts</CardDescription>
        </CardHeader>
        {sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Peak viewers</TableHead>
                <TableHead className="text-right">Gift stars</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="max-w-xs truncate">
                    {session.title || <span className="text-ink-faint">Untitled</span>}
                  </TableCell>
                  <TableCell className="text-xs text-ink-faint">
                    {dateTime(session.startedAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {session.durationSeconds
                      ? fmtHours(session.durationSeconds / 3600)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {number(session.peakViewers)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {number(session.giftStars)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ThbAmount value={session.costThb} className="text-warning" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Clock}
            title="No live sessions"
            description="This creator has not gone live yet."
          />
        )}
      </Card>
    </div>
  )
}
