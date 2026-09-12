'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ANY = 'any'

/** All filter state is URL state, so a filtered view is linkable and reloadable. */
export function CreatorFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)

  // Adjusting state during render (rather than in an effect) is React's
  // sanctioned way to re-sync local state when an external value changes —
  // here, the URL moving underneath us via back/forward or a cleared filter.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setQuery(urlQuery)
  }

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '' || value === ANY) params.delete(key)
      else params.set(key, value)
    }
    // Any filter change invalidates the current page offset.
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  // Debounce the search box so typing doesn't fire a request per keystroke.
  // The push is built inline rather than through update() so the effect has no
  // dependency on a function redefined every render.
  useEffect(() => {
    if (query === urlQuery) return

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) params.set('q', query)
      else params.delete('q')
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, urlQuery, pathname, router, searchParams])

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or handle…"
          aria-label="Search creators"
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tier-filter">Tier</Label>
        <Select
          value={searchParams.get('tier') ?? ANY}
          onValueChange={(v) => update({ tier: v })}
        >
          <SelectTrigger id="tier-filter" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All tiers</SelectItem>
            {[1, 2, 3, 4].map((tier) => (
              <SelectItem key={tier} value={String(tier)}>
                T{tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="risk-filter">Health</Label>
        <Select
          value={searchParams.get('risk') ?? ANY}
          onValueChange={(v) => update({ risk: v })}
        >
          <SelectTrigger id="risk-filter" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All</SelectItem>
            <SelectItem value="at-risk">At risk</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sort-filter">Sort by</Label>
        <Select
          value={searchParams.get('sort') ?? 'profit'}
          onValueChange={(v) => update({ sort: v })}
        >
          <SelectTrigger id="sort-filter" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="margin">Margin</SelectItem>
            <SelectItem value="hours">Live hours</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-xs text-ink-dim">
        <Switch
          checked={searchParams.get('show_excluded') === 'true'}
          onCheckedChange={(checked) =>
            update({ show_excluded: checked ? 'true' : null })
          }
          aria-label="Show excluded creators"
        />
        Show excluded
      </label>
    </div>
  )
}
