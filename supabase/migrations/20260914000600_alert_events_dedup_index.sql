-- De-duplication for alert delivery.
--
-- The cron evaluates every 15 minutes. Without this, a creator who is over threshold
-- stays over threshold and re-fires 96 times a day, which buries the real signal and
-- spams Telegram — the exact failure mode FOLLOWUPS called out as the risk here.
--
-- A rule+creator pair can hold at most one 'active' event. Re-firing only becomes
-- possible once that event is resolved, which is a deliberate human act on /alerts.
-- 'watch' is intentionally not covered: parking an event as watch does not suppress
-- a fresh breach.
create unique index if not exists uq_alert_events_active_rule_creator
  on public.alert_events (rule_id, creator_id)
  where status = 'active';
