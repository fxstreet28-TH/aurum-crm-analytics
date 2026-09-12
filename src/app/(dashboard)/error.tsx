'use client'

import { useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaced in Vercel runtime logs; the UI keeps the detail generic.
    console.error(error)
  }, [error])

  return (
    <Card className="mx-auto mt-12 max-w-lg p-8 text-center">
      <TriangleAlert className="mx-auto size-6 text-danger" />
      <h2 className="mt-3 text-base font-semibold text-ink">Could not load this page</h2>
      <p className="mt-2 text-sm text-ink-dim">
        {error.message || 'An unexpected error occurred while querying Supabase.'}
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-ink-faint">Reference: {error.digest}</p>
      )}
      <Button onClick={reset} className="mt-5">
        Try again
      </Button>
    </Card>
  )
}
