-- Current-month tier + commission split for one creator.
-- SCHEMA NOTE (verified 2026-09-12): live_gifts columns are
--   (id, session_id, creator_id, sender_id, tier_id, quantity, stars_total, message, created_at).
-- The spec assumed `stars_amount` / `sent_at`; the real columns are `stars_total` / `created_at`.
create or replace function public.get_creator_current_tier(
  p_creator_id uuid,
  p_month text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_stars bigint := 0;
  v_tier int;
  v_pct numeric;
  v_next int;
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_internal numeric;
  v_value numeric;
  v_excluded boolean;
begin
  select excluded_from_analytics into v_excluded
    from public.creators where id = p_creator_id;

  if v_excluded is null then
    return jsonb_build_object('error', 'creator_not_found', 'creator_id', p_creator_id);
  end if;

  v_month_start := public.crm_month_start(p_month);
  v_month_end   := v_month_start + interval '1 month';

  if v_excluded then
    return jsonb_build_object(
      'month', to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM'),
      'tier', 0, 'stars_this_month', 0, 'internal_value_thb', 0,
      'tier_pct', 0, 'platform_thb', 0, 'creator_thb', 0,
      'next_threshold', null, 'to_next_stars', 0, 'excluded', true
    );
  end if;

  select coalesce(sum(stars_total), 0) into v_stars
    from public.live_gifts
   where creator_id = p_creator_id
     and created_at >= v_month_start
     and created_at <  v_month_end;

  -- TODO: fold in PPV / subscription / tip earnings once those tables carry data.

  v_tier     := public.crm_tier_of(v_stars);
  v_pct      := public.crm_tier_pct(v_stars);
  v_next     := public.crm_tier_next_threshold(v_stars);
  v_internal := public.crm_internal_star_thb();
  v_value    := v_stars * v_internal;

  return jsonb_build_object(
    'month', to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM'),
    'tier', v_tier,
    'stars_this_month', v_stars,
    'internal_value_thb', round(v_value, 2),
    'tier_pct', v_pct,
    'platform_thb', round(v_value * v_pct, 2),
    'creator_thb', round(v_value * (1 - v_pct), 2),
    'next_threshold', v_next,
    'to_next_stars', case when v_next is null then 0 else greatest(v_next - v_stars, 0) end,
    'excluded', false
  );
end;
$$;

revoke all on function public.get_creator_current_tier(uuid, text) from public, anon, authenticated;
grant execute on function public.get_creator_current_tier(uuid, text) to service_role;
