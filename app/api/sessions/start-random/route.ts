/**
 * POST /api/sessions/start-random
 * Picks a random published case and starts a session.
 *
 * Mirrors /api/sessions/start but selects the case server-side from
 * is_published = true rows. Honors free-tier limit.
 */

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { FREE_LIMIT } from "@/lib/plans";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  const sb = createServiceRoleClient();

  /* ---- Fetch user (plan/status) + all published case IDs in parallel ---- */
  const [userResult, casesResult] = await Promise.all([
    sb
      .from("users")
      .select("plan, subscription_status")
      .eq("user_id", userId)
      .single(),
    sb.from("cases").select("id").eq("is_published", true),
  ]);

  const userRow = userResult.data;
  if (!userRow) {
    return NextResponse.json({ error: "Användare saknas." }, { status: 404 });
  }

  const caseIds = (casesResult.data ?? []).map((c) => c.id as string);
  if (caseIds.length === 0) {
    return NextResponse.json(
      { error: "Inga patientfall finns tillgängliga." },
      { status: 404 }
    );
  }

  /* ---- Free-tier limit check (atomic) ---- */
  if (userRow.plan === "free") {
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
    if (result === -1) {
      return NextResponse.json(
        {
          error: `Du har nått månadens gräns (${FREE_LIMIT} fall). Uppgradera till Pro för obegränsat.`,
        },
        { status: 403 }
      );
    }
  }

  /* ---- Pick a random case ---- */
  const randomCaseId = caseIds[Math.floor(Math.random() * caseIds.length)];

  /* ---- Fetch chosen case (for opening_message) ---- */
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, simulation")
    .eq("id", randomCaseId)
    .single();

  if (!caseRow) {
    return NextResponse.json(
      { error: "Slumpat fall kunde inte hämtas." },
      { status: 500 }
    );
  }

  const openingMessage =
    (caseRow.simulation as { opening_message?: string } | null)?.opening_message ?? "";

  /* ---- Create session ---- */
  const { data: session, error: sessionError } = await sb
    .from("sessions")
    .insert({
      user_id: userId,
      case_id: randomCaseId,
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

  /* ---- Insert opening message ---- */
  if (openingMessage) {
    await sb.from("messages").insert({
      session_id: session.id,
      role: "assistant",
      content: openingMessage,
    });
  }

  revalidateTag(`sessions-${userId}`, "default");
  revalidateTag(`usage-${userId}`, "default");

  return NextResponse.json({ sessionId: session.id });
}

function currentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
