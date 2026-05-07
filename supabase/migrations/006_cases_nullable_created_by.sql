-- =============================================================================
-- Migration 006 — Make cases.created_by nullable and drop FK
-- =============================================================================
-- AI-generated cases have no human creator — they should not require a
-- placeholder user_id. The source_type + generated_by columns already track
-- provenance correctly, so created_by becomes optional:
--   - source_type = 'ai_generated'  → created_by = NULL
--   - source_type = 'human_created' → created_by = clerk_user_id
--   - source_type = 'human_edited'  → created_by = clerk_user_id of last editor
-- =============================================================================

begin;

alter table public.cases drop constraint if exists cases_created_by_fkey;

alter table public.cases alter column created_by drop not null;

-- Optional cleanup: existing AI-generated rows can have their fake creator
-- cleared. Comment out if you want to preserve historical attribution.
update public.cases
  set created_by = null
  where source_type = 'ai_generated';

commit;
