-- Captures one feed_post_view_daily row per ready clip for a Bangkok day.
--
-- Idempotent: re-running for the same day overwrites that day's row rather than
-- duplicating it, so a retried cron run or a manual catch-up is safe.
--
-- views_delta is measured against the most recent EARLIER snapshot, not against
-- "yesterday", so a missed day is absorbed into the next one instead of being lost.
-- The first snapshot for a post has no predecessor and therefore records delta 0 —
-- the counter's existing value is history that did not happen on that day.
create or replace function public.snapshot_feed_post_views(p_day date default null)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day  date;
  v_rows int;
begin
  v_day := coalesce(p_day, (now() at time zone 'Asia/Bangkok')::date);

  insert into public.feed_post_view_daily
    (post_id, creator_id, day, views_total, views_delta, captured_at)
  select
    f.id,
    f.creator_id,
    v_day,
    coalesce(f.view_count, 0)::bigint,
    -- Clamp at zero: a view_count reset would otherwise book a nonsense negative day.
    greatest(
      coalesce(f.view_count, 0)::bigint
        - coalesce(prev.views_total, coalesce(f.view_count, 0)::bigint),
      0
    ),
    now()
  from public.feed_posts f
  left join lateral (
    select d.views_total
      from public.feed_post_view_daily d
     where d.post_id = f.id
       and d.day < v_day
     order by d.day desc
     limit 1
  ) prev on true
  where f.video_status = 'ready'
  on conflict (post_id, day) do update
    set views_total = excluded.views_total,
        views_delta = excluded.views_delta,
        captured_at = excluded.captured_at;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

revoke all on function public.snapshot_feed_post_views(date) from public, anon, authenticated;
grant execute on function public.snapshot_feed_post_views(date) to service_role;

comment on function public.snapshot_feed_post_views(date) is
  'Snapshots feed_posts.view_count into feed_post_view_daily for one Bangkok day. Idempotent per day. Returns rows written.';
