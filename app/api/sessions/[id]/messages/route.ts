import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

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
  try {
    const body = await request.json();
    content = String(body.content ?? "").trim();
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

  /* ---- Generate AI response ---- */
  // TODO: Replace this placeholder with a real AI call (OpenAI / Anthropic / etc.)
  // For now, return a placeholder assistant reply so the chat flow works end-to-end.
  const assistantContent =
    "Jag förstår. Kan du berätta mer om dina symtom? När började de och hur skulle du beskriva dem?";

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
