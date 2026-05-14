/**
 * POST /api/feedback
 * Sends user-submitted feedback (bug/förslag/fråga/annat) to the team's mailbox.
 *
 * Requires env vars:
 *   RESEND_API_KEY
 *   RESEND_FROM_ADDRESS  — t.ex. "Diagnostika <noreply@diagnostika.se>"
 *   FEEDBACK_TO_ADDRESS  — t.ex. "feedback@diagnostika.se"
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const MAX_LENGTH = 2000;

type Category = "bug" | "suggestion" | "question" | "other";

const CATEGORY_LABEL: Record<Category, string> = {
  bug: "Bug",
  suggestion: "Förslag",
  question: "Fråga",
  other: "Annat",
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  let body: { category?: string; message?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig request." }, { status: 400 });
  }

  const category = (body.category ?? "other") as Category;
  if (!(category in CATEGORY_LABEL)) {
    return NextResponse.json({ error: "Ogiltig kategori." }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Meddelande krävs." }, { status: 400 });
  }
  if (message.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Meddelandet är för långt (max ${MAX_LENGTH} tecken).` },
      { status: 400 }
    );
  }

  const url = body.url ? String(body.url).slice(0, 500) : "(ej angiven)";

  // Fetch user info for context (best-effort)
  const sb = createServiceRoleClient();
  const { data: user } = await sb
    .from("users")
    .select("email, full_name, plan")
    .eq("user_id", userId)
    .single();

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.RESEND_FROM_ADDRESS ?? "Diagnostika <noreply@diagnostika.se>";
  const toAddress = process.env.FEEDBACK_TO_ADDRESS ?? "feedback@diagnostika.se";

  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return NextResponse.json({ error: "Mail inte konfigurerat." }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const subject = `[Feedback / ${CATEGORY_LABEL[category]}] ${message.slice(0, 60)}${message.length > 60 ? "..." : ""}`;

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d3557;">
  <h2 style="margin:0 0 16px;">Feedback från Diagnostika-användare</h2>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
    <tr><td><strong>Kategori</strong></td><td>${CATEGORY_LABEL[category]}</td></tr>
    <tr><td><strong>Användare</strong></td><td>${escapeHtml(user?.full_name ?? "(okänt)")}</td></tr>
    <tr><td><strong>E-post</strong></td><td>${escapeHtml(user?.email ?? "(okänt)")}</td></tr>
    <tr><td><strong>Plan</strong></td><td>${escapeHtml(user?.plan ?? "(okänd)")}</td></tr>
    <tr><td><strong>user_id</strong></td><td><code>${escapeHtml(userId)}</code></td></tr>
    <tr><td><strong>URL</strong></td><td>${escapeHtml(url)}</td></tr>
    <tr><td><strong>Datum</strong></td><td>${new Date().toISOString()}</td></tr>
  </table>
  <h3 style="margin:24px 0 8px;">Meddelande</h3>
  <div style="background:#F9FAFB;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(message)}</div>
</div>`.trim();

  const text = [
    `Feedback från Diagnostika-användare`,
    ``,
    `Kategori: ${CATEGORY_LABEL[category]}`,
    `Användare: ${user?.full_name ?? "(okänt)"}`,
    `E-post: ${user?.email ?? "(okänt)"}`,
    `Plan: ${user?.plan ?? "(okänd)"}`,
    `user_id: ${userId}`,
    `URL: ${url}`,
    `Datum: ${new Date().toISOString()}`,
    ``,
    `Meddelande:`,
    message,
  ].join("\n");

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: user?.email ?? undefined,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("Failed to send feedback email:", err);
    return NextResponse.json(
      { error: "Kunde inte skicka feedback. Försök igen senare." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
