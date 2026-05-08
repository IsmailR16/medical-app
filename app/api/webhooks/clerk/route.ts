/**
 * Clerk webhook handler — keeps Supabase in sync with Clerk.
 *
 * Handles events:
 *   user.created  — backup for JIT creation in getOrCreateUser
 *   user.updated  — sync name/email/avatar changes
 *   user.deleted  — cascade delete from Supabase (sessions, messages, evaluations, etc.)
 *
 * Setup:
 *   1. In Clerk Dashboard → Configure → Webhooks → Add endpoint
 *   2. URL: https://<your-domain>/api/webhooks/clerk
 *   3. Select events: user.created, user.updated, user.deleted
 *   4. Copy signing secret into env var CLERK_WEBHOOK_SECRET
 */

import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceRoleClient } from "@/lib/supabase/server";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    deleted?: boolean;
  };
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Svix sends signature headers used to verify the payload integrity.
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();

  let evt: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sb = createServiceRoleClient();

  try {
    if (evt.type === "user.created") {
      // JIT-creation in getOrCreateUser handles this for normal flows; this
      // is a backup to catch users created via Clerk dashboard or other paths.
      const u = evt.data;
      const email = primaryEmail(u);
      if (!email) {
        console.warn("user.created: no primary email, skipping");
        return NextResponse.json({ ok: true });
      }
      const fullName = joinName(u.first_name, u.last_name);

      // Upsert by user_id — won't overwrite existing rows.
      await sb.from("users").upsert(
        {
          user_id: u.id,
          email,
          full_name: fullName,
          avatar_url: u.image_url ?? null,
          plan: "free",
          subscription_status: "inactive",
          cancel_at_period_end: false,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    }

    if (evt.type === "user.updated") {
      const u = evt.data;
      const email = primaryEmail(u);
      const fullName = joinName(u.first_name, u.last_name);

      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (email) update.email = email;
      update.full_name = fullName;
      update.avatar_url = u.image_url ?? null;

      await sb.from("users").update(update).eq("user_id", u.id);
    }

    if (evt.type === "user.deleted") {
      const u = evt.data;
      // Sessions has CASCADE → messages + evaluations get cleaned up automatically
      // when sessions are deleted (or when users row is deleted, since session
      // FK is ON DELETE CASCADE).
      await sb.from("users").delete().eq("user_id", u.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`Failed to handle ${evt.type}:`, err);
    return NextResponse.json(
      { error: "Failed to process event" },
      { status: 500 }
    );
  }
}

function primaryEmail(u: ClerkUserEvent["data"]): string | null {
  if (!u.email_addresses || u.email_addresses.length === 0) return null;
  const primary = u.email_addresses.find((e) => e.id === u.primary_email_address_id);
  return primary?.email_address ?? u.email_addresses[0].email_address;
}

function joinName(first?: string | null, last?: string | null): string | null {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : null;
}
