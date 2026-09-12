-- Per-creator infra cost split for one Bangkok calendar month.
-- SCHEMA NOTES (verified 2026-09-12), differing from the original spec:
--   * live_sessions cost column is `estimated_cost_thb` (spec assumed `total_cost_thb`).
--     live_sessions also exposes duration_seconds, peak_viewer_count, total_viewer_minutes,
--     chat_message_count -- all used below instead of deriving from started_at/ended_at alone.
--   * feed_posts size column is `file_size_bytes` (spec assumed `video_size_bytes`) and there
--     is NO deleted_at column, so no soft-delete filter is applied.
-- Cost constants: Bunny SG storage 0.50 THB/GB/month, playback 0.003 THB/view,
-- chat 0 (Supabase Realtime free tier).
create or replace function public.get_creator_cost_breakdown(
  p_creator_id uuid,
  p_month text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_live_cost numeric := 0;
  v_live_hours numeric := 0;
  v_viewer_hours numeric := 0;
  v_sessions int := 0;
  v_chat_msgs bigint := 0;
  v_storage_gb numeric := 0;
  v_storage_cost numeric := 0;
  v_clips int := 0;
  v_views bigint := 0;
  v_playback_cost numeric := 0;
  v_chat_cost numeric := 0;
begin
  v_month_start := public.crm_month_start(p_month);
  v_month_end   := v_month_start + interval '1 month';

  select
    coalesce(sum(estimated_cost_thb), 0),
    coalesce(sum(coalesce(duration_seconds,
                          extract(epoch from (ended_at - started_at)))) / 3600.0, 0),
    coalesce(sum(coalesce(total_viewer_minutes,
                          coalesce(peak_viewer_count, 0)
                          * coalesce(duration_seconds, 0) / 60.0)) / 60.0, 0),
    count(*),
    coalesce(sum(chat_message_count), 0)
  into v_live_cost, v_live_hours, v_viewer_hours, v_sessions, v_chat_msgs
  from public.live_sessions
  where creator_id = p_creator_id
    and started_at >= v_month_start
    and started_at <  v_month_end;

  -- Storage is a standing monthly charge on everything currently stored, not month-scoped.
  select coalesce(sum(file_size_bytes), 0) / 1e9, count(*)
  into v_storage_gb, v_clips
  from public.feed_posts
  where creator_id = p_creator_id
    and video_status = 'ready';

  v_storage_cost := v_storage_gb * 0.5;

  select coalesce(sum(view_count), 0) into v_views
  from public.feed_posts
  where creator_id = p_creator_id
    and video_status = 'ready';

  v_playback_cost := v_views * 0.003;
  v_chat_cost := 0;

  return jsonb_build_object(
    'month', to_char(v_month_start at time zone 'Asia/Bangkok', 'YYYY-MM'),
    'live', jsonb_build_object(
      'cost_thb', round(v_live_cost, 2),
      'hours', round(v_live_hours, 2),
      'viewer_hours', round(v_viewer_hours, 2),
      'sessions', v_sessions),
    'storage', jsonb_build_object(
      'cost_thb', round(v_storage_cost, 2),
      'gb_stored', round(v_storage_gb, 3),
      'clips', v_clips),
    'playback', jsonb_build_object(
      'cost_thb', round(v_playback_cost, 2),
      'views', v_views),
    'chat', jsonb_build_object(
      'cost_thb', round(v_chat_cost, 2),
      'messages', v_chat_msgs),
    'total_cost_thb', round(v_live_cost + v_storage_cost + v_playback_cost + v_chat_cost, 2)
  );
end;
$$;

revoke all on function public.get_creator_cost_breakdown(uuid, text) from public, anon, authenticated;
grant execute on function public.get_creator_cost_breakdown(uuid, text) to service_role;
