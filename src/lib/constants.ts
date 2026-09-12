/** Display timezone. Everything is stored in UTC and rendered in Bangkok time. */
export const BANGKOK_TZ = 'Asia/Bangkok'

/**
 * Tier ladder, mirroring public.crm_tier_of / crm_tier_pct in the database.
 * `platformPct` is the platform's cut of a creator's monthly star value.
 */
export const TIERS = [
  { tier: 1, label: 'T1', min: 0, max: 5000, platformPct: 0.3 },
  { tier: 2, label: 'T2', min: 5001, max: 40000, platformPct: 0.25 },
  { tier: 3, label: 'T3', min: 40001, max: 129999, platformPct: 0.2 },
  { tier: 4, label: 'T4', min: 130000, max: null, platformPct: 0.15 },
] as const

export type TierNumber = (typeof TIERS)[number]['tier']

/** Infra unit costs, mirroring the constants baked into the cost RPCs. */
export const COST_RATES = {
  storageThbPerGbMonth: 0.5,
  playbackThbPerView: 0.003,
} as const

export const ALERT_CHANNELS = ['in_app', 'telegram', 'email'] as const
export type AlertChannel = (typeof ALERT_CHANNELS)[number]

export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]

export const ALERT_PERIODS = ['hour', 'day', 'week', 'month'] as const
export type AlertPeriod = (typeof ALERT_PERIODS)[number]

export const DATE_RANGES = ['today', 'this_week', 'this_month'] as const
export type DateRange = (typeof DATE_RANGES)[number]

export const CREATORS_PAGE_SIZE = 20
