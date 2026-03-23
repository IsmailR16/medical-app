import "server-only";

import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UsageRow {
  id: string;
  user_id: string;
  period: string;
  sessions_started: number;
}

export interface RecentSession {
  id: string;
  status: string;
  started_at: string;
  case_title: string;
}

export interface LatestEvaluation {
  id: string;
  overall_score: number;
  diagnosis_correct: boolean;
  created_at: string;
  case_title: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Current month in "YYYY-MM" format. */
export function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/* ------------------------------------------------------------------ */
/*  Usage                                                              */
/* ------------------------------------------------------------------ */

/** Fetch the usage row for the current month (or null if none exists). */
export const getMonthlyUsage = (userId: string) =>
  unstable_cache(
    async (): Promise<UsageRow | null> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("usage")
        .select("*")
        .eq("user_id", userId)
        .eq("period", currentPeriod())
        .single();
      return (data as UsageRow) ?? null;
    },
    [`usage-${userId}-${currentPeriod()}`],
    { tags: [`usage-${userId}`], revalidate: 30 }
  )();

/* ------------------------------------------------------------------ */
/*  Recent sessions (last 10)                                          */
/* ------------------------------------------------------------------ */

export const getRecentSessions = (userId: string) =>
  unstable_cache(
    async (): Promise<RecentSession[]> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("sessions")
        .select("id, status, started_at, case_id")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return [];

      const caseIds = [...new Set(data.map((s) => s.case_id as string))];
      const { data: cases } = await sb
        .from("cases")
        .select("id, title")
        .in("id", caseIds);

      const titleMap = new Map(
        (cases ?? []).map((c: { id: string; title: string }) => [c.id, c.title])
      );

      return data.map((s) => ({
        id: s.id as string,
        status: s.status as string,
        started_at: s.started_at as string,
        case_title: titleMap.get(s.case_id as string) ?? "Okänt fall",
      }));
    },
    [`recent-sessions-${userId}`],
    { tags: [`sessions-${userId}`], revalidate: 60 }
  )();

/* ------------------------------------------------------------------ */
/*  Latest evaluations (last 5)                                        */
/* ------------------------------------------------------------------ */

export const getLatestEvaluations = (userId: string) =>
  unstable_cache(
    async (): Promise<LatestEvaluation[]> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("evaluations")
        .select("id, overall_score, diagnosis_correct, created_at, case_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!data || data.length === 0) return [];

      const caseIds = [...new Set(data.map((e) => e.case_id as string))];
      const { data: cases } = await sb
        .from("cases")
        .select("id, title")
        .in("id", caseIds);

      const titleMap = new Map(
        (cases ?? []).map((c: { id: string; title: string }) => [c.id, c.title])
      );

      return data.map((e) => ({
        id: e.id as string,
        overall_score: e.overall_score as number,
        diagnosis_correct: e.diagnosis_correct as boolean,
        created_at: e.created_at as string,
        case_title: titleMap.get(e.case_id as string) ?? "Okänt fall",
      }));
    },
    [`latest-evals-${userId}`],
    { tags: [`evaluations-${userId}`], revalidate: 60 }
  )();

/* ------------------------------------------------------------------ */
/*  Published community cases for the case picker                      */
/* ------------------------------------------------------------------ */

export interface CaseListItem {
  id: string;
  title: string;
  description: string;
  specialty: string;
  difficulty: string;
}

export const getPublishedCases = () =>
  unstable_cache(
    async (): Promise<CaseListItem[]> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("cases")
        .select("id, title, description, specialty, difficulty")
        .eq("is_published", true)
        .order("title", { ascending: true });

      return (data as CaseListItem[]) ?? [];
    },
    ["published-cases"],
    { tags: ["cases"], revalidate: 120 }
  )();

/* ------------------------------------------------------------------ */
/*  Session + Messages for chat page                                   */
/* ------------------------------------------------------------------ */

export interface ClinicalDataSection {
  title: string;
  items: { label: string; value: string }[];
}

export interface SessionDetail {
  id: string;
  user_id: string;
  case_id: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  evaluated_at: string | null;
  revealed_vitals: boolean;
  revealed_labs: boolean;
  revealed_imaging: boolean;
  revealed_physical_exam: boolean;
  primary_diagnosis: string | null;
  case_title: string;
  case_description: string;
  case_specialty: string;
  case_difficulty: string;
  presenting_complaint: string;
  clinical_data: ClinicalDataSection[];
}

export interface MessageRow {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  clinical_data_type: string | null;
  created_at: string;
}

export async function getSessionWithMessages(
  sessionId: string,
  userId: string
): Promise<{ session: SessionDetail; messages: MessageRow[] } | null> {
  const sb = createServiceRoleClient();

  const { data: session } = await sb
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) return null;

  const { data: caseRow } = await sb
    .from("cases")
    .select("title, description, specialty, difficulty, presenting_complaint, vitals, lab_results, imaging, physical_exam")
    .eq("id", session.case_id)
    .single();

  const { data: messages } = await sb
    .from("messages")
    .select("id, role, content, clinical_data_type, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Build clinical data sections from the case JSONB columns
  function jsonToItems(obj: Record<string, unknown>): { label: string; value: string }[] {
    return Object.entries(obj ?? {}).map(([key, val]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(val),
    }));
  }

  const clinicalData: ClinicalDataSection[] = [
    { title: "Vitala parametrar", items: jsonToItems(caseRow?.vitals as Record<string, unknown> ?? {}) },
    { title: "Laboratorieprover", items: jsonToItems(caseRow?.lab_results as Record<string, unknown> ?? {}) },
    { title: "Bilddiagnostik", items: jsonToItems(caseRow?.imaging as Record<string, unknown> ?? {}) },
    { title: "Fysikaliska fynd", items: jsonToItems(caseRow?.physical_exam as Record<string, unknown> ?? {}) },
  ].filter((s) => s.items.length > 0);

  return {
    session: {
      id: session.id,
      user_id: session.user_id,
      case_id: session.case_id,
      status: session.status,
      started_at: session.started_at,
      submitted_at: session.submitted_at,
      evaluated_at: session.evaluated_at,
      revealed_vitals: session.revealed_vitals,
      revealed_labs: session.revealed_labs,
      revealed_imaging: session.revealed_imaging,
      revealed_physical_exam: session.revealed_physical_exam,
      primary_diagnosis: session.primary_diagnosis,
      case_title: caseRow?.title ?? "Okänt fall",
      case_description: caseRow?.description ?? "",
      case_specialty: caseRow?.specialty ?? "",
      case_difficulty: caseRow?.difficulty ?? "medium",
      presenting_complaint: caseRow?.presenting_complaint ?? "",
      clinical_data: clinicalData,
    },
    messages: (messages as MessageRow[]) ?? [],
  };
}

/* ------------------------------------------------------------------ */
/*  All sessions (for sessions list page)                              */
/* ------------------------------------------------------------------ */

export interface SessionListItem {
  id: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  evaluated_at: string | null;
  case_title: string;
  case_specialty: string;
  case_difficulty: string;
  overall_score: number | null;
}

export const getAllSessions = (userId: string) =>
  unstable_cache(
    async (): Promise<SessionListItem[]> => {
      const sb = createServiceRoleClient();

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, status, started_at, submitted_at, evaluated_at, case_id")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (!sessions || sessions.length === 0) return [];

  // Fetch case info
  const caseIds = [...new Set(sessions.map((s) => s.case_id as string))];
  const { data: cases } = await sb
    .from("cases")
    .select("id, title, specialty, difficulty")
    .in("id", caseIds);
  const caseMap = new Map(
    (cases ?? []).map((c: { id: string; title: string; specialty: string; difficulty: string }) => [
      c.id,
      c,
    ])
  );

  // Fetch evaluations for scored sessions
  const sessionIds = sessions.map((s) => s.id as string);
  const { data: evals } = await sb
    .from("evaluations")
    .select("session_id, overall_score")
    .in("session_id", sessionIds);
  const evalMap = new Map(
    (evals ?? []).map((e: { session_id: string; overall_score: number }) => [
      e.session_id,
      e.overall_score,
    ])
  );

  return sessions.map((s) => {
    const c = caseMap.get(s.case_id as string);
    return {
      id: s.id as string,
      status: s.status as string,
      started_at: s.started_at as string,
      submitted_at: (s.submitted_at as string) ?? null,
      evaluated_at: (s.evaluated_at as string) ?? null,
      case_title: c?.title ?? "Okänt fall",
      case_specialty: c?.specialty ?? "",
      case_difficulty: c?.difficulty ?? "medium",
      overall_score: evalMap.get(s.id as string) ?? null,
    };
  });
    },
    [`all-sessions-${userId}`],
    { tags: [`sessions-${userId}`], revalidate: 60 }
  )();

/* ------------------------------------------------------------------ */
/*  Evaluation detail                                                  */
/* ------------------------------------------------------------------ */

export interface EvaluationListItem {
  id: string;
  session_id: string;
  case_title: string;
  case_specialty: string;
  overall_score: number;
  history_taking_score: number;
  physical_exam_score: number;
  diagnosis_score: number;
  treatment_score: number;
  created_at: string;
  started_at: string;
  duration_min: number | null;
}

export const getEvaluatedSessions = (userId: string) =>
  unstable_cache(
    async (): Promise<EvaluationListItem[]> => {
      const sb = createServiceRoleClient();

  // Get evaluated sessions
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, case_id, started_at, submitted_at, evaluated_at")
    .eq("user_id", userId)
    .in("status", ["evaluated", "submitted"])
    .order("started_at", { ascending: false });

  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id as string);
  const caseIds = [...new Set(sessions.map((s) => s.case_id as string))];

  // Fetch evaluations
  const { data: evals } = await sb
    .from("evaluations")
    .select(
      "id, session_id, overall_score, history_taking_score, physical_exam_score, diagnosis_score, treatment_score, created_at"
    )
    .in("session_id", sessionIds);

  const evalMap = new Map(
    (evals ?? []).map((e: Record<string, unknown>) => [e.session_id as string, e])
  );

  // Fetch cases
  const { data: cases } = await sb
    .from("cases")
    .select("id, title, specialty")
    .in("id", caseIds);

  const caseMap = new Map(
    (cases ?? []).map((c: { id: string; title: string; specialty: string }) => [c.id, c])
  );

  return sessions
    .filter((s) => evalMap.has(s.id as string))
    .map((s) => {
      const ev = evalMap.get(s.id as string) as Record<string, unknown>;
      const c = caseMap.get(s.case_id as string);
      const endTime = (s.submitted_at ?? s.evaluated_at) as string | null;
      const durationMin = endTime
        ? Math.round(
            (new Date(endTime).getTime() -
              new Date(s.started_at as string).getTime()) /
              60000
          )
        : null;

      return {
        id: ev.id as string,
        session_id: s.id as string,
        case_title: c?.title ?? "Okänt fall",
        case_specialty: c?.specialty ?? "",
        overall_score: ev.overall_score as number,
        history_taking_score: ev.history_taking_score as number,
        physical_exam_score: ev.physical_exam_score as number,
        diagnosis_score: ev.diagnosis_score as number,
        treatment_score: ev.treatment_score as number,
        created_at: ev.created_at as string,
        started_at: s.started_at as string,
        duration_min: durationMin,
      };
    });
    },
    [`evaluated-sessions-${userId}`],
    { tags: [`evaluations-${userId}`], revalidate: 60 }
  )();

export interface EvaluationDetail {
  id: string;
  session_id: string;
  overall_score: number;
  history_taking_score: number;
  physical_exam_score: number;
  diagnosis_score: number;
  treatment_score: number;
  reasoning_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missed_findings: string[];
  diagnosis_correct: boolean;
  created_at: string;
  case_title: string;
  case_specialty: string;
  case_difficulty: string;
  hidden_diagnosis: string;
}

export const getEvaluationBySession = (sessionId: string, userId: string) =>
  unstable_cache(
    async (): Promise<EvaluationDetail | null> => {
      const sb = createServiceRoleClient();

      // Verify ownership
      const { data: session } = await sb
        .from("sessions")
        .select("id, case_id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();
      if (!session) return null;

      const { data: ev } = await sb
        .from("evaluations")
        .select("*")
        .eq("session_id", sessionId)
        .single();
      if (!ev) return null;

      const { data: caseRow } = await sb
        .from("cases")
        .select("title, specialty, difficulty, hidden_diagnosis")
        .eq("id", session.case_id)
        .single();

      return {
        id: ev.id,
        session_id: ev.session_id,
        overall_score: ev.overall_score,
        history_taking_score: ev.history_taking_score,
        physical_exam_score: ev.physical_exam_score,
        diagnosis_score: ev.diagnosis_score,
        treatment_score: ev.treatment_score,
        reasoning_score: ev.reasoning_score,
        summary: ev.summary,
        strengths: ev.strengths ?? [],
        improvements: ev.improvements ?? [],
        missed_findings: ev.missed_findings ?? [],
        diagnosis_correct: ev.diagnosis_correct,
        created_at: ev.created_at,
        case_title: caseRow?.title ?? "Okänt fall",
        case_specialty: caseRow?.specialty ?? "",
        case_difficulty: caseRow?.difficulty ?? "medium",
        hidden_diagnosis: caseRow?.hidden_diagnosis ?? "",
      };
    },
    [`evaluation-${sessionId}`],
    { tags: [`evaluations-${userId}`, `evaluation-${sessionId}`], revalidate: 300 }
  )();

/* ------------------------------------------------------------------ */
/*  Dashboard overview stats                                           */
/* ------------------------------------------------------------------ */

/** Average overall_score across all user evaluations. */
export const getAverageScore = (userId: string) =>
  unstable_cache(
    async (): Promise<number> => {
      const sb = createServiceRoleClient();

      const { data } = await sb
        .from("evaluations")
        .select("overall_score")
        .eq("user_id", userId);

      if (!data || data.length === 0) return 0;

      const sum = data.reduce(
        (acc, e) => acc + (e.overall_score as number),
        0
      );
      return Math.round(sum / data.length);
    },
    [`avg-score-${userId}`],
    { tags: [`evaluations-${userId}`], revalidate: 60 }
  )();

/** Number of consecutive days (up to today) with at least one session. */
export const getSessionStreak = (userId: string) =>
  unstable_cache(
    async (): Promise<number> => {
      const sb = createServiceRoleClient();

      const { data: sessions } = await sb
        .from("sessions")
        .select("started_at")
        .eq("user_id", userId)
        .order("started_at", { ascending: false });

      if (!sessions || sessions.length === 0) return 0;

      const dateset = new Set<string>();
      for (const s of sessions) {
        dateset.add(new Date(s.started_at as string).toISOString().slice(0, 10));
      }

      let streak = 0;
      const day = new Date();
      day.setHours(0, 0, 0, 0);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const key = day.toISOString().slice(0, 10);
        if (dateset.has(key)) {
          streak++;
          day.setDate(day.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    },
    [`streak-${userId}`],
    { tags: [`sessions-${userId}`], revalidate: 60 }
  )();
