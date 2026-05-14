import "server-only";

import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  Grade,
  RubricAreaScore,
  AutoFailMatch,
} from "@/lib/ai/patient";
import { splitLabValue, labLabelWithReference } from "@/lib/utils/clinical-format";

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
  total_score: number;
  grade: Grade;
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
        .select("id, total_score, grade, diagnosis_correct, created_at, case_id")
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
        total_score: Number(e.total_score) || 0,
        grade: e.grade as Grade,
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
  clinical_setting: string;
}

export const getPublishedCases = () =>
  unstable_cache(
    async (): Promise<CaseListItem[]> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("cases")
        .select("id, title, description, specialty, clinical_setting")
        .eq("is_published", true)
        .order("title", { ascending: true });

      return (data as CaseListItem[]) ?? [];
    },
    ["published-cases"],
    { tags: ["cases"], revalidate: 120 }
  )();

/**
 * Return a map of case_id → session_id for the user's active (in-progress)
 * sessions. Used by the case library to let users resume an in-progress
 * session instead of starting a new one (which would consume a usage credit).
 */
export const getActiveSessionsByCase = (userId: string) =>
  unstable_cache(
    async (): Promise<Record<string, string>> => {
      const sb = createServiceRoleClient();
      const { data } = await sb
        .from("sessions")
        .select("id, case_id")
        .eq("user_id", userId)
        .eq("status", "active");

      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        // If somehow more than one active session exists per case, the last
        // one wins. Shouldn't happen in normal flow but harmless.
        map[row.case_id as string] = row.id as string;
      }
      return map;
    },
    [`active-sessions-${userId}`],
    { tags: [`sessions-${userId}`], revalidate: 30 }
  )();

/* ------------------------------------------------------------------ */
/*  Session + Messages for chat page                                   */
/* ------------------------------------------------------------------ */

export type OrderableSection = "vitals" | "labs" | "imaging" | "physical_exam";

export interface OrderableItem {
  /** Unique key matching the order API (e.g. "vitals", "imaging:ekg"). */
  key: string;
  section: OrderableSection;
  /** Human-readable label shown on the order button. */
  label: string;
  /** True if the student has already ordered it in this session. */
  revealed: boolean;
  /** Single string value (for imaging / physical_exam items). */
  value?: string;
  /** For panel-style items (vitals) — the list of sub-values. */
  sub_items?: { label: string; value: string }[];
  /** Lab-specific: raw reference range like "ref 117-153" for out-of-range checks. */
  reference?: string | null;
}

export interface SessionDetail {
  id: string;
  user_id: string;
  case_id: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  evaluated_at: string | null;
  revealed_items: string[];
  primary_diagnosis: string | null;
  case_title: string;
  case_description: string;
  case_specialty: string;
  case_clinical_setting: string;
  orderables: OrderableItem[];
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
    .select("title, description, specialty, clinical_setting, simulation")
    .eq("id", session.case_id)
    .single();

  const { data: messages } = await sb
    .from("messages")
    .select("id, role, content, clinical_data_type, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Build orderable items from simulation.clinical_data JSONB
  function prettify(k: string): string {
    const s = k.replace(/_/g, " ");
    return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
  }

  function dictToList(obj: Record<string, unknown> | undefined): { label: string; value: string }[] {
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([k, v]) => !k.startsWith("_") && v != null && String(v).trim() !== "")
      .map(([k, v]) => ({
        label: prettify(k),
        value: typeof v === "object" ? JSON.stringify(v) : String(v),
      }));
  }

  const sim = (caseRow?.simulation ?? {}) as {
    clinical_data?: {
      vitals?: Record<string, unknown>;
      lab_results?: Record<string, unknown>;
      imaging?: Record<string, unknown>;
      physical_exam?: Record<string, unknown>;
    };
  };
  const cd = sim.clinical_data ?? {};
  const revealedItems = (session.revealed_items as string[] | null) ?? [];
  const revealedSet = new Set(revealedItems);

  const orderables: OrderableItem[] = [];

  // vitals (panel)
  const vitalsList = dictToList(cd.vitals);
  if (vitalsList.length > 0) {
    const revealed = revealedSet.has("vitals");
    orderables.push({
      key: "vitals",
      section: "vitals",
      label: "Vitalparametrar",
      revealed,
      sub_items: revealed ? vitalsList : undefined,
    });
  }

  // lab_results (per item — student orders individual tests).
  // Reference range is pulled out of the value and appended to the label so
  // the UI shows e.g. "Hb (ref 117-153)" with just "129 g/L" as the value.
  for (const [k, v] of Object.entries(cd.lab_results ?? {})) {
    if (k.startsWith("_") || v == null || String(v).trim() === "") continue;
    const rawValue = typeof v === "object" ? JSON.stringify(v) : String(v);
    const { value: cleanValue, reference } = splitLabValue(rawValue);
    const key = `lab:${k}`;
    const revealed = revealedSet.has(key);
    orderables.push({
      key,
      section: "labs",
      label: labLabelWithReference(prettify(k), reference),
      revealed,
      value: revealed ? cleanValue : undefined,
      reference,
    });
  }

  // imaging (per item)
  for (const [k, v] of Object.entries(cd.imaging ?? {})) {
    if (k.startsWith("_") || v == null || String(v).trim() === "") continue;
    const key = `imaging:${k}`;
    const revealed = revealedSet.has(key);
    orderables.push({
      key,
      section: "imaging",
      label: prettify(k),
      revealed,
      value: revealed ? (typeof v === "object" ? JSON.stringify(v) : String(v)) : undefined,
    });
  }

  // physical_exam (per subsystem) — fixed display order + Swedish labels.
  const PHYSICAL_EXAM_ORDER = ["allmän", "cor", "pulm", "buk", "neuro", "övrigt"];
  const PHYSICAL_EXAM_LABELS: Record<string, string> = {
    allmän: "Allmäntillstånd",
    cor: "Cor",
    pulm: "Pulm",
    buk: "Buk",
    neuro: "Neuro",
    övrigt: "Övrigt",
  };
  const peEntries = Object.entries(cd.physical_exam ?? {})
    .filter(([k, v]) => !k.startsWith("_") && v != null && String(v).trim() !== "")
    .sort(([a], [b]) => {
      const ai = PHYSICAL_EXAM_ORDER.indexOf(a.toLowerCase());
      const bi = PHYSICAL_EXAM_ORDER.indexOf(b.toLowerCase());
      // Known keys → ordered position; unknown keys → after, alphabetically
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  for (const [k, v] of peEntries) {
    const key = `physical_exam:${k}`;
    const revealed = revealedSet.has(key);
    orderables.push({
      key,
      section: "physical_exam",
      label: PHYSICAL_EXAM_LABELS[k.toLowerCase()] ?? prettify(k),
      revealed,
      value: revealed ? (typeof v === "object" ? JSON.stringify(v) : String(v)) : undefined,
    });
  }

  return {
    session: {
      id: session.id,
      user_id: session.user_id,
      case_id: session.case_id,
      status: session.status,
      started_at: session.started_at,
      submitted_at: session.submitted_at,
      evaluated_at: session.evaluated_at,
      revealed_items: revealedItems,
      primary_diagnosis: session.primary_diagnosis,
      case_title: caseRow?.title ?? "Okänt fall",
      case_description: caseRow?.description ?? "",
      case_specialty: caseRow?.specialty ?? "",
      case_clinical_setting: caseRow?.clinical_setting ?? "",
      orderables,
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
  case_clinical_setting: string;
  total_score: number | null;
  grade: Grade | null;
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
    .select("id, title, specialty, clinical_setting")
    .in("id", caseIds);
  const caseMap = new Map(
    (cases ?? []).map((c: { id: string; title: string; specialty: string; clinical_setting: string }) => [
      c.id,
      c,
    ])
  );

  // Fetch evaluations for scored sessions
  const sessionIds = sessions.map((s) => s.id as string);
  const { data: evals } = await sb
    .from("evaluations")
    .select("session_id, total_score, grade")
    .in("session_id", sessionIds);
  const evalMap = new Map(
    (evals ?? []).map((e: { session_id: string; total_score: number; grade: string }) => [
      e.session_id,
      { total_score: Number(e.total_score) || 0, grade: e.grade as Grade },
    ])
  );

  return sessions.map((s) => {
    const c = caseMap.get(s.case_id as string);
    const ev = evalMap.get(s.id as string);
    return {
      id: s.id as string,
      status: s.status as string,
      started_at: s.started_at as string,
      submitted_at: (s.submitted_at as string) ?? null,
      evaluated_at: (s.evaluated_at as string) ?? null,
      case_title: c?.title ?? "Okänt fall",
      case_specialty: c?.specialty ?? "",
      case_clinical_setting: c?.clinical_setting ?? "",
      total_score: ev?.total_score ?? null,
      grade: ev?.grade ?? null,
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
  total_score: number;
  grade: Grade;
  rubric_scores: RubricAreaScore[];
  diagnosis_correct: boolean;
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
    .select("id, session_id, total_score, grade, rubric_scores, diagnosis_correct, created_at")
    .in("session_id", sessionIds);

  type EvalRow = {
    id: string;
    session_id: string;
    total_score: number;
    grade: string;
    rubric_scores: RubricAreaScore[];
    diagnosis_correct: boolean;
    created_at: string;
  };

  const evalMap = new Map(
    (evals ?? []).map((e: EvalRow) => [e.session_id, e])
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
      const ev = evalMap.get(s.id as string)!;
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
        id: ev.id,
        session_id: s.id as string,
        case_title: c?.title ?? "Okänt fall",
        case_specialty: c?.specialty ?? "",
        total_score: Number(ev.total_score) || 0,
        grade: ev.grade as Grade,
        rubric_scores: Array.isArray(ev.rubric_scores) ? ev.rubric_scores : [],
        diagnosis_correct: ev.diagnosis_correct,
        created_at: ev.created_at,
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
  total_score: number;
  grade: Grade;
  rubric_scores: RubricAreaScore[];
  auto_fail_triggered: AutoFailMatch[];
  summary: string;
  strengths: string[];
  improvements: string[];
  diagnosis_correct: boolean;
  created_at: string;
  case_title: string;
  case_specialty: string;
  case_clinical_setting: string;
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
        .select("title, specialty, clinical_setting, evaluation")
        .eq("id", session.case_id)
        .single();

      const hiddenDx =
        (caseRow?.evaluation as { hidden_diagnosis?: string } | null)?.hidden_diagnosis ?? "";

      return {
        id: ev.id,
        session_id: ev.session_id,
        total_score: Number(ev.total_score) || 0,
        grade: ev.grade as Grade,
        rubric_scores: Array.isArray(ev.rubric_scores) ? ev.rubric_scores : [],
        auto_fail_triggered: Array.isArray(ev.auto_fail_triggered) ? ev.auto_fail_triggered : [],
        summary: ev.summary,
        strengths: ev.strengths ?? [],
        improvements: ev.improvements ?? [],
        diagnosis_correct: ev.diagnosis_correct,
        created_at: ev.created_at,
        case_title: caseRow?.title ?? "Okänt fall",
        case_specialty: caseRow?.specialty ?? "",
        case_clinical_setting: caseRow?.clinical_setting ?? "",
        hidden_diagnosis: hiddenDx,
      };
    },
    [`evaluation-${userId}-${sessionId}`],
    { tags: [`evaluations-${userId}`, `evaluation-${sessionId}`], revalidate: 300 }
  )();

/* ------------------------------------------------------------------ */
/*  Dashboard overview stats                                           */
/* ------------------------------------------------------------------ */

/** Average total_score across all user evaluations, returned as 0-100 percentage. */
export const getAverageScore = (userId: string) =>
  unstable_cache(
    async (): Promise<number> => {
      const sb = createServiceRoleClient();

      const { data } = await sb
        .from("evaluations")
        .select("total_score")
        .eq("user_id", userId);

      if (!data || data.length === 0) return 0;

      const sum = data.reduce(
        (acc, e) => acc + (Number(e.total_score) || 0),
        0
      );
      return Math.round((sum / data.length) * 100);
    },
    [`avg-score-${userId}`],
    { tags: [`evaluations-${userId}`], revalidate: 60 }
  )();

/** Number of consecutive days (up to today) with at least one session. */
export const getSessionStreak = (userId: string) =>
  unstable_cache(
    async (): Promise<number> => {
      const sb = createServiceRoleClient();

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: sessions } = await sb
        .from("sessions")
        .select("started_at")
        .eq("user_id", userId)
        .gte("started_at", sixtyDaysAgo.toISOString())
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
