-- =============================================================================
-- Migration 002 — Per-item investigation ordering on sessions
-- =============================================================================
-- Adds revealed_items text[] to track which specific clinical data items
-- (vitals, labs, imaging tests, physical exam subsystems) the student has
-- ordered during a session.
--
-- Item key scheme:
--   "vitals"                        — whole vitals block (ordered as one)
--   "labs"                          — whole lab panel (ordered as one)
--   "imaging:<test-name>"           — specific imaging test (e.g. "imaging:ekg")
--   "physical_exam:<subsystem>"     — specific exam (e.g. "physical_exam:cor")
--
-- The old per-category booleans (revealed_vitals, revealed_labs, etc.) are
-- left in place for now but are no longer written or read by the app.
-- =============================================================================

begin;

alter table public.sessions
  add column if not exists revealed_items text[] not null default '{}';

commit;
