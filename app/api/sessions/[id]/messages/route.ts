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
  try {
    const body = await request.json();
    content = String(body.content ?? "").trim();
    submitDiagnosis = body.submitDiagnosis === true;
    if (!content) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Meddelande krävs." },
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
    .select("id, case_id, status")
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
    .select(
      "description, patient_name, patient_age, patient_gender, patient_background, presenting_complaint, hidden_diagnosis, differential_diagnoses, vitals, lab_results, imaging, physical_exam, medications, system_prompt_extra"
    )
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
    patient_name: caseRow.patient_name,
    patient_age: caseRow.patient_age,
    patient_gender: caseRow.patient_gender,
    patient_background: caseRow.patient_background,
    presenting_complaint: caseRow.presenting_complaint,
    hidden_diagnosis: caseRow.hidden_diagnosis,
    differential_diagnoses: caseRow.differential_diagnoses ?? [],
    vitals: (caseRow.vitals as Record<string, unknown>) ?? {},
    lab_results: (caseRow.lab_results as Record<string, unknown>) ?? {},
    imaging: (caseRow.imaging as Record<string, unknown>) ?? {},
    physical_exam: (caseRow.physical_exam as Record<string, unknown>) ?? {},
    medications: caseRow.medications ?? [],
    system_prompt_extra: caseRow.system_prompt_extra ?? null,
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
  if (submitDiagnosis) {
    // Parse diagnosis and treatment from the formatted content
    const diagnosisMatch = content.match(/DIAGNOS:\s*([\s\S]*?)(?:\n\nBEHANDLINGSPLAN:|$)/);
    const treatmentMatch = content.match(/BEHANDLINGSPLAN:\s*([\s\S]*?)$/);
    const studentDiagnosis = diagnosisMatch?.[1]?.trim() ?? content;
    const studentTreatment = treatmentMatch?.[1]?.trim() ?? "";

    // Update session status to submitted
    await sb
      .from("sessions")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        primary_diagnosis: studentDiagnosis,
        treatment_plan: studentTreatment,
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

    // Generate AI evaluation
    try {
      const evaluation = await generateEvaluation(
        caseContext,
        conversationHistory,
        studentDiagnosis,
        studentTreatment
      );

      // Save evaluation
      await sb.from("evaluations").insert({
        session_id: sessionId,
        user_id: userId,
        case_id: session.case_id,
        overall_score: evaluation.overall_score,
        history_taking_score: evaluation.history_taking_score,
        physical_exam_score: evaluation.physical_exam_score,
        diagnosis_score: evaluation.diagnosis_score,
        treatment_score: evaluation.treatment_score,
        reasoning_score: evaluation.reasoning_score,
        summary: evaluation.summary,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        missed_findings: evaluation.missed_findings,
        diagnosis_correct: evaluation.diagnosis_correct,
        raw_response: evaluation,
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
      const evalSummaryContent = `Utvärdering klar! Poäng: ${evaluation.overall_score}/100\n\n${evaluation.summary}`;

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
        score: evaluation.overall_score,
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
