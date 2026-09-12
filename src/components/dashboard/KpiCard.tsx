import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'accent'
  className?: string
}

const TONES = {
  default: 'text-ink',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  accent: 'text-accent-light',
}

export function KpiCard({ label, value, hint, icon: Icon, tone = 'default', className }: Props) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {label}
          </div>
          <div className={cn('mt-2 text-2xl font-semibold tabular-nums', TONES[tone])}>
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
        </div>
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hover">
            <Icon className="size-4 text-ink-dim" />
          </div>
        )}
      </div>
    </Card>
  )
}
