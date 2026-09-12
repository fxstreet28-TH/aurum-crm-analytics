'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { setCreatorExcluded } from '@/lib/actions/creators'

type Props = {
  creatorId: string
  excluded: boolean
  label?: string
}

export function ExclusionToggle({ creatorId, excluded, label = 'Exclude from analytics' }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onChange(next: boolean) {
    startTransition(async () => {
      const result = await setCreatorExcluded(creatorId, next)
      if (result.ok) {
        toast.success(
          next ? 'Creator excluded from analytics' : 'Creator included in analytics',
        )
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <label className="flex items-center gap-2 text-xs text-ink-dim">
      <Switch
        checked={excluded}
        onCheckedChange={onChange}
        disabled={pending}
        aria-label={label}
      />
      {label}
    </label>
  )
}
