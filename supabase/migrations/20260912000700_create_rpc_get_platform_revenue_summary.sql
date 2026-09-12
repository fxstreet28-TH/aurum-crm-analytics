-- Platform P&L for one Bangkok calendar month.
-- SCHEMA NOTES (verified 2026-09-12), differing from the original spec:
--   * star_purchases has NO customer_id -> it carries user_id (auth.users.id), joined to
--     customers.user_id, then to creators via customer_id OR user_id.
--   * the status column is `payment_status`, and its only live value is 'succeeded'
--     (the spec assumed a `status` column holding 'completed').
--   * markup is derived as (thb_amount - stars_amount * internal_thb_per_star) rather than
--     (retail_thb_per_star - 10) * stars, because admin-credited grants carry
--     retail_thb_per_star = 0 and thb_amount = 0; those are not sales, so rows with
--     thb_amount <= 0 are excluded instead of counting as negative markup.
--   * creators has NO is_active column, so every non-excluded creator is counted.
create or replace function public.get_platform_revenue_summary(p_month text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_month_key text;
  v_internal numeric;
  v_markup numeric := 0;
  v_gross numeric := 0;
  v_stars_sold bigint := 0;
  v_orders int := 0;
  v_tier_commission numeric := 0;
  v_creator_payout numeric := 0;
  v_gift_stars bigint := 0;
  v_infra numeric := 0;
begin
  v_month_start := public.crm_month_start(p_month);
  v_month_end   := v_month_start + interval '1 month';
  v_month_key   := to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM');
  v_internal    := public.crm_internal_star_thb();

  -- Star markup from real (paid) purchases by non-excluded accounts.
  select
    coalesce(sum(sp.thb_amount - sp.stars_amount * v_internal), 0),
    coalesce(sum(sp.thb_amount), 0),
    coalesce(sum(sp.stars_amount), 0),
    count(*)
  into v_markup, v_gross, v_stars_sold, v_orders
  from public.star_purchases sp
  join public.customers cu on cu.user_id = sp.user_id
  left join public.creators cr
         on cr.customer_id = cu.id or cr.user_id = cu.user_id
  where sp.payment_status = 'succeeded'
    and sp.thb_amount > 0
    and sp.completed_at >= v_month_start
    and sp.completed_at <  v_month_end
    and coalesce(cr.excluded_from_analytics, false) = false;

  -- Tier commission across all non-excluded creators, set-based (no per-creator loop).
  with monthly as (
    select c.id,
           coalesce(sum(g.stars_total), 0)::bigint as stars
      from public.creators c
      left join public.live_gifts g
             on g.creator_id = c.id
            and g.created_at >= v_month_start
            and g.created_at <  v_month_end
     where c.excluded_from_analytics = false
     group by c.id
  )
  select
    coalesce(sum(stars * v_internal * public.crm_tier_pct(stars)), 0),
    coalesce(sum(stars * v_internal * (1 - public.crm_tier_pct(stars))), 0),
    coalesce(sum(stars), 0)
  into v_tier_commission, v_creator_payout, v_gift_stars
  from monthly;

  select coalesce(total_spent_thb, 0) into v_infra
    from public.platform_budget_state
   where month_key = v_month_key;

  return jsonb_build_object(
    'month', v_month_key,
    'star_markup_thb', round(v_markup, 2),
    'star_gross_thb', round(v_gross, 2),
    'stars_sold', v_stars_sold,
    'orders_count', v_orders,
    'gift_stars', v_gift_stars,
    'tier_commission_thb', round(v_tier_commission, 2),
    'creator_payout_thb', round(v_creator_payout, 2),
    'total_revenue_thb', round(v_markup + v_tier_commission, 2),
    'infra_cost_thb', round(coalesce(v_infra, 0), 2),
    'net_profit_thb', round(v_markup + v_tier_commission - coalesce(v_infra, 0), 2)
  );
end;
$$;

revoke all on function public.get_platform_revenue_summary(text) from public, anon, authenticated;
grant execute on function public.get_platform_revenue_summary(text) to service_role;
