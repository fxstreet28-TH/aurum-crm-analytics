'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { BellOff, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreatorName } from '@/components/shared/CreatorName'
import { EmptyState } from '@/components/shared/EmptyState'
import { ExportCsvButton } from '@/components/shared/ExportCsvButton'
import { resolveAlertEvent } from '@/lib/actions/alerts'
import { dateTime } from '@/lib/format'
import type { AlertEvent } from '@/lib/queries/alerts'

type Props = { events: AlertEvent[]; status: string }

const SEVERITY_VARIANT = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
} as const

const STATUS_VARIANT = {
  active: 'danger',
  watch: 'warning',
  resolved: 'success',
} as const

const ALL = 'all'

export function AlertHistoryTable({ events, status }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === ALL) params.delete('status')
    else params.set('status', value)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function resolve(eventId: string) {
    startTransition(async () => {
      const result = await resolveAlertEvent(eventId)
      if (result.ok) {
        toast.success('Alert resolved')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const exportRows = events.map((e) => ({
    triggered_at: e.triggeredAt,
    rule: e.ruleName ?? '',
    creator: e.displayName ?? e.handle ?? '',
    severity: e.severity,
    status: e.status,
    resolved_at: e.resolvedAt ?? '',
    details: JSON.stringify(e.details),
  }))

  return (
    <Card className={pending ? 'opacity-70' : undefined}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Alert history</CardTitle>
          <CardDescription>Every event raised by your rules</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status || ALL} onValueChange={setStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="watch">Watch</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <ExportCsvButton rows={exportRows} filename="aurum-alert-events.csv" />
        </div>
      </CardHeader>

      {events.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Triggered</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-xs text-ink-faint">
                  {dateTime(event.triggeredAt)}
                </TableCell>
                <TableCell className="text-ink-dim">{event.ruleName ?? '—'}</TableCell>
                <TableCell>
                  {event.creatorId ? (
                    <Link href={`/creators/${event.creatorId}`} className="hover:underline">
                      <CreatorName
                        handle={event.handle}
                        displayName={event.displayName}
                        creatorId={event.creatorId}
                        size="sm"
                      />
                    </Link>
                  ) : (
                    <span className="text-ink-faint">Platform-wide</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      SEVERITY_VARIANT[event.severity as keyof typeof SEVERITY_VARIANT] ??
                      'default'
                    }
                  >
                    {event.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      STATUS_VARIANT[event.status as keyof typeof STATUS_VARIANT] ?? 'default'
                    }
                  >
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {event.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => resolve(event.id)}
                    >
                      <Check /> Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={BellOff}
          title="No alert events"
          description="Events land here once the scheduled rule evaluation job runs. That job ships in a follow-up change."
        />
      )}
    </Card>
  )
}
