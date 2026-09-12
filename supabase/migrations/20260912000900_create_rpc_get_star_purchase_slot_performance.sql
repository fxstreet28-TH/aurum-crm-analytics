-- Star purchase slot (bundle size) performance for one Bangkok calendar month.
-- SCHEMA NOTES: see get_platform_revenue_summary -- star_purchases joins via user_id,
-- the status column is payment_status ('succeeded'), and unpaid admin grants
-- (thb_amount <= 0) are excluded so they cannot show up as negative markup.
create or replace function public.get_star_purchase_slot_performance(p_month text default null)
returns table (
  stars_per_slot int,
  slot_label text,
  retail_thb numeric,
  internal_thb numeric,
  markup_per_order numeric,
  orders_count int,
  stars_sold bigint,
  total_profit_thb numeric
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
  select
    sp.stars_amount::int,
    case sp.stars_amount
      when 10  then 'min purchase'
      when 50  then 'popular'
      when 100 then 'bundle'
      when 500 then 'whale'
      else 'custom'
    end::text,
    round(avg(sp.thb_amount), 2),
    round(avg(sp.stars_amount * v_internal), 2),
    round(avg(sp.thb_amount - sp.stars_amount * v_internal), 2),
    count(*)::int,
    coalesce(sum(sp.stars_amount), 0)::bigint,
    round(coalesce(sum(sp.thb_amount - sp.stars_amount * v_internal), 0), 2)
  from public.star_purchases sp
  join public.customers cu on cu.user_id = sp.user_id
  left join public.creators cr
         on cr.customer_id = cu.id or cr.user_id = cu.user_id
  where sp.payment_status = 'succeeded'
    and sp.thb_amount > 0
    and sp.completed_at >= v_month_start
    and sp.completed_at <  v_month_end
    and coalesce(cr.excluded_from_analytics, false) = false
  group by sp.stars_amount
  order by sp.stars_amount;
end;
$$;

revoke all on function public.get_star_purchase_slot_performance(text) from public, anon, authenticated;
grant execute on function public.get_star_purchase_slot_performance(text) to service_role;
