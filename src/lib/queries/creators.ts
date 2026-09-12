import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { CREATORS_PAGE_SIZE } from '@/lib/constants'
import { getCreatorLeaderboard } from './overview'
import type { LeaderboardRow, LeaderboardSort } from './types'

export type CreatorFilters = {
  q?: string
  tier?: number
  risk?: 'at-risk' | 'healthy'
  sort?: LeaderboardSort
  order?: 'asc' | 'desc'
  page?: number
  showExcluded?: boolean
  month?: string
}

export type CreatorListResult = {
  rows: LeaderboardRow[]
  page: number
  pageCount: number
  total: number
}

/**
 * The leaderboard RPC does the money maths; search / tier / risk filtering and
 * paging happen here because they are presentation concerns and the creator
 * population is small (tens, not thousands). If that changes, push these
 * predicates down into the RPC.
 */
export async function listCreators(filters: CreatorFilters): Promise<CreatorListResult> {
  const all = await getCreatorLeaderboard(
    filters.sort ?? 'profit',
    1000,
    0,
    filters.month,
    filters.showExcluded ?? false,
  )

  let rows = all

  const q = filters.q?.trim().toLowerCase()
  if (q) {
    rows = rows.filter((r) =>
      [r.handle, r.display_name, r.creator_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }

  if (filters.tier) {
    rows = rows.filter((r) => r.tier === filters.tier)
  }

  if (filters.risk === 'at-risk') {
    rows = rows.filter((r) => Number(r.profit_thb) < 0)
  } else if (filters.risk === 'healthy') {
    rows = rows.filter((r) => Number(r.profit_thb) >= 0)
  }

  if (filters.order === 'asc') {
    rows = [...rows].reverse()
  }

  const total = rows.length
  const pageCount = Math.max(1, Math.ceil(total / CREATORS_PAGE_SIZE))
  const page = Math.min(Math.max(filters.page ?? 1, 1), pageCount)
  const start = (page - 1) * CREATORS_PAGE_SIZE

  return {
    rows: rows.slice(start, start + CREATORS_PAGE_SIZE),
    page,
    pageCount,
    total,
  }
}

export type CreatorProfile = {
  id: string
  handle: string | null
  displayName: string | null
  category: string | null
  bio: string | null
  kycStatus: string | null
  contentTier: string | null
  createdAt: string
  excludedFromAnalytics: boolean
  email: string | null
}

export async function getCreatorProfile(creatorId: string): Promise<CreatorProfile | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select(
      'id, handle, display_name, category, bio, kyc_status, content_tier, created_at, excluded_from_analytics, customers(email)',
    )
    .eq('id', creatorId)
    .maybeSingle()

  if (error) throw new Error(`getCreatorProfile failed: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    handle: data.handle,
    displayName: data.display_name,
    category: data.category,
    bio: data.bio,
    kycStatus: data.kyc_status,
    contentTier: data.content_tier,
    createdAt: data.created_at,
    excludedFromAnalytics: data.excluded_from_analytics,
    email: data.customers?.email ?? null,
  }
}

export type CreatorClip = {
  id: string
  title: string | null
  publishedAt: string | null
  sizeBytes: number
  views: number
  durationSeconds: number | null
  storageCostThb: number
}

/** Largest stored clips for one creator, used by the detail + storage pages. */
export async function getCreatorClips(creatorId: string, limit = 10): Promise<CreatorClip[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('feed_posts')
    .select('id, title, published_at, file_size_bytes, view_count, duration_seconds')
    .eq('creator_id', creatorId)
    .eq('video_status', 'ready')
    .order('file_size_bytes', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(`getCreatorClips failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    publishedAt: row.published_at,
    sizeBytes: Number(row.file_size_bytes ?? 0),
    views: Number(row.view_count ?? 0),
    durationSeconds: row.duration_seconds,
    storageCostThb: (Number(row.file_size_bytes ?? 0) / 1e9) * 0.5,
  }))
}

export type CreatorSession = {
  id: string
  title: string | null
  startedAt: string | null
  durationSeconds: number | null
  peakViewers: number | null
  costThb: number
  giftStars: number
}

export async function getCreatorSessions(
  creatorId: string,
  limit = 10,
): Promise<CreatorSession[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('live_sessions')
    .select(
      'id, title, started_at, duration_seconds, peak_viewer_count, estimated_cost_thb, gift_stars_total',
    )
    .eq('creator_id', creatorId)
    .order('started_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(`getCreatorSessions failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    startedAt: row.started_at,
    durationSeconds: row.duration_seconds,
    peakViewers: row.peak_viewer_count,
    costThb: Number(row.estimated_cost_thb ?? 0),
    giftStars: Number(row.gift_stars_total ?? 0),
  }))
}

export type ExcludedCreator = {
  id: string
  handle: string | null
  displayName: string | null
  email: string | null
}

export async function listExcludedCreators(): Promise<ExcludedCreator[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select('id, handle, display_name, customers(email)')
    .eq('excluded_from_analytics', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`listExcludedCreators failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    email: row.customers?.email ?? null,
  }))
}

export async function listAllCreatorsForSettings(): Promise<
  (ExcludedCreator & { excluded: boolean })[]
> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('creators')
    .select('id, handle, display_name, excluded_from_analytics, customers(email)')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`listAllCreatorsForSettings failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    email: row.customers?.email ?? null,
    excluded: row.excluded_from_analytics,
  }))
}
