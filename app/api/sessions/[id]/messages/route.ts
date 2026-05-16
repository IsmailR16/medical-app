import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  generatePatientResponse,
  generateEvaluation,
  type CaseContext,
  type ConversationMessage,
} from "@/lib/ai/patient";
import {
  detectRealPatientData,
  SAFETY_WARNING,
} from "@/lib/safety/real-patient-detection";

// Allow long-running evaluation calls on Vercel (Pro plan = up to 300s).
export const maxDuration = 150;

const MAX_MESSAGE_LENGTH = 500;
// Cap chat turns per session. A thorough OSCE interview is ~15-40 exchanges;
// 60 leaves generous headroom while bounding both the (quadratically growing)
// patient-chat token cost AND the conversation size fed into the 6 evaluation
// calls. Submission is exempt — a student can always submit at the cap.
const MAX_USER_MESSAGES_PER_SESSION = 60;
// A clinical submission (diagnosis + differentials + plan + reasoning) is
// legitimately longer than a single chat turn but still tightly bounded —
// every char is sent into ~6 evaluation calls (5 area + 1 meta), so length
// directly multiplies token cost. Must stay above the sum of the per-field
// client maxLengths in DiagnosisModal (150+300+1000+1000 + labels ≈ 2600).
const MAX_SUBMISSION_LENGTH = 3000;

/**
 * Collapse whitespace abuse: runs of spaces/tabs → one space, 3+ newlines →
 * two, trim ends. Stops users padding a submission with whitespace to bloat
 * the evaluation prompt's token count. Single newlines are preserved so
 * differential-per-line structure survives.
 */
function normalizeWhitespace(s: string): string {
  return s
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Hard cap on AI evaluations per user per UTC day. Each evaluation fans out to
// ~6 OpenAI calls (~$0.02-0.04). "Pro" is unlimited *sessions* but evals must
// still be bounded so a single account can't rack up unbounded OpenAI cost
// (scripted create→submit→eval loops). 30/day is generous for real study use
// (a heavy day is ~5-10 cases) while capping worst-case abuse at ~$1.20/day.
const DAILY_EVAL_CAP = 30;

/** UTC day key for the per-user daily eval counter, e.g. "eval-2026-05-15". */
function dailyEvalPeriod(): string {
  return `eval-${new Date().toISOString().slice(0, 10)}`;
}

// Simple in-memory rate limiter: max 10 messages per user per 60s
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_MAX;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  /* ---- Auth ---- */
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Ej autentiserad." },
      { status: 401 }
    );
  }

  /* ---- Rate limit ---- */
  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Du skickar meddelanden för snabbt. Vänta lite." },
      { status: 429 }
    );
  }

  /* ---- Body ---- */
  let content: string;
  let submitDiagnosis = false;
  let submission: {
    primary_diagnosis: string;
    differential_diagnoses: string[];
    treatment_plan: string;
    reasoning?: string;
  } | null = null;

  try {
    const body = await request.json();
    submitDiagnosis = body.submitDiagnosis === true;

    if (submitDiagnosis) {
      submission = {
        primary_diagnosis: normalizeWhitespace(String(body.primary_diagnosis ?? "")),
        differential_diagnoses: Array.isArray(body.differential_diagnoses)
          ? body.differential_diagnoses
              .map((d: unknown) => normalizeWhitespace(String(d)))
              .filter(Boolean)
          : [],
        treatment_plan: normalizeWhitespace(String(body.treatment_plan ?? "")),
        reasoning: body.reasoning
          ? normalizeWhitespace(String(body.reasoning)) || undefined
          : undefined,
      };
      if (!submission.primary_diagnosis || !submission.treatment_plan) {
        throw new Error();
      }
      // Build a chat-displayable rendering of the submission
      const diffsLine =
        submission.differential_diagnoses.length > 0
          ? submission.differential_diagnoses.map((d) => `- ${d}`).join("\n")
          : "(inga angivna)";
      content =
        `DIAGNOS: ${submission.primary_diagnosis}\n\n` +
        `DIFFERENTIALDIAGNOSER:\n${diffsLine}\n\n` +
        `HANDLÄGGNINGSPLAN: ${submission.treatment_plan}` +
        (submission.reasoning ? `\n\nRESONEMANG: ${submission.reasoning}` : "");
    } else {
      content = String(body.content ?? "").trim();
      if (!content) throw new Error();
    }
  } catch {
    return NextResponse.json(
      { error: submitDiagnosis ? "Diagnos och plan krävs." : "Meddelande krävs." },
      { status: 400 }
    );
  }

  const maxLen = submitDiagnosis ? MAX_SUBMISSION_LENGTH : MAX_MESSAGE_LENGTH;
  if (content.length > maxLen) {
    return NextResponse.json(
      {
        error: submitDiagnosis
          ? `Inlämningen är för lång (max ${MAX_SUBMISSION_LENGTH} tecken).`
          : `Meddelandet är för långt (max ${MAX_MESSAGE_LENGTH} tecken).`,
      },
      { status: 400 }
    );
  }

  const sb = createServiceRoleClient();

  /* ---- Verify session belongs to user and is active ---- */
  const { data: session } = await sb
    .from("sessions")
    .select("id, case_id, status, revealed_items")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "Session hittades inte." },
      { status: 404 }
    );
  }

  if (session.status !== "active") {
    return NextResponse.json(
      { error: "Sessionen är inte aktiv." },
      { status: 400 }
    );
  }

  /* ---- Per-session chat-turn cap (submission exempt) ---- */
  if (!submitDiagnosis) {
    const { count: userMsgCount } = await sb
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("role", "user");

    if ((userMsgCount ?? 0) >= MAX_USER_MESSAGES_PER_SESSION) {
      return NextResponse.json(
        {
          error: `Du har nått maxgränsen för meddelanden i denna session (${MAX_USER_MESSAGES_PER_SESSION}). Lämna in din bedömning för att få feedback.`,
        },
        { status: 429 }
      );
    }
  }

  /* ---- Fetch full case data for AI context ---- */
  const { data: caseRow } = await sb
    .from("cases")
    .select("description, specialty, clinical_setting, simulation, evaluation")
    .eq("id", session.case_id)
    .single();

  if (!caseRow) {
    return NextResponse.json(
      { error: "Patientfallet hittades inte." },
      { status: 404 }
    );
  }

  const caseContext: CaseContext = {
    description: caseRow.description,
    specialty: caseRow.specialty,
    clinical_setting: caseRow.clinical_setting,
    simulation: caseRow.simulation as CaseContext["simulation"],
    evaluation: caseRow.evaluation as CaseContext["evaluation"],
  };

  /* ---- Real-patient-data safety check (only for chat, not for submission) ---- */
  const detection = !submitDiagnosis ? detectRealPatientData(content) : { level: "none" as const, reason: null };

  if (detection.level === "strong") {
    // Block: user message is NOT saved. Insert a system warning instead and
    // return it as if it were the assistant's response.
    const warningContent = SAFETY_WARNING.strong(detection.reason ?? "Identifierande information upptäckt");
    const { data: warnMsg } = await sb
      .from("messages")
      .insert({
        session_id: sessionId,
        role: "system",
        content: warningContent,
      })
      .select("id, role, content, created_at")
      .single();

    return NextResponse.json({
      message: {
        id: warnMsg?.id ?? "blocked",
        role: "system",
        content: warningContent,
        created_at: warnMsg?.created_at ?? new Date().toISOString(),
      },
      blocked: true,
    });
  }

  /* ---- Save user message ---- */
  const { error: userMsgError } = await sb.from("messages").insert({
    session_id: sessionId,
    role: "user",
    content,
  });

  if (userMsgError) {
    console.error("Failed to save user message:", userMsgError);
    return NextResponse.json(
      { error: "Kunde inte spara meddelandet." },
      { status: 500 }
    );
  }

  // Weak detection: insert system warning AFTER user message so it appears
  // between user input and AI response. Returned in response so client can
  // display it without a re-fetch.
  let weakSystemMessage: { id: string; role: string; content: string; created_at: string } | null = null;
  if (detection.level === "weak") {
    const warningContent = SAFETY_WARNING.weak(
      detection.reason ?? "Möjlig referens till verklig person"
    );
    const { data: warnMsg } = await sb
      .from("messages")
      .insert({
        session_id: sessionId,
        role: "system",
        content: warningContent,
      })
      .select("id, role, content, created_at")
      .single();
    if (warnMsg) {
      weakSystemMessage = {
        id: warnMsg.id,
        role: warnMsg.role,
        content: warnMsg.content,
        created_at: warnMsg.created_at,
      };
    }
  }

  /* ---- Handle diagnosis submission ---- */
  if (submitDiagnosis && submission) {
    // Daily eval cap (atomic, race-safe via the same RPC as the monthly
    // free-tier limiter). Checked BEFORE marking the session submitted so a
    // capped user can retry tomorrow instead of being stuck with an
    // un-evaluable submitted session. Counts even if the eval later fails —
    // failed evals still cost OpenAI tokens.
    const { data: evalCount, error: capError } = await sb.rpc("increment_usage", {
      p_user_id: userId,
      p_period: dailyEvalPeriod(),
      p_limit: DAILY_EVAL_CAP,
    });

    if (capError) {
      console.error("Daily eval cap RPC failed:", capError);
      return NextResponse.json(
        { error: "Kunde inte verifiera utvärderingsgräns." },
        { status: 500 }
      );
    }

    if (evalCount === -1) {
      return NextResponse.json(
        {
          error: `Du har nått dagens gräns (${DAILY_EVAL_CAP} utvärderingar). Försök igen imorgon.`,
        },
        { status: 429 }
      );
    }

    // Update session status to submitted (also stores the structured submission)
    await sb
      .from("sessions")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        primary_diagnosis: submission.primary_diagnosis,
        differential_diagnoses: submission.differential_diagnoses,
        treatment_plan: submission.treatment_plan,
        reasoning: submission.reasoning ?? null,
      })
      .eq("id", sessionId);

    // Fetch the interview for evaluation. Exclude the submission message we
    // just saved above (its content === `content`): it's passed separately as
    // the `submission` arg and already rendered in the eval prompt's
    // "STUDENTENS INLÄMNING" section, so including it in the chat log would be
    // redundant AND would defeat the degenerate-submission gate (which counts
    // real interview turns via user-message count).
    const { data: allMessages } = await sb
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const conversationHistory: ConversationMessage[] = (allMessages ?? [])
      .filter((m: { role: string; content: string }) => m.content !== content)
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

    const orderedItems: string[] = (session.revealed_items as string[] | null) ?? [];

    // Generate AI evaluation
    try {
      const evaluation = await generateEvaluation(
        caseContext,
        conversationHistory,
        orderedItems,
        submission
      );

      // Save evaluation
      await sb.from("evaluations").insert({
        session_id: sessionId,
        user_id: userId,
        case_id: session.case_id,
        total_score: evaluation.total_score,
        grade: evaluation.grade,
        rubric_scores: evaluation.rubric_scores,
        auto_fail_triggered: evaluation.auto_fail_triggered,
        summary: evaluation.summary,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        diagnosis_correct: evaluation.diagnosis_correct,
      });

      // Update session to evaluated
      await sb
        .from("sessions")
        .update({
          status: "evaluated",
          evaluated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      // Save a system message confirming evaluation
      const pct = Math.round(evaluation.total_score * 100);
      const evalSummaryContent = `Utvärdering klar! Betyg: ${evaluation.grade} (${pct}%)\n\n${evaluation.summary}`;

      const { data: evalMsg } = await sb
        .from("messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: evalSummaryContent,
        })
        .select("id, role, content, created_at")
        .single();

      /* ---- Invalidate cached data ---- */
      revalidateTag(`sessions-${userId}`, "default");
      revalidateTag(`evaluations-${userId}`, "default");

      return NextResponse.json({
        message: {
          id: evalMsg?.id ?? "eval",
          role: "assistant",
          content: evalSummaryContent,
          created_at: evalMsg?.created_at ?? new Date().toISOString(),
        },
        evaluated: true,
        grade: evaluation.grade,
        total_score: evaluation.total_score,
      });
    } catch (evalErr) {
      console.error("Evaluation failed:", evalErr);

      // Still mark as submitted even if evaluation fails
      revalidateTag(`sessions-${userId}`, "default");

      const fallbackContent =
        "Din diagnos har tagits emot. Utvärderingen misslyckades tyvärr — försök igen senare.";

      const { data: fallbackMsg } = await sb
        .from("messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: fallbackContent,
        })
        .select("id, role, content, created_at")
        .single();

      return NextResponse.json({
        message: {
          id: fallbackMsg?.id ?? "fallback",
          role: "assistant",
          content: fallbackContent,
          created_at: fallbackMsg?.created_at ?? new Date().toISOString(),
        },
        evaluated: false,
      });
    }
  }

  /* ---- Fetch conversation history for AI context ---- */
  const { data: historyMessages } = await sb
    .from("messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const conversationHistory: ConversationMessage[] = (
    historyMessages ?? []
  ).map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  /* ---- Generate AI patient response ---- */
  let assistantContent: string;
  try {
    assistantContent = await generatePatientResponse(
      caseContext,
      conversationHistory
    );
  } catch (aiErr) {
    console.error("AI generation failed:", aiErr);
    assistantContent =
      "Förlåt, jag mår inte så bra just nu och har svårt att svara. Kan du fråga igen?";
  }

  /* ---- Save assistant message ---- */
  const { data: assistantMsg, error: assistantMsgError } = await sb
    .from("messages")
    .insert({
      session_id: sessionId,
      role: "assistant",
      content: assistantContent,
    })
    .select("id, role, content, created_at")
    .single();

  if (assistantMsgError || !assistantMsg) {
    console.error("Failed to save assistant message:", assistantMsgError);
    return NextResponse.json(
      { error: "Kunde inte generera svar." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: {
      id: assistantMsg.id,
      role: assistantMsg.role,
      content: assistantMsg.content,
      created_at: assistantMsg.created_at,
    },
    systemMessage: weakSystemMessage,
  });
}
