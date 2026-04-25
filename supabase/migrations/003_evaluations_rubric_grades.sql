-- =============================================================================
-- Migration 003 — Evaluations to rubric-based scoring + 5-band grades
-- =============================================================================
-- Replaces the legacy 6-score-fields layout with:
--   total_score          numeric(0-1)        — weighted sum of rubric areas
--   grade                text                — one of 5 OSCE bands
--   rubric_scores        jsonb               — per-area + per-item scoring
--   auto_fail_triggered  jsonb (array)       — which conditions, if any, forced Clear Fail
--
-- VARNING: Destruktiv. Rensar alla existerande evaluations (dev-data).
-- =============================================================================

begin;

truncate table public.evaluations restart identity cascade;

-- Drop old constraints + columns
alter table public.evaluations drop constraint if exists evaluations_score_range;

alter table public.evaluations
  drop column if exists overall_score,
  drop column if exists history_taking_score,
  drop column if exists physical_exam_score,
  drop column if exists diagnosis_score,
  drop column if exists treatment_score,
  drop column if exists reasoning_score,
  drop column if exists missed_findings;

-- Add new columns
alter table public.evaluations
  add column if not exists total_score numeric(4,3) not null default 0,
  add column if not exists grade text not null default 'Clear Fail',
  add column if not exists rubric_scores jsonb not null default '{}'::jsonb,
  add column if not exists auto_fail_triggered jsonb not null default '[]'::jsonb;

-- Constraints
alter table public.evaluations
  add constraint evaluations_total_score_check check (total_score between 0 and 1);

alter table public.evaluations
  add constraint evaluations_grade_check check (grade in (
    'Excellent', 'Good Pass', 'Clear Pass', 'Borderline', 'Clear Fail'
  ));

-- Index for grade-based filtering / analytics
create index if not exists idx_evaluations_grade on public.evaluations (grade);

commit;
