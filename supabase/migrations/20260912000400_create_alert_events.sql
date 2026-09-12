-- Fired alert history. RLS locked to profiles.role = 'super_admin'.
create table if not exists public.alert_events (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.alert_rules(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  details_json jsonb not null default '{}'::jsonb,
  severity text not null default 'warning' check (severity in ('info','warning','critical')),
  status text not null default 'active' check (status in ('active','watch','resolved')),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  note text
);

alter table public.alert_events enable row level security;

drop policy if exists "alert_events_super_admin_all" on public.alert_events;
create policy "alert_events_super_admin_all" on public.alert_events
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

create index if not exists idx_alert_events_creator on public.alert_events (creator_id, triggered_at desc);
create index if not exists idx_alert_events_active on public.alert_events (status, triggered_at desc) where status = 'active';
