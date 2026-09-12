import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type AdminUser = { id: string; email: string | null }

/**
 * Guard for every server action and mutation.
 *
 * Mutations run through the service-role client, which bypasses RLS entirely —
 * so the caller's role has to be proven here against their own session cookie
 * before any write is allowed. Middleware is a UX redirect, not a security
 * boundary, and cannot be relied on for this.
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not signed in.')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw new Error(`Could not verify permissions: ${error.message}`)
  if (profile?.role !== 'super_admin') throw new Error('Super admin access required.')

  return { id: user.id, email: user.email ?? null }
}
