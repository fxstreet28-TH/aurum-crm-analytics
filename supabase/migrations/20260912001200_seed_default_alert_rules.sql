-- Four starter alert rules. Idempotent on name so re-running the migration cannot duplicate.
insert into public.alert_rules (name, description, condition_json, threshold_period, channels, severity, enabled)
select v.name, v.description, v.condition_json::jsonb, v.threshold_period, v.channels, v.severity, v.enabled
from (values
  ('High cost / low revenue',
   'Flags creators spending more than they earn',
   '{"cost_gt_thb": 1000, "revenue_lt_thb": 3000}',
   'day', array['telegram','email']::text[], 'critical', true),
  ('Storage bloat',
   'Warns when storage approaches quota with low playback',
   '{"storage_used_pct_gt": 80, "avg_views_per_clip_lt": 100}',
   'day', array['telegram','in_app']::text[], 'warning', true),
  ('Chat spam risk',
   'Detects unusual message volume that may trigger Supabase quota',
   '{"chat_msgs_per_day_gt": 10000, "unique_senders_lt": 5}',
   'day', array['telegram']::text[], 'warning', true),
  ('Tier drop warning',
   'Alerts creator when they may drop a tier next month',
   '{"days_left_lte": 7, "projected_stars_lt_current_tier": true}',
   'week', array['in_app']::text[], 'info', false)
) as v(name, description, condition_json, threshold_period, channels, severity, enabled)
where not exists (select 1 from public.alert_rules r where r.name = v.name);
