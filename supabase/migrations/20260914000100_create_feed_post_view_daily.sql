-- Daily snapshot of feed_posts.view_count, one row per ready clip per Bangkok day.
--
-- feed_posts.view_count is a running total with no history, which back-loads playback
-- cost onto a clip's publish date and makes "stale" unanswerable for a clip that was
-- watched heavily last year and ignored since. This table is the missing history.
--
-- views_total is the raw counter as observed; views_delta is the derived day-over-day
-- movement, clamped at zero so a counter reset cannot produce a negative day.
create table if not exists public.feed_post_view_daily (
  post_id     uuid not null references public.feed_posts(id) on delete cascade,
  -- Denormalised from feed_posts so a per-creator series never has to join back.
  creator_id  uuid not null references public.creators(id) on delete cascade,
  day         date not null,
  views_total bigint not null,
  views_delta bigint not null,
  captured_at timestamptz not null default now(),
  primary key (post_id, day)
);

-- Covering index: a 30- or 90-day creator series is answered index-only, no heap
-- fetch and no scan of the wider row.
create index if not exists idx_feed_post_view_daily_creator_day
  on public.feed_post_view_daily (creator_id, day desc)
  include (views_delta, views_total);

-- Platform-wide day rollups (all creators, one day).
create index if not exists idx_feed_post_view_daily_day
  on public.feed_post_view_daily (day desc);

alter table public.feed_post_view_daily enable row level security;

drop policy if exists "feed_post_view_daily_super_admin_read" on public.feed_post_view_daily;
create policy "feed_post_view_daily_super_admin_read" on public.feed_post_view_daily
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

-- Written only by the snapshot function (security definer) and read by the analytics
-- RPCs, which are granted to service_role alone. Clients get nothing directly.
revoke all on table public.feed_post_view_daily from public, anon, authenticated;
grant select on table public.feed_post_view_daily to service_role;

comment on table public.feed_post_view_daily is
  'Daily snapshot of feed_posts.view_count. Written by snapshot_feed_post_views() on a pg_cron schedule; history starts the day the table shipped and cannot be backfilled further.';
