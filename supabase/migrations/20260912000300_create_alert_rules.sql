-- CRM alert rule definitions. RLS locked to profiles.role = 'super_admin'.
create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  condition_json jsonb not null,
  threshold_period text not null default 'day' check (threshold_period in ('hour','day','week','month')),
  channels text[] not null default array['in_app']::text[],
  enabled boolean not null default true,
  severity text not null default 'warning' check (severity in ('info','warning','critical')),
  triggered_count int not null default 0,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.alert_rules enable row level security;

drop policy if exists "alert_rules_super_admin_all" on public.alert_rules;
create policy "alert_rules_super_admin_all" on public.alert_rules
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

create index if not exists idx_alert_rules_enabled on public.alert_rules (enabled) where enabled = true;
