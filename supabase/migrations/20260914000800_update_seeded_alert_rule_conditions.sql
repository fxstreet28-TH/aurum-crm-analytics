-- Settles the two open questions FOLLOWUPS raised about the seeded rules.
--
-- 1. Storage bloat needed a quota to be a percentage OF something.
--    content_tier_limits.storage_quota_gb already exists per content tier, so the
--    percentage is now defined as gb_stored / storage_quota_gb. No new column needed.
--    (Every tier currently sits at 2000 GB, so this rule is quiet until a creator
--    actually approaches 1.6 TB — correct, not broken.)
--
-- 2. Chat spam needed a unique-sender count that the platform does not record.
--    live_sessions has chat_message_count but nothing writes a distinct-sender count,
--    and unique_viewer_count counts viewers rather than chatters. Adding a column that
--    stays 0 would make `unique_senders_lt: 5` true for every session and fire the rule
--    constantly. The condition key is dropped instead: the rule alerts on volume alone
--    and says so.
update public.alert_rules
   set condition_json = condition_json - 'unique_senders_lt',
       description    = 'Detects unusual message volume that may trigger Supabase quota. '
                        || 'Volume only — live_sessions does not record unique senders.',
       updated_at     = now()
 where condition_json ? 'unique_senders_lt';

update public.alert_rules
   set description = 'Warns when storage passes a share of the creator''s tier quota '
                     || '(content_tier_limits.storage_quota_gb) with low playback.',
       updated_at  = now()
 where condition_json ? 'storage_used_pct_gt';

update public.alert_rules
   set description = 'Warns when this month''s projected star finish lands a tier below '
                     || 'the tier the creator closed last month.',
       updated_at  = now()
 where condition_json ? 'days_left_lte';
