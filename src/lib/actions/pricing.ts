'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth'
import type { ActionResult } from './creators'

/**
 * Supersedes the active star pricing row rather than editing it in place, so the
 * historical retail/internal values stay intact for past months' reporting.
 */
export async function updatePricingConfig(input: {
  retailThbPerStar: number
  internalThbPerStar: number
  label: string
  notes?: string
}): Promise<ActionResult> {
  try {
    const admin = await requireSuperAdmin()

    const { retailThbPerStar, internalThbPerStar } = input
    if (!Number.isFinite(retailThbPerStar) || retailThbPerStar <= 0) {
      return { ok: false, error: 'Retail price must be greater than 0.' }
    }
    if (!Number.isFinite(internalThbPerStar) || internalThbPerStar <= 0) {
      return { ok: false, error: 'Internal value must be greater than 0.' }
    }
    if (retailThbPerStar < internalThbPerStar) {
      return {
        ok: false,
        error: 'Retail price is below internal value — that would sell stars at a loss.',
      }
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { error: closeError } = await supabase
      .from('star_pricing_config')
      .update({ is_active: false, valid_to: now })
      .eq('is_active', true)

    if (closeError) return { ok: false, error: closeError.message }

    const { error: insertError } = await supabase.from('star_pricing_config').insert({
      retail_thb_per_star: retailThbPerStar,
      internal_thb_per_star: internalThbPerStar,
      label: input.label.trim() || 'custom',
      notes: input.notes?.trim() || null,
      is_active: true,
      valid_from: now,
      created_by: admin.id,
    })

    if (insertError) return { ok: false, error: insertError.message }

    for (const path of ['/', '/revenue', '/purchases', '/reports']) {
      revalidatePath(path)
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
