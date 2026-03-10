import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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

  /* ---- Free-tier limit check (atomic) ---- */
  const isFree = userRow.plan === "free";

  if (isFree) {
    const period = currentPeriod();

    const { data: result, error: rpcError } = await sb.rpc("increment_usage", {
      p_user_id: userId,
      p_period: period,
      p_limit: FREE_LIMIT,
    });

    if (rpcError) {
      console.error("Usage increment RPC failed:", rpcError);
      return NextResponse.json(
        { error: "Kunde inte verifiera användningsgräns." },
        { status: 500 }
      );
    }

    // result === -1 means the limit was already reached
    if (result === -1) {
      return NextResponse.json(
        {
          error: `Du har nått månadens gräns (${FREE_LIMIT} fall). Uppgradera till Pro för obegränsat.`,
        },
        { status: 403 }
      );
    }
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

  /* ---- Invalidate cached data ---- */
  revalidateTag(`sessions-${userId}`, "default");
  revalidateTag(`usage-${userId}`, "default");

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
