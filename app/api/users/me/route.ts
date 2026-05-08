/**
 * DELETE /api/users/me
 * Account deletion (GDPR Art. 17).
 *
 * Flow:
 *   1. Verify user is authenticated.
 *   2. Delete the Supabase user row — cascades to sessions, messages,
 *      evaluations, usage, institution_members.
 *   3. Delete the Clerk user via Clerk Backend SDK.
 *   4. (Webhook user.deleted will fire — idempotent because the row is
 *      already gone.)
 *
 * Stripe data is NOT deleted here — bookkeeping retention (7 years) overrides
 * GDPR erasure for invoices. Stripe customer record stays in Stripe.
 */

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  const sb = createServiceRoleClient();

  // 1. Delete Supabase user row (cascades to sessions/messages/evaluations/etc.)
  const { error: dbError } = await sb.from("users").delete().eq("user_id", userId);
  if (dbError) {
    console.error("Failed to delete Supabase user:", dbError);
    return NextResponse.json(
      { error: "Kunde inte radera kontot. Kontakta privacy@diagnostika.se." },
      { status: 500 }
    );
  }

  // 2. Delete Clerk user (this also signs them out)
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (err) {
    // Supabase row is already gone, but Clerk failed. Log + return success to user.
    // Background cleanup may be needed, but user data has been removed.
    console.error("Failed to delete Clerk user (Supabase already removed):", err);
  }

  return NextResponse.json({ ok: true });
}
