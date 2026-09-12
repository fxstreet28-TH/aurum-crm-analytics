import { cn } from '@/lib/utils'
import { thbAmount, thbSigned } from '@/lib/format'

type Props = {
  value: number | string | null | undefined
  /** Prefix an explicit +/− sign — used for profit and delta figures. */
  signed?: boolean
  /** Colour green when positive and red when negative. */
  colored?: boolean
  className?: string
}

export function ThbAmount({ value, signed = false, colored = false, className }: Props) {
  const n = value === null || value === undefined ? null : Number(value)
  const tone =
    colored && n !== null
      ? n > 0
        ? 'text-success'
        : n < 0
          ? 'text-danger'
          : 'text-ink-dim'
      : undefined

  return (
    <span className={cn('tabular-nums', tone, className)}>
      {signed ? thbSigned(value) : thbAmount(value)}
    </span>
  )
}
