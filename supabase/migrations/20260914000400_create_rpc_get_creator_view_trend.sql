-- Per-creator daily view series for the last p_days Bangkok days (inclusive of today).
--
-- Dense: days with no snapshot come back as zero rather than as a gap, so a chart
-- shows a flat line instead of interpolating across missing dates.
--
-- `has_history` distinguishes "nobody watched anything that day" from "this table was
-- not capturing yet", which the UI needs in order to be honest about the short series
-- it has while history accumulates.
create or replace function public.get_creator_view_trend(
  p_creator_id uuid,
  p_days int default 30
)
returns table (
  day date,
  views bigint,
  views_total bigint,
  has_history boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_days  int := least(greatest(coalesce(p_days, 30), 1), 365);
  v_end   date;
  v_start date;
begin
  v_end   := (now() at time zone 'Asia/Bangkok')::date;
  v_start := v_end - (v_days - 1);

  return query
  with days as (
    select generate_series(v_start, v_end, interval '1 day')::date as d
  ),
  -- Indexed on (creator_id, day desc) include (views_delta, views_total): this is an
  -- index-only range scan, never a table scan.
  snap as (
    select v.day,
           sum(v.views_delta)::bigint as delta,
           sum(v.views_total)::bigint as total
      from public.feed_post_view_daily v
     where v.creator_id = p_creator_id
       and v.day between v_start and v_end
     group by v.day
  )
  select days.d,
         coalesce(s.delta, 0)::bigint,
         coalesce(s.total, 0)::bigint,
         s.day is not null
    from days
    left join snap s on s.day = days.d
   order by days.d;
end;
$$;

revoke all on function public.get_creator_view_trend(uuid, int) from public, anon, authenticated;
grant execute on function public.get_creator_view_trend(uuid, int) to service_role;
