# Follow-ups

Known gaps in the CRM analytics dashboard, in the order they are worth doing.

---

## 1. Alert delivery cron (Phase F.4)

**Status:** rules are stored, editable and toggleable in `/alerts`. Nothing evaluates
them. `alert_events` is empty and will stay empty, so the Overview at-risk panel and the
sidebar alert badge are permanently quiet.

This is the largest functional gap: the alerts UI currently promises monitoring the
platform does not actually do.

### Approach

Keep evaluation in Postgres and delivery in an Edge Function. The exclusion rule is
enforced inside the database today; evaluation should live in the same place so a future
caller cannot bypass it.

**Step 1 — `public.evaluate_alert_rules()` RPC**

For each `alert_rules` row where `enabled = true`, evaluate `condition_json` against the
non-excluded creator population and insert one `alert_events` row per newly-breaching
creator. Return the inserted rows so the caller can deliver them.

The four seeded rules need these operators:

| Rule | Condition keys | Data source |
| --- | --- | --- |
| High cost / low revenue | `cost_gt_thb`, `revenue_lt_thb` | `get_creator_leaderboard` |
| Storage bloat | `storage_used_pct_gt`, `avg_views_per_clip_lt` | `feed_posts` aggregate + a quota to compare against |
| Chat spam risk | `chat_msgs_per_day_gt`, `unique_senders_lt` | `live_sessions.chat_message_count`; **unique senders is not recorded** |
| Tier drop warning | `days_left_lte`, `projected_stars_lt_current_tier` | `get_creator_current_tier` + month-to-date run rate |

Two things to settle before writing it:

- **Storage bloat needs a quota.** `storage_used_pct_gt: 80` is a percentage of something
  that does not exist yet. Either add a per-creator storage quota column or redefine the
  rule in absolute GB.
- **Chat spam needs unique senders.** `live_sessions` has `chat_message_count` but no
  distinct-sender count. Either add one or drop that half of the condition.

**Step 2 — de-duplication.** Re-firing the same alert hourly would bury the real signal.
Suppress a rule+creator pair while an `active` event already exists for it, and only
re-fire after it is resolved or after a cooldown. Worth a partial unique index on
`(rule_id, creator_id) where status = 'active'`.

**Step 3 — `run_alert_rules` Edge Function**, scheduled hourly via `pg_cron` (already
enabled on this project — see the `enable_pg_cron_and_schedule` migration). It calls the
RPC, then fans out per `alert_rules.channels`:

- `telegram` → Bot API `sendMessage`, reusing the livekit-sg-1 monitor bot
- `email` → Resend
- `in_app` → no delivery; the row in `alert_events` is the delivery

**Step 4 — bump the counters.** `triggered_count` and `last_triggered_at` are shown on
every rule card and are currently always `0` / null.

### Secrets needed

`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY` — placeholders are already in
`.env.example`. These belong in Supabase Edge Function secrets, not Vercel, since the
function runs in Supabase.

**Effort:** ~1 day, most of it in the evaluation SQL.
**Risk:** medium — a bug here spams Telegram. Ship with every rule disabled, enable one
at a time, and dry-run by inserting `alert_events` without delivering for the first day.

---

## 2. `middleware.ts` → `proxy.ts`

**Status:** works, but every build prints a deprecation warning.

Next 16 renamed the middleware file convention to `proxy.ts`. The current
`src/middleware.ts` still runs, so this is housekeeping, not a defect — but it will
become a hard break on a future major.

### Approach

```bash
npx @next/codemod@canary middleware-to-proxy .
```

Then verify by hand, because the auth guard is the one thing here that must not silently
stop working:

- Unauthenticated request to every dashboard route → `307` to `/login?redirectTo=…`
- Non-`super_admin` session → `307` to `/login?error=unauthorized`
- Signed-in `super_admin` → `200`
- Auth cookies survive a redirect (`copyCookies` in the current implementation)

The matcher excluding `_next/static`, images and fonts must survive the move — without it
the role lookup runs a Supabase round trip per asset.

**Effort:** ~30 minutes including verification.
**Risk:** low, but it touches the auth path — do it on its own branch and check the four
cases above before merging. Middleware is a UX redirect only; the dashboard layout and
`requireSuperAdmin()` are the actual enforcement, so a regression here degrades UX rather
than exposing data.

---

## 3. Daily `view_count` history table

**Status:** `feed_posts.view_count` is a running total with no history. Three things are
degraded by this.

1. **Playback cost cannot be split by day.** `get_daily_revenue_trend` attributes a
   clip's entire playback cost to its publish date, back-loading cost onto one day
   instead of spreading it across the days views actually happened.
2. **Stale content is a weak proxy.** `/storage` defines stale as "published 90+ days ago
   with zero recorded views". A clip watched heavily last year and ignored since is
   invisible to that test — exactly the clip worth archiving.
3. **No engagement trend.** No way to show whether a creator's back catalogue is growing
   or decaying.

### Approach

```sql
create table public.feed_post_view_daily (
  post_id     uuid not null references public.feed_posts(id) on delete cascade,
  day         date not null,
  views_total bigint not null,   -- snapshot of view_count at capture
  views_delta bigint not null,   -- derived vs the previous snapshot
  primary key (post_id, day)
);
```

Populate with a daily `pg_cron` job that snapshots every `video_status = 'ready'` post and
computes `views_delta` against the previous row. Clamp negatives to zero — a `view_count`
reset would otherwise produce a nonsense negative delta.

Then:

- `get_daily_revenue_trend` uses `views_delta × 0.003` on the actual day
- `/storage` redefines stale as "no `views_delta > 0` in 90 days", which is the real
  question
- The creator detail page can gain a per-clip sparkline

**Backfill is not possible** — the history does not exist. The table starts accumulating
the day it ships, so the sooner it lands the sooner cost attribution becomes honest.
Until then keep the caveat visible on `/help`, which already documents this limitation.

**Effort:** ~half a day.
**Risk:** low — additive, and nothing depends on it until the consuming queries switch
over.

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
