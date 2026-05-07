-- =============================================================================
-- Migration 004 — Drop evaluations.raw_response (data minimization / GDPR)
-- =============================================================================
-- raw_response stored the full LLM JSON output as a debug blob — but it was
-- never read anywhere in the app. Dropping it for GDPR data-minimization
-- reasons (Art. 5.1.c) and to reduce blast radius if the DB ever leaks.
--
-- Structured fields (total_score, grade, rubric_scores, summary, strengths,
-- improvements, auto_fail_triggered, diagnosis_correct) cover all user-facing
-- and analytics needs. raw_response was redundant.
-- =============================================================================

begin;

alter table public.evaluations drop column if exists raw_response;

commit;
