/**
 * GET /api/cron/cleanup-inactive
 * Daily cron that handles 24-month inactivity-based account deletion.
 *
 * Flow (per docs/legal/retention-policy.md):
 *   1. Send 30-day warning to users at 23-month inactivity (warning_30d_sent_at = null)
 *   2. Send 7-day warning to users at 23m + 3w inactivity (warning_7d_sent_at = null)
 *   3. Delete users at 24-month+ inactivity (plus send confirmation mail)
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` header.
 *
 * Configure schedule in vercel.json.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  warning30dMail,
  warning7dMail,
  deletionConfirmationMail,
} from "@/lib/email/inactivity-mails";

// Allow long-running execution for batch processing
export const maxDuration = 60;

// Calendar-month-based thresholds (handles months of varying length correctly).
// Account is deleted after 24 calendar months of inactivity. Warnings are
// sent at the 23-month mark and again 7 days before deletion.
function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function GET(request: Request) {
  // Verify request is from Vercel Cron (or authorized manual trigger)
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? "Diagnostika <noreply@diagnostika.se>";
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return NextResponse.json({ error: "Mail not configured" }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const sb = createServiceRoleClient();

  const summary = {
    warnings_30d_sent: 0,
    warnings_7d_sent: 0,
    deleted: 0,
    errors: [] as string[],
  };

  // Cutoffs (calendar-month based):
  //   D0  = 24 months ago — last_login <= D0  → user is past 24m inactivity (delete)
  //   D7  = D0 + 7 days   — last_login <= D7  → within 7-day deletion window
  //   D30 = 23 months ago — last_login <= D30 → at least 23m inactive (30d warning window)
  const D0 = monthsAgo(24);
  const D7 = addDays(D0, 7);
  const D30 = monthsAgo(23);

  /* ---- 1. 30-day warnings: inactive between 23m and 23m+3w ---- */
  const { data: warn30Users } = await sb
    .from("users")
    .select("user_id, email, full_name")
    .lte("last_login_at", D30.toISOString())
    .gt("last_login_at", D7.toISOString())
    .is("warning_30d_sent_at", null);

  for (const u of warn30Users ?? []) {
    try {
      const mail = warning30dMail(u.full_name);
      await resend.emails.send({
        from: fromAddress,
        to: u.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      await sb
        .from("users")
        .update({ warning_30d_sent_at: new Date().toISOString() })
        .eq("user_id", u.user_id);
      summary.warnings_30d_sent++;
    } catch (err) {
      summary.errors.push(`30d warning for ${u.user_id}: ${err}`);
    }
  }

  /* ---- 2. 7-day warnings: inactive between (24m-7d) and 24m ---- */
  const { data: warn7Users } = await sb
    .from("users")
    .select("user_id, email, full_name")
    .lte("last_login_at", D7.toISOString())
    .gt("last_login_at", D0.toISOString())
    .is("warning_7d_sent_at", null);

  for (const u of warn7Users ?? []) {
    try {
      const mail = warning7dMail(u.full_name);
      await resend.emails.send({
        from: fromAddress,
        to: u.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      await sb
        .from("users")
        .update({ warning_7d_sent_at: new Date().toISOString() })
        .eq("user_id", u.user_id);
      summary.warnings_7d_sent++;
    } catch (err) {
      summary.errors.push(`7d warning for ${u.user_id}: ${err}`);
    }
  }

  /* ---- 3. Delete users past 24 months ---- */
  const { data: deleteUsers } = await sb
    .from("users")
    .select("user_id, email, full_name")
    .lte("last_login_at", D0.toISOString());

  let clerkClientInstance: Awaited<ReturnType<typeof clerkClient>> | null = null;

  for (const u of deleteUsers ?? []) {
    try {
      // Send confirmation mail FIRST (before deletion, so user gets it)
      const mail = deletionConfirmationMail(u.full_name);
      await resend.emails.send({
        from: fromAddress,
        to: u.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });

      // Delete Supabase row (cascades to sessions, messages, evaluations, etc.)
      await sb.from("users").delete().eq("user_id", u.user_id);

      // Delete Clerk user
      if (!clerkClientInstance) clerkClientInstance = await clerkClient();
      await clerkClientInstance.users.deleteUser(u.user_id);

      summary.deleted++;
    } catch (err) {
      summary.errors.push(`delete ${u.user_id}: ${err}`);
    }
  }

  console.log("cleanup-inactive summary:", summary);
  return NextResponse.json(summary);
}
