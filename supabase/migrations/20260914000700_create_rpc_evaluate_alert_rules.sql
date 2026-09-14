-- Evaluates every enabled alert rule against the current data and writes one
-- alert_events row per newly-breaching creator. Returns the rows it inserted so the
-- caller can deliver them.
--
-- Evaluation lives in Postgres on purpose: the excluded-creator rule is enforced here,
-- and keeping evaluation in the same place means a future caller cannot bypass it by
-- talking to the tables directly.
--
-- Rules are dispatched on the keys present in condition_json rather than on rule name,
-- so a rule cloned or hand-written through /alerts with the same keys evaluates too.
-- Full semantics for each rule are in docs/alert-rules.md.
create or replace function public.evaluate_alert_rules()
returns table (
  event_id     uuid,
  rule_id      uuid,
  rule_name    text,
  severity     text,
  channels     text[],
  creator_id   uuid,
  handle       text,
  display_name text,
  details      jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
-- The RETURNS TABLE out-params (rule_id, creator_id, severity, details, channels...)
-- share names with columns on alert_events / alert_rules, which makes every reference
-- in the final statement ambiguous. Resolve to the column: nothing in this function
-- reads an out-param as a variable, and every local is prefixed v_ or is the record r.
#variable_conflict use_column
declare
  r               record;
  v_month_start   timestamptz;
  v_month_end     timestamptz;
  v_prev_start    timestamptz;
  v_today         date;
  v_month_days    int;
  v_days_elapsed  int;
  v_days_left     int;
  v_window        interval;
begin
  v_month_start  := public.crm_month_start(null);
  v_month_end    := v_month_start + interval '1 month';
  v_prev_start   := v_month_start - interval '1 month';
  v_today        := (now() at time zone 'Asia/Bangkok')::date;
  v_month_days   := (v_month_end at time zone 'Asia/Bangkok')::date
                    - (v_month_start at time zone 'Asia/Bangkok')::date;
  v_days_elapsed := v_today - (v_month_start at time zone 'Asia/Bangkok')::date + 1;
  v_days_left    := v_month_days - v_days_elapsed;

  create temp table if not exists _alert_candidates (
    rule_id    uuid,
    creator_id uuid,
    severity   text,
    details    jsonb
  ) on commit drop;
  -- truncate, not DELETE: service_role runs with safeupdate, which rejects an
  -- unqualified DELETE, and this function is reached through PostgREST as service_role.
  truncate table _alert_candidates;

  for r in select * from public.alert_rules where enabled = true loop

    -- Rule window, for the rules that measure a rate rather than a standing level.
    v_window := case r.threshold_period
                  when 'hour'  then interval '1 hour'
                  when 'week'  then interval '7 days'
                  when 'month' then interval '30 days'
                  else interval '1 day'
                end;

    ------------------------------------------------------------------
    -- High cost / low revenue
    -- Revenue means what the PLATFORM earns from this creator (tier commission),
    -- not the creator's gross — this dashboard reports the platform's P&L.
    ------------------------------------------------------------------
    if r.condition_json ? 'cost_gt_thb' and r.condition_json ? 'revenue_lt_thb' then
      insert into _alert_candidates
      select r.id, l.creator_id, r.severity,
             jsonb_build_object(
               'rule_kind',            'high_cost_low_revenue',
               'month',                to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM'),
               'cost_thb',             l.total_cost_thb,
               'revenue_thb',          l.platform_thb,
               'profit_thb',           l.profit_thb,
               'live_cost_thb',        l.live_cost_thb,
               'storage_cost_thb',     l.storage_cost_thb,
               'playback_cost_thb',    l.playback_cost_thb,
               'threshold_cost_thb',   (r.condition_json->>'cost_gt_thb')::numeric,
               'threshold_revenue_thb',(r.condition_json->>'revenue_lt_thb')::numeric
             )
        from public.get_creator_leaderboard('profit', 1000, 0, null, false) l
       where l.total_cost_thb > (r.condition_json->>'cost_gt_thb')::numeric
         and l.platform_thb   < (r.condition_json->>'revenue_lt_thb')::numeric;
    end if;

    ------------------------------------------------------------------
    -- Storage bloat
    -- storage_used_pct is measured against content_tier_limits.storage_quota_gb for
    -- the creator's content_tier — the quota the follow-up noted was missing already
    -- exists, so the percentage is real rather than a percentage of nothing.
    ------------------------------------------------------------------
    if r.condition_json ? 'storage_used_pct_gt' then
      insert into _alert_candidates
      select r.id, c.id, r.severity,
             jsonb_build_object(
               'rule_kind',           'storage_bloat',
               'content_tier',        c.content_tier,
               'gb_stored',           round(s.gb, 3),
               'quota_gb',            t.storage_quota_gb,
               'storage_used_pct',    round(s.gb / t.storage_quota_gb * 100, 2),
               'clips',               s.clips,
               'avg_views_per_clip',  round(s.views / s.clips, 2),
               'threshold_pct',       (r.condition_json->>'storage_used_pct_gt')::numeric,
               'threshold_avg_views', (r.condition_json->>'avg_views_per_clip_lt')::numeric
             )
        from public.creators c
        join public.content_tier_limits t on t.tier = c.content_tier
        cross join lateral (
          select coalesce(sum(f.file_size_bytes), 0)::numeric / 1e9 as gb,
                 coalesce(sum(f.view_count), 0)::numeric            as views,
                 count(*)::int                                      as clips
            from public.feed_posts f
           where f.creator_id = c.id
             and f.video_status = 'ready'
        ) s
       where c.excluded_from_analytics = false
         and t.storage_quota_gb > 0
         and s.clips > 0
         and (s.gb / t.storage_quota_gb * 100) > (r.condition_json->>'storage_used_pct_gt')::numeric
         and (
           not (r.condition_json ? 'avg_views_per_clip_lt')
           or (s.views / s.clips) < (r.condition_json->>'avg_views_per_clip_lt')::numeric
         );
    end if;

    ------------------------------------------------------------------
    -- Chat spam risk
    -- live_sessions records chat_message_count but no distinct-sender count, and
    -- nothing on the platform writes one. The unique_senders half of this condition
    -- is therefore dropped rather than faked from unique_viewer_count, which counts
    -- viewers and not chatters. See docs/alert-rules.md.
    ------------------------------------------------------------------
    if r.condition_json ? 'chat_msgs_per_day_gt' then
      insert into _alert_candidates
      select r.id, c.id, r.severity,
             jsonb_build_object(
               'rule_kind',     'chat_spam_risk',
               'window',        r.threshold_period,
               'chat_messages', m.msgs,
               'sessions',      m.sessions,
               'threshold_msgs',(r.condition_json->>'chat_msgs_per_day_gt')::numeric,
               'note',          'unique-sender count is not recorded by live_sessions; volume only'
             )
        from public.creators c
        cross join lateral (
          select coalesce(sum(s.chat_message_count), 0)::bigint as msgs,
                 count(*)::int                                  as sessions
            from public.live_sessions s
           where s.creator_id = c.id
             and s.started_at >= now() - v_window
        ) m
       where c.excluded_from_analytics = false
         and m.msgs > (r.condition_json->>'chat_msgs_per_day_gt')::numeric;
    end if;

    ------------------------------------------------------------------
    -- Tier drop warning
    -- "Drop a tier" is only meaningful against a month the creator has finished, so
    -- this compares the projected finish for THIS month against the tier they
    -- actually closed LAST month. Run rate is month-to-date stars extrapolated over
    -- the whole month. Creators with no previous month are skipped — there is nothing
    -- to drop from.
    ------------------------------------------------------------------
    if r.condition_json ? 'days_left_lte' then
      insert into _alert_candidates
      select r.id, c.id, r.severity,
             jsonb_build_object(
               'rule_kind',        'tier_drop_warning',
               'month',            to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM'),
               'days_left',        v_days_left,
               'stars_mtd',        cur.mtd,
               'projected_stars',  round(cur.mtd::numeric / greatest(v_days_elapsed, 1) * v_month_days),
               'projected_tier',   public.crm_tier_of(
                                     (cur.mtd::numeric / greatest(v_days_elapsed, 1) * v_month_days)::bigint),
               'previous_month_stars', pm.prev,
               'previous_month_tier',  public.crm_tier_of(pm.prev)
             )
        from public.creators c
        cross join lateral (
          select coalesce(sum(g.stars_total), 0)::bigint as mtd
            from public.live_gifts g
           where g.creator_id = c.id
             and g.created_at >= v_month_start
             and g.created_at <  v_month_end
        ) cur
        cross join lateral (
          select coalesce(sum(g.stars_total), 0)::bigint as prev
            from public.live_gifts g
           where g.creator_id = c.id
             and g.created_at >= v_prev_start
             and g.created_at <  v_month_start
        ) pm
       where c.excluded_from_analytics = false
         and v_days_left <= (r.condition_json->>'days_left_lte')::int
         and pm.prev > 0
         and public.crm_tier_of(
               (cur.mtd::numeric / greatest(v_days_elapsed, 1) * v_month_days)::bigint
             ) < public.crm_tier_of(pm.prev);
    end if;

  end loop;

  -- One statement: insert the breaches that are not already open, bump the rule
  -- counters by however many actually landed, and hand the caller the new rows.
  -- The data-modifying CTEs run to completion whether or not the outer select reads
  -- them, so `bump` fires even though nothing selects from it.
  return query
  with candidates as (
    select distinct on (c.rule_id, c.creator_id)
           c.rule_id, c.creator_id, c.severity, c.details
      from _alert_candidates c
  ),
  ins as (
    insert into public.alert_events (rule_id, creator_id, severity, details_json, status)
    select cd.rule_id, cd.creator_id, cd.severity, cd.details, 'active'
      from candidates cd
    on conflict (rule_id, creator_id) where status = 'active' do nothing
    returning id, rule_id, creator_id, severity, details_json
  ),
  bump as (
    update public.alert_rules ar
       set triggered_count   = ar.triggered_count + agg.n,
           last_triggered_at = now(),
           updated_at        = now()
      from (select i.rule_id, count(*) as n from ins i group by i.rule_id) agg
     where ar.id = agg.rule_id
    returning ar.id
  )
  select i.id, i.rule_id, ar.name, i.severity, ar.channels,
         i.creator_id, cr.handle, cr.display_name, i.details_json
    from ins i
    join public.alert_rules ar on ar.id = i.rule_id
    left join public.creators cr on cr.id = i.creator_id;
end;
$$;

revoke all on function public.evaluate_alert_rules() from public, anon, authenticated;
grant execute on function public.evaluate_alert_rules() to service_role;

comment on function public.evaluate_alert_rules() is
  'Evaluates enabled alert_rules, inserts one alert_events row per newly-breaching creator (suppressed while an active event already exists for that rule+creator), bumps rule counters, and returns the inserted rows for delivery.';
