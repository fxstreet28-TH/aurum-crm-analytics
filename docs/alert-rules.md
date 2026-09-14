# Alert rules — evaluation and delivery

How the four seeded rules are actually evaluated, what each threshold means, and what
the pipeline does with a breach. Written alongside the Phase F.4 delivery cron.

## Pipeline

```
pg_cron  */15 * * * *
   └─ public.run_alert_rules()          -- skips entirely if no rule is enabled
        └─ pg_net POST (service-role bearer)
             └─ Edge Function alert-delivery-cron
                  ├─ public.evaluate_alert_rules()   -- evaluates + inserts + bumps counters
                  └─ delivery: Telegram / Resend / in_app
```

Evaluation runs **inside Postgres**, not in the Edge Function. The
`excluded_from_analytics` rule is enforced there, and keeping evaluation in the same
place means a future caller cannot bypass it by reading the tables directly. The Edge
Function only carries rows outward, because Postgres cannot call the Telegram or Resend
APIs itself.

This matches how the project already runs `live-session-watchdog` and
`star-expirations-daily`. No second scheduler was introduced.

## Dispatch

Rules are matched on the **keys present in `condition_json`**, not on rule name. A rule
cloned or hand-written through `/alerts` with the same keys evaluates the same way.

| Keys | Rule |
| --- | --- |
| `cost_gt_thb` + `revenue_lt_thb` | High cost / low revenue |
| `storage_used_pct_gt` | Storage bloat |
| `chat_msgs_per_day_gt` | Chat spam risk |
| `days_left_lte` | Tier drop warning |

`threshold_period` sizes the measurement window for the rate-based rules:
`hour` → 1 hour, `day` → 1 day, `week` → 7 days, `month` → 30 days.

## Rule semantics

### High cost / low revenue

Source: `get_creator_leaderboard` for the current Bangkok month.

Fires when `total_cost_thb > cost_gt_thb` **and** `platform_thb < revenue_lt_thb`.

**Revenue here means what the platform earns from the creator** — tier commission — not
the creator's gross. This dashboard reports the platform's P&L, so a creator earning
well while costing more than their commission returns is exactly the case worth
flagging.

### Storage bloat

`storage_used_pct` = creator's stored GB ÷ `content_tier_limits.storage_quota_gb` × 100,
where stored GB is `sum(feed_posts.file_size_bytes)` over clips with
`video_status = 'ready'`.

Fires when the percentage exceeds `storage_used_pct_gt` and, if
`avg_views_per_clip_lt` is present, average views per clip is below it.

FOLLOWUPS flagged that `storage_used_pct_gt: 80` was "a percentage of something that
does not exist yet". It does exist: `content_tier_limits.storage_quota_gb` is per
content tier. No new column was needed.

Two things keep this rule quiet today, both correct rather than broken:

- every tier's quota is currently 2000 GB, so it takes ~1.6 TB to trip 80%
- `feed_posts.file_size_bytes` is `NULL` on the only stored clip, so measured storage is
  0 GB across the whole platform

The second is a real upstream gap — the upload pipeline is not recording file size — and
it makes every storage figure on the dashboard read zero, not just this rule. Logged as
a follow-up.

### Chat spam risk

Sums `live_sessions.chat_message_count` per creator over the rule's window. Fires when
the total exceeds `chat_msgs_per_day_gt`.

**`unique_senders_lt` was dropped from the seeded condition.** `live_sessions` records a
message count but no distinct-sender count, and nothing on the platform writes one.
The two alternatives were both worse:

- adding a column nothing populates leaves it at `0`, making `unique_senders_lt: 5`
  true for every session — the rule would fire constantly
- `live_sessions.unique_viewer_count` exists but counts *viewers*, not chatters, so the
  rule would fire on the wrong grounds while looking correct

The rule alerts on volume alone and says so, both in its description and in the
`note` field of every event it writes. If distinct senders start being recorded, add
the key back and the dispatch picks it up.

### Tier drop warning

Ships **disabled**, as seeded.

"Dropping a tier" only means something against a month the creator has finished, so this
compares the projected finish for the current month against the tier they actually
closed **last** month:

```
projected_stars = stars_month_to_date ÷ days_elapsed × days_in_month
fires when  days_left <= days_left_lte
      and   previous_month_stars > 0
      and   crm_tier_of(projected_stars) < crm_tier_of(previous_month_stars)
```

Note what this rule cannot be: comparing projected against the creator's *current* tier
is vacuous, because the current tier is itself computed from month-to-date stars and the
projection is always ≥ month-to-date. It would never fire.

Creators with no previous month are skipped — there is nothing to drop from.

## De-duplication

A partial unique index:

```sql
create unique index uq_alert_events_active_rule_creator
  on public.alert_events (rule_id, creator_id)
  where status = 'active';
```

A rule+creator pair can hold at most one `active` event, and the insert is
`on conflict … do nothing`. A creator sitting over threshold therefore fires **once**,
not 96 times a day. Re-firing needs the event resolved, which is a deliberate act on
`/alerts`.

`watch` is intentionally not covered: parking an event as watch does not suppress a
fresh breach.

## Counters

`alert_rules.triggered_count` is incremented by the number of events that actually
landed (not the number of candidates), and `last_triggered_at` is set, in the same
statement as the insert. Both were permanently `0` / `null` before this.

## Delivery

Per `alert_rules.channels`:

| Channel | Behaviour |
| --- | --- |
| `in_app` | No send. The `alert_events` row **is** the delivery; `/alerts` reads it. |
| `telegram` | One Bot API `sendMessage` per event, capped at 10 per run. Past the cap, one summary message points at the dashboard. |
| `email` | **One digest per run**, not one mail per event, via Resend. |

Outcome per channel is written back onto `alert_events.details_json.delivery`, including
the Resend message id. `email_log` is deliberately not used: its `event_type` check
constraint is owned by the platform repo's migrations, and this repo should not widen a
shared table to log its own sends.

### Secrets

All already present in the project — nothing new was created, and no credential is in
this repo.

| Secret | Where | Used for |
| --- | --- | --- |
| `telegram_bot_token_origin_alert` | Supabase vault | the `livekit-sg-1` monitor bot |
| `telegram_chat_id_origin_alert` | Supabase vault | CEO Por's personal chat |
| `admin_notification_email` | Supabase vault | digest recipient |
| `edge_function_service_key` | Supabase vault | bearer for the pg_net call |
| `edge_function_alert_delivery_url` | Supabase vault | where pg_net posts |
| `alert_delivery_mode` | Supabase vault | `dry_run` / `live` switch |
| `RESEND_API_KEY` | Edge Function env | Resend, shared with `send-transactional-email` |

### The delivery mode switch

`alert_delivery_mode` gates outbound sending:

- `dry_run` — `alert_events` rows are written and `/alerts` shows them; nothing is sent
- `live` — deliver on each rule's channels

Flipping it needs no redeploy:

```sql
select vault.update_secret(id, 'dry_run') from vault.secrets where name = 'alert_delivery_mode';
```

This exists because FOLLOWUPS called out the risk plainly: a bug here spams Telegram.
The Telegram per-run cap is the second guard, and the de-duplication index is the third.
