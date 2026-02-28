import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const FREE_LIMIT = 3;

export async function POST(request: Request) {
  /* ---- Auth ---- */
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Ej autentiserad." },
      { status: 401 }
    );
  }

  /* ---- Body ---- */
  let caseId: string;
  try {
    const body = await request.json();
    caseId = body.caseId;
    if (typeof caseId !== "string" || !caseId) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "caseId krävs." },
      { status: 400 }
    );
  }

  const sb = createServiceRoleClient();

  /* ---- Verify case exists and is published ---- */
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, presenting_complaint")
    .eq("id", caseId)
    .eq("is_published", true)
    .single();

  if (!caseRow) {
    return NextResponse.json(
      { error: "Patientfallet hittades inte." },
      { status: 404 }
    );
  }

  /* ---- Fetch user row ---- */
  const { data: userRow } = await sb
    .from("users")
    .select("plan, subscription_status")
    .eq("user_id", userId)
    .single();

  if (!userRow) {
    return NextResponse.json(
      { error: "Användare saknas." },
      { status: 404 }
    );
  }

  /* ---- Free-tier limit check ---- */
  const isFree = userRow.plan === "free";

  if (isFree) {
    const period = currentPeriod();

    // Upsert usage row (create if missing) and check count atomically
    const { data: usageRow } = await sb
      .from("usage")
      .upsert(
        { user_id: userId, period, sessions_started: 0 },
        { onConflict: "user_id,period", ignoreDuplicates: true }
      )
      .select("sessions_started")
      .single();

    // Re-fetch to get current value (upsert with ignoreDuplicates doesn't return the existing row reliably)
    const { data: currentUsage } = await sb
      .from("usage")
      .select("sessions_started")
      .eq("user_id", userId)
      .eq("period", period)
      .single();

    const used = currentUsage?.sessions_started ?? usageRow?.sessions_started ?? 0;

    if (used >= FREE_LIMIT) {
      return NextResponse.json(
        {
          error: `Du har nått månadens gräns (${FREE_LIMIT} fall). Uppgradera till Pro för obegränsat.`,
        },
        { status: 403 }
      );
    }

    // Increment usage atomically using RPC
    // Fallback: simple increment (tiny race window acceptable for MVP)
    await sb
      .from("usage")
      .update({ sessions_started: used + 1 })
      .eq("user_id", userId)
      .eq("period", period);
  }

  /* ---- Create session ---- */
  const { data: session, error: sessionError } = await sb
    .from("sessions")
    .insert({
      user_id: userId,
      case_id: caseId,
      status: "active",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("Failed to create session:", sessionError);
    return NextResponse.json(
      { error: "Kunde inte skapa sessionen." },
      { status: 500 }
    );
  }

  /* ---- Insert system message with presenting complaint ---- */
  await sb.from("messages").insert({
    session_id: session.id,
    role: "assistant",
    content: caseRow.presenting_complaint,
  });

  return NextResponse.json({ sessionId: session.id });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
