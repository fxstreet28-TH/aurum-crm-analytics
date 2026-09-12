'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = { page: number; pageCount: number; total: number }

export function Pagination({ page, pageCount, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(next))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (pageCount <= 1) {
    return (
      <p className="px-5 py-3 text-xs text-ink-faint">
        {total} creator{total === 1 ? '' : 's'}
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <p className="text-xs text-ink-faint">
        Page {page} of {pageCount} · {total} creators
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        >
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => go(page + 1)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
