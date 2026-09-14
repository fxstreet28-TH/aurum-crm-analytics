// AURUM CRM — alert delivery cron.
//
// Invoked every 15 minutes by pg_cron via public.run_alert_rules(), which POSTs here
// over pg_net with the service-role key as a bearer token.
//
// Evaluation is NOT done here. public.evaluate_alert_rules() does it inside Postgres,
// where the excluded-creator rule is enforced, and returns only the events it actually
// inserted — an event already open for the same rule+creator is suppressed by a partial
// unique index, so a creator sitting over threshold does not re-fire every 15 minutes.
// This function's only job is to carry those rows to Telegram and Resend.
//
// Delivery is gated on the `alert_delivery_mode` vault secret:
//   dry_run (default) — alert_events rows are written, nothing is sent
//   live              — deliver on each rule's channels
// Flipping it needs no redeploy.

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const RESEND_API_URL = 'https://api.resend.com/emails'
const DASHBOARD_BASE = 'https://aurum-crm-analytics.vercel.app'
const FROM_ADDRESS = 'AURUM CRM Alerts <admin@creatorlivetech.com>'
const FALLBACK_ALERT_EMAIL = 'aurumtech@outlook.co.th'

/** Hard ceiling on Telegram messages per run — a bad rule cannot flood the chat. */
const TELEGRAM_MAX_PER_RUN = 10

type AlertEvent = {
  event_id: string
  rule_id: string
  rule_name: string
  severity: 'info' | 'warning' | 'critical'
  channels: string[]
  creator_id: string | null
  handle: string | null
  display_name: string | null
  details: Record<string, unknown>
}

const SEVERITY_ICON: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
}

function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceKey) return json({ error: 'misconfigured' }, 500)
  if (req.headers.get('Authorization') !== `Bearer ${serviceKey}`) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabase = serviceClient()

  const { data: events, error: evalError } = await supabase.rpc('evaluate_alert_rules')
  if (evalError) {
    console.error('[alert-cron] evaluate_alert_rules failed', evalError.message)
    return json({ error: 'evaluation_failed', detail: evalError.message }, 500)
  }

  const fired = (events ?? []) as AlertEvent[]
  const mode = (await secret(supabase, 'alert_delivery_mode')) ?? 'dry_run'

  if (fired.length === 0) {
    return json({ ok: true, mode, fired: 0, delivered: { telegram: 0, email: 0 } })
  }

  // in_app needs no delivery: the alert_events row IS the delivery, and /alerts reads it.
  const telegramEvents = fired.filter((e) => e.channels.includes('telegram'))
  const emailEvents = fired.filter((e) => e.channels.includes('email'))

  const delivery: Record<string, { telegram?: string; email?: string }> = {}
  const note = (id: string, channel: 'telegram' | 'email', status: string) => {
    delivery[id] = { ...(delivery[id] ?? {}), [channel]: status }
  }

  let telegramSent = 0
  let emailSent = 0
  let resendId: string | null = null

  if (mode !== 'live') {
    for (const e of telegramEvents) note(e.event_id, 'telegram', 'skipped: dry_run')
    for (const e of emailEvents) note(e.event_id, 'email', 'skipped: dry_run')
  } else {
    // ---- Telegram: one message per event, capped ----
    if (telegramEvents.length > 0) {
      const token = await secret(supabase, 'telegram_bot_token_origin_alert')
      const chatId = await secret(supabase, 'telegram_chat_id_origin_alert')

      if (!token || !chatId) {
        for (const e of telegramEvents) note(e.event_id, 'telegram', 'failed: vault secrets missing')
      } else {
        const send = telegramEvents.slice(0, TELEGRAM_MAX_PER_RUN)
        const held = telegramEvents.length - send.length

        for (const e of send) {
          const status = await sendTelegram(token, chatId, telegramText(e))
          if (status === 'sent') telegramSent += 1
          note(e.event_id, 'telegram', status)
        }
        if (held > 0) {
          await sendTelegram(
            token,
            chatId,
            `${SEVERITY_ICON.warning} <b>${held} further alert${held === 1 ? '' : 's'} withheld</b>\n` +
              `Per-run Telegram cap is ${TELEGRAM_MAX_PER_RUN}. All of them are on the dashboard.\n` +
              `${DASHBOARD_BASE}/alerts`,
          )
          for (const e of telegramEvents.slice(TELEGRAM_MAX_PER_RUN)) {
            note(e.event_id, 'telegram', 'withheld: per-run cap')
          }
        }
      }
    }

    // ---- Email: one digest per run, not one mail per event ----
    if (emailEvents.length > 0) {
      const apiKey = Deno.env.get('RESEND_API_KEY')
      const to = (await secret(supabase, 'admin_notification_email')) ?? FALLBACK_ALERT_EMAIL

      if (!apiKey) {
        for (const e of emailEvents) note(e.event_id, 'email', 'failed: RESEND_API_KEY not set')
      } else {
        const result = await sendDigest(apiKey, to, emailEvents)
        resendId = result.resendId
        if (result.status === 'sent') emailSent = emailEvents.length
        for (const e of emailEvents) note(e.event_id, 'email', result.status)
      }
    }
  }

  // Delivery outcome is recorded on the event itself. email_log is deliberately not
  // used: its event_type check constraint is owned by the platform repo's migrations
  // and this repo should not be widening a shared table to log its own sends.
  for (const e of fired) {
    const outcome = delivery[e.event_id]
    await supabase
      .from('alert_events')
      .update({
        details_json: {
          ...e.details,
          delivery: {
            mode,
            channels: e.channels,
            telegram: outcome?.telegram ?? (e.channels.includes('telegram') ? 'not attempted' : 'n/a'),
            email: outcome?.email ?? (e.channels.includes('email') ? 'not attempted' : 'n/a'),
            in_app: e.channels.includes('in_app') ? 'row is the delivery' : 'n/a',
            at: new Date().toISOString(),
            ...(resendId && e.channels.includes('email') ? { resend_id: resendId } : {}),
          },
        },
      })
      .eq('id', e.event_id)
  }

  return json({
    ok: true,
    mode,
    fired: fired.length,
    delivered: { telegram: telegramSent, email: emailSent },
    resend_id: resendId,
    rules: [...new Set(fired.map((e) => e.rule_name))],
  })
})

async function secret(supabase: SupabaseClient, name: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_vault_secret', { p_name: name })
  if (error) {
    console.warn(`[alert-cron] vault read failed for ${name}`, error.message)
    return null
  }
  return typeof data === 'string' && data ? data : null
}

function creatorLabel(e: AlertEvent): string {
  return e.display_name || (e.handle ? `@${e.handle}` : e.creator_id?.slice(0, 8) ?? 'unknown creator')
}

function telegramText(e: AlertEvent): string {
  const icon = SEVERITY_ICON[e.severity] ?? SEVERITY_ICON.warning
  const lines = [
    `${icon} <b>${escapeHtml(e.rule_name)}</b>`,
    `Creator: <b>${escapeHtml(creatorLabel(e))}</b>`,
    '',
    ...detailLines(e.details).map(([k, v]) => `${escapeHtml(k)}: <b>${escapeHtml(v)}</b>`),
    '',
    `${DASHBOARD_BASE}/creators/${e.creator_id ?? ''}`,
  ]
  return lines.join('\n')
}

/** Renders the rule-specific detail keys, skipping bookkeeping ones. */
function detailLines(details: Record<string, unknown>): [string, string][] {
  const SKIP = new Set(['rule_kind', 'delivery'])
  const LABEL: Record<string, string> = {
    cost_thb: 'Cost',
    revenue_thb: 'Platform revenue',
    profit_thb: 'Profit',
    threshold_cost_thb: 'Cost threshold',
    threshold_revenue_thb: 'Revenue threshold',
    storage_used_pct: 'Quota used %',
    gb_stored: 'Stored GB',
    quota_gb: 'Quota GB',
    avg_views_per_clip: 'Avg views / clip',
    chat_messages: 'Chat messages',
    projected_stars: 'Projected stars',
    projected_tier: 'Projected tier',
    previous_month_tier: 'Last month tier',
    days_left: 'Days left in month',
  }
  return Object.entries(details)
    .filter(([k, v]) => !SKIP.has(k) && v !== null && v !== undefined)
    .slice(0, 8)
    .map(([k, v]) => [LABEL[k] ?? k.replace(/_/g, ' '), String(v)])
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<string> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[alert-cron] telegram rejected', res.status, body)
      return `failed: telegram ${res.status}`
    }
    return 'sent'
  } catch (err) {
    console.error('[alert-cron] telegram exception', err)
    return `failed: ${(err as Error).message}`
  }
}

async function sendDigest(
  apiKey: string,
  to: string,
  events: AlertEvent[],
): Promise<{ status: string; resendId: string | null }> {
  const critical = events.filter((e) => e.severity === 'critical').length
  const subject =
    events.length === 1
      ? `${SEVERITY_ICON[events[0].severity] ?? '⚠️'} CRM alert · ${events[0].rule_name} · ${creatorLabel(events[0])}`
      : `${critical > 0 ? '🚨' : '⚠️'} ${events.length} CRM alerts fired`

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html: digestHtml(events),
        text: digestText(events),
      }),
    })
    const data = (await res.json().catch(() => null)) as { id?: string } | null

    if (!res.ok) {
      console.error('[alert-cron] resend rejected', JSON.stringify(data))
      return { status: `failed: resend ${res.status}`, resendId: null }
    }
    return { status: 'sent', resendId: data?.id ?? null }
  } catch (err) {
    console.error('[alert-cron] resend exception', err)
    return { status: `failed: ${(err as Error).message}`, resendId: null }
  }
}

function digestText(events: AlertEvent[]): string {
  return events
    .map((e) =>
      [
        `${e.severity.toUpperCase()} · ${e.rule_name}`,
        `Creator: ${creatorLabel(e)}`,
        ...detailLines(e.details).map(([k, v]) => `  ${k}: ${v}`),
        `${DASHBOARD_BASE}/creators/${e.creator_id ?? ''}`,
      ].join('\n'),
    )
    .join('\n\n')
}

function digestHtml(events: AlertEvent[]): string {
  const cards = events
    .map((e) => {
      const bar = e.severity === 'critical' ? '#B4413F' : e.severity === 'info' ? '#4E7A3F' : '#A47E1B'
      const rows = detailLines(e.details)
        .map(
          ([k, v], i, arr) => `<tr>
            <td style="padding:9px 0;${i === arr.length - 1 ? '' : 'border-bottom:1px solid #F0EDE3;'}font-family:-apple-system,'Segoe UI',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.1px;text-transform:uppercase;color:#8a8579;width:50%;">${escapeHtml(k)}</td>
            <td style="padding:9px 0;${i === arr.length - 1 ? '' : 'border-bottom:1px solid #F0EDE3;'}font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;color:#1a1614;text-align:right;">${escapeHtml(v)}</td>
          </tr>`,
        )
        .join('')

      return `<table role="presentation" width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;margin:0 auto 16px;background:#ffffff;border-radius:12px;box-shadow:0 1px 2px rgba(74,55,20,0.04),0 8px 24px rgba(74,55,20,0.06);border-left:4px solid ${bar};">
        <tr><td style="padding:28px 32px 24px;">
          <div style="font-family:-apple-system,'Segoe UI',sans-serif;font-size:10px;font-weight:700;letter-spacing:2.4px;color:${bar};margin:0 0 12px;">${escapeHtml(e.severity.toUpperCase())} · ${escapeHtml(e.rule_name.toUpperCase())}</div>
          <div style="font-family:-apple-system,'Segoe UI',sans-serif;font-size:19px;line-height:1.35;color:#1a1614;margin:0 0 20px;">${escapeHtml(creatorLabel(e))}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
          <div style="margin-top:20px;padding-top:18px;border-top:1px solid #F0EDE3;">
            <a href="${DASHBOARD_BASE}/creators/${e.creator_id ?? ''}" style="font-family:-apple-system,'Segoe UI',sans-serif;font-size:12px;font-weight:600;color:${bar};text-decoration:none;">View creator →</a>
          </div>
        </td></tr>
      </table>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en" style="color-scheme: light only;">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only"><title>AURUM CRM Alerts</title>
<style>body { margin:0; padding:0; background:#F5EEDA; color-scheme: light only; }</style></head>
<body style="margin:0;padding:0;background:#F5EEDA;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5EEDA;">
  <tr><td align="center" style="padding:32px 20px 40px;">
    <table role="presentation" width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;margin:0 auto 20px;">
      <tr><td align="left" style="padding:0 6px;">
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:500;letter-spacing:4.5px;color:#1a1614;">A U R U M</span>
        <span style="display:inline-block;margin-left:8px;padding:2px 8px;background:#1a1614;color:#F5EEDA;font-family:-apple-system,'Segoe UI',sans-serif;font-size:9px;font-weight:600;letter-spacing:1.8px;border-radius:3px;">CRM ALERTS</span>
      </td></tr>
    </table>
    ${cards}
    <div style="max-width:540px;margin:20px auto 0;text-align:center;font-family:-apple-system,'Segoe UI',sans-serif;font-size:10px;color:#a8a29e;line-height:1.6;">
      Fired by the alert rules on <a href="${DASHBOARD_BASE}/alerts" style="color:#a8a29e;">${DASHBOARD_BASE}/alerts</a><br>
      Evaluated every 15 minutes · AURUM Operations
    </div>
  </td></tr>
</table>
</body></html>`
}

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
