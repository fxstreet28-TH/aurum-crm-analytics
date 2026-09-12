-- Daily revenue / cost / profit series for the last p_days Bangkok days (inclusive of today).
-- Revenue per day = star markup booked that day + tier commission on stars gifted that day.
-- Tier % is taken from each creator's month-to-date standing, so a creator who climbs a tier
-- mid-month is valued at the tier they are actually in for the month being charted.
-- Cost per day = live session estimated cost that day + daily share of the standing storage
-- charge + playback cost attributed on the day clips were published (best available proxy:
-- feed_posts has no per-day view history).
create or replace function public.get_daily_revenue_trend(p_days int default 30)
returns table (
  day date,
  revenue_thb numeric,
  cost_thb numeric,
  profit_thb numeric,
  stars bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_days int := least(greatest(coalesce(p_days, 30), 1), 365);
  v_end date;
  v_start date;
  v_internal numeric;
begin
  v_end      := (now() at time zone 'Asia/Bangkok')::date;
  v_start    := v_end - (v_days - 1);
  v_internal := public.crm_internal_star_thb();

  return query
  with days as (
    select generate_series(v_start, v_end, interval '1 day')::date as d
  ),
  included as (
    select id from public.creators where excluded_from_analytics = false
  ),
  -- month-to-date stars per creator, used to pick the tier % applied to that creator's gifts
  month_stars as (
    select g.creator_id, coalesce(sum(g.stars_total), 0)::bigint as stars
      from public.live_gifts g
      join included i on i.id = g.creator_id
     where g.created_at >= public.crm_month_start(null)
     group by g.creator_id
  ),
  gift_days as (
    select (g.created_at at time zone 'Asia/Bangkok')::date as d,
           coalesce(sum(g.stars_total), 0)::bigint as stars,
           coalesce(sum(g.stars_total * v_internal
                        * public.crm_tier_pct(coalesce(ms.stars, 0))), 0)::numeric as commission
      from public.live_gifts g
      join included i on i.id = g.creator_id
      left join month_stars ms on ms.creator_id = g.creator_id
     where (g.created_at at time zone 'Asia/Bangkok')::date between v_start and v_end
     group by 1
  ),
  purchase_days as (
    select (sp.completed_at at time zone 'Asia/Bangkok')::date as d,
           coalesce(sum(sp.thb_amount - sp.stars_amount * v_internal), 0)::numeric as markup
      from public.star_purchases sp
      join public.customers cu on cu.user_id = sp.user_id
      left join public.creators cr
             on cr.customer_id = cu.id or cr.user_id = cu.user_id
     where sp.payment_status = 'succeeded'
       and sp.thb_amount > 0
       and coalesce(cr.excluded_from_analytics, false) = false
       and (sp.completed_at at time zone 'Asia/Bangkok')::date between v_start and v_end
     group by 1
  ),
  live_days as (
    select (s.started_at at time zone 'Asia/Bangkok')::date as d,
           coalesce(sum(s.estimated_cost_thb), 0)::numeric as cost
      from public.live_sessions s
      join included i on i.id = s.creator_id
     where (s.started_at at time zone 'Asia/Bangkok')::date between v_start and v_end
     group by 1
  ),
  storage_daily as (
    -- standing monthly storage charge amortised across a 30-day month
    select coalesce(sum(f.file_size_bytes), 0)::numeric / 1e9 * 0.5 / 30.0 as cost
      from public.feed_posts f
      join included i on i.id = f.creator_id
     where f.video_status = 'ready'
  ),
  playback_days as (
    select (f.published_at at time zone 'Asia/Bangkok')::date as d,
           coalesce(sum(f.view_count), 0)::numeric * 0.003 as cost
      from public.feed_posts f
      join included i on i.id = f.creator_id
     where f.video_status = 'ready'
       and (f.published_at at time zone 'Asia/Bangkok')::date between v_start and v_end
     group by 1
  )
  select
    days.d,
    round(coalesce(gd.commission, 0) + coalesce(pd.markup, 0), 2),
    round(coalesce(ld.cost, 0) + coalesce(sd.cost, 0) + coalesce(pbd.cost, 0), 2),
    round((coalesce(gd.commission, 0) + coalesce(pd.markup, 0))
          - (coalesce(ld.cost, 0) + coalesce(sd.cost, 0) + coalesce(pbd.cost, 0)), 2),
    coalesce(gd.stars, 0)
  from days
  left join gift_days     gd  on gd.d  = days.d
  left join purchase_days pd  on pd.d  = days.d
  left join live_days     ld  on ld.d  = days.d
  left join playback_days pbd on pbd.d = days.d
  cross join storage_daily sd
  order by days.d;
end;
$$;

revoke all on function public.get_daily_revenue_trend(int) from public, anon, authenticated;
grant execute on function public.get_daily_revenue_trend(int) to service_role;
