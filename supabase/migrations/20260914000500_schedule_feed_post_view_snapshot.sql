-- Daily view snapshot, on the same pg_cron this project already uses for
-- star-expirations-daily and live-session-watchdog.
--
-- 16:50 UTC is 23:50 Asia/Bangkok: the row for Bangkok day D is captured just before
-- day D closes, so views_total is that day's final counter. pg_cron schedules are
-- evaluated in UTC, hence the offset rather than a local-looking "23:50".
--
-- Idempotent: drops any existing job of the same name before scheduling, so re-running
-- the migration cannot leave two jobs snapshotting the same day.
select cron.unschedule('feed-post-view-snapshot-daily')
 where exists (select 1 from cron.job where jobname = 'feed-post-view-snapshot-daily');

select cron.schedule(
  'feed-post-view-snapshot-daily',
  '50 16 * * *',
  $$select public.snapshot_feed_post_views();$$
);
