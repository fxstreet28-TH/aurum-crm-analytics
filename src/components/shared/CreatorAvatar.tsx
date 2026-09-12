import { cn } from '@/lib/utils'

type Props = {
  handle?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-xs',
  lg: 'size-14 text-lg',
}

/**
 * Creators have no avatar column yet, so initials on a deterministic gradient
 * stand in — same creator always gets the same hue.
 */
export function CreatorAvatar({ handle, displayName, size = 'md', className }: Props) {
  const label = displayName || handle || '—'
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const hue = hashHue(handle || displayName || 'aurum')

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        SIZES[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 42%))`,
      }}
    >
      {initials || '—'}
    </span>
  )
}

function hashHue(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 360
}
