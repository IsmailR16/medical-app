/**
 * DELETE /api/sessions/[id]
 * Delete a single session (GDPR Art. 17, granular).
 * Cascades to messages and evaluations via the schema's ON DELETE CASCADE.
 */

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  const sb = createServiceRoleClient();

  // Verify ownership before deleting
  const { data: session } = await sb
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session hittades inte." }, { status: 404 });
  }

  const { error } = await sb.from("sessions").delete().eq("id", sessionId);
  if (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Kunde inte radera sessionen." },
      { status: 500 }
    );
  }

  // Invalidate caches that include this session
  revalidateTag(`sessions-${userId}`, "default");
  revalidateTag(`evaluations-${userId}`, "default");

  return NextResponse.json({ ok: true });
}
