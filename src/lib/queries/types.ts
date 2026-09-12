import type { Database } from '@/lib/types/database'

type Fn = Database['public']['Functions']

/** Shapes of the jsonb-returning RPCs, which the generated types widen to `Json`. */
export type RevenueSummary = {
  month: string
  star_markup_thb: number
  star_gross_thb: number
  stars_sold: number
  orders_count: number
  gift_stars: number
  tier_commission_thb: number
  creator_payout_thb: number
  total_revenue_thb: number
  infra_cost_thb: number
  net_profit_thb: number
}

export type CreatorTier = {
  month: string
  tier: number
  stars_this_month: number
  internal_value_thb: number
  tier_pct: number
  platform_thb: number
  creator_thb: number
  next_threshold: number | null
  to_next_stars: number
  excluded: boolean
}

export type CostCategory = { cost_thb: number }

export type CostBreakdown = {
  month: string
  live: CostCategory & { hours: number; viewer_hours: number; sessions: number }
  storage: CostCategory & { gb_stored: number; clips: number }
  playback: CostCategory & { views: number }
  chat: CostCategory & { messages: number }
  total_cost_thb: number
}

export type LeaderboardRow = Fn['get_creator_leaderboard']['Returns'][number]
export type SlotPerformanceRow = Fn['get_star_purchase_slot_performance']['Returns'][number]
export type TrendPoint = Fn['get_daily_revenue_trend']['Returns'][number]

export type LeaderboardSort = 'profit' | 'margin' | 'hours' | 'stars'

export const LEADERBOARD_SORTS: LeaderboardSort[] = ['profit', 'margin', 'hours', 'stars']

export function parseSort(value: string | undefined): LeaderboardSort {
  return LEADERBOARD_SORTS.includes(value as LeaderboardSort)
    ? (value as LeaderboardSort)
    : 'profit'
}
