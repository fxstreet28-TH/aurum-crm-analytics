import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, className, children }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && <Icon className="size-6 text-ink-faint" />}
      <p className="text-sm font-medium text-ink-dim">{title}</p>
      {description && <p className="max-w-md text-xs text-ink-faint">{description}</p>}
      {children}
    </div>
  )
}
