'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ALERT_CHANNELS } from '@/lib/constants'
import { setAlertRuleChannels, setAlertRuleEnabled } from '@/lib/actions/alerts'
import { dateTime, number } from '@/lib/format'
import type { AlertRule } from '@/lib/queries/alerts'

type Props = { rule: AlertRule }

const SEVERITY_VARIANT = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
} as const

const CHANNEL_LABEL: Record<string, string> = {
  in_app: 'In-app',
  telegram: 'Telegram',
  email: 'Email',
}

export function AlertRuleCard({ rule }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function toggleEnabled(enabled: boolean) {
    startTransition(async () => {
      const result = await setAlertRuleEnabled(rule.id, enabled)
      if (result.ok) {
        toast.success(enabled ? 'Rule enabled' : 'Rule disabled')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function toggleChannel(channel: string) {
    const next = rule.channels.includes(channel)
      ? rule.channels.filter((c) => c !== channel)
      : [...rule.channels, channel]

    startTransition(async () => {
      const result = await setAlertRuleChannels(rule.id, next)
      if (result.ok) {
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const conditions = Object.entries(
    (rule.condition_json ?? {}) as Record<string, unknown>,
  )

  return (
    <Card className={cn('p-5', pending && 'opacity-70', !rule.enabled && 'opacity-60')}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{rule.name}</h3>
            <Badge
              variant={
                SEVERITY_VARIANT[rule.severity as keyof typeof SEVERITY_VARIANT] ?? 'default'
              }
            >
              {rule.severity}
            </Badge>
            <Badge variant="outline">per {rule.threshold_period}</Badge>
          </div>
          {rule.description && (
            <p className="mt-1 text-xs text-ink-dim">{rule.description}</p>
          )}
        </div>
        <Switch
          checked={rule.enabled}
          onCheckedChange={toggleEnabled}
          disabled={pending}
          aria-label={`${rule.enabled ? 'Disable' : 'Enable'} ${rule.name}`}
        />
      </div>

      {conditions.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-1.5">
          {conditions.map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-dim"
            >
              <dt className="inline text-ink-faint">{key}</dt>
              <dd className="inline"> = {String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wide text-ink-faint">
          Channels
        </span>
        {ALERT_CHANNELS.map((channel) => {
          const on = rule.channels.includes(channel)
          return (
            <button
              key={channel}
              type="button"
              onClick={() => toggleChannel(channel)}
              disabled={pending}
              aria-pressed={on}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] transition-colors',
                on
                  ? 'border-accent/40 bg-accent/15 text-accent-light'
                  : 'border-line bg-transparent text-ink-faint hover:text-ink-dim',
              )}
            >
              {CHANNEL_LABEL[channel] ?? channel}
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-line pt-3 text-[11px] text-ink-faint">
        Triggered {number(rule.triggered_count)}×
        {rule.last_triggered_at && ` · last ${dateTime(rule.last_triggered_at)}`}
      </div>
    </Card>
  )
}
