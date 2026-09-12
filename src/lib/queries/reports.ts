import 'server-only'

import { currentBangkokMonth, shiftMonth } from '@/lib/format'
import { getCreatorLeaderboard, getPlatformRevenueSummary, getRevenueTrend } from './overview'
import type { LeaderboardRow, RevenueSummary, TrendPoint } from './types'

export type WeeklyBucket = {
  label: string
  revenueThb: number
  costThb: number
  profitThb: number
}

/** Folds the daily trend into ISO-ish weekly buckets for the stacked bar chart. */
export function toWeeklyBuckets(trend: TrendPoint[], weeks = 6): WeeklyBucket[] {
  const buckets: WeeklyBucket[] = []

  for (let i = trend.length; i > 0; i -= 7) {
    const slice = trend.slice(Math.max(i - 7, 0), i)
    if (slice.length === 0) continue
    buckets.unshift({
      label: `${slice[0].day.slice(5)} – ${slice[slice.length - 1].day.slice(5)}`,
      revenueThb: sum(slice.map((d) => Number(d.revenue_thb))),
      costThb: sum(slice.map((d) => Number(d.cost_thb))),
      profitThb: sum(slice.map((d) => Number(d.profit_thb))),
    })
  }

  return buckets.slice(-weeks)
}

export type CategorySlice = { name: string; value: number }

export function toCostCategories(rows: LeaderboardRow[]): CategorySlice[] {
  return [
    { name: 'Live', value: sum(rows.map((r) => Number(r.live_cost_thb))) },
    { name: 'Storage', value: sum(rows.map((r) => Number(r.storage_cost_thb))) },
    { name: 'Playback', value: sum(rows.map((r) => Number(r.playback_cost_thb))) },
  ].filter((slice) => slice.value > 0)
}

export type TierBucket = { tier: string; creators: number; platformThb: number }

export function toTierDistribution(rows: LeaderboardRow[]): TierBucket[] {
  const buckets = new Map<number, TierBucket>()
  for (const tier of [1, 2, 3, 4]) {
    buckets.set(tier, { tier: `T${tier}`, creators: 0, platformThb: 0 })
  }
  for (const row of rows) {
    const bucket = buckets.get(Number(row.tier))
    if (!bucket) continue
    bucket.creators += 1
    bucket.platformThb += Number(row.platform_thb)
  }
  return Array.from(buckets.values())
}

export type MonthlyComparison = {
  month: string
  summary: RevenueSummary
}

/** Summaries for the last `count` Bangkok months, newest first. */
export async function getMonthlyComparison(count = 6): Promise<MonthlyComparison[]> {
  const current = currentBangkokMonth()
  const months = Array.from({ length: count }, (_, i) => shiftMonth(current, -i))

  const summaries = await Promise.all(
    months.map(async (month) => ({
      month,
      summary: await getPlatformRevenueSummary(month),
    })),
  )

  return summaries
}

export type ReportsData = {
  weekly: WeeklyBucket[]
  categories: CategorySlice[]
  tiers: TierBucket[]
  monthly: MonthlyComparison[]
}

export async function getReportsData(): Promise<ReportsData> {
  const [trend, leaderboard, monthly] = await Promise.all([
    getRevenueTrend(42),
    getCreatorLeaderboard('profit', 1000),
    getMonthlyComparison(6),
  ])

  return {
    weekly: toWeeklyBuckets(trend),
    categories: toCostCategories(leaderboard),
    tiers: toTierDistribution(leaderboard),
    monthly,
  }
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + (Number.isFinite(v) ? v : 0), 0)
}
