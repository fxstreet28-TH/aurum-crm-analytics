import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/database'

export type AlertRule = Database['public']['Tables']['alert_rules']['Row']

export type AlertEvent = {
  id: string
  ruleId: string | null
  ruleName: string | null
  creatorId: string | null
  handle: string | null
  displayName: string | null
  severity: string
  status: string
  triggeredAt: string
  resolvedAt: string | null
  note: string | null
  details: Record<string, unknown>
}

export async function listAlertRules(): Promise<AlertRule[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`listAlertRules failed: ${error.message}`)
  return data ?? []
}

export async function listAlertEvents(
  status?: 'active' | 'watch' | 'resolved',
  limit = 100,
): Promise<AlertEvent[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('alert_events')
    .select(
      'id, rule_id, creator_id, severity, status, triggered_at, resolved_at, note, details_json, alert_rules(name), creators(handle, display_name)',
    )
    .order('triggered_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(`listAlertEvents failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    ruleId: row.rule_id,
    ruleName: row.alert_rules?.name ?? null,
    creatorId: row.creator_id,
    handle: row.creators?.handle ?? null,
    displayName: row.creators?.display_name ?? null,
    severity: row.severity,
    status: row.status,
    triggeredAt: row.triggered_at,
    resolvedAt: row.resolved_at,
    note: row.note,
    details: (row.details_json ?? {}) as Record<string, unknown>,
  }))
}
