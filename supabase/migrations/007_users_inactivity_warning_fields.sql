-- =============================================================================
-- Migration 007 — Inactivity warning timestamps
-- =============================================================================
-- Tracks when warning emails were sent before account deletion at 24 months
-- of inactivity (see docs/legal/retention-policy.md).
--
-- warning_30d_sent_at — set when the "30 days remaining" mail is sent
-- warning_7d_sent_at  — set when the "7 days remaining" mail is sent
--
-- The /api/cron/cleanup-inactive job uses these to avoid spamming users
-- and to track who has been warned.
-- =============================================================================

begin;

alter table public.users
  add column if not exists warning_30d_sent_at timestamptz null,
  add column if not exists warning_7d_sent_at timestamptz null;

commit;
