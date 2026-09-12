import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  CostBreakdown,
  CreatorTier,
  LeaderboardRow,
  LeaderboardSort,
  RevenueSummary,
  TrendPoint,
} from './types'

/**
 * Every RPC below enforces `creators.excluded_from_analytics = false` inside the
 * database, so no caller can accidentally let test accounts into the numbers.
 */

export async function getPlatformRevenueSummary(month?: string): Promise<RevenueSummary> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_platform_revenue_summary', {
    p_month: month,
  })
  if (error) throw new Error(`get_platform_revenue_summary failed: ${error.message}`)
  return data as unknown as RevenueSummary
}

export async function getCreatorTier(
  creatorId: string,
  month?: string,
): Promise<CreatorTier> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_creator_current_tier', {
    p_creator_id: creatorId,
    p_month: month,
  })
  if (error) throw new Error(`get_creator_current_tier failed: ${error.message}`)
  return data as unknown as CreatorTier
}

export async function getCreatorCostBreakdown(
  creatorId: string,
  month?: string,
): Promise<CostBreakdown> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_creator_cost_breakdown', {
    p_creator_id: creatorId,
    p_month: month,
  })
  if (error) throw new Error(`get_creator_cost_breakdown failed: ${error.message}`)
  return data as unknown as CostBreakdown
}

export async function getCreatorLeaderboard(
  sort: LeaderboardSort = 'profit',
  limit = 20,
  offset = 0,
  month?: string,
  includeExcluded = false,
): Promise<LeaderboardRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_creator_leaderboard', {
    p_sort: sort,
    p_limit: limit,
    p_offset: offset,
    p_month: month,
    p_include_excluded: includeExcluded,
  })
  if (error) throw new Error(`get_creator_leaderboard failed: ${error.message}`)
  return data ?? []
}

export async function getRevenueTrend(days = 30): Promise<TrendPoint[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_daily_revenue_trend', { p_days: days })
  if (error) throw new Error(`get_daily_revenue_trend failed: ${error.message}`)
  return data ?? []
}

export type AtRiskCreator = {
  eventId: string
  creatorId: string | null
  handle: string | null
  displayName: string | null
  severity: string
  status: string
  triggeredAt: string
  ruleName: string | null
  details: Record<string, unknown>
}

/** Active alert events, newest first, joined to the creator they fired for. */
export async function getAtRiskCreators(limit = 10): Promise<AtRiskCreator[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('alert_events')
    .select(
      'id, creator_id, severity, status, triggered_at, details_json, alert_rules(name), creators(handle, display_name)',
    )
    .eq('status', 'active')
    .order('triggered_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getAtRiskCreators failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    eventId: row.id,
    creatorId: row.creator_id,
    handle: row.creators?.handle ?? null,
    displayName: row.creators?.display_name ?? null,
    severity: row.severity,
    status: row.status,
    triggeredAt: row.triggered_at,
    ruleName: row.alert_rules?.name ?? null,
    details: (row.details_json ?? {}) as Record<string, unknown>,
  }))
}

export async function getActiveAlertCount(): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('alert_events')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
  if (error) throw new Error(`getActiveAlertCount failed: ${error.message}`)
  return count ?? 0
}
