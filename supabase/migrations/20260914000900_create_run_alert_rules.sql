-- pg_cron entry point for alert delivery.
--
-- Same shape as run_live_watchdog(): the schedule lives in pg_cron, the DB does the
-- evaluation, and an Edge Function does the outbound delivery — Postgres cannot call
-- the Telegram or Resend APIs itself. Secrets come from the vault, never from a
-- migration, and the function no-ops loudly rather than silently if they are absent.
--
-- Non-secret configuration (the function URL, and the delivery mode switch) is seeded
-- here; the credentials it references already exist in this project's vault.
-- vault.create_secret(), not a direct insert: the secrets table is only writable
-- through it (a plain insert is denied on _crypto_aead_det_noncegen).
select vault.create_secret(
         'https://hknvooaqgpufrbdxtzxf.supabase.co/functions/v1/alert-delivery-cron',
         'edge_function_alert_delivery_url',
         'URL of the alert-delivery-cron Edge Function, POSTed by run_alert_rules() over pg_net.')
 where not exists (select 1 from vault.secrets where name = 'edge_function_alert_delivery_url');

-- 'dry_run' writes alert_events but sends nothing; 'live' delivers on the rule's
-- channels. Ships as dry_run deliberately — FOLLOWUPS flagged that a bug here spams
-- Telegram. Flipping it needs no redeploy, mirroring the live_delivery_mode switch.
select vault.create_secret(
         'dry_run',
         'alert_delivery_mode',
         'Alert delivery switch: dry_run writes alert_events without sending; live delivers over Telegram/Resend.')
 where not exists (select 1 from vault.secrets where name = 'alert_delivery_mode');

create or replace function public.run_alert_rules()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enabled     int;
  v_url         text;
  v_service_key text;
begin
  select count(*) into v_enabled from public.alert_rules where enabled = true;

  -- Nothing enabled means nothing to evaluate: skip the round trip entirely.
  if v_enabled = 0 then
    return;
  end if;

  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'edge_function_alert_delivery_url';
  select decrypted_secret into v_service_key
    from vault.decrypted_secrets where name = 'edge_function_service_key';

  if v_url is null or v_service_key is null then
    raise warning 'alert delivery: vault secrets missing, % enabled rule(s) not evaluated', v_enabled;
    return;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body    := jsonb_build_object('triggered_by', 'pg_cron', 'enabled_rules', v_enabled)
  );
end;
$$;

revoke all on function public.run_alert_rules() from public, anon, authenticated;
grant execute on function public.run_alert_rules() to service_role;
