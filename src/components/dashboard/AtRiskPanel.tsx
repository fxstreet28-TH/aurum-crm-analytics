import Link from 'next/link'
import { ShieldCheck, TriangleAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { dateTime } from '@/lib/format'
import type { AtRiskCreator } from '@/lib/queries/overview'

type Props = { events: AtRiskCreator[] }

const SEVERITY_VARIANT = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
} as const

export function AtRiskPanel({ events }: Props) {
  const hasEvents = events.length > 0

  return (
    <Card className={hasEvents ? 'border-danger/40' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasEvents ? (
            <TriangleAlert className="size-4 text-danger" />
          ) : (
            <ShieldCheck className="size-4 text-success" />
          )}
          At-risk creators
        </CardTitle>
        <CardDescription>
          Active alert events raised by your alert rules
        </CardDescription>
      </CardHeader>

      {hasEvents ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Triggered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.eventId}>
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
                <TableCell className="text-ink-dim">{event.ruleName ?? '—'}</TableCell>
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
                <TableCell className="text-xs text-ink-faint">
                  {dateTime(event.triggeredAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No active alerts"
          description="Alert events appear here once the rule evaluation job starts writing to alert_events. Rules are configured on the Alert Rules page."
        />
      )}
    </Card>
  )
}
