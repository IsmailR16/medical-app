-- =============================================================================
-- Migration 001 — Cases table to OSCE/AI-simulation schema
-- =============================================================================
-- VARNING: Destruktiv. Rensar alla existerande cases, sessions, messages
-- och evaluations (dev-data). Kör endast om inga produktionsdata finns.
-- =============================================================================

begin;

-- 1. Rensa beroende data (cascade via FK)
truncate table public.cases restart identity cascade;

-- 2. Ta bort gamla index på columns som försvinner
drop index if exists public.idx_cases_difficulty;

-- 3. Ta bort gamla constraints som blockerar kolumnborttagning
alter table public.cases drop constraint if exists cases_difficulty_check;
alter table public.cases drop constraint if exists cases_gender_check;
alter table public.cases drop constraint if exists cases_age_check;

-- 4. Släpp gamla kolumner (ersätts av simulation/evaluation JSONB)
alter table public.cases
  drop column if exists difficulty,
  drop column if exists patient_name,
  drop column if exists patient_age,
  drop column if exists patient_gender,
  drop column if exists patient_background,
  drop column if exists presenting_complaint,
  drop column if exists hidden_diagnosis,
  drop column if exists differential_diagnoses,
  drop column if exists vitals,
  drop column if exists lab_results,
  drop column if exists imaging,
  drop column if exists physical_exam,
  drop column if exists medications,
  drop column if exists system_prompt_extra;

-- 5. Lägg till nya kolumner för ny struktur
alter table public.cases
  add column if not exists clinical_setting text not null default 'akutmottagning',
  add column if not exists simulation jsonb not null default '{}'::jsonb,
  add column if not exists evaluation jsonb not null default '{}'::jsonb,
  add column if not exists source_type text not null default 'ai_generated',
  add column if not exists generated_by text null;

-- 6. CHECK-constraints
alter table public.cases
  add constraint cases_specialty_check check (specialty in (
    'internmedicin',
    'infektion',
    'allmänmedicin',
    'akutmedicin',
    'geriatrik',
    'psykiatri',
    'kirurgi',
    'pediatrik',
    'neurologi',
    'obstetrik',
    'gynekologi',
    'ortopedi',
    'gastroenterologi',
    'lungmedicin',
    'kardiologi',
    'endokrinologi',
    'urologi',
    'ögonsjukdomar',
    'öron-näsa-hals',
    'dermatologi',
    'reumatologi',
    'nefrologi',
    'hematologi',
    'onkologi'
  ));

alter table public.cases
  add constraint cases_clinical_setting_check check (clinical_setting in (
    'akutmottagning',
    'vårdcentral',
    'vårdavdelning',
    'mottagning',
    'förlossning',
    'barnakut',
    'psykakut'
  ));

alter table public.cases
  add constraint cases_source_type_check check (source_type in (
    'ai_generated',
    'human_created',
    'human_edited'
  ));

-- 7. Index för filtrering i case-biblioteket
create index if not exists idx_cases_clinical_setting on public.cases (clinical_setting);
create index if not exists idx_cases_source_type on public.cases (source_type);

commit;
