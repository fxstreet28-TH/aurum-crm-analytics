'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { resolveNav } from '@/lib/nav'
import { DateRangeSwitcher } from './DateRangeSwitcher'
import { UserMenu } from './UserMenu'

type Props = { email: string | null }

export function TopBar({ email }: Props) {
  const pathname = usePathname()
  const { title, subtitle } = resolveNav(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/60 px-6 backdrop-blur">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink">{title}</div>
        {subtitle && <div className="truncate text-xs text-ink-faint">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3">
        <Suspense fallback={null}>
          <DateRangeSwitcher />
        </Suspense>
        <UserMenu email={email} />
      </div>
    </header>
  )
}
