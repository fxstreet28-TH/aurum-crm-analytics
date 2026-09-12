-- Adds the manual analytics exclusion flag used by every CRM revenue/cost/tier RPC.
-- Verified against live schema 2026-09-12: public.creators(id, user_id, customer_id, handle,
-- display_name, category, bio, kyc_status, created_at, updated_at, content_tier, ...).
-- NOTE: creators has NO is_active column, so downstream RPCs must not filter on it.

alter table public.creators
  add column if not exists excluded_from_analytics boolean not null default false;

comment on column public.creators.excluded_from_analytics is
  'When true, this creator is excluded from all platform revenue/tier/cost calculations. Used for test accounts. Toggle from CRM Settings page.';

create index if not exists idx_creators_excluded
  on public.creators (excluded_from_analytics)
  where excluded_from_analytics = false;
