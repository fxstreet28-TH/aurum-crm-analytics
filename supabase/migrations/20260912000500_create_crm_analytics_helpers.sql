-- Shared immutable helpers so tier thresholds and month-window maths are defined once.
-- Tier ladder (stars received in the Bangkok calendar month):
--   T1 0-5000 -> 30% platform | T2 5001-40000 -> 25% | T3 40001-129999 -> 20% | T4 130000+ -> 15%

create or replace function public.crm_tier_of(p_stars bigint)
returns int language sql immutable set search_path = pg_catalog as $$
  select case
    when coalesce(p_stars, 0) >= 130000 then 4
    when coalesce(p_stars, 0) >= 40001  then 3
    when coalesce(p_stars, 0) >= 5001   then 2
    else 1
  end;
$$;

create or replace function public.crm_tier_pct(p_stars bigint)
returns numeric language sql immutable set search_path = pg_catalog as $$
  select case public.crm_tier_of(p_stars)
    when 4 then 0.15 when 3 then 0.20 when 2 then 0.25 else 0.30
  end::numeric;
$$;

create or replace function public.crm_tier_next_threshold(p_stars bigint)
returns int language sql immutable set search_path = pg_catalog as $$
  select case public.crm_tier_of(p_stars)
    when 4 then null when 3 then 130000 when 2 then 40001 else 5001
  end;
$$;

-- Start of a Bangkok calendar month as a UTC timestamptz.
-- p_month is 'YYYY-MM'; null means the current Bangkok month.
create or replace function public.crm_month_start(p_month text default null)
returns timestamptz language sql stable set search_path = pg_catalog as $$
  select case
    when p_month is null
      then (date_trunc('month', (now() at time zone 'Asia/Bangkok'))) at time zone 'Asia/Bangkok'
    else (to_date(p_month || '-01', 'YYYY-MM-DD')::timestamp) at time zone 'Asia/Bangkok'
  end;
$$;

-- Active internal (cost) value of one star in THB, from star_pricing_config.
create or replace function public.crm_internal_star_thb()
returns numeric language sql stable set search_path = public, pg_catalog as $$
  select coalesce(
    (select internal_thb_per_star from public.star_pricing_config
      where is_active = true
        and valid_from <= now()
        and (valid_to is null or valid_to > now())
      order by valid_from desc limit 1),
    10::numeric);
$$;

revoke all on function public.crm_tier_of(bigint) from public, anon, authenticated;
revoke all on function public.crm_tier_pct(bigint) from public, anon, authenticated;
revoke all on function public.crm_tier_next_threshold(bigint) from public, anon, authenticated;
revoke all on function public.crm_month_start(text) from public, anon, authenticated;
revoke all on function public.crm_internal_star_thb() from public, anon, authenticated;
grant execute on function public.crm_tier_of(bigint) to service_role;
grant execute on function public.crm_tier_pct(bigint) to service_role;
grant execute on function public.crm_tier_next_threshold(bigint) to service_role;
grant execute on function public.crm_month_start(text) to service_role;
grant execute on function public.crm_internal_star_thb() to service_role;
