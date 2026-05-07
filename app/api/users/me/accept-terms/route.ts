import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { TERMS_VERSION, PRIVACY_POLICY_VERSION } from "@/lib/legal/versions";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  let body: {
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    acknowledgeNoRealPatientData?: boolean;
    marketingConsent?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig request." }, { status: 400 });
  }

  // All three required acceptances must be true.
  if (
    !body.acceptTerms ||
    !body.acceptPrivacy ||
    !body.acknowledgeNoRealPatientData
  ) {
    return NextResponse.json(
      { error: "Du måste acceptera alla tre obligatoriska punkter." },
      { status: 400 }
    );
  }

  const sb = createServiceRoleClient();
  const now = new Date().toISOString();

  const { error } = await sb
    .from("users")
    .update({
      terms_accepted_at: now,
      terms_version: TERMS_VERSION,
      privacy_policy_accepted_at: now,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      no_real_patient_data_acknowledged_at: now,
      marketing_consent: body.marketingConsent === true,
      updated_at: now,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("accept-terms update failed:", error);
    return NextResponse.json(
      { error: "Kunde inte spara acceptansen." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
