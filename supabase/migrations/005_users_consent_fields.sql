-- =============================================================================
-- Migration 005 — User consent + acceptance tracking
-- =============================================================================
-- Adds fields to users-table for GDPR-compliant acceptance logging:
-- - Terms of Service acceptance + version
-- - Privacy Policy acceptance + version
-- - "No real patient data" acknowledgement
-- - Marketing consent (opt-in only)
-- - Last login (for inactivity-based auto-deletion, see retention policy)
-- =============================================================================

begin;

alter table public.users
  add column if not exists terms_accepted_at timestamptz null,
  add column if not exists terms_version text null,
  add column if not exists privacy_policy_accepted_at timestamptz null,
  add column if not exists privacy_policy_version text null,
  add column if not exists no_real_patient_data_acknowledged_at timestamptz null,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists last_login_at timestamptz null;

create index if not exists idx_users_last_login_at on public.users (last_login_at);

commit;
