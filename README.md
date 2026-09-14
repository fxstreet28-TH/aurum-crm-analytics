# AURUM CRM Analytics

Internal CRM dashboard for the AURUM Live platform: infra cost, platform profit and
creator health, in one place for the platform owner.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Radix primitives · Recharts ·
Supabase SSR.

## What it shows

| Route | Purpose |
| --- | --- |
| `/` | Overview — revenue, infra cost, net profit, at-risk creators, 30-day trend, leaderboard |
| `/creators` | Searchable, filterable creator list with profit and margin per creator |
| `/creators/[creatorId]` | One creator: tier progress, cost split, stored clips, recent sessions |
| `/revenue` | Star markup, purchase slots, and the per-creator tier commission table |
| `/purchases` | Completed star orders ledger |
| `/alerts` | Alert rules (toggle, channels, create) and alert history |
| `/reports` | Weekly revenue vs cost, cost mix, tier distribution, month-on-month |
| `/storage` | Stored clips, cost by tier, largest clips, stale content |
| `/settings` | Analytics exclusion list and account info |
| `/help` | How every number is calculated |

## Access control

Only `profiles.role = 'super_admin'` gets past `/login`.

Three layers, deliberately:

1. **Proxy** (`src/proxy.ts`) — redirects unauthenticated or non-admin traffic.
   This is a UX redirect, not a security boundary. Next 16 renamed the `middleware`
   file convention to `proxy`; the runtime is Node, not edge.
2. **Dashboard layout** — re-verifies the session server-side before rendering any
   financial figure.
3. **Server actions** — `requireSuperAdmin()` proves the caller's role against their
   own session cookie before any write. This matters because mutations run through the
   service-role client, which bypasses RLS entirely.

Every analytics RPC is `REVOKE`d from `anon` and `authenticated` and granted to
`service_role` only, so the dashboard is the sole path to these figures.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Used for the auth session only |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Required — every RPC is service-role-gated |

`.env.local` is gitignored. Never commit the service-role key; set it in Vercel
project settings for deployments.

Alert delivery needs **no Vercel variables**. The `alert-delivery-cron` Edge Function
runs inside Supabase, so its Telegram and Resend credentials live in the Supabase vault
and Edge Function secrets — see [`docs/alert-rules.md`](docs/alert-rules.md).

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in the keys
pnpm dev
```

Checks:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm build       # production build
```

## Database

Migrations live in `supabase/migrations/` and are applied to project
`hknvooaqgpufrbdxtzxf` (shared with `creator-livetech`).

New objects:

- `creators.excluded_from_analytics` — the manual test-account exclusion flag
- `alert_rules`, `alert_events` — RLS-locked to `super_admin`
- `crm_tier_of` / `crm_tier_pct` / `crm_tier_next_threshold` / `crm_month_start` /
  `crm_internal_star_thb` — shared helpers so tier and month maths are defined once
- `feed_post_view_daily` + `snapshot_feed_post_views` — nightly view-count history
- `evaluate_alert_rules` / `run_alert_rules` — alert evaluation and the 15-minute
  delivery cron; see [`docs/alert-rules.md`](docs/alert-rules.md)
- `get_creator_current_tier`, `get_platform_revenue_summary`,
  `get_creator_cost_breakdown`, `get_star_purchase_slot_performance`,
  `get_creator_leaderboard`, `get_daily_revenue_trend`, `get_creator_view_trend`

Every one of those RPCs filters `excluded_from_analytics = true` **inside the
database**, so no caller — this app or any future one — can let test data into
production metrics.

Regenerate types after a schema change:

```bash
pnpm dlx supabase gen types typescript --project-id hknvooaqgpufrbdxtzxf \
  > src/lib/types/database.ts
```

## Conventions

- Money is always THB, formatted with `Intl.NumberFormat('th-TH')` as `฿ 12,345`.
- Timestamps are stored UTC and displayed in Bangkok time (ICT).
- Server Components by default; `'use client'` only where interaction demands it.
- Filter and sort state lives in the URL so any view is linkable and reloadable.

## Deploy

Vercel, git-linked, framework preset Next.js. Set all three Supabase variables on
Production, Preview and Development. Custom domain `analytics.creatorlivetech.com`
via a proxied Cloudflare CNAME to `cname.vercel-dns.com`.

## Known follow-ups

- `feed_posts.file_size_bytes` is never populated, so every storage figure on the
  dashboard is computed from 0 bytes and is understated. Upstream upload-pipeline gap.
- Playback cost is still attributed to each clip's publish date. `feed_post_view_daily`
  now snapshots real per-day movement, but the cost queries only switch over once ~30
  days of history have accumulated — see `FOLLOWUPS.md`.
- Desktop-first: no layout work below 768px.
