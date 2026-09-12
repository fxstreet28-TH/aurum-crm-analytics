import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { SlotPerformanceRow } from './types'

export async function getStarPurchaseSlotPerformance(
  month?: string,
): Promise<SlotPerformanceRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_star_purchase_slot_performance', {
    p_month: month,
  })
  if (error) throw new Error(`get_star_purchase_slot_performance failed: ${error.message}`)
  return data ?? []
}

export type PricingConfig = {
  id: string
  label: string | null
  retailThbPerStar: number
  internalThbPerStar: number
  isActive: boolean
  validFrom: string
  validTo: string | null
  notes: string | null
}

export async function getActivePricingConfig(): Promise<PricingConfig | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('star_pricing_config')
    .select('id, label, retail_thb_per_star, internal_thb_per_star, is_active, valid_from, valid_to, notes')
    .eq('is_active', true)
    .order('valid_from', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`getActivePricingConfig failed: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    label: data.label,
    retailThbPerStar: Number(data.retail_thb_per_star),
    internalThbPerStar: Number(data.internal_thb_per_star),
    isActive: data.is_active,
    validFrom: data.valid_from,
    validTo: data.valid_to,
    notes: data.notes,
  }
}

export type PurchaseRow = {
  id: string
  starsAmount: number
  thbAmount: number
  retailThbPerStar: number
  paymentMethod: string | null
  paymentStatus: string
  completedAt: string | null
  buyerEmail: string | null
  excluded: boolean
}

/**
 * Recent star purchases for the Star Purchases page. Excluded accounts are
 * filtered out in SQL-adjacent code here rather than by an RPC because this is
 * a raw ledger view, not an aggregate that feeds a KPI.
 */
export async function listStarPurchases(
  limit = 100,
  includeExcluded = false,
): Promise<PurchaseRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('star_purchases')
    .select('id, user_id, stars_amount, thb_amount, retail_thb_per_star, payment_method, payment_status, completed_at')
    .eq('payment_status', 'succeeded')
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(`listStarPurchases failed: ${error.message}`)

  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id).filter(Boolean)))
  const buyers = await buyerIndex(userIds as string[])

  const rows = (data ?? []).map((row) => {
    const buyer = row.user_id ? buyers.get(row.user_id) : undefined
    return {
      id: row.id,
      starsAmount: Number(row.stars_amount ?? 0),
      thbAmount: Number(row.thb_amount ?? 0),
      retailThbPerStar: Number(row.retail_thb_per_star ?? 0),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      completedAt: row.completed_at,
      buyerEmail: buyer?.email ?? null,
      excluded: buyer?.excluded ?? false,
    }
  })

  return includeExcluded ? rows : rows.filter((r) => !r.excluded)
}

/** Resolves auth user ids to buyer email + exclusion state in two queries, not N. */
async function buyerIndex(userIds: string[]) {
  const index = new Map<string, { email: string | null; excluded: boolean }>()
  if (userIds.length === 0) return index

  const supabase = createAdminClient()

  const { data: customers, error: customerError } = await supabase
    .from('customers')
    .select('id, user_id, email')
    .in('user_id', userIds)
  if (customerError) throw new Error(`buyerIndex customers failed: ${customerError.message}`)

  const { data: creators, error: creatorError } = await supabase
    .from('creators')
    .select('user_id, customer_id, excluded_from_analytics')
  if (creatorError) throw new Error(`buyerIndex creators failed: ${creatorError.message}`)

  const excludedByUser = new Set(
    (creators ?? []).filter((c) => c.excluded_from_analytics).map((c) => c.user_id),
  )
  const excludedByCustomer = new Set(
    (creators ?? []).filter((c) => c.excluded_from_analytics).map((c) => c.customer_id),
  )

  for (const customer of customers ?? []) {
    if (!customer.user_id) continue
    index.set(customer.user_id, {
      email: customer.email,
      excluded:
        excludedByUser.has(customer.user_id) || excludedByCustomer.has(customer.id),
    })
  }

  return index
}
