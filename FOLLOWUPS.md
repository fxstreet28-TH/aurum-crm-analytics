# Follow-ups

All three items from the 2026-09-12 list are done. New gaps found while closing them are
at the bottom.

---

## 1. Alert delivery cron (Phase F.4) — **DONE** (2026-09-14)

Rules are evaluated every 15 minutes and delivered. `alert_events` is written, the
Overview at-risk panel and the sidebar alert badge have something to read, and
`triggered_count` / `last_triggered_at` move.

- `public.evaluate_alert_rules()` — evaluation stays in Postgres, where the
  excluded-creator rule is enforced. Dispatches on `condition_json` keys, not rule name.
- Edge Function `alert-delivery-cron` — delivery only: Telegram (Bot API), email
  (Resend digest, one per run), `in_app` (the row is the delivery).
- `public.run_alert_rules()` + `pg_cron` job `alert-delivery-cron` on `*/15 * * * *`,
  the same pattern as `live-session-watchdog`.
- De-duplication: partial unique index on `(rule_id, creator_id) where status = 'active'`,
  so a creator over threshold fires once rather than 96 times a day.
- `alert_delivery_mode` vault secret switches `dry_run` / `live` with no redeploy.

Both open questions from the original write-up are settled:

- **Storage quota** — `content_tier_limits.storage_quota_gb` already existed. No new
  column; `storage_used_pct` is measured against the creator's tier quota.
- **Unique senders** — dropped from the condition rather than faked. `live_sessions` has
  no distinct-sender count and `unique_viewer_count` counts viewers, not chatters.

Full semantics in [`docs/alert-rules.md`](docs/alert-rules.md).

---

## 2. `middleware.ts` → `proxy.ts` — **DONE** (2026-09-14)

Migrated with `npx @next/codemod@canary middleware-to-proxy .`. `src/middleware.ts` and
`src/lib/supabase/middleware.ts` are gone; `src/proxy.ts` and `src/lib/supabase/proxy.ts`
replace them. The build no longer prints the deprecation warning.

Verified by running the Phase B auth smoke test against a production build before and
after the move and diffing: all 11 guarded routes 307 to `/login?redirectTo=…`, `/login`
200, `/favicon.ico` unguarded, query string preserved. Identical both sides.

Note: `proxy` runs on the **Node** runtime. Next 16 does not support edge for `proxy` and
it cannot be configured.

---

## 3. Daily `view_count` history table — **DONE** (2026-09-14)

`feed_post_view_daily (post_id, day)` with a denormalised `creator_id` and a covering
index on `(creator_id, day desc) include (views_delta, views_total)`, so 30- and 90-day
series are index-only.

`snapshot_feed_post_views(day)` runs nightly on `pg_cron` at 16:50 UTC (23:50
Asia/Bangkok). Deltas are measured against the most recent earlier snapshot — a missed
run is absorbed, not lost — and clamped at zero so a counter reset cannot book a negative
day. `get_creator_view_trend(creator, days)` feeds a recharts trend on the creator
detail page.

As predicted, earlier history could not be backfilled; the baseline snapshot captures
today's counter as the starting line with `views_delta = 0`.

---

## Newly discovered

### `feed_posts.file_size_bytes` is never populated

The only stored clip has `file_size_bytes = NULL`. Every storage figure on the platform
is therefore computed from 0 bytes: `/storage` totals, the storage slice of every cost
breakdown, `storage_cost_thb` on the leaderboard, and the Storage bloat alert rule, which
cannot trip a quota percentage against zero.

This is an upstream gap in the upload pipeline, not in this dashboard — the dashboard is
reading the column correctly. Worth confirming whether Bunny Stream returns a size on
upload completion and wiring it into `content-bunny-webhook`.

**Until then, treat every storage cost on this dashboard as understated.**

### Switch the cost queries over to real view history

`get_daily_revenue_trend` still attributes a clip's whole playback cost to its publish
date, and `/storage` still defines stale as "published 90+ days ago with zero lifetime
views". Both were left alone deliberately: switching today would read from an empty
history and zero out playback cost.

Once ~30 days have accumulated in `feed_post_view_daily`:

- `get_daily_revenue_trend` → `views_delta × 0.003` on the day the views happened
- `/storage` stale → "no `views_delta > 0` in 90 days", which is the real question
- creator detail can gain a per-clip sparkline

`/help` currently documents the interim state.

### Tier drop warning has never fired

The rule is correct but no creator has previous-month stars, so there is nothing to drop
from. It stays disabled until there is a month of gift history to compare against.

### Surface delivery status on `/alerts`

`alert_events.details_json.delivery` records per-channel outcome and the Resend message
id. The history table does not show it yet, so a silently failed Telegram send is
invisible in the UI.

---

## Smaller items

- **shadcn primitives are hand-written.** `ui.shadcn.com` was unreachable from the build
  environment, so the 13 components in `src/components/ui/` were written by hand against
  Radix + `cva` to shadcn's API. They are not CLI-managed, so `shadcn add` will not update
  them. Re-run `pnpm dlx shadcn@latest init` from a machine with network access to make
  them CLI-tracked.
- **Design fidelity unverified.** The mockup HTML was not available in the build
  environment; the UI was built from the palette and section specs. Worth a pass against
  `aurum-live-crm-mockup.html`.
- **No mobile layout.** Desktop-first by design; nothing below 768px has been laid out.
- **Historical tier snapshots.** Tier is always recomputed from current `live_gifts`, so a
  past month's report reflects today's data, not what was true then. A monthly snapshot
  table would make historical reports immutable.
- **Creator list filters in TypeScript.** Search, tier and risk filtering happen in
  `listCreators` after fetching up to 1000 leaderboard rows. Fine at 6 creators; push
  these predicates into the RPC before the population reaches the hundreds.
- **`/purchases` shows nothing today.** All 6 succeeded purchases belong to excluded
  accounts, so the default view is empty. Correct behaviour, but confusing until real
  customers exist.
