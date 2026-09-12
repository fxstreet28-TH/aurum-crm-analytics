'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ALERT_CHANNELS, ALERT_PERIODS, ALERT_SEVERITIES } from '@/lib/constants'
import { createAlertRule } from '@/lib/actions/alerts'

const CHANNEL_LABEL: Record<string, string> = {
  in_app: 'In-app',
  telegram: 'Telegram',
  email: 'Email',
}

export function NewRuleDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('{"cost_gt_thb": 1000}')
  const [period, setPeriod] = useState<string>('day')
  const [severity, setSeverity] = useState<string>('warning')
  const [channels, setChannels] = useState<string[]>(['in_app'])

  function toggleChannel(channel: string) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel],
    )
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await createAlertRule({
        name,
        description,
        conditionJson: condition,
        thresholdPeriod: period,
        severity,
        channels,
      })
      if (result.ok) {
        toast.success('Alert rule created')
        setOpen(false)
        setName('')
        setDescription('')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New rule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New alert rule</DialogTitle>
          <DialogDescription>
            Rules are stored now and evaluated by the scheduled job shipping in a follow-up
            change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-name">Name</Label>
            <Input
              id="rule-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Storage over budget"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-description">Description</Label>
            <Input
              id="rule-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this rule watches for"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-condition">Condition (JSON)</Label>
            <Input
              id="rule-condition"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule-period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="rule-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule-severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="rule-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALERT_CHANNELS.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  aria-pressed={channels.includes(channel)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition-colors',
                    channels.includes(channel)
                      ? 'border-accent/40 bg-accent/15 text-accent-light'
                      : 'border-line text-ink-faint hover:text-ink-dim',
                  )}
                >
                  {CHANNEL_LABEL[channel]}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
