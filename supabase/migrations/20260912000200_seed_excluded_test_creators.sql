-- Marks Por's 3 test/personal accounts as excluded from analytics.
-- creators links to customers by customer_id; some rows only carry user_id, so match either.
update public.creators c
   set excluded_from_analytics = true
  from public.customers cu
 where cu.email in ('porforex599@gmail.com', 'porinw911911@gmail.com', 'porches911911@gmail.com')
   and (c.customer_id = cu.id or c.user_id = cu.user_id);

do $$
declare v_count int;
begin
  select count(*) into v_count from public.creators where excluded_from_analytics = true;
  raise notice 'Excluded % test creators from analytics', v_count;
end $$;
