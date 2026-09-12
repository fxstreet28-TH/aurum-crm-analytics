import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { COST_RATES } from '@/lib/constants'

export type StorageClip = {
  id: string
  creatorId: string | null
  handle: string | null
  displayName: string | null
  title: string | null
  publishedAt: string | null
  sizeBytes: number
  views: number
  storageCostThb: number
  /** Days since publication with no recorded views — drives the stale report. */
  staleDays: number | null
}

export type StorageSummary = {
  totalGb: number
  totalCostThb: number
  clipCount: number
  totalViews: number
  byTier: { tier: string; gb: number; costThb: number; clips: number }[]
  staleClips: StorageClip[]
  largestClips: StorageClip[]
}

const STALE_AFTER_DAYS = 90

/**
 * Global storage picture across non-excluded creators only.
 *
 * feed_posts has no per-day view history, so "stale" means published more than
 * 90 days ago with zero recorded views — the strongest signal available.
 */
export async function getStorageSummary(includeExcluded = false): Promise<StorageSummary> {
  const supabase = createAdminClient()

  const { data: creators, error: creatorError } = await supabase
    .from('creators')
    .select('id, handle, display_name, content_tier, excluded_from_analytics')
  if (creatorError) throw new Error(`getStorageSummary creators failed: ${creatorError.message}`)

  const included = (creators ?? []).filter(
    (c) => includeExcluded || !c.excluded_from_analytics,
  )
  const creatorById = new Map(included.map((c) => [c.id, c]))

  if (included.length === 0) {
    return {
      totalGb: 0,
      totalCostThb: 0,
      clipCount: 0,
      totalViews: 0,
      byTier: [],
      staleClips: [],
      largestClips: [],
    }
  }

  const { data: posts, error: postError } = await supabase
    .from('feed_posts')
    .select('id, creator_id, title, published_at, file_size_bytes, view_count')
    .eq('video_status', 'ready')
    .in('creator_id', Array.from(creatorById.keys()))
  if (postError) throw new Error(`getStorageSummary feed_posts failed: ${postError.message}`)

  const now = Date.now()

  const clips: StorageClip[] = (posts ?? []).map((row) => {
    const creator = row.creator_id ? creatorById.get(row.creator_id) : undefined
    const sizeBytes = Number(row.file_size_bytes ?? 0)
    const views = Number(row.view_count ?? 0)
    const publishedMs = row.published_at ? new Date(row.published_at).getTime() : null
    const ageDays =
      publishedMs === null ? null : Math.floor((now - publishedMs) / 86_400_000)

    return {
      id: row.id,
      creatorId: row.creator_id,
      handle: creator?.handle ?? null,
      displayName: creator?.display_name ?? null,
      title: row.title,
      publishedAt: row.published_at,
      sizeBytes,
      views,
      storageCostThb: (sizeBytes / 1e9) * COST_RATES.storageThbPerGbMonth,
      staleDays: ageDays !== null && ageDays >= STALE_AFTER_DAYS && views === 0 ? ageDays : null,
    }
  })

  const totalBytes = clips.reduce((sum, c) => sum + c.sizeBytes, 0)
  const totalGb = totalBytes / 1e9

  const tierBuckets = new Map<string, { bytes: number; clips: number }>()
  for (const clip of clips) {
    const creator = clip.creatorId ? creatorById.get(clip.creatorId) : undefined
    const tier = creator?.content_tier ?? 'unassigned'
    const bucket = tierBuckets.get(tier) ?? { bytes: 0, clips: 0 }
    bucket.bytes += clip.sizeBytes
    bucket.clips += 1
    tierBuckets.set(tier, bucket)
  }

  return {
    totalGb,
    totalCostThb: totalGb * COST_RATES.storageThbPerGbMonth,
    clipCount: clips.length,
    totalViews: clips.reduce((sum, c) => sum + c.views, 0),
    byTier: Array.from(tierBuckets.entries())
      .map(([tier, b]) => ({
        tier,
        gb: b.bytes / 1e9,
        costThb: (b.bytes / 1e9) * COST_RATES.storageThbPerGbMonth,
        clips: b.clips,
      }))
      .sort((a, b) => b.gb - a.gb),
    staleClips: clips
      .filter((c) => c.staleDays !== null)
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 50),
    largestClips: [...clips].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 20),
  }
}
