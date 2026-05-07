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

// Allow long-running evaluation calls on Vercel (Pro plan = up to 300s).
export const maxDuration = 150;

const MAX_MESSAGE_LENGTH = 2000;

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
        primary_diagnosis: String(body.primary_diagnosis ?? "").trim(),
        differential_diagnoses: Array.isArray(body.differential_diagnoses)
          ? body.differential_diagnoses.map((d: unknown) => String(d).trim()).filter(Boolean)
          : [],
        treatment_plan: String(body.treatment_plan ?? "").trim(),
        reasoning: body.reasoning ? String(body.reasoning).trim() : undefined,
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

  if (content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `Meddelandet är för långt (max ${MAX_MESSAGE_LENGTH} tecken).`,
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

  /* ---- Handle diagnosis submission ---- */
  if (submitDiagnosis && submission) {
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

    // Fetch full conversation for evaluation
    const { data: allMessages } = await sb
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const conversationHistory: ConversationMessage[] = (allMessages ?? []).map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })
    );

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
  });
}
