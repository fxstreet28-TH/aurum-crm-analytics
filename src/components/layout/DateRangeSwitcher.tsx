'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
] as const

/**
 * Range lives in the URL (`?range=this_month`) so it survives reload and can be
 * shared, rather than in component state as the mockup did.
 */
export function DateRangeSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const current = searchParams.get('range') ?? 'this_month'

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', value)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5',
        pending && 'opacity-70',
      )}
    >
      {RANGES.map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => select(range.value)}
          aria-pressed={current === range.value}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            current === range.value
              ? 'bg-accent text-white'
              : 'text-ink-dim hover:bg-hover hover:text-ink',
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
