import Link from 'next/link'
import { Archive, Film, HardDrive, Eye } from 'lucide-react'
import { getStorageSummary } from '@/lib/queries/storage'
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
import { StorageByTierChart } from '@/components/dashboard/StorageByTierChart'
import { PageHeader } from '@/components/shared/PageHeader'
import { ThbAmount } from '@/components/shared/ThbAmount'
import { EmptyState } from '@/components/shared/EmptyState'
import { ExportCsvButton } from '@/components/shared/ExportCsvButton'
import { date, gigabytes, number, thbAmount } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function StoragePage() {
  const summary = await getStorageSummary()

  const reclaimable = summary.staleClips.reduce(
    (sum, clip) => sum + clip.storageCostThb,
    0,
  )

  const exportRows = summary.largestClips.map((clip) => ({
    clip_id: clip.id,
    creator: clip.displayName ?? clip.handle ?? '',
    title: clip.title ?? '',
    published_at: clip.publishedAt ?? '',
    size_gb: (clip.sizeBytes / 1e9).toFixed(3),
    views: clip.views,
    storage_thb_per_month: clip.storageCostThb.toFixed(2),
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Storage"
        description="Stored clips across creators in analytics scope, at ฿ 0.50 per GB per month."
        actions={<ExportCsvButton rows={exportRows} filename="aurum-storage.csv" />}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total stored"
          value={gigabytes(summary.totalGb)}
          hint={`${number(summary.clipCount)} ready clips`}
          icon={HardDrive}
        />
        <KpiCard
          label="Storage cost"
          value={thbAmount(summary.totalCostThb)}
          hint="Per month at current volume"
          icon={Archive}
          tone="warning"
        />
        <KpiCard
          label="Total views"
          value={number(summary.totalViews)}
          hint={`Playback ≈ ${thbAmount(summary.totalViews * 0.003)}`}
          icon={Eye}
        />
        <KpiCard
          label="Reclaimable"
          value={thbAmount(reclaimable)}
          hint={`${number(summary.staleClips.length)} stale clips, 90+ days unwatched`}
          icon={Film}
          tone={reclaimable > 0 ? 'danger' : 'success'}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Storage by content tier</CardTitle>
          <CardDescription>Bytes stored per creator content tier</CardDescription>
        </CardHeader>
        <div className="px-3 pb-5">
          <StorageByTierChart data={summary.byTier} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Largest clips</CardTitle>
          <CardDescription>Top {summary.largestClips.length} by file size</CardDescription>
        </CardHeader>
        {summary.largestClips.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clip</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">฿ / month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.largestClips.map((clip) => (
                <TableRow key={clip.id}>
                  <TableCell className="max-w-xs truncate">
                    {clip.title || <span className="text-ink-faint">Untitled</span>}
                  </TableCell>
                  <TableCell className="text-ink-dim">
                    {clip.creatorId ? (
                      <Link href={`/creators/${clip.creatorId}`} className="hover:underline">
                        {clip.displayName || clip.handle || '—'}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-ink-faint">
                    {date(clip.publishedAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {gigabytes(clip.sizeBytes / 1e9)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {number(clip.views)}
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
            description="No creator in analytics scope has a feed post with a ready video."
          />
        )}
      </Card>

      <Card className={summary.staleClips.length > 0 ? 'border-warning/40' : undefined}>
        <CardHeader>
          <CardTitle>Stale content</CardTitle>
          <CardDescription>
            Published 90+ days ago with zero recorded views. feed_posts keeps no per-day view
            history, so this is the strongest staleness signal available.
          </CardDescription>
        </CardHeader>
        {summary.staleClips.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clip</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-right">Age</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">฿ / month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.staleClips.map((clip) => (
                <TableRow key={clip.id}>
                  <TableCell className="max-w-xs truncate">
                    {clip.title || <span className="text-ink-faint">Untitled</span>}
                  </TableCell>
                  <TableCell className="text-ink-dim">
                    {clip.displayName || clip.handle || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="warning">{clip.staleDays}d</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-ink-dim">
                    {gigabytes(clip.sizeBytes / 1e9)}
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
            icon={Archive}
            title="No stale content"
            description="Every stored clip is either recent or has recorded views."
          />
        )}
      </Card>
    </div>
  )
}
