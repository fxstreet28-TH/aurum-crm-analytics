-- Baseline snapshot.
--
-- The per-day history genuinely does not exist before this table shipped — there is
-- nothing to reconstruct it from. What CAN be captured is today's counter as the
-- starting line, so tomorrow's run has a predecessor to diff against and books a real
-- delta instead of skipping a day.
--
-- Every baseline row therefore carries views_delta = 0: the views it counts happened
-- before this table existed and must not be attributed to the day it shipped.
select public.snapshot_feed_post_views();
