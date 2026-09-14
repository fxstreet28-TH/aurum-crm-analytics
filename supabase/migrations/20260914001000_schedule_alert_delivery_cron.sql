-- Every 15 minutes, per the brief. pg_cron, not a Supabase scheduled function: this
-- project already drives star-expirations-daily and live-session-watchdog this way and
-- there is no reason for alerts to introduce a second scheduler.
--
-- Idempotent: any existing job of this name is dropped before scheduling.
select cron.unschedule('alert-delivery-cron')
 where exists (select 1 from cron.job where jobname = 'alert-delivery-cron');

select cron.schedule(
  'alert-delivery-cron',
  '*/15 * * * *',
  $$select public.run_alert_rules();$$
);
