import "server-only";

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
export async function getMonthlyUsage(
  userId: string
): Promise<UsageRow | null> {
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("period", currentPeriod())
    .single();
  return (data as UsageRow) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Recent sessions (last 10)                                          */
/* ------------------------------------------------------------------ */

export async function getRecentSessions(
  userId: string
): Promise<RecentSession[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("sessions")
    .select("id, status, started_at, case_id")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return [];

  // Fetch case titles in a single query
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
}

/* ------------------------------------------------------------------ */
/*  Latest evaluations (last 5)                                        */
/* ------------------------------------------------------------------ */

export async function getLatestEvaluations(
  userId: string
): Promise<LatestEvaluation[]> {
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
}

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

export async function getPublishedCases(): Promise<CaseListItem[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("cases")
    .select("id, title, description, specialty, difficulty")
    .eq("is_published", true)
    .eq("is_community", true)
    .order("title", { ascending: true });

  return (data as CaseListItem[]) ?? [];
}

/* ------------------------------------------------------------------ */
/*  Session + Messages for chat page                                   */
/* ------------------------------------------------------------------ */

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
  presenting_complaint: string;
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
    .select("title, description, presenting_complaint")
    .eq("id", session.case_id)
    .single();

  const { data: messages } = await sb
    .from("messages")
    .select("id, role, content, clinical_data_type, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

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
      presenting_complaint: caseRow?.presenting_complaint ?? "",
    },
    messages: (messages as MessageRow[]) ?? [],
  };
}
