import { CreatorAvatar } from './CreatorAvatar'
import { Badge } from '@/components/ui/badge'

type Props = {
  handle: string | null
  displayName: string | null
  creatorId?: string
  excluded?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/** Creator identity cell. Falls back to a short id when the profile is blank. */
export function CreatorName({ handle, displayName, creatorId, excluded, size = 'md' }: Props) {
  const primary = displayName || handle || (creatorId ? `${creatorId.slice(0, 8)}…` : 'Unknown')
  const secondary = displayName && handle ? `@${handle}` : null

  return (
    <div className="flex items-center gap-2.5">
      <CreatorAvatar handle={handle} displayName={displayName} size={size} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-ink">{primary}</span>
          {excluded && <Badge variant="outline">excluded</Badge>}
        </div>
        {secondary && <div className="truncate text-xs text-ink-faint">{secondary}</div>}
      </div>
    </div>
  )
}
