import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/env'

/**
 * Service-role client. Every analytics RPC is revoked from anon/authenticated
 * and granted to service_role only, so all dashboard reads go through here.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * pulled into a client bundle.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
