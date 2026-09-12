'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth'
import { ALERT_CHANNELS, ALERT_PERIODS, ALERT_SEVERITIES } from '@/lib/constants'
import type { ActionResult } from './creators'

export async function setAlertRuleEnabled(
  ruleId: string,
  enabled: boolean,
): Promise<ActionResult> {
  try {
    await requireSuperAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('alert_rules')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', ruleId)

    if (error) return { ok: false, error: error.message }
    revalidatePath('/alerts')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function setAlertRuleChannels(
  ruleId: string,
  channels: string[],
): Promise<ActionResult> {
  try {
    await requireSuperAdmin()

    const clean = channels.filter((c) =>
      (ALERT_CHANNELS as readonly string[]).includes(c),
    )
    if (clean.length === 0) {
      return { ok: false, error: 'A rule needs at least one delivery channel.' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('alert_rules')
      .update({ channels: clean, updated_at: new Date().toISOString() })
      .eq('id', ruleId)

    if (error) return { ok: false, error: error.message }
    revalidatePath('/alerts')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function createAlertRule(input: {
  name: string
  description: string
  conditionJson: string
  thresholdPeriod: string
  severity: string
  channels: string[]
}): Promise<ActionResult> {
  try {
    const admin = await requireSuperAdmin()

    const name = input.name.trim()
    if (!name) return { ok: false, error: 'Name is required.' }

    let condition: unknown
    try {
      condition = JSON.parse(input.conditionJson)
    } catch {
      return { ok: false, error: 'Condition must be valid JSON.' }
    }
    if (typeof condition !== 'object' || condition === null || Array.isArray(condition)) {
      return { ok: false, error: 'Condition must be a JSON object.' }
    }

    if (!(ALERT_PERIODS as readonly string[]).includes(input.thresholdPeriod)) {
      return { ok: false, error: 'Invalid threshold period.' }
    }
    if (!(ALERT_SEVERITIES as readonly string[]).includes(input.severity)) {
      return { ok: false, error: 'Invalid severity.' }
    }

    const channels = input.channels.filter((c) =>
      (ALERT_CHANNELS as readonly string[]).includes(c),
    )
    if (channels.length === 0) {
      return { ok: false, error: 'Pick at least one delivery channel.' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('alert_rules').insert({
      name,
      description: input.description.trim() || null,
      condition_json: condition as never,
      threshold_period: input.thresholdPeriod,
      severity: input.severity,
      channels,
      created_by: admin.id,
    })

    if (error) return { ok: false, error: error.message }
    revalidatePath('/alerts')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function resolveAlertEvent(
  eventId: string,
  note?: string,
): Promise<ActionResult> {
  try {
    const admin = await requireSuperAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('alert_events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: admin.id,
        note: note?.trim() || null,
      })
      .eq('id', eventId)

    if (error) return { ok: false, error: error.message }
    revalidatePath('/alerts')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
