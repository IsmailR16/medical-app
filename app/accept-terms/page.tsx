import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import {
  TERMS_VERSION,
  PRIVACY_POLICY_VERSION,
} from "@/lib/legal/versions";
import { AcceptTermsForm } from "./AcceptTermsForm";

export const metadata: Metadata = {
  title: "Acceptera villkor",
};

export default async function AcceptTermsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  // If user already accepted current versions, skip this page.
  const alreadyAccepted =
    user.terms_accepted_at &&
    user.terms_version === TERMS_VERSION &&
    user.privacy_policy_accepted_at &&
    user.privacy_policy_version === PRIVACY_POLICY_VERSION &&
    user.no_real_patient_data_acknowledged_at;

  if (alreadyAccepted) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-white flex items-center justify-center p-6">
      <div className="w-full max-w-[640px] bg-white rounded-3xl border border-[#1d3557]/[0.06] shadow-[0_8px_32px_-8px_rgba(29,53,87,0.08)] p-8 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight mb-2">
            Innan du börjar
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed">
            Diagnostika är en utbildningstjänst med fiktiva, AI-genererade
            patientfall. För att börja använda tjänsten behöver vi att du
            läser igenom och accepterar nedanstående.
          </p>
        </div>

        <AcceptTermsForm />
      </div>
    </div>
  );
}
