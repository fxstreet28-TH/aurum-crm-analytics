-- Creator leaderboard: tier commission earned by the platform vs infra cost caused,
-- for one Bangkok calendar month. Set-based (no per-creator RPC loop) to avoid N+1.
-- p_sort: 'profit' | 'margin' | 'hours' | 'stars'. Excluded creators are never returned
-- unless p_include_excluded is explicitly true (Settings page only).
create or replace function public.get_creator_leaderboard(
  p_sort text default 'profit',
  p_limit int default 20,
  p_offset int default 0,
  p_month text default null,
  p_include_excluded boolean default false
)
returns table (
  creator_id uuid,
  handle text,
  display_name text,
  excluded_from_analytics boolean,
  stars bigint,
  tier int,
  tier_pct numeric,
  platform_thb numeric,
  creator_thb numeric,
  live_cost_thb numeric,
  storage_cost_thb numeric,
  playback_cost_thb numeric,
  total_cost_thb numeric,
  profit_thb numeric,
  margin_pct numeric,
  live_hours numeric,
  sessions_count int,
  total_rows bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_internal numeric;
begin
  v_month_start := public.crm_month_start(p_month);
  v_month_end   := v_month_start + interval '1 month';
  v_internal    := public.crm_internal_star_thb();

  return query
  with base as (
    select c.id, c.handle, c.display_name, c.excluded_from_analytics
      from public.creators c
     where p_include_excluded or c.excluded_from_analytics = false
  ),
  gifts as (
    select b.id, coalesce(sum(g.stars_total), 0)::bigint as stars
      from base b
      left join public.live_gifts g
             on g.creator_id = b.id
            and g.created_at >= v_month_start
            and g.created_at <  v_month_end
     group by b.id
  ),
  live as (
    select b.id,
           coalesce(sum(s.estimated_cost_thb), 0)::numeric as live_cost,
           coalesce(sum(coalesce(s.duration_seconds,
                                 extract(epoch from (s.ended_at - s.started_at)))), 0)::numeric / 3600.0 as hours,
           count(s.id)::int as sessions
      from base b
      left join public.live_sessions s
             on s.creator_id = b.id
            and s.started_at >= v_month_start
            and s.started_at <  v_month_end
     group by b.id
  ),
  clips as (
    select b.id,
           coalesce(sum(f.file_size_bytes), 0)::numeric / 1e9 * 0.5 as storage_cost,
           coalesce(sum(f.view_count), 0)::numeric * 0.003 as playback_cost
      from base b
      left join public.feed_posts f
             on f.creator_id = b.id
            and f.video_status = 'ready'
     group by b.id
  ),
  calc as (
    select b.id, b.handle, b.display_name, b.excluded_from_analytics,
           g.stars,
           public.crm_tier_of(g.stars) as tier,
           public.crm_tier_pct(g.stars) as pct,
           round(g.stars * v_internal * public.crm_tier_pct(g.stars), 2) as platform_thb,
           round(g.stars * v_internal * (1 - public.crm_tier_pct(g.stars)), 2) as creator_thb,
           round(l.live_cost, 2) as live_cost,
           round(cl.storage_cost, 2) as storage_cost,
           round(cl.playback_cost, 2) as playback_cost,
           round(l.hours, 2) as hours,
           l.sessions
      from base b
      join gifts g  on g.id = b.id
      join live  l  on l.id = b.id
      join clips cl on cl.id = b.id
  ),
  final as (
    select c.*,
           round(c.live_cost + c.storage_cost + c.playback_cost, 2) as total_cost,
           round(c.platform_thb - (c.live_cost + c.storage_cost + c.playback_cost), 2) as profit
      from calc c
  )
  select f.id, f.handle, f.display_name, f.excluded_from_analytics,
         f.stars, f.tier, f.pct,
         f.platform_thb, f.creator_thb,
         f.live_cost, f.storage_cost, f.playback_cost,
         f.total_cost, f.profit,
         case when f.platform_thb > 0
              then round(f.profit / f.platform_thb * 100, 1)
              else null end,
         f.hours, f.sessions,
         count(*) over () as total_rows
    from final f
   order by
     case when p_sort = 'profit' then f.profit end desc nulls last,
     case when p_sort = 'margin' then
       (case when f.platform_thb > 0 then f.profit / f.platform_thb else null end) end desc nulls last,
     case when p_sort = 'hours'  then f.hours end desc nulls last,
     case when p_sort = 'stars'  then f.stars end desc nulls last,
     f.id
   limit greatest(p_limit, 0) offset greatest(p_offset, 0);
end;
$$;

revoke all on function public.get_creator_leaderboard(text, int, int, text, boolean) from public, anon, authenticated;
grant execute on function public.get_creator_leaderboard(text, int, int, text, boolean) to service_role;
