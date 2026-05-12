-- =============================================================================
-- Diagnostika — Full Database Schema
-- =============================================================================

-- 1. USERS
-- -----------------------------------------------------------------------------

create table public.users (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  email text not null,
  full_name text null,
  avatar_url text null,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  plan text not null default 'free',
  subscription_status text not null default 'active',
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  cancel_at_period_end boolean null default false,

  -- GDPR-compliant consent tracking (set when user accepts Terms+Privacy
  -- in the post-signup acceptance flow at /accept-terms).
  terms_accepted_at timestamptz null,
  terms_version text null,
  privacy_policy_accepted_at timestamptz null,
  privacy_policy_version text null,
  no_real_patient_data_acknowledged_at timestamptz null,
  marketing_consent boolean not null default false,

  -- Updated on every login. Used for the 24-month-inactivity auto-deletion
  -- job (see docs/legal/retention-policy.md).
  last_login_at timestamptz null,
  -- Set when the 30-day / 7-day warning mails are dispatched.
  warning_30d_sent_at timestamptz null,
  warning_7d_sent_at timestamptz null,

  created_at timestamptz null default now(),
  updated_at timestamptz null default now(),

  constraint users_pkey primary key (id),
  constraint users_user_id_key unique (user_id),
  constraint users_email_key unique (email),
  constraint users_stripe_customer_id_key unique (stripe_customer_id),
  constraint users_stripe_subscription_id_key unique (stripe_subscription_id),
  constraint users_plan_check check (plan in ('free', 'pro', 'institution')),
  constraint users_subscription_status_check check (
    subscription_status in ('active', 'inactive', 'canceled', 'past_due', 'trialing', 'incomplete')
  )
);

create index if not exists idx_users_last_login_at on public.users (last_login_at);

-- 2. INSTITUTIONS
-- For the Institution plan — teams / universities / teaching hospitals.
-- -----------------------------------------------------------------------------
create table public.institutions (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null,                                 -- URL-friendly identifier
  owner_user_id text not null,                        -- Clerk user_id of the admin

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint institutions_pkey primary key (id),
  constraint institutions_slug_key unique (slug),
  constraint institutions_owner_fkey foreign key (owner_user_id)
    references public.users (user_id) on delete restrict
);

-- 3. INSTITUTION MEMBERS
-- Many-to-many: which users belong to which institution.
-- -----------------------------------------------------------------------------
create table public.institution_members (
  id uuid not null default gen_random_uuid(),
  institution_id uuid not null,
  user_id text not null,                              -- Clerk user_id
  role text not null default 'student',               -- student | teacher | admin

  joined_at timestamptz not null default now(),

  constraint institution_members_pkey primary key (id),
  constraint institution_members_inst_fkey foreign key (institution_id)
    references public.institutions (id) on delete cascade,
  constraint institution_members_user_fkey foreign key (user_id)
    references public.users (user_id) on delete cascade,
  constraint institution_members_unique unique (institution_id, user_id),
  constraint institution_members_role_check check (role in ('student', 'teacher', 'admin'))
);

create index idx_inst_members_user on public.institution_members (user_id);
create index idx_inst_members_inst on public.institution_members (institution_id);

-- 4. CASES
-- The patient case library — the core content of the platform.
--
-- Structure: split into two JSONB blocks.
--   simulation  → everything the AI-patient needs to roleplay the chat
--                 (patient, opening_message, persona, clinical_data)
--   evaluation  → OSCE-style rubric used AFTER submission
--                 (hidden_diagnosis, rubric with 5 areas, pass_threshold, max_points)
-- -----------------------------------------------------------------------------
create table public.cases (
  id uuid not null default gen_random_uuid(),
  -- Clerk user_id of creator. NULL for AI-generated cases (use source_type
  -- to distinguish). No FK so admin-deleted users don't cascade-restrict cases.
  created_by text null,

  -- Public-facing metadata (shown in case library)
  title text not null,                                -- e.g. "45-årig man med bröstsmärta"
  description text not null,                          -- Short intro shown in case card
  specialty text not null,                            -- See cases_specialty_check (24 enum)
  clinical_setting text not null default 'akutmottagning',

  -- Core content — see structure note above
  simulation jsonb not null default '{}'::jsonb,
  evaluation jsonb not null default '{}'::jsonb,

  -- Provenance
  source_type text not null default 'ai_generated',   -- ai_generated | human_created | human_edited
  generated_by text null,                             -- Model name (e.g. gpt-5.4) when ai_generated

  -- Visibility / access control
  is_published boolean not null default false,        -- Only published cases show in library
  is_community boolean not null default false,        -- Visible to all vs. institution-only
  institution_id uuid null,                           -- If institution-only, which institution

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cases_pkey primary key (id),
  constraint cases_institution_fkey foreign key (institution_id)
    references public.institutions (id) on delete set null,
  constraint cases_specialty_check check (specialty in (
    'internmedicin', 'infektion', 'allmänmedicin', 'akutmedicin',
    'geriatrik', 'psykiatri', 'kirurgi', 'pediatrik',
    'neurologi', 'obstetrik', 'gynekologi', 'ortopedi',
    'gastroenterologi', 'lungmedicin', 'kardiologi', 'endokrinologi',
    'urologi', 'ögonsjukdomar', 'öron-näsa-hals', 'dermatologi',
    'reumatologi', 'nefrologi', 'hematologi', 'onkologi'
  )),
  constraint cases_clinical_setting_check check (clinical_setting in (
    'akutmottagning', 'vårdcentral', 'vårdavdelning', 'mottagning',
    'förlossning', 'barnakut', 'psykakut'
  )),
  constraint cases_source_type_check check (source_type in (
    'ai_generated', 'human_created', 'human_edited'
  ))
);

create index idx_cases_specialty on public.cases (specialty);
create index idx_cases_clinical_setting on public.cases (clinical_setting);
create index idx_cases_source_type on public.cases (source_type);
create index idx_cases_published on public.cases (is_published) where is_published = true;
create index idx_cases_created_by on public.cases (created_by);
create index idx_cases_institution on public.cases (institution_id) where institution_id is not null;

-- 5. SESSIONS
-- A student's attempt at a case (one session = one interview + submission).
-- -----------------------------------------------------------------------------
create table public.sessions (
  id uuid not null default gen_random_uuid(),
  user_id text not null,                              -- Clerk user_id
  case_id uuid not null,

  status text not null default 'active',              -- active | submitted | evaluated

  -- Timestamps for tracking progression
  started_at timestamptz not null default now(),
  submitted_at timestamptz null,                      -- When student submitted diagnosis
  evaluated_at timestamptz null,                      -- When AI evaluation completed

  -- Which clinical data items the student has ordered during this session.
  -- Item key scheme:
  --   "vitals"                     — whole vitals block (ordered as one)
  --   "lab:<test>"                 — single lab test (e.g. "lab:CRP")
  --   "imaging:<test>"             — single imaging test (e.g. "imaging:EKG")
  --   "physical_exam:<subsystem>"  — single subsystem (e.g. "physical_exam:cor")
  revealed_items text[] not null default '{}',
  -- Legacy per-category booleans (no longer used — see revealed_items).
  revealed_vitals boolean not null default false,
  revealed_labs boolean not null default false,
  revealed_imaging boolean not null default false,
  revealed_physical_exam boolean not null default false,

  -- Student's diagnosis submission
  primary_diagnosis text null,
  differential_diagnoses text[] null,
  treatment_plan text null,
  reasoning text null,                                -- Student's clinical reasoning explanation

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sessions_pkey primary key (id),
  constraint sessions_user_fkey foreign key (user_id)
    references public.users (user_id) on delete cascade,
  constraint sessions_case_fkey foreign key (case_id)
    references public.cases (id) on delete cascade,
  constraint sessions_status_check check (status in ('active', 'submitted', 'evaluated'))
);

create index idx_sessions_user_id on public.sessions (user_id);
create index idx_sessions_case_id on public.sessions (case_id);
create index idx_sessions_user_status on public.sessions (user_id, status);
create index idx_sessions_started_at on public.sessions (started_at desc);

-- 6. MESSAGES
-- Chat messages within a session (student ↔ AI patient conversation).
-- -----------------------------------------------------------------------------
create table public.messages (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null,

  role text not null,                                 -- user | assistant | system
  content text not null,

  -- Optional: tracks when the student requests clinical data
  clinical_data_type text null,                       -- vitals | labs | imaging | physical_exam

  created_at timestamptz not null default now(),

  constraint messages_pkey primary key (id),
  constraint messages_session_fkey foreign key (session_id)
    references public.sessions (id) on delete cascade,
  constraint messages_role_check check (role in ('user', 'assistant', 'system')),
  constraint messages_clinical_data_check check (
    clinical_data_type is null
    or clinical_data_type in ('vitals', 'labs', 'imaging', 'physical_exam')
  )
);

-- Load all messages for a session in chronological order
create index idx_messages_session on public.messages (session_id, created_at asc);

-- 7. EVALUATIONS
-- AI-generated rubric scoring + 5-band OSCE grade for a completed session.
--
-- total_score          numeric(0-1)    — weighted sum of rubric areas
-- grade                text            — one of 5 OSCE bands (global mapping from total_score,
--                                        forced to "Clear Fail" if any auto_fail_triggered)
-- rubric_scores        jsonb           — per-area + per-item scoring (anamnes, undersokningar,
--                                        kommunikation, klinisk_resonemang, bedomning_och_atgard)
-- auto_fail_triggered  jsonb (array)   — { category, description }[] if patient-safety brister
-- -----------------------------------------------------------------------------
create table public.evaluations (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null,
  user_id text not null,                              -- Denormalized for quick lookups
  case_id uuid not null,                              -- Denormalized for analytics

  -- Scoring
  total_score numeric(4,3) not null default 0,       -- 0.000 – 1.000
  grade text not null default 'Clear Fail',
  rubric_scores jsonb not null default '{}'::jsonb,
  auto_fail_triggered jsonb not null default '[]'::jsonb,

  -- Qualitative feedback
  summary text not null,
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',

  -- Was the primary diagnosis correct?
  diagnosis_correct boolean not null,

  created_at timestamptz not null default now(),

  constraint evaluations_pkey primary key (id),
  constraint evaluations_user_fkey foreign key (user_id)
    references public.users (user_id) on delete cascade,
  constraint evaluations_case_fkey foreign key (case_id)
    references public.cases (id) on delete cascade,
  constraint evaluations_session_fkey foreign key (session_id)
    references public.sessions (id) on delete cascade,
  constraint evaluations_session_key unique (session_id),         -- One evaluation per session
  constraint evaluations_total_score_check check (total_score between 0 and 1),
  constraint evaluations_grade_check check (grade in (
    'Excellent', 'Good Pass', 'Clear Pass', 'Borderline', 'Clear Fail'
  ))
);

create index idx_evaluations_user on public.evaluations (user_id);
create index idx_evaluations_case on public.evaluations (case_id);
create index idx_evaluations_grade on public.evaluations (grade);
create index idx_evaluations_user_score on public.evaluations (user_id, total_score desc);

-- 8. USAGE
-- Monthly usage tracking — enforces free-tier limit (3 cases/month).
-- -----------------------------------------------------------------------------
create table public.usage (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  period text not null,                               -- Format: "2026-02" (year-month)
  sessions_started integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint usage_pkey primary key (id),
  constraint usage_user_fkey foreign key (user_id)
    references public.users (user_id) on delete cascade,
  constraint usage_user_period_key unique (user_id, period)
);

-- idx_usage_user_period not needed — the unique constraint already creates an implicit index.

-- =============================================================================
-- Row-Level Security (RLS) policies
-- =============================================================================

alter table public.users enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
alter table public.cases enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.evaluations enable row level security;
alter table public.usage enable row level security;

-- Users can read their own row
create policy "Users can read own row"
  on public.users for select
  using (user_id = auth.jwt() ->> 'sub');

-- Users can read published community cases
create policy "Anyone can read published cases"
  on public.cases for select
  using (is_published = true and is_community = true);

-- Users can read their own sessions
create policy "Users can read own sessions"
  on public.sessions for select
  using (user_id = auth.jwt() ->> 'sub');

-- Users can read messages in their own sessions
create policy "Users can read own messages"
  on public.messages for select
  using (
    session_id in (
      select id from public.sessions where user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can read their own evaluations
create policy "Users can read own evaluations"
  on public.evaluations for select
  using (user_id = auth.jwt() ->> 'sub');

-- Users can read their own usage
create policy "Users can read own usage"
  on public.usage for select
  using (user_id = auth.jwt() ->> 'sub');

-- Institution members can read their institution
create policy "Members can read own institution"
  on public.institutions for select
  using (
    id in (
      select institution_id from public.institution_members
      where user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can read members of their own institution
create policy "Members can read fellow members"
  on public.institution_members for select
  using (
    institution_id in (
      select institution_id from public.institution_members
      where user_id = auth.jwt() ->> 'sub'
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Atomic usage increment for free-tier limit enforcement.
-- Returns the new count if increment succeeds, or -1 if already at/over the limit.
create or replace function public.increment_usage(
  p_user_id text,
  p_period text,
  p_limit int
)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_count int;
begin
  insert into public.usage (user_id, period, sessions_started)
  values (p_user_id, p_period, 1)
  on conflict (user_id, period) do update
    set sessions_started = public.usage.sessions_started + 1,
        updated_at = now()
    where public.usage.sessions_started < p_limit
  returning sessions_started into new_count;

  -- If new_count is null, the WHERE clause prevented the update (limit reached)
  if new_count is null then
    return -1;
  end if;

  return new_count;
end;
$$;
