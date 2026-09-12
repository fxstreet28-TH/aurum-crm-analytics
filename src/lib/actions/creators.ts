'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth'

export type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Flips creators.excluded_from_analytics. Every analytics RPC reads this column,
 * so the whole dashboard has to be revalidated, not just the calling page.
 */
export async function setCreatorExcluded(
  creatorId: string,
  excluded: boolean,
): Promise<ActionResult> {
  try {
    await requireSuperAdmin()

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('creators')
      .update({ excluded_from_analytics: excluded })
      .eq('id', creatorId)

    if (error) return { ok: false, error: error.message }

    for (const path of [
      '/',
      '/creators',
      `/creators/${creatorId}`,
      '/revenue',
      '/purchases',
      '/reports',
      '/storage',
      '/settings',
    ]) {
      revalidatePath(path)
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
