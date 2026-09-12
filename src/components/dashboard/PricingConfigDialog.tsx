'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePricingConfig } from '@/lib/actions/pricing'
import type { PricingConfig } from '@/lib/queries/revenue'
import { thbAmount } from '@/lib/format'

type Props = { config: PricingConfig | null }

export function PricingConfigDialog({ config }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [retail, setRetail] = useState(String(config?.retailThbPerStar ?? 11))
  const [internal, setInternal] = useState(String(config?.internalThbPerStar ?? 10))
  const [label, setLabel] = useState(config?.label ?? 'launch_regular')
  const [notes, setNotes] = useState('')

  const markup = Number(retail) - Number(internal)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updatePricingConfig({
        retailThbPerStar: Number(retail),
        internalThbPerStar: Number(internal),
        label,
        notes,
      })
      if (result.ok) {
        toast.success('Star pricing updated')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 /> Edit pricing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Star pricing</DialogTitle>
          <DialogDescription>
            Saving supersedes the current row rather than editing it, so past months keep
            the prices they were actually sold at.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="retail">Retail ฿ / star</Label>
              <Input
                id="retail"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={retail}
                onChange={(e) => setRetail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="internal">Internal ฿ / star</Label>
              <Input
                id="internal"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={internal}
                onChange={(e) => setInternal(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="launch_regular"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this change?"
            />
          </div>

          <p
            className={
              markup >= 0
                ? 'rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-dim'
                : 'rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger'
            }
          >
            {markup >= 0
              ? `Markup ${thbAmount(markup)} per star — ${thbAmount(markup * 100)} profit per 100 stars sold.`
              : 'Retail is below internal value — stars would sell at a loss.'}
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || markup < 0}>
              {pending ? 'Saving…' : 'Save pricing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
