import { BANGKOK_TZ } from './constants'

const thb = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const thbPrecise = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const plain = new Intl.NumberFormat('th-TH')

/**
 * Money is always THB and always rendered as `฿ 12,345`.
 * Sub-100 amounts keep 2 decimals so small infra costs don't collapse to ฿ 0.
 */
export function thbAmount(value: number | string | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '—'
  const abs = Math.abs(n)
  const body = abs > 0 && abs < 100 ? thbPrecise.format(n) : thb.format(n)
  return `฿ ${body}`
}

/** Same as thbAmount but prefixes a sign, for deltas and profit figures. */
export function thbSigned(value: number | string | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '—'
  const formatted = thbAmount(Math.abs(n))
  if (n > 0) return `+${formatted}`
  if (n < 0) return `−${formatted}`
  return formatted
}

export function number(value: number | string | null | undefined): string {
  const n = toNumber(value)
  return n === null ? '—' : plain.format(n)
}

export function percent(
  value: number | string | null | undefined,
  digits = 1,
): string {
  const n = toNumber(value)
  return n === null ? '—' : `${n.toFixed(digits)}%`
}

/** Converts a 0–1 ratio to a display percentage (0.25 -> "25%"). */
export function ratioPercent(
  value: number | string | null | undefined,
  digits = 0,
): string {
  const n = toNumber(value)
  return n === null ? '—' : `${(n * 100).toFixed(digits)}%`
}

export function gigabytes(value: number | string | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '—'
  if (n < 1) return `${(n * 1024).toFixed(0)} MB`
  return `${n.toFixed(2)} GB`
}

export function hours(value: number | string | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '—'
  if (n < 1) return `${Math.round(n * 60)} min`
  return `${n.toFixed(1)} h`
}

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: BANGKOK_TZ,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: BANGKOK_TZ,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: BANGKOK_TZ,
  day: '2-digit',
  month: 'short',
})

/** Timestamps are stored UTC and always displayed in Bangkok time. */
export function dateTime(value: string | Date | null | undefined): string {
  const d = toDate(value)
  return d ? `${dateTimeFmt.format(d)} ICT` : '—'
}

export function date(value: string | Date | null | undefined): string {
  const d = toDate(value)
  return d ? dateFmt.format(d) : '—'
}

/** Short axis label for charts — "12 Sep". */
export function dayLabel(value: string | Date | null | undefined): string {
  const d = toDate(value)
  return d ? dayFmt.format(d) : ''
}

/** "YYYY-MM" for the current Bangkok month, matching crm_month_start(null). */
export function currentBangkokMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGKOK_TZ,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value ?? '0000'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  return `${year}-${month}`
}

/** Shifts a "YYYY-MM" key by whole months. */
export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, 1)))
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
